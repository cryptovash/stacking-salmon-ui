/* eslint-disable no-invalid-this */
import { Contract } from '@ethersproject/contracts';
import { BigNumber, BigNumberish } from '@ethersproject/bignumber';
import { formatUnits } from '@ethersproject/units';

import TarotRouter from '.';
import { Address, BoostMaxxPoolInfo, PoolTokenType, TEN_18 } from '../types/interfaces';
import { PermitData } from '../hooks/useApprove';
import { impermanentLoss } from '../utils';
import { DistributorDetails } from '../utils/constants';
import { WETH_ADDRESSES } from '../config/web3/contracts/weth';
import waitForTx from '../services/wait-for-tx';
import FarmingPoolJSON from '../abis/contracts/IFarmingPool.json';
import SupplyVaultRouterJSON from '../abis/contracts/ISupplyVaultRouter01.json';
import SupplyVaultMigratorJSON from '../abis/contracts/ISupplyVaultMigrator01.json';
import BoostMaxxerJSON from '../abis/contracts/BoostMaxxer.json';
import GaugeVaultProxyManagerJSON from '../abis/contracts/GaugeVaultProxyManager.json';
import Router02JSON from '../abis/contracts/Router02.json';
import { SUPPLY_VAULTS, SUPPLY_VAULT_ROUTERS, SUPPLY_VAULT_MIGRATORS } from '../config/web3/contracts/supply-vault';
import { parse18, parseNumber } from '../utils/big-amount';
import { BOOSTMAXXER_ADDRESSES } from '../config/web3/contracts/boostmaxxer';
import { FACTORY_DETAILS_MAP } from '../config/web3/contracts/tarot-factories';
import { LENDING_POOLS_LIST, LENDING_POOL_DETAILS_MAP } from '../config/web3/contracts/lending-pools';
import { ZERO_ADDRESS } from '../utils/address';
import { GAUGE_VAULT_PROXY_MANAGER_ADDRESS } from '../config/web3/contracts/wrapped-escrow-spirit';

export async function xStake(
  this: TarotRouter,
  amount: BigNumber,
  poolId: number,
  // eslint-disable-next-line @typescript-eslint/ban-types
  onTransactionHash: Function
): Promise<void> {
  const xStakingPoolController = new Contract(this.xStakingPoolController.address, this.xStakingPoolController.interface, this.library.getSigner(this.account).connectUnchecked());
  try {
    const txTask = xStakingPoolController.deposit(BigNumber.from(poolId), amount);
    const receipt = await waitForTx(this, txTask);
    onTransactionHash(receipt.transactionHash);
  } catch (error) {
    console.error('[stake] error.message => ', error.message);
  }
}

export async function xUnstake(
  this: TarotRouter,
  amount: BigNumber,
  poolId: number,
  // eslint-disable-next-line @typescript-eslint/ban-types
  onTransactionHash: Function
): Promise<void> {
  const xStakingPoolController = new Contract(this.xStakingPoolController.address, this.xStakingPoolController.interface, this.library.getSigner(this.account).connectUnchecked());
  try {
    const txTask = xStakingPoolController.withdraw(BigNumber.from(poolId), amount);
    const receipt = await waitForTx(this, txTask);
    onTransactionHash(receipt.transactionHash);
  } catch (error) {
    console.error('[stake] error.message => ', error.message);
  }
}

export async function boostStake(
  this: TarotRouter,
  amount: BigNumber,
  poolInfo: BoostMaxxPoolInfo,
  // eslint-disable-next-line @typescript-eslint/ban-types
  onTransactionHash: Function
): Promise<void> {
  const boostMaxxer = new Contract(BOOSTMAXXER_ADDRESSES[this.chainId], BoostMaxxerJSON, this.library.getSigner(this.account).connectUnchecked());
  try {
    const txTask = boostMaxxer.deposit(poolInfo.id, amount);
    const receipt = await waitForTx(this, txTask);
    onTransactionHash(receipt.transactionHash);
  } catch (error) {
    console.error('[stake] error.message => ', error.message);
  }
}

export async function boostUnstake(
  this: TarotRouter,
  amount: BigNumber,
  poolInfo: BoostMaxxPoolInfo,
  // eslint-disable-next-line @typescript-eslint/ban-types
  onTransactionHash: Function
): Promise<void> {
  const boostMaxxer = new Contract(BOOSTMAXXER_ADDRESSES[this.chainId], BoostMaxxerJSON, this.library.getSigner(this.account).connectUnchecked());
  try {
    const txTask = boostMaxxer.withdraw(poolInfo.id, amount);
    const receipt = await waitForTx(this, txTask);
    onTransactionHash(receipt.transactionHash);
  } catch (error) {
    console.error('[stake] error.message => ', error.message);
  }
}

export async function gaugeVaultProxyManagerDeposit(
  this: TarotRouter,
  amount: BigNumber,
  // eslint-disable-next-line @typescript-eslint/ban-types
  onTransactionHash: Function
): Promise<void> {
  const gaugeVaultProxyManager = new Contract(GAUGE_VAULT_PROXY_MANAGER_ADDRESS, GaugeVaultProxyManagerJSON, this.library.getSigner(this.account).connectUnchecked());
  try {
    const txTask = gaugeVaultProxyManager.wrappedVeDeposit(amount);
    const receipt = await waitForTx(this, txTask);
    onTransactionHash(receipt.transactionHash);
  } catch (error) {
    console.error('[stake] error.message => ', error.message);
  }
}

export async function stake(
  this: TarotRouter,
  amount: BigNumber,
  supplyVaultAddress: Address,
  toStakeAddress: Address,
  // eslint-disable-next-line @typescript-eslint/ban-types
  onTransactionHash: Function
): Promise<void> {
  const fullLendingPoolsMap = await this.getFullLendingPoolsData();
  const supplyVaultInfo = SUPPLY_VAULTS[this.chainId][supplyVaultAddress];
  const wethAddress = WETH_ADDRESSES[this.chainId];
  const isWETH = toStakeAddress.toLowerCase() === wethAddress.toLowerCase();
  const isUnderlying = toStakeAddress.toLowerCase() === supplyVaultInfo.underlyingAddress.toLowerCase();
  const c = new Contract(SUPPLY_VAULT_ROUTERS[this.chainId], SupplyVaultRouterJSON, this.library.getSigner(this.account).connectUnchecked());
  try {
    let txTask;
    if (isUnderlying) {
      if (supplyVaultInfo.borrowableAddresses.length > 0) {
        // enter/enterETH
        let toBorrowable = supplyVaultInfo.borrowableAddresses[0];
        try {
          const supplyVaultBorrowables = supplyVaultInfo.borrowableAddresses.map(x => x.toLowerCase());
          const supplyRates: {borrowableAddress: string, supplyRate: number}[] = [];
          const parsedAmount = parseNumber({ amount: amount, decimals: supplyVaultInfo.underlyingDecimals });
          LENDING_POOLS_LIST
            .forEach(poolDetails => {
              const pool = fullLendingPoolsMap[poolDetails.lendingPoolAddress.toLowerCase()];
              [
                0,
                1
              ].forEach(x => {
                if (supplyVaultBorrowables.includes((poolDetails[`borrowableAddress${x}` as keyof typeof poolDetails] as string).toLowerCase())) {
                  const reserveFactor = parse18(poolDetails[`reserveFactor${x}` as keyof typeof poolDetails] as BigNumberish);
                  const totalBalance = parseFloat(formatUnits(pool.excessSupply[x], poolDetails[`decimals${x}` as keyof typeof poolDetails] as BigNumberish));
                  const totalBorrows = parseFloat(formatUnits(pool.totalBorrows[x], poolDetails[`decimals${x}` as keyof typeof poolDetails] as BigNumberish));
                  const kinkBorrowRate = parse18(pool.nextKinkBorrowRate[x]);
                  const kinkUtilizationRate = parse18(poolDetails[`kinkUtilizationRate${x}` as keyof typeof poolDetails] as BigNumberish);
                  const utilizationRate = (totalBalance + totalBorrows + parsedAmount) === 0 ? 0 : totalBorrows / (totalBalance + totalBorrows + parsedAmount);
                  const kinkMultiplier = FACTORY_DETAILS_MAP[poolDetails.tarotFactoryAddress].kinkMultiplier;
                  const supplyRate = (utilizationRate < kinkUtilizationRate) ? utilizationRate / kinkUtilizationRate * kinkBorrowRate * utilizationRate * (1 - reserveFactor) :
                    ((utilizationRate - kinkUtilizationRate) / (1 - kinkUtilizationRate) * (kinkMultiplier - 1) + 1) * kinkBorrowRate * utilizationRate * (1 - reserveFactor);
                  supplyRates.push({
                    borrowableAddress: poolDetails[`borrowableAddress${x}` as keyof typeof poolDetails] as string,
                    supplyRate: supplyRate
                  });
                }
              });
            });
          const max = supplyRates.reduce((prev, curr) => (prev.supplyRate > curr.supplyRate) ? prev : curr);
          toBorrowable = max.borrowableAddress;
        } catch (error) {
          console.error('[stake - getBestBorrowable] => ', error.message);
        }
        if (isWETH) {
          txTask = c.enterETH(supplyVaultAddress, toBorrowable, { value: amount });
        } else {
          txTask = c.enter(supplyVaultAddress, amount, toBorrowable);
        }
      } else {
        // enterWithAlloc/enterWithAllocETH
        if (isWETH) {
          txTask = c.enterWithAllocETH(supplyVaultAddress, { value: amount });
        } else {
          txTask = c.enterWithAlloc(supplyVaultAddress, amount);
        }
      }
    } else {
      // is never WETH here as WETH can only be the underlying of a supply vault
      txTask = c.enterWithToken(supplyVaultAddress, toStakeAddress, amount);
    }
    const receipt = await waitForTx(this, txTask);
    onTransactionHash(receipt.transactionHash);
  } catch (error) {
    console.error('[stake] error.message => ', error.message);
  }
}

export async function unstake(
  this: TarotRouter,
  amount: BigNumber,
  supplyVaultAddress: Address,
  // eslint-disable-next-line @typescript-eslint/ban-types
  onTransactionHash: Function
): Promise<void> {
  const supplyVaultInfo = SUPPLY_VAULTS[this.chainId][supplyVaultAddress];
  const wethAddress = WETH_ADDRESSES[this.chainId];
  const isWETH = supplyVaultInfo.underlyingAddress.toLowerCase() === wethAddress.toLowerCase();
  const c = new Contract(SUPPLY_VAULT_ROUTERS[this.chainId], SupplyVaultRouterJSON, this.library.getSigner(this.account).connectUnchecked());
  try {
    let txTask;
    if (isWETH) {
      txTask = c.leaveETH(supplyVaultAddress, amount);
    } else {
      txTask = c.leave(supplyVaultAddress, amount);
    }
    const receipt = await waitForTx(this, txTask);
    onTransactionHash(receipt.transactionHash);
  } catch (error) {
    console.error('[unstake] error.message => ', error.message);
  }
}

export async function migrate(
  this: TarotRouter,
  supplyVaultAddress: Address,
  // eslint-disable-next-line @typescript-eslint/ban-types
  onTransactionHash: Function
): Promise<void> {
  const supplyVaultInfo = SUPPLY_VAULTS[this.chainId][supplyVaultAddress];
  const c = new Contract(SUPPLY_VAULT_MIGRATORS[this.chainId], SupplyVaultMigratorJSON, this.library.getSigner(this.account).connectUnchecked());
  try {
    const txTask = c.migrate(supplyVaultInfo.migrateFromAddress, supplyVaultAddress);
    const receipt = await waitForTx(this, txTask);
    onTransactionHash(receipt.transactionHash);
  } catch (error) {
    console.error('[migrate] error.message => ', error.message);
  }
}

export async function deposit(
  this: TarotRouter,
  uniswapV2PairAddress: Address,
  poolTokenType: PoolTokenType,
  amount: BigNumber,
  permitData: PermitData,
  // eslint-disable-next-line @typescript-eslint/ban-types
  onTransactionHash: Function
): Promise<void> {
  const [poolToken, token] = await this.getContracts(uniswapV2PairAddress, poolTokenType);
  const data = permitData ? permitData.permitData : '0x';
  const deadline = permitData ? permitData.deadline : this.getDeadline();
  const c = new Contract(this.getRouterByLendingPoolId(uniswapV2PairAddress), Router02JSON, this.library.getSigner(this.account).connectUnchecked());
  try {
    const wethAddress = WETH_ADDRESSES[this.chainId];
    let txTask;
    if (token.address.toLowerCase() === wethAddress.toLowerCase()) {
      const overrides = { value: amount };
      txTask = c.mintETH(poolToken.address, this.account, deadline, overrides);
    } else if (poolTokenType === PoolTokenType.Collateral) {
      txTask = c.mintCollateral(poolToken.address, amount, this.account, deadline, data);
    } else {
      txTask = c.mint(poolToken.address, amount, this.account, deadline);
    }
    const receipt = await waitForTx(this, txTask);
    onTransactionHash(receipt.transactionHash);
  } catch (error) {
    console.error('[deposit] error.message => ', error.message);
  }
}

export async function withdraw(
  this: TarotRouter,
  uniswapV2PairAddress: Address,
  poolTokenType: PoolTokenType,
  tokens: BigNumber,
  permitData: PermitData,
  // eslint-disable-next-line @typescript-eslint/ban-types
  onTransactionHash: Function
): Promise<void> {
  const [poolToken, token] = await this.getContracts(uniswapV2PairAddress, poolTokenType);
  const data = permitData ? permitData.permitData : '0x';
  const deadline = permitData ? permitData.deadline : this.getDeadline();
  const c = new Contract(this.getRouterByLendingPoolId(uniswapV2PairAddress), Router02JSON, this.library.getSigner(this.account).connectUnchecked());
  let txTask;
  try {
    const wethAddress = WETH_ADDRESSES[this.chainId];
    if (token.address.toLowerCase() === wethAddress.toLowerCase()) {
      txTask = c.redeemETH(poolToken.address, tokens, this.account, deadline, data);
    } else {
      txTask = c.redeem(poolToken.address, tokens, this.account, deadline, data);
    }
    const receipt = await waitForTx(this, txTask);
    onTransactionHash(receipt.transactionHash);
  } catch (error) {
    console.error('[withdraw] error.message => ', error.message);
  }
}

export async function borrow(
  this: TarotRouter,
  uniswapV2PairAddress: Address,
  poolTokenType: PoolTokenType,
  amount: BigNumber,
  permitData: PermitData,
  // eslint-disable-next-line @typescript-eslint/ban-types
  onTransactionHash: Function
): Promise<void> {
  const [borrowable, token] = await this.getContracts(uniswapV2PairAddress, poolTokenType);
  const data = permitData ? permitData.permitData : '0x';
  const deadline = permitData ? permitData.deadline : this.getDeadline();
  const c = new Contract(this.getRouterByLendingPoolId(uniswapV2PairAddress), Router02JSON, this.library.getSigner(this.account).connectUnchecked());
  try {
    const wethAddress = WETH_ADDRESSES[this.chainId];
    let txTask;
    if (token.address.toLowerCase() === wethAddress.toLowerCase()) {
      txTask = c.borrowETH(borrowable.address, amount, this.account, deadline, data);
    } else {
      txTask = c.borrow(borrowable.address, amount, this.account, deadline, data);
    }
    const receipt = await waitForTx(this, txTask);
    onTransactionHash(receipt.transactionHash);
  } catch (error) {
    console.error('[borrow] error.message => ', error.message);
  }
}

export async function repay(
  this: TarotRouter,
  uniswapV2PairAddress: Address,
  poolTokenType: PoolTokenType,
  amount: BigNumber,
  // eslint-disable-next-line @typescript-eslint/ban-types
  onTransactionHash: Function
): Promise<void> {
  const [borrowable, token] = await this.getContracts(uniswapV2PairAddress, poolTokenType);
  const deadline = this.getDeadline();
  const c = new Contract(this.getRouterByLendingPoolId(uniswapV2PairAddress), Router02JSON, this.library.getSigner(this.account).connectUnchecked());
  try {
    const wethAddress = WETH_ADDRESSES[this.chainId];
    let txTask;
    if (token.address.toLowerCase() === wethAddress.toLowerCase()) {
      const overrides = { value: amount };
      txTask = c.repayETH(borrowable.address, this.account, deadline, overrides);
    } else {
      txTask = c.repay(borrowable.address, amount, this.account, deadline);
    }
    const receipt = await waitForTx(this, txTask);
    onTransactionHash(receipt.transactionHash);
  } catch (error) {
    console.error('[repay] error.message => ', error.message);
  }
}

export async function getLeverageAmounts(
  this: TarotRouter,
  uniswapV2PairAddress: Address,
  leverage: number,
  slippage: number
) : Promise<{bAmountA: number, bAmountB: number, cAmount: number, bAmountAMin: number, bAmountBMin: number, cAmountMin: number}> {
  const poolDetails = LENDING_POOL_DETAILS_MAP[uniswapV2PairAddress.toLowerCase()];
  if (poolDetails.stable) {
    const [pools, [priceA, priceB], [reserve0, reserve1], currentLeverage, collateralValueBigAmount] = await Promise.all([
      this.getFullLendingPoolsData(),
      this.getMarketPriceDenomLP(uniswapV2PairAddress),
      this.getReserves(uniswapV2PairAddress),
      this.getLeverage(uniswapV2PairAddress),
      this.getDeposited(uniswapV2PairAddress, PoolTokenType.Collateral)
    ]);
    const pool = pools[uniswapV2PairAddress.toLowerCase()];
    if (!pool.twapReserves) {
      return {
        bAmountA: 0,
        bAmountB: 0,
        cAmount: 0,
        bAmountAMin: 0,
        bAmountBMin: 0,
        cAmountMin: 0
      };
    }
    const twapReserve0 = parse18(BigNumber.from(pool.twapReserves[0]).mul(TEN_18).div(BigNumber.from(10).pow(poolDetails.decimals0)));
    const twapReserve1 = parse18(BigNumber.from(pool.twapReserves[1]).mul(TEN_18).div(BigNumber.from(10).pow(poolDetails.decimals1)));
    const m = (reserve1 / reserve0) / (twapReserve1 / twapReserve0);
    const x2 = reserve0 * reserve0;
    const y2 = reserve1 * reserve1;
    const f = (3 * x2 + y2) / (x2 + 3 * y2);
    const impLoss = reserve1 / twapReserve1 * (1 + f) / (1 + m * f);
    const adjustFactor = Math.pow(impLoss, leverage);
    const collateralValue = parseNumber(collateralValueBigAmount);
    const changeCollateralValue = (collateralValue * leverage / currentLeverage - collateralValue) * adjustFactor;
    const valueA = changeCollateralValue * f / (1 + f);
    const valueB = changeCollateralValue / (1 + f);
    const bAmountA = priceA > 0 ? valueA / priceA : 0;
    const bAmountB = priceB > 0 ? valueB / priceB : 0;
    const cAmount = changeCollateralValue ? changeCollateralValue : 0;
    return {
      bAmountA: bAmountA,
      bAmountB: bAmountB,
      cAmount: cAmount,
      bAmountAMin: bAmountA / slippage,
      bAmountBMin: bAmountB / slippage,
      cAmountMin: cAmount / Math.sqrt(slippage)
    };
  }
  const [priceA, priceB] = await this.getMarketPriceDenomLP(uniswapV2PairAddress);
  // This function must use the market price, but the account leverage is calculated with the TWAP, so we need an adjustFactor
  const [priceATWAP] = await this.getPriceDenomLP(uniswapV2PairAddress);
  const diff = priceA > priceATWAP ? priceA / priceATWAP : priceATWAP / priceA;
  const adjustFactor = Math.pow(impermanentLoss(diff ** 2), leverage);
  const currentLeverage = await this.getLeverage(uniswapV2PairAddress);
  const collateralValueBigAmount = await this.getDeposited(uniswapV2PairAddress, PoolTokenType.Collateral);
  const collateralValue = parseNumber(collateralValueBigAmount);
  const changeCollateralValue = (collateralValue * leverage / currentLeverage - collateralValue) * adjustFactor;
  const valueForEach = changeCollateralValue / 2;
  const bAmountA = priceA > 0 ? valueForEach / priceA : 0;
  const bAmountB = priceB > 0 ? valueForEach / priceB : 0;
  const cAmount = changeCollateralValue ? changeCollateralValue : 0;
  return {
    bAmountA: bAmountA,
    bAmountB: bAmountB,
    cAmount: cAmount,
    bAmountAMin: bAmountA / slippage,
    bAmountBMin: bAmountB / slippage,
    cAmountMin: cAmount / Math.sqrt(slippage)
  };
}
export async function leverage(
  this: TarotRouter,
  uniswapV2PairAddress: Address,
  amountA: BigNumber,
  amountB: BigNumber,
  amountAMin: BigNumber,
  amountBMin: BigNumber,
  permitDataA: PermitData,
  permitDataB: PermitData,
  // eslint-disable-next-line @typescript-eslint/ban-types
  onTransactionHash: Function
): Promise<void> {
  const dataA = permitDataA ? permitDataA.permitData : '0x';
  const dataB = permitDataB ? permitDataB.permitData : '0x';
  if (permitDataA && permitDataB && !permitDataA.deadline.eq(permitDataB.deadline)) {
    return console.error('Permits deadline are not equal');
  }
  const deadline = permitDataA ? permitDataA.deadline : permitDataB ? permitDataB.deadline : this.getDeadline();
  const c = new Contract(this.getRouterByLendingPoolId(uniswapV2PairAddress), Router02JSON, this.library.getSigner(this.account).connectUnchecked());
  try {
    const txTask =
      c.leverage(
        uniswapV2PairAddress,
        amountA,
        amountB,
        amountAMin,
        amountBMin,
        this.account,
        deadline,
        dataA,
        dataB
      );
    const receipt = await waitForTx(this, txTask);
    onTransactionHash(receipt.transactionHash);
  } catch (error) {
    console.error('[leverage] error.message => ', error.message);
  }
}

export async function getDeleverageAmounts(
  this: TarotRouter,
  uniswapV2PairAddress: Address,
  changeCollateralValue: number,
  slippage: number
) : Promise<{bAmountA: number, bAmountB: number, cAmount: number, bAmountAMin: number, bAmountBMin: number}> {
  const [[x, y], [priceA, priceB]] = await Promise.all([
    this.getReserves(uniswapV2PairAddress),
    this.getMarketPriceDenomLP(uniswapV2PairAddress)
  ]);
  const poolDetails = LENDING_POOL_DETAILS_MAP[uniswapV2PairAddress.toLowerCase()];
  const x2 = x * x;
  const y2 = y * y;
  const f = poolDetails.stable ? (3 * x2 + y2) / (x2 + 3 * y2) : 1;
  const valueA = changeCollateralValue * f / (1 + f);
  const valueB = changeCollateralValue / (1 + f);
  const bAmountA = priceA > 0 ? valueA / priceA : 0;
  const bAmountB = priceB > 0 ? valueB / priceB : 0;
  return {
    bAmountA: bAmountA,
    bAmountB: bAmountB,
    cAmount: changeCollateralValue,
    bAmountAMin: bAmountA / Math.sqrt(slippage),
    bAmountBMin: bAmountB / Math.sqrt(slippage)
  };
}
export async function deleverage(
  this: TarotRouter,
  uniswapV2PairAddress: Address,
  tokens: BigNumber,
  amountAMin: BigNumber,
  amountBMin: BigNumber,
  permitData: PermitData,
  // eslint-disable-next-line @typescript-eslint/ban-types
  onTransactionHash: Function
): Promise<void> {
  const data = permitData ? permitData.permitData : '0x';
  const deadline = permitData ? permitData.deadline : this.getDeadline();
  const c = new Contract(this.getRouterByLendingPoolId(uniswapV2PairAddress), Router02JSON, this.library.getSigner(this.account).connectUnchecked());
  try {
    const txTask =
      c.deleverage(uniswapV2PairAddress, tokens, amountAMin, amountBMin, deadline, data);
    const receipt = await waitForTx(this, txTask);
    onTransactionHash(receipt.transactionHash);
  } catch (error) {
    console.error('[deleverage] error.message => ', error.message);
  }
}

export async function trackBorrows(
  this: TarotRouter,
  uniswapV2PairAddress: Address,
  // eslint-disable-next-line @typescript-eslint/ban-types
  onTransactionHash: Function
): Promise<void> {
  const toTrack = [];
  const borrowableA = await this.getPoolToken(uniswapV2PairAddress, PoolTokenType.BorrowableA);
  const borrowableB = await this.getPoolToken(uniswapV2PairAddress, PoolTokenType.BorrowableB);
  const borrowedA = await this.getBorrowed(uniswapV2PairAddress, PoolTokenType.BorrowableA);
  const borrowedB = await this.getBorrowed(uniswapV2PairAddress, PoolTokenType.BorrowableB);
  const sharesA = await this.getFarmingShares(uniswapV2PairAddress, PoolTokenType.BorrowableA);
  const sharesB = await this.getFarmingShares(uniswapV2PairAddress, PoolTokenType.BorrowableB);
  if (borrowedA.amount.gt(0) && sharesA === 0) toTrack.push(borrowableA.address);
  if (borrowedB.amount.gt(0) && sharesB === 0) toTrack.push(borrowableB.address);
  const c = new Contract(this.claimAggregator.address, this.claimAggregator.interface, this.library.getSigner(this.account).connectUnchecked());
  try {
    const txTask = c.trackBorrows(this.account, toTrack);
    const receipt = await waitForTx(this, txTask);
    onTransactionHash(receipt.transactionHash);
  } catch (error) {
    console.error('[trackBorrows] error.message => ', error.message);
  }
}

export async function claimXStakingReward(
  this: TarotRouter,
  poolId: number,
  // eslint-disable-next-line @typescript-eslint/ban-types
  onTransactionHash: Function
): Promise<void> {
  const xStakingPoolController = new Contract(this.xStakingPoolController.address, this.xStakingPoolController.interface, this.library.getSigner(this.account).connectUnchecked());
  try {
    const txTask = xStakingPoolController.withdraw(BigNumber.from(poolId), BigNumber.from(0));
    const receipt = await waitForTx(this, txTask);
    onTransactionHash(receipt.transactionHash);
  } catch (error) {
    console.error('[claims] error.message => ', error.message);
  }
}

export async function claimBoostReward(
  this: TarotRouter,
  pool: string,
  // eslint-disable-next-line @typescript-eslint/ban-types
  onTransactionHash: Function
): Promise<void> {
  const boostMaxxer = new Contract(BOOSTMAXXER_ADDRESSES[this.chainId], BoostMaxxerJSON, this.library.getSigner(this.account).connectUnchecked());
  try {
    const txTask = boostMaxxer.withdraw(pool, BigNumber.from(0));
    const receipt = await waitForTx(this, txTask);
    onTransactionHash(receipt.transactionHash);
  } catch (error) {
    console.error('[claims] error.message => ', error.message);
  }
}

export async function claimAllFarmingRewards(
  this: TarotRouter,
  // eslint-disable-next-line @typescript-eslint/ban-types
  onTransactionHash: Function
): Promise<void> {
  const toClaim = [];
  const farmingPools = [];
  const lendingPools = LENDING_POOLS_LIST;
  for (const lendingPool of lendingPools) {
    if (lendingPool.farmingPoolAddress0 && lendingPool.farmingPoolAddress0 !== ZERO_ADDRESS) {
      farmingPools.push(new Contract(lendingPool.farmingPoolAddress0, FarmingPoolJSON, this.readLibrary));
    }
    if (lendingPool.farmingPoolAddress1 && lendingPool.farmingPoolAddress1 !== ZERO_ADDRESS) {
      farmingPools.push(new Contract(lendingPool.farmingPoolAddress1, FarmingPoolJSON, this.readLibrary));
    }
  }

  const claimAmounts = await this.doMulticall(
    farmingPools.map(farmingPool => ([farmingPool, 'claimAccount', [this.account]])));
  for (let i = 0; i < claimAmounts.length; i++) {
    const claimAmount = claimAmounts[i];
    const farmingPool = farmingPools[i];
    if (claimAmount.gt(0)) {
      toClaim.push(farmingPool.address);
    }
  }
  const c = new Contract(this.claimAggregator.address, this.claimAggregator.interface, this.library.getSigner(this.account).connectUnchecked());
  try {
    const txTask = c.claims(this.account, toClaim);
    const receipt = await waitForTx(this, txTask);
    onTransactionHash(receipt.transactionHash);
  } catch (error) {
    console.error('[claimAllFarmingRewards] error.message => ', error.message);
  }
}

export async function claims(
  this: TarotRouter,
  uniswapV2PairAddress: Address,
  // eslint-disable-next-line @typescript-eslint/ban-types
  onTransactionHash: Function
): Promise<void> {
  const toClaim = [];
  const [farmingPoolA, farmingPoolB] = await Promise.all([
    this.getFarmingPool(uniswapV2PairAddress, PoolTokenType.BorrowableA),
    this.getFarmingPool(uniswapV2PairAddress, PoolTokenType.BorrowableB)
  ]);
  const fA = new Contract(farmingPoolA.address, farmingPoolA.interface, this.library.getSigner(this.account));
  const fB = new Contract(farmingPoolB.address, farmingPoolB.interface, this.library.getSigner(this.account));
  const [bigClaimAmountA, bigClaimAmountB] = await Promise.all([
    fA.callStatic.claim({ blockTag: 'latest' }),
    fB.callStatic.claim({ blockTag: 'latest' })
  ]);
  const claimAmountA = parseFloat(formatUnits(bigClaimAmountA));
  const claimAmountB = parseFloat(formatUnits(bigClaimAmountB));
  if (claimAmountA * 1 > 0) toClaim.push(farmingPoolA.address);
  if (claimAmountB * 1 > 0) toClaim.push(farmingPoolB.address);
  const c = new Contract(this.claimAggregator.address, this.claimAggregator.interface, this.library.getSigner(this.account).connectUnchecked());
  try {
    const txTask = c.claims(this.account, toClaim);
    const receipt = await waitForTx(this, txTask);
    onTransactionHash(receipt.transactionHash);
  } catch (error) {
    console.error('[claims] error.message => ', error.message);
  }
}

export async function claimDistributor(
  this: TarotRouter,
  distributorDetails: DistributorDetails,
  // eslint-disable-next-line @typescript-eslint/ban-types
  onTransactionHash: Function
): Promise<void> {
  const claimable = await this.getClaimable(distributorDetails.claimableAddress);
  const c = new Contract(claimable.address, claimable.interface, this.library.getSigner(this.account));
  try {
    const txTask = c.claim.call({ blockTag: 'latest' });
    const receipt = await waitForTx(this, txTask);
    const txInfo = await this.library.getTransaction(receipt.transactionHash);
    onTransactionHash(receipt.transactionHash, txInfo.gasPrice, receipt.gasUsed, receipt.logs);
  } catch (error) {
    console.error('[claimDistributor] error.message => ', error.message);
  }
}

export async function reinvest(
  this: TarotRouter,
  uniswapV2PairAddress: Address,
  // eslint-disable-next-line @typescript-eslint/ban-types
  onTransactionHash: Function
): Promise<void> {
  try {
    const vaultToken = await this.getVaultToken(uniswapV2PairAddress);
    const c = new Contract(vaultToken.address, vaultToken.interface, this.library.getSigner(this.account).connectUnchecked());
    const txTask = c.reinvest();
    const receipt = await waitForTx(this, txTask);
    onTransactionHash(receipt.transactionHash);
  } catch (error) {
    console.error('[reinvest] error.message => ', error.message);
  }
}

export async function liquidityGeneratorDeposit(
  this: TarotRouter,
  amount: BigNumber,
  // eslint-disable-next-line @typescript-eslint/ban-types
  onTransactionHash: Function
): Promise<void> {
  try {
    if (!this.liquidityGenerator) {
      return;
    }
    const c = new Contract(this.liquidityGenerator.address, this.liquidityGenerator.interface, this.library.getSigner(this.account));
    const overrides = { value: amount };
    const txTask = c.deposit(overrides);
    const receipt = await waitForTx(this, txTask);
    const txInfo = await this.library.getTransaction(receipt.transactionHash);
    onTransactionHash(receipt.transactionHash, txInfo.gasPrice, receipt.gasUsed, receipt.logs);
  } catch (error) {
    console.error('[liquidityGeneratorDeposit] error.message => ', error.message);
  }
}
