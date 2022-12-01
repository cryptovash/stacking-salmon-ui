/* eslint-disable no-invalid-this */
// TODO: <
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
// TODO: >

import { formatUnits } from '@ethersproject/units';

import TarotRouter from '.';
import {
  Address,
  PoolTokenType,
  Changes,
  NO_CHANGES,
  BigAmount,
  TEN_18,
  ZERO_BIG_AMOUNT,
  ZERO
} from '../types/interfaces';
import { WETH_ADDRESSES } from '../config/web3/contracts/weth';
import { CHAIN_DETAILS } from '../config/web3/chains';
import { BigNumber } from '@ethersproject/bignumber';
import { parse18, parseNumber } from '../utils/big-amount';
import { LENDING_POOL_DETAILS_MAP } from '../config/web3/contracts/lending-pools';
import { decimalToBalance } from '../utils/ether-utils';
import { MaxUint256 } from '@ethersproject/constants';

const M_TOLERANCE = 1e-8;
const D_TOLERANCE = 1e-8;
const B_TOLERANCE = 1e-8;
const Z_TOLERANCE = 1e-8;

function _fm(p1: number, m: number) : boolean {
  const a = (m * m * m) + (3 * m);
  const b = 3 * p1 * m * m;
  return a > b && a - b > p1;
}

// eslint-disable-next-line camelcase
function _get_m(p1: number, a: number, b: number) : number {
  let m = 0;
  for (let i = 0; i < 255; i++) {
    const mid = (b - a) / 2;
    m = a + mid;
    if (mid <= M_TOLERANCE) {
      return m;
    }
    if (_fm(p1, m)) {
      b = m;
    } else {
      a = m;
    }
  }
  return m;
}

function getReservesGivenReservesRatioSwing(reservesRatioSwing: number, reserves: [number, number]) : [number, number] {
  const { deltaX, deltaY } = getReserveDeltas(reservesRatioSwing, reserves);
  return [
    reserves[0] * deltaX,
    reserves[1] * deltaY
  ];
}

function getPriceGivenReservesRatioSwing(reservesRatioSwing: number, reserves: [number, number]) : number {
  const { deltaX, deltaY, priceFactor } = getReserveDeltas(reservesRatioSwing, reserves);
  return (reserves[1] * deltaY) / (reserves[0] * deltaX) * priceFactor;
}

function getReservesRatioSwingGivenPriceSwing(priceSwing: number, reserves: [number, number]) : number {
  if (priceSwing === 1) {
    return 1;
  }

  const x = reserves[0];
  const y = reserves[1];
  const x2 = x * x;
  const y2 = y * y;
  const p0 = y / x * (3 * x2 + y2) / (x2 + 3 * y2);
  const p1 = p0 * priceSwing;

  const [a, b] = p1 > 1 ? [1, 3 * p1] : [p1 / 3, 1];
  const m = _get_m(p1, a, b);

  return m * x / y;
}

function getSafetyMarginReservesRatioSwings(safetyMargin: number, reserves: [number, number]) : [number, number] {
  return [
    getReservesRatioSwingGivenPriceSwing(safetyMargin, reserves),
    getReservesRatioSwingGivenPriceSwing(1 / safetyMargin, reserves)
  ];
}

interface ReserveDeltas {
  deltaX: number;
  deltaY: number;
  priceFactor: number;
}

function getReserveDeltas(m: number, reserves: [number, number]) : ReserveDeltas {
  const x = reserves[0];
  const y = reserves[1];
  const x2 = x * x;
  const y2 = y * y;
  const m2 = m * m;
  const a = y2 * m2;
  const b = m * (x2 + a);
  const c = (x2 + y2) / b;
  const d = Math.sqrt(Math.sqrt(c));
  return {
    deltaX: d,
    deltaY: d * m,
    priceFactor: (3 * x2 + a) / (3 * a + x2)
  };
}

function calculateRawLiquidityAfterReservesRatioSwing(reservesRatioSwing: number, valueCollateral: number, valueA: number, valueB: number, liquidationPenalty: number, reserves: [number, number]) : [number, number] {
  const x = reserves[0];
  const y = reserves[1];
  const x2 = x * x;
  const y2 = y * y;
  const f0 = (3 * x2 + y2) / (x2 + 3 * y2);
  const { deltaX, deltaY, priceFactor: f1 } = getReserveDeltas(reservesRatioSwing, reserves);
  const partA = valueA / deltaX * (1 + f0) / f0 * f1 / (1 + f1);
  const partB = valueB / deltaY * (1 + f0) / (1 + f1);
  const collateralNeeded = (partA + partB) * liquidationPenalty;
  if (valueCollateral >= collateralNeeded) {
    return [valueCollateral - collateralNeeded, 0];
  }
  return [0, collateralNeeded - valueCollateral];
}

function calculateLiquidationPrices(valueCollateral: number, valueA: number, valueB: number, safetyMargin: number, liquidationPenalty: number, reserves: [number, number]) : [number, number] {
  let hasUpperSwing = true;
  let hasLowerSwing = true;

  if (valueA === 0) {
    hasUpperSwing = false;
  }
  if (valueB === 0) {
    hasLowerSwing = false;
  }

  let zeroLiquiditySwingA = Infinity;
  let zeroLiquiditySwingB = 0;
  if (hasUpperSwing) {
    let a = 0;
    let b = 0;
    let shortfall = 0;
    {
      let m = 1;
      for (let i = 0; i < 20; i++) {
        m = m * 2;
        shortfall = calculateRawLiquidityAfterReservesRatioSwing(m, valueCollateral, valueA, valueB, liquidationPenalty, reserves)[1];
        if (shortfall > 0) {
          a = m / 2;
          b = m;
          break;
        }
      }
      if (shortfall > 0) {
        let m = 0;
        for (let i = 0; i < 255; i++) {
          const mid = (b - a) / 2;
          m = a + mid;
          if (mid <= D_TOLERANCE) {
            break;
          }
          const liquidity = calculateRawLiquidityAfterReservesRatioSwing(m, valueCollateral, valueA, valueB, liquidationPenalty, reserves)[0];
          if (liquidity > 0) {
            a = m;
          } else {
            b = m;
          }
        }
        zeroLiquiditySwingA = m;
      }
    }
  }
  if (hasLowerSwing) {
    let a = 0;
    let b = 1;
    let m = 0;
    for (let i = 0; i < 255; i++) {
      const mid = (b - a) / 2;
      m = a + mid;
      if (mid <= D_TOLERANCE) {
        break;
      }
      const liquidity = calculateRawLiquidityAfterReservesRatioSwing(m, valueCollateral, valueA, valueB, liquidationPenalty, reserves)[0];
      if (liquidity > 0) {
        b = m;
      } else {
        a = m;
      }
    }
    zeroLiquiditySwingB = m;
  }

  const [ratioSwingA, ratioSwingB] = getSafetyMarginReservesRatioSwings(safetyMargin, reserves);
  if (ratioSwingA > zeroLiquiditySwingA || ratioSwingB < zeroLiquiditySwingB) {
    return [Infinity, 0];
  }
  let liqPriceA = Infinity;
  let liqPriceB = 0;
  if (hasUpperSwing && zeroLiquiditySwingA !== Infinity) {
    const zeroLiquidityReserves = getReservesGivenReservesRatioSwing(zeroLiquiditySwingA, reserves);
    const safetyMarginSwing = getReservesRatioSwingGivenPriceSwing(1 / safetyMargin, zeroLiquidityReserves);
    liqPriceA = getPriceGivenReservesRatioSwing(zeroLiquiditySwingA * safetyMarginSwing, reserves);
  }
  if (hasLowerSwing && zeroLiquiditySwingB !== 0) {
    const zeroLiquidityReserves = getReservesGivenReservesRatioSwing(zeroLiquiditySwingB, reserves);
    const safetyMarginSwing = getReservesRatioSwingGivenPriceSwing(safetyMargin, zeroLiquidityReserves);
    liqPriceB = getPriceGivenReservesRatioSwing(zeroLiquiditySwingB * safetyMarginSwing, reserves);
  }

  return [
    liqPriceB,
    liqPriceA
  ];
}

// Exchange rate
export async function initializeExchangeRate(
  this: TarotRouter,
  uniswapV2PairAddress: Address,
  poolTokenType: PoolTokenType
) : Promise<BigNumber> {
  const pools = await this.getFullLendingPoolsData();
  const poolDetails = LENDING_POOL_DETAILS_MAP[uniswapV2PairAddress.toLowerCase()];
  const pool = pools[uniswapV2PairAddress.toLowerCase()];

  let ret = BigNumber.from(0);
  if (poolTokenType === PoolTokenType.BorrowableA) {
    ret = BigNumber.from(pool.borrowableExchangeRate0);
  } else if (poolTokenType === PoolTokenType.BorrowableB) {
    ret = BigNumber.from(pool.borrowableExchangeRate1);
  } else if (poolTokenType === PoolTokenType.Collateral) {
    let exchangeRate = BigNumber.from(pool.collateralExchangeRate);
    if (poolDetails.isTarotVault) {
      exchangeRate = exchangeRate.mul(pool.vaultTokenExchangeRate).div(TEN_18);
    }
    ret = exchangeRate;
  }
  return ret;
}

export async function getExchangeRate(this: TarotRouter, uniswapV2PairAddress: Address, poolTokenType: PoolTokenType) : Promise<BigNumber> {
  const cache = this.getPoolTokenCache(uniswapV2PairAddress, poolTokenType);
  if (!cache.exchangeRate) cache.exchangeRate = this.initializeExchangeRate(uniswapV2PairAddress, poolTokenType);
  return cache.exchangeRate;
}

export async function getAvailableETH(this: TarotRouter) : Promise<number> {
  const bigBalance = await this.readLibrary.getBalance(this.account);
  const availableBalance = parseFloat(formatUnits(bigBalance));
  return availableBalance;
}

export async function initializeTokenBalance(
  this: TarotRouter,
  tokenAddress: Address,
  account?: Address
): Promise<BigAmount> {
  account = account || this.account;
  if (!account || account === '') {
    return ZERO_BIG_AMOUNT;
  }
  const wethAddress = WETH_ADDRESSES[this.chainId];
  if (tokenAddress.toLowerCase() === wethAddress.toLowerCase()) {
    const ethBalance = await this.readLibrary.getBalance(account);
    return {
      amount: ethBalance,
      decimals: BigNumber.from(CHAIN_DETAILS[this.chainId].nativeCurrency.decimals)
    };
  }
  const token = this.newERC20(tokenAddress);
  const [balance, decimals] = await Promise.all([
    token.balanceOf(account),
    token.decimals()
  ]);
  return {
    amount: balance,
    decimals: decimals
  };
}

export async function getTokenBalance(
  this: TarotRouter,
  tokenAddress: Address,
  account?: Address
): Promise<BigAmount> {
  account = account || this.account;
  if (!this.tokenBalanceCache[account]) {
    this.tokenBalanceCache[account] = {};
  }
  if (!this.tokenBalanceCache[account][tokenAddress]) {
    this.tokenBalanceCache[account][tokenAddress] = this.initializeTokenBalance(tokenAddress, account);
  }
  return this.tokenBalanceCache[account][tokenAddress];
}

// Available Balance
export async function initializeAvailableBalance(
  this: TarotRouter,
  uniswapV2PairAddress: Address,
  poolTokenType: PoolTokenType
) : Promise<number> {
  const [, token] = await this.getContracts(uniswapV2PairAddress, poolTokenType);
  const wethAddress = WETH_ADDRESSES[this.chainId];
  if (token.address.toLowerCase() === wethAddress.toLowerCase()) {
    const bigBalance = await this.readLibrary.getBalance(this.account);
    const availableBalance = parseFloat(formatUnits(bigBalance)) / this.dust;
    return availableBalance;
  }

  const balance = await token.balanceOf(this.account);

  return (await this.normalize(uniswapV2PairAddress, poolTokenType, balance)) / this.dust;
}

export async function getAvailableBalance(
  this: TarotRouter,
  uniswapV2PairAddress: Address,
  poolTokenType: PoolTokenType
) : Promise<number> {
  // TODO: should handle cache via an independent mechanism
  const cache = this.getPoolTokenCache(uniswapV2PairAddress, poolTokenType);
  if (!cache.availableBalance) {
    cache.availableBalance = this.initializeAvailableBalance(uniswapV2PairAddress, poolTokenType);
  }
  return cache.availableBalance;
}

// Deposited
export async function initializeDeposited(
  this: TarotRouter,
  uniswapV2PairAddress: Address,
  poolTokenType: PoolTokenType,
  account = this.account
) : Promise<BigAmount> {
  if (!account || account === '') {
    return ZERO_BIG_AMOUNT;
  }
  const [[poolToken], exchangeRate] = await Promise.all([
    this.getContracts(uniswapV2PairAddress, poolTokenType),
    this.getExchangeRate(uniswapV2PairAddress, poolTokenType)
  ]);
  const balance = await poolToken.balanceOf(account);
  const poolDetails = LENDING_POOL_DETAILS_MAP[uniswapV2PairAddress.toLowerCase()];
  const decimals = poolTokenType === PoolTokenType.BorrowableA ? poolDetails.decimals0 : poolTokenType === PoolTokenType.BorrowableB ? poolDetails.decimals1 : 18;

  return {
    amount: balance.mul(exchangeRate).div(TEN_18),
    decimals: BigNumber.from(decimals)
  };
}

export async function getDeposited(this: TarotRouter, uniswapV2PairAddress: Address, poolTokenType: PoolTokenType, account = this.account) : Promise<BigAmount> {
  const cache = this.getPoolTokenCache(uniswapV2PairAddress, poolTokenType);
  if (!cache.deposited) {
    cache.deposited = {};
  }
  if (!cache.deposited[account]) cache.deposited[account] = this.initializeDeposited(uniswapV2PairAddress, poolTokenType, account);
  return cache.deposited[account];
}
export async function getDepositedUSD(
  this: TarotRouter,
  uniswapV2PairAddress: Address,
  poolTokenType: PoolTokenType,
  account = this.account
) : Promise<number> {
  const [deposited, tokenPriceMap] = await Promise.all([
    this.getDeposited(uniswapV2PairAddress, poolTokenType, account),
    this.getTokenPrices()
  ]);
  const pool = LENDING_POOL_DETAILS_MAP[uniswapV2PairAddress.toLowerCase()];
  const priceKey = poolTokenType === PoolTokenType.Collateral ? 'uniswapV2PairAddress' : poolTokenType === PoolTokenType.BorrowableA ? 'tokenAddress0' : 'tokenAddress1';
  const tokenPrice = tokenPriceMap[pool[priceKey].toLowerCase()].priceUSD.value;
  return parseFloat(formatUnits(deposited.amount.mul(tokenPrice).div(TEN_18), deposited.decimals));
}

// Borrowed
export async function initializeBorrowed(
  this: TarotRouter,
  uniswapV2PairAddress: Address,
  poolTokenType: PoolTokenType,
  account = this.account
) : Promise<BigAmount> {
  if (!account || account === '') {
    return ZERO_BIG_AMOUNT;
  }
  const [borrowable] = await this.getContracts(uniswapV2PairAddress, poolTokenType);
  const [, balance, accrualTimestamp, borrowRate] = await this.doMulticall([
    [borrowable, 'exchangeRate', []],
    [borrowable, 'borrowBalance', [account]],
    [borrowable, 'accrualTimestamp', []],
    [borrowable, 'borrowRate', []]
  ]);
  const poolDetails = LENDING_POOL_DETAILS_MAP[uniswapV2PairAddress.toLowerCase()];
  const decimals = poolTokenType === PoolTokenType.BorrowableA ? poolDetails.decimals0 : poolTokenType === PoolTokenType.BorrowableB ? poolDetails.decimals1 : 18;
  return {
    amount: balance.add(balance.mul(60000 + Date.now() - (accrualTimestamp * 1000)).mul(borrowRate).div(TEN_18).div(1000)),
    decimals: decimals
  };
}

export async function getBorrowed(this: TarotRouter, uniswapV2PairAddress: Address, poolTokenType: PoolTokenType, account = this.account) : Promise<BigAmount> {
  const cache = this.getPoolTokenCache(uniswapV2PairAddress, poolTokenType);
  if (!cache.borrowed) {
    cache.borrowed = {};
  }
  if (!cache.borrowed[account]) cache.borrowed[account] = this.initializeBorrowed(uniswapV2PairAddress, poolTokenType, account);
  return cache.borrowed[account];
}
export async function getBorrowedUSD(this: TarotRouter, uniswapV2PairAddress: Address, poolTokenType: PoolTokenType, account = this.account) : Promise<number> {
  const [borrowed, tokenPrice] = await Promise.all([
    this.getBorrowed(uniswapV2PairAddress, poolTokenType, account),
    this.getPoolTokenPrice(uniswapV2PairAddress, poolTokenType)
  ]);
  return parseNumber(borrowed) * tokenPrice;
}

// Balance
export async function getBalanceUSD(this: TarotRouter, uniswapV2PairAddress: Address, account = this.account) : Promise<number> {
  const [depositedAUSD, depositedBUSD, depositedCUSD] = await Promise.all([
    this.getDepositedUSD(uniswapV2PairAddress, PoolTokenType.BorrowableA, account),
    this.getDepositedUSD(uniswapV2PairAddress, PoolTokenType.BorrowableB, account),
    this.getDepositedUSD(uniswapV2PairAddress, PoolTokenType.Collateral, account)
  ]);
  return depositedAUSD + depositedBUSD + depositedCUSD;
}

// Supplied
export async function getSuppliedUSD(this: TarotRouter, uniswapV2PairAddress: Address, account = this.account) : Promise<number> {
  const [depositedAUSD, depositedBUSD] = await Promise.all([
    this.getDepositedUSD(uniswapV2PairAddress, PoolTokenType.BorrowableA, account),
    this.getDepositedUSD(uniswapV2PairAddress, PoolTokenType.BorrowableB, account)
  ]);
  return depositedAUSD + depositedBUSD;
}

// Debt
export async function getDebtUSD(this: TarotRouter, uniswapV2PairAddress: Address, account = this.account) : Promise<number> {
  const [borrowedAUSD, borrowedBUSD] = await Promise.all([
    this.getBorrowedUSD(uniswapV2PairAddress, PoolTokenType.BorrowableA, account),
    this.getBorrowedUSD(uniswapV2PairAddress, PoolTokenType.BorrowableB, account)
  ]);
  return borrowedAUSD + borrowedBUSD;
}

// Equity
export async function getEquityUSD(this: TarotRouter, uniswapV2PairAddress: Address, account = this.account) : Promise<number> {
  const [balanceUSD, debtUSD] = await Promise.all([
    this.getBalanceUSD(uniswapV2PairAddress, account),
    this.getDebtUSD(uniswapV2PairAddress, account)
  ]);
  return balanceUSD - debtUSD;
}
export async function getLPEquityUSD(this: TarotRouter, uniswapV2PairAddress: Address, account = this.account) : Promise<number> {
  const [collateralUSD, debtUSD] = await Promise.all([
    this.getDepositedUSD(uniswapV2PairAddress, PoolTokenType.Collateral, account),
    this.getDebtUSD(uniswapV2PairAddress, account)
  ]);
  return collateralUSD - debtUSD;
}
export async function getLPEquity(this: TarotRouter, uniswapV2PairAddress: Address, account = this.account) : Promise<number> {
  const [collateralUSD, debtUSD, tokenPriceMap] = await Promise.all([
    this.getDepositedUSD(uniswapV2PairAddress, PoolTokenType.Collateral, account),
    this.getDebtUSD(uniswapV2PairAddress, account),
    this.getTokenPrices()
  ]);
  const pool = LENDING_POOL_DETAILS_MAP[uniswapV2PairAddress.toLowerCase()];
  const tokenPrice = parse18(tokenPriceMap[pool.uniswapV2PairAddress.toLowerCase()].priceUSD.value);
  if (tokenPrice <= 0) {
    return 0;
  }
  return parseFloat(((collateralUSD - debtUSD) / tokenPrice).toFixed(18));
}

// Debt
export async function getAccountAPY(this: TarotRouter, uniswapV2PairAddress: Address, account = this.account) : Promise<number> {
  const [depositedAUSD, depositedBUSD, supplyAPYA, supplyAPYB] = await Promise.all([
    this.getDepositedUSD(uniswapV2PairAddress, PoolTokenType.BorrowableA, account),
    this.getDepositedUSD(uniswapV2PairAddress, PoolTokenType.BorrowableB, account),
    this.getSupplyAPY(uniswapV2PairAddress, PoolTokenType.BorrowableA),
    this.getSupplyAPY(uniswapV2PairAddress, PoolTokenType.BorrowableB)
  ]);
  const totalSupplied = depositedAUSD + depositedBUSD;
  return totalSupplied > 0 ? (depositedAUSD * supplyAPYA + depositedBUSD * supplyAPYB) / totalSupplied : 0;
}

// Values
export async function getValuesFromPrice(this: TarotRouter, uniswapV2PairAddress: Address, changes: Changes, priceA: number, priceB: number, account = this.account) : Promise<{valueCollateral: number, valueA: number, valueB: number}> {
  const [valueCollateralPart, amountAPart, amountBPart] = await Promise.all([
    this.getDeposited(uniswapV2PairAddress, PoolTokenType.Collateral, account),
    this.getBorrowed(uniswapV2PairAddress, PoolTokenType.BorrowableA, account),
    this.getBorrowed(uniswapV2PairAddress, PoolTokenType.BorrowableB, account)
  ]);
  const valueCollateral = parseNumber(valueCollateralPart) + changes.changeCollateral;
  const amountA = parseNumber(amountAPart) + changes.changeBorrowedA;
  const amountB = parseNumber(amountBPart) + changes.changeBorrowedB;
  const valueA = amountA * priceA;
  const valueB = amountB * priceB;
  return {
    valueCollateral: valueCollateral > 0 ? valueCollateral : 0,
    valueA: valueA > 0 ? valueA : 0,
    valueB: valueB > 0 ? valueB : 0
  };
}
export async function getValues(this: TarotRouter, uniswapV2PairAddress: Address, changes: Changes, account = this.account) : Promise<{valueCollateral: number, valueA: number, valueB: number}> {
  const [priceA, priceB] = await this.getPriceDenomLP(uniswapV2PairAddress);
  return this.getValuesFromPrice(uniswapV2PairAddress, changes, priceA, priceB, account);
}
export async function getMarketValues(this: TarotRouter, uniswapV2PairAddress: Address, changes: Changes, account = this.account) : Promise<{valueCollateral: number, valueA: number, valueB: number}> {
  const [priceA, priceB] = await this.getMarketPriceDenomLP(uniswapV2PairAddress);
  return this.getValuesFromPrice(uniswapV2PairAddress, changes, priceA, priceB, account);
}

// Leverage
export async function getNewLeverage(this: TarotRouter, uniswapV2PairAddress: Address, changes: Changes, account = this.account) : Promise<number> {
  const { valueCollateral, valueA, valueB } = await this.getValues(uniswapV2PairAddress, changes, account);
  const valueDebt = valueA + valueB;
  if (valueDebt === 0) return 1;
  const equity = valueCollateral - valueDebt;
  if (equity <= 0) return Infinity;
  return valueDebt / equity + 1;
}
export async function getLeverage(this: TarotRouter, uniswapV2PairAddress: Address, account = this.account) : Promise<number> {
  return await this.getNewLeverage(uniswapV2PairAddress, NO_CHANGES, account);
}

export async function calculateLiquidity(this: TarotRouter, uniswapV2PairAddress: Address, changes: Changes, account = this.account, uiMargin = 1) : Promise<[number, number]> {
  const [pools, safetyMarginPart, liquidationPenalty] = await Promise.all([
    this.getFullLendingPoolsData(),
    this.getSafetyMargin(uniswapV2PairAddress),
    this.getLiquidationPenalty(uniswapV2PairAddress)
  ]);
  const safetyMargin = safetyMarginPart * uiMargin;
  const pool = pools[uniswapV2PairAddress.toLowerCase()];
  const poolDetails = LENDING_POOL_DETAILS_MAP[uniswapV2PairAddress.toLowerCase()];
  const x = parse18(BigNumber.from(pool.twapReserves[0]).mul(TEN_18).div(BigNumber.from(10).pow(poolDetails.decimals0)));
  const y = parse18(BigNumber.from(pool.twapReserves[1]).mul(TEN_18).div(BigNumber.from(10).pow(poolDetails.decimals1)));
  const [ratioSwingA, ratioSwingB] = getSafetyMarginReservesRatioSwings(safetyMargin, [x, y]);
  const { deltaX: dx1, deltaY: dy1, priceFactor: a1 } = getReserveDeltas(ratioSwingA, [x, y]);
  const { deltaX: dx2, deltaY: dy2, priceFactor: a2 } = getReserveDeltas(ratioSwingB, [x, y]);
  const rlp = parse18(pool.pairTotalSupply);
  const price0A = rlp / x / dx1 * a1 / (1 + a1);
  const price1A = rlp / y / dy1 / (1 + a1);
  const price0B = rlp / x / dx2 * a2 / (1 + a2);
  const price1B = rlp / y / dy2 / (1 + a2);
  const [
    { valueCollateral, valueA: valueAA, valueB: valueBA },
    { valueA: valueAB, valueB: valueBB }
  ] = await Promise.all([
    this.getValuesFromPrice(uniswapV2PairAddress, changes, price0A, price1A, account),
    this.getValuesFromPrice(uniswapV2PairAddress, changes, price0B, price1B, account)
  ]);
  const collateralNeededA = (valueAA + valueBA) * liquidationPenalty;
  const collateralNeededB = (valueAB + valueBB) * liquidationPenalty;
  const collateralNeeded = (collateralNeededA > collateralNeededB) ? collateralNeededA : collateralNeededB;
  if (valueCollateral >= collateralNeeded) {
    return [valueCollateral - collateralNeeded, 0];
  } else {
    return [0, collateralNeeded - valueCollateral];
  }
}

// Liquidation Threshold
export async function getNewLiquidationPriceSwings(this: TarotRouter, uniswapV2PairAddress: Address, changes: Changes, account = this.account) : Promise<[number, number]> {
  const { valueCollateral, valueA, valueB } = await this.getValues(uniswapV2PairAddress, changes, account);
  if (valueA + valueB === 0) return [Infinity, Infinity];
  const [safetyMargin, liquidationPenalty] = await Promise.all([
    this.getSafetyMargin(uniswapV2PairAddress),
    this.getLiquidationPenalty(uniswapV2PairAddress)
  ]);
  const actualCollateral = valueCollateral / liquidationPenalty;
  const rad = Math.sqrt(actualCollateral ** 2 - 4 * valueA * valueB);
  if (!rad) return [0, 0];
  const t = (actualCollateral + rad) / (2 * Math.sqrt(safetyMargin));
  const priceSwingA = (t / valueA) ** 2;
  const priceSwingB = (t / valueB) ** 2;
  return [priceSwingA, priceSwingB];
}
export async function getNewLiquidationPrices(this: TarotRouter, uniswapV2PairAddress: Address, changes: Changes, account = this.account) : Promise<[number, number]> {
  const poolDetails = LENDING_POOL_DETAILS_MAP[uniswapV2PairAddress.toLowerCase()];
  if (poolDetails.stable) {
    const { valueCollateral, valueA, valueB } = await this.getValues(uniswapV2PairAddress, changes, account);
    // eslint-disable-next-line no-negated-condition
    if (valueA + valueB === 0) return [0, Infinity];
    const [pools, safetyMargin, liquidationPenalty, [, shortfall]] = await Promise.all([
      this.getFullLendingPoolsData(),
      this.getSafetyMargin(uniswapV2PairAddress),
      this.getLiquidationPenalty(uniswapV2PairAddress),
      this.calculateLiquidity(uniswapV2PairAddress, changes, account)
    ]);
    if (shortfall > 0) {
      return [Infinity, 0];
    }
    const pool = pools[uniswapV2PairAddress.toLowerCase()];

    const x = parse18(BigNumber.from(pool.twapReserves[0]).mul(TEN_18).div(BigNumber.from(10).pow(poolDetails.decimals0)));
    const y = parse18(BigNumber.from(pool.twapReserves[1]).mul(TEN_18).div(BigNumber.from(10).pow(poolDetails.decimals1)));
    const liquidationPrices = calculateLiquidationPrices(valueCollateral, valueA, valueB, safetyMargin, liquidationPenalty, [x, y]);
    // eslint-disable-next-line no-negated-condition
    return !this.priceInverted ? liquidationPrices : [1 / liquidationPrices[1], 1 / liquidationPrices[0]];
  }
  const [currentPrice, [priceSwingA, priceSwingB]] = await Promise.all([
    this.getTWAPPrice(uniswapV2PairAddress),
    this.getNewLiquidationPriceSwings(uniswapV2PairAddress, changes, account)
  ]);
  // eslint-disable-next-line no-negated-condition
  return !this.priceInverted ? [currentPrice / priceSwingB, currentPrice * priceSwingA] : [currentPrice / priceSwingA, currentPrice * priceSwingB];
}
export async function getLiquidationPriceSwings(this: TarotRouter, uniswapV2PairAddress: Address, account = this.account) : Promise<[number, number]> {
  return await this.getNewLiquidationPriceSwings(uniswapV2PairAddress, NO_CHANGES, account);
}
export async function getLiquidationPrices(this: TarotRouter, uniswapV2PairAddress: Address, account = this.account) : Promise<[number, number]> {
  return await this.getNewLiquidationPrices(uniswapV2PairAddress, NO_CHANGES, account);
}

// Max Withdrawable
export async function getMaxWithdrawable(this: TarotRouter, uniswapV2PairAddress: Address, poolTokenType: PoolTokenType, account = this.account) : Promise<BigAmount> {
  const [deposited, availableCash] = await Promise.all([
    this.getDeposited(uniswapV2PairAddress, poolTokenType, account),
    this.getTotalBalance(uniswapV2PairAddress, poolTokenType)
  ]);
  if (poolTokenType !== PoolTokenType.Collateral) {
    return deposited.amount.lt(availableCash.amount) ? deposited : availableCash;
  }
  const poolDetails = LENDING_POOL_DETAILS_MAP[uniswapV2PairAddress.toLowerCase()];
  if (poolDetails.stable) {
    const [liquidity] = await this.calculateLiquidity(uniswapV2PairAddress, NO_CHANGES, account, this.uiMarginStable);
    const maxWithdrawable = { amount: decimalToBalance(liquidity, 18), decimals: BigNumber.from(18) };
    const ret = [deposited, availableCash, maxWithdrawable].reduce((prev, curr) => (prev.amount.lt(curr.amount) ? prev : curr), { amount: MaxUint256, decimals: BigNumber.from(18) });
    return ret.amount.gt(ZERO) ? ret : ZERO_BIG_AMOUNT;
  }
  const [{ valueCollateral, valueA: valueARaw, valueB: valueBRaw }, safetyMarginPart, liquidationPenalty] = await Promise.all([
    this.getValues(uniswapV2PairAddress, NO_CHANGES, account),
    this.getSafetyMargin(uniswapV2PairAddress),
    this.getLiquidationPenalty(uniswapV2PairAddress)
  ]);
  const valueA = valueARaw > 0 ? Math.max(valueARaw, 1e-18) : 0;
  const valueB = valueBRaw > 0 ? Math.max(valueBRaw, 1e-18) : 0;
  const safetyMargin = safetyMarginPart * this.uiMargin;
  const actualCollateral = valueCollateral / liquidationPenalty;
  const maxWithdrawable1 = { amount: decimalToBalance((actualCollateral - (valueA + valueB * safetyMargin) / Math.sqrt(safetyMargin)) * liquidationPenalty, 18), decimals: BigNumber.from(18) };
  const maxWithdrawable2 = { amount: decimalToBalance((actualCollateral - (valueB + valueA * safetyMargin) / Math.sqrt(safetyMargin)) * liquidationPenalty, 18), decimals: BigNumber.from(18) };
  const ret = [deposited, availableCash, maxWithdrawable1, maxWithdrawable2].reduce((prev, curr) => (prev.amount.lt(curr.amount) ? prev : curr), { amount: MaxUint256, decimals: BigNumber.from(18) });
  return ret.amount.gt(ZERO) ? ret : ZERO_BIG_AMOUNT;
}

// Max Borrowable
export async function getMaxBorrowable(this: TarotRouter, uniswapV2PairAddress: Address, poolTokenType: PoolTokenType, account = this.account) : Promise<number> {
  const poolDetails = LENDING_POOL_DETAILS_MAP[uniswapV2PairAddress.toLowerCase()];
  if (poolDetails.stable) {
    const [availableCash, { valueCollateral, valueA, valueB }, [, currShortfall], [priceA, priceB]] = await Promise.all([
      this.getTotalBalance(uniswapV2PairAddress, poolTokenType),
      this.getValues(uniswapV2PairAddress, NO_CHANGES, account),
      this.calculateLiquidity(uniswapV2PairAddress, NO_CHANGES, account, this.uiMarginStable),
      this.getPriceDenomLP(uniswapV2PairAddress)
    ]);
    if (currShortfall > 0) {
      return 0;
    }
    const rawEquity = valueCollateral - valueA - valueB;
    let a = 0;
    let b = rawEquity / (poolTokenType === PoolTokenType.BorrowableA ? priceA : priceB);
    let borrowAmount = 0;
    for (let i = 0; i < 255; i++) {
      const mid = (b - a) / 2;
      borrowAmount = a + mid;
      if (mid <= B_TOLERANCE) {
        borrowAmount = a;
        break;
      }
      const changes: Changes = {
        changeCollateral: 0,
        changeBorrowedA: poolTokenType === PoolTokenType.BorrowableA ? borrowAmount : 0,
        changeBorrowedB: poolTokenType === PoolTokenType.BorrowableA ? 0 : borrowAmount
      };
      const [, shortfall] = await this.calculateLiquidity(uniswapV2PairAddress, changes, account, this.uiMarginStable);
      if (shortfall > 0) {
        b = borrowAmount;
      } else {
        a = borrowAmount;
      }
    }
    return Math.max(0, Math.min(parseNumber(availableCash), borrowAmount));
  }
  const [availableCash, { valueCollateral, valueA, valueB }, safetyMarginPart, liquidationPenalty, price] = await Promise.all([
    this.getTotalBalance(uniswapV2PairAddress, poolTokenType),
    this.getValues(uniswapV2PairAddress, NO_CHANGES, account),
    this.getSafetyMargin(uniswapV2PairAddress),
    this.getLiquidationPenalty(uniswapV2PairAddress),
    this.getBorrowablePriceDenomLP(uniswapV2PairAddress, poolTokenType)
  ]);
  const valueBorrowed = poolTokenType === PoolTokenType.BorrowableA ? valueA : valueB;
  const valueOther = poolTokenType === PoolTokenType.BorrowableA ? valueB : valueA;
  const safetyMargin = safetyMarginPart * this.uiMargin;
  const actualCollateral = valueCollateral / liquidationPenalty;
  const totalValueBorrowable1 = (actualCollateral * Math.sqrt(safetyMargin) - valueOther) / safetyMargin;
  const totalValueBorrowable2 = (actualCollateral / Math.sqrt(safetyMargin) - valueOther) * safetyMargin;
  const maxValueBorrowable = Math.min(totalValueBorrowable1, totalValueBorrowable2) - valueBorrowed;
  return Math.max(0, Math.min(parseNumber(availableCash), maxValueBorrowable / price));
}

// Max Leverage
export async function getMaxLeverage(this: TarotRouter, uniswapV2PairAddress: Address, account = this.account) : Promise<number> {
  const poolDetails = LENDING_POOL_DETAILS_MAP[uniswapV2PairAddress.toLowerCase()];
  if (poolDetails.stable) {
    const [availableCashA, availableCashB, [reserve0, reserve1], { valueCollateral, valueA, valueB }, [, currShortfall], [priceATWAP], [priceA, priceB]] = await Promise.all([
      this.getTotalBalance(uniswapV2PairAddress, PoolTokenType.BorrowableA),
      this.getTotalBalance(uniswapV2PairAddress, PoolTokenType.BorrowableB),
      this.getReserves(uniswapV2PairAddress),
      this.getValues(uniswapV2PairAddress, NO_CHANGES, account),
      this.calculateLiquidity(uniswapV2PairAddress, NO_CHANGES, account, this.uiMarginStable),
      this.getPriceDenomLP(uniswapV2PairAddress),
      this.getMarketPriceDenomLP(uniswapV2PairAddress)
    ]);
    if (currShortfall > 0) {
      return this.getLeverage(uniswapV2PairAddress, account);
    }

    let maxBorrowA = 0;
    let maxBorrowB = 0;
    const availableA = parseNumber(availableCashA);
    const availableB = parseNumber(availableCashB);
    if (reserve1 * availableA > reserve0 * availableB) {
      maxBorrowA = availableB * reserve0 / reserve1;
      maxBorrowB = availableB;
    } else {
      maxBorrowA = availableA;
      maxBorrowB = availableA * reserve1 / reserve0;
    }
    let m = 0;
    let a = 0;
    let b = 1;
    let changes: Changes = {
      changeCollateral: 0,
      changeBorrowedA: 0,
      changeBorrowedB: 0
    };
    for (let i = 0; i < 255; i++) {
      const mid = (b - a) / 2;
      m = a + mid;
      if (mid <= Z_TOLERANCE) {
        break;
      }
      const borrowA = maxBorrowA * m;
      const borrowB = maxBorrowB * m;
      changes = {
        changeCollateral: borrowA * priceA + borrowB * priceB,
        changeBorrowedA: borrowA,
        changeBorrowedB: borrowB
      };
      const [, shortfall] = await this.calculateLiquidity(uniswapV2PairAddress, changes, account, this.uiMarginStable);
      if (shortfall > 0) {
        b = m;
      } else {
        a = m;
      }
    }

    const diff = priceA > priceATWAP ? priceA / priceATWAP : priceATWAP / priceA;
    const adjustFactor = 1 / diff;
    const valueDebt = valueA + valueB;
    const equity = valueCollateral - valueDebt;
    if (equity === 0) return 1;
    return (valueDebt + (changes.changeBorrowedA * priceA + changes.changeBorrowedB * priceB) * adjustFactor) / equity + 1;
  }
  const [availableCashA, availableCashB, [priceA, priceB], [priceATWAP], { valueCollateral, valueA, valueB }, safetyMarginPart, liquidationPenalty] = await Promise.all([
    this.getTotalBalance(uniswapV2PairAddress, PoolTokenType.BorrowableA),
    this.getTotalBalance(uniswapV2PairAddress, PoolTokenType.BorrowableB),
    this.getMarketPriceDenomLP(uniswapV2PairAddress),
    this.getPriceDenomLP(uniswapV2PairAddress),
    this.getValues(uniswapV2PairAddress, NO_CHANGES, account),
    this.getSafetyMargin(uniswapV2PairAddress),
    this.getLiquidationPenalty(uniswapV2PairAddress)
  ]);
  const diff = priceA > priceATWAP ? priceA / priceATWAP : priceATWAP / priceA;
  const adjustFactor = 1 / diff;
  const availableCashValue1 = parseNumber(availableCashA) * priceA;
  const availableCashValue2 = parseNumber(availableCashB) * priceB;
  const safetyMargin = safetyMarginPart * this.uiMargin;
  const actualCollateral = valueCollateral / liquidationPenalty;
  const num1 = actualCollateral * Math.sqrt(safetyMargin) - valueA * safetyMargin - valueB;
  const num2 = actualCollateral * Math.sqrt(safetyMargin) - valueB * safetyMargin - valueA;
  const den = safetyMargin + 1 - 2 * Math.sqrt(safetyMargin) / liquidationPenalty;
  const additionalValueBorrowablePerSide = Math.min(num1 / den, num2 / den, availableCashValue1, availableCashValue2) * adjustFactor;
  const valueDebt = valueA + valueB;
  const equity = valueCollateral - valueDebt;
  if (equity === 0) return 1;
  return (valueDebt + additionalValueBorrowablePerSide * 2) / equity + 1;
}

// Max Deleverage
export async function getMaxDeleverage(this: TarotRouter, uniswapV2PairAddress: Address, slippage: number, account = this.account) : Promise<number> {
  const poolDetails = LENDING_POOL_DETAILS_MAP[uniswapV2PairAddress.toLowerCase()];
  if (poolDetails.stable) {
    const [[reserve0, reserve1], { valueCollateral, valueA, valueB }] = await Promise.all([
      this.getReserves(uniswapV2PairAddress),
      this.getMarketValues(uniswapV2PairAddress, NO_CHANGES, account)
    ]);
    const x2 = reserve0 * reserve0;
    const y2 = reserve1 * reserve1;
    const f = (3 * x2 + y2) / (x2 + 3 * y2);
    const minRepayA = valueCollateral * f / (1 + f) / Math.sqrt(slippage);
    const minRepayB = valueCollateral / (1 + f) / Math.sqrt(slippage);
    if (minRepayA >= valueA && minRepayB >= valueB) {
      const deposited = await this.getDeposited(uniswapV2PairAddress, PoolTokenType.Collateral, account);
      return parseNumber(deposited);
    }
    if (valueCollateral / Math.sqrt(slippage) < valueA + valueB) {
      return 0;
    }
    if (minRepayA >= valueA) {
      return valueA * (1 + 1 / f) * Math.sqrt(slippage);
    } else {
      return valueB * (1 + f) * Math.sqrt(slippage);
    }
  }
  const { valueCollateral, valueA, valueB } = await this.getMarketValues(uniswapV2PairAddress, NO_CHANGES, account);
  const minRepayPerSide = valueCollateral / 2 / Math.sqrt(slippage);
  if (minRepayPerSide >= valueA && minRepayPerSide >= valueB) {
    const deposited = await this.getDeposited(uniswapV2PairAddress, PoolTokenType.Collateral, account);
    return parseNumber(deposited);
  }
  if (minRepayPerSide * 2 < valueA + valueB) {
    return 0;
  }
  return Math.min(valueA, valueB) * 2 * Math.sqrt(slippage);
}

export async function getAccountTotalValueLocked(this: TarotRouter, account: Address) : Promise<number> {
  let tvl = 0;
  const [{ collateralPositions: borrowPositions, supplyPositions }, supplyVaultTVL, xStakingPoolTVL] = await Promise.all([
    this.getUserPositions(account),
    this.getSupplyVaultTVLForAccount(account),
    this.getXStakingPoolTVLForAccount(account)
  ]);
  tvl += supplyVaultTVL;
  tvl += xStakingPoolTVL;
  await Promise.all([
    (async () => {
      const values = await Promise.all(borrowPositions.map(uniswapV2PairAddress => this.getLPEquityUSD(uniswapV2PairAddress, account)));
      for (const value of values) {
        tvl += value;
      }
    })(),
    (async () => {
      const values = await Promise.all([
        ...supplyPositions.map(uniswapV2PairAddress => this.getDepositedUSD(uniswapV2PairAddress, PoolTokenType.BorrowableA, account)),
        ...supplyPositions.map(uniswapV2PairAddress => this.getDepositedUSD(uniswapV2PairAddress, PoolTokenType.BorrowableB, account))
      ]);
      for (const value of values) {
        tvl += value;
      }
    })()
  ]);
  return tvl;
}

export async function getAccountTotalValueSupplied(this: TarotRouter, account: Address) : Promise<number> {
  let tvl = 0;
  const [{ supplyPositions }, supplyVaultTVL, xStakingPoolTVL] = await Promise.all([
    this.getUserPositions(account),
    this.getSupplyVaultTVLForAccount(account),
    this.getXStakingPoolTVLForAccount(account)
  ]);
  tvl += supplyVaultTVL;
  tvl += xStakingPoolTVL;
  await Promise.all([
    (async () => {
      const values = await Promise.all([
        ...supplyPositions.map(uniswapV2PairAddress => this.getDepositedUSD(uniswapV2PairAddress, PoolTokenType.BorrowableA, account)),
        ...supplyPositions.map(uniswapV2PairAddress => this.getDepositedUSD(uniswapV2PairAddress, PoolTokenType.BorrowableB, account))
      ]);
      for (const value of values) {
        tvl += value;
      }
    })()
  ]);
  return tvl;
}

export async function getAccountTotalValueBorrowed(this: TarotRouter, account: Address) : Promise<number> {
  let tvl = 0;
  const { collateralPositions: borrowPositions } = await this.getUserPositions(account);
  await Promise.all([
    (async () => {
      const values = await Promise.all([
        ...borrowPositions.map(uniswapV2PairAddress => this.getBorrowedUSD(uniswapV2PairAddress, PoolTokenType.BorrowableA, account)),
        ...borrowPositions.map(uniswapV2PairAddress => this.getBorrowedUSD(uniswapV2PairAddress, PoolTokenType.BorrowableB, account))
      ]);
      for (const value of values) {
        tvl += value;
      }
    })()
  ]);
  return tvl;
}

/*

export async function getAccountTotalValueSupplied(this: TarotRouter, account: Address) : Promise<number> {
  const supplyPositions = await this.getSupplyPositions(account);
  let tvl = 0;
  for (const uniswapV2PairAddress of supplyPositions) {
    tvl += await this.getSuppliedValue(account, uniswapV2PairAddress, PoolTokenType.BorrowableA);
    tvl += await this.getSuppliedValue(account, uniswapV2PairAddress, PoolTokenType.BorrowableB);
  }
  return tvl;
}

export async function getAccountTotalValueBorrowed(this: TarotRouter, account: Address) : Promise<number> {
  const borrowPositions = await this.getBorrowPositions(account);
  let tvl = 0;
  for (const uniswapV2PairAddress of borrowPositions) {
    tvl += await this.getBorrowedValue(account, uniswapV2PairAddress, PoolTokenType.BorrowableA);
    tvl += await this.getBorrowedValue(account, uniswapV2PairAddress, PoolTokenType.BorrowableB);
  }
  return tvl;
}
*/
