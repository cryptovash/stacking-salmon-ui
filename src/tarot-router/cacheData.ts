/* eslint-disable no-invalid-this */
import { LENDING_POOL_DETAILS_MAP } from '../config/web3/contracts/lending-pools';
import { FACTORY_DETAILS_MAP } from '../config/web3/contracts/tarot-factories';
import { BigNumber } from 'ethers';
import { formatUnits } from 'ethers/lib/utils';
import toAPY from '../services/to-apy';
import { parse18, parseNumber } from '../utils/big-amount';
import TarotRouter from '.';
import { Address, BigAmount, PoolTokenType, TEN_18, ZERO_BIG_AMOUNT } from '../types/interfaces';

// Adjust subgraph's token price if vaultToken
export async function getPoolTokenPrice(
  this: TarotRouter,
  uniswapV2PairAddress: Address,
  poolTokenType: PoolTokenType) : Promise<number> {
  const poolDetails = LENDING_POOL_DETAILS_MAP[uniswapV2PairAddress.toLowerCase()];
  if (!poolDetails) {
    return 0;
  }
  const [tokenPriceMap, pool] = await Promise.all([
    this.getTokenPrices(),
    this.getFullLendingPool(uniswapV2PairAddress)
  ]);
  if (poolTokenType === PoolTokenType.Collateral) {
    return parse18(tokenPriceMap[poolDetails.uniswapV2PairAddress.toLowerCase()].priceUSD.value.mul(pool.vaultTokenExchangeRate).div(TEN_18));
  } else if (poolTokenType === PoolTokenType.BorrowableA) {
    return parse18(tokenPriceMap[poolDetails.tokenAddress0.toLowerCase()].priceUSD.value);
  } else if (poolTokenType === PoolTokenType.BorrowableB) {
    return parse18(tokenPriceMap[poolDetails.tokenAddress1.toLowerCase()].priceUSD.value);
  } else {
    return 0;
  }
}

// Total balance
export async function getTotalBalance(this: TarotRouter, uniswapV2PairAddress: Address, poolTokenType: PoolTokenType) : Promise<BigAmount> {
  const lendingPoolData = await this.getFullLendingPool(uniswapV2PairAddress);
  const poolDetails = LENDING_POOL_DETAILS_MAP[uniswapV2PairAddress.toLowerCase()];
  if (poolTokenType === PoolTokenType.Collateral) {
    return {
      amount: BigNumber.from(lendingPoolData.totalLp),
      decimals: BigNumber.from(18)
    };
  }
  if (poolTokenType === PoolTokenType.BorrowableA) {
    return {
      amount: BigNumber.from(lendingPoolData.excessSupply[0]),
      decimals: BigNumber.from(poolDetails.decimals0)
    };
  }
  if (poolTokenType === PoolTokenType.BorrowableB) {
    return {
      amount: BigNumber.from(lendingPoolData.excessSupply[1]),
      decimals: BigNumber.from(poolDetails.decimals1)
    };
  }
  return ZERO_BIG_AMOUNT;
}

// Safety Margin
export async function getSafetyMargin(this: TarotRouter, uniswapV2PairAddress: Address) : Promise<number> {
  const poolDetails = LENDING_POOL_DETAILS_MAP[uniswapV2PairAddress.toLowerCase()];
  return poolDetails.stable ? parse18(BigNumber.from(poolDetails.stableSafetyMargin)) : parse18(BigNumber.from(poolDetails.safetyMarginSqrt).pow(2).div(TEN_18));
}

// Liquidation Penalty
export async function getLiquidationPenalty(this: TarotRouter, uniswapV2PairAddress: Address) : Promise<number> {
  const poolDetails = LENDING_POOL_DETAILS_MAP[uniswapV2PairAddress.toLowerCase()];
  return parse18(BigNumber.from(poolDetails.liquidationIncentive).add(poolDetails.liquidationFee ? poolDetails.liquidationFee : 0));
}

// Reserve Factor
export async function getReserveFactor(this: TarotRouter, uniswapV2PairAddress: Address, poolTokenType: PoolTokenType) : Promise<number> {
  const poolDetails = LENDING_POOL_DETAILS_MAP[uniswapV2PairAddress.toLowerCase()];
  if (poolTokenType === PoolTokenType.BorrowableA) {
    return parse18(BigNumber.from(poolDetails.reserveFactor0));
  }
  if (poolTokenType === PoolTokenType.BorrowableB) {
    return parse18(BigNumber.from(poolDetails.reserveFactor1));
  }
  return 0;
}

// Kink Borrow Rate
export async function getKinkBorrowRate(this: TarotRouter, uniswapV2PairAddress: Address, poolTokenType: PoolTokenType) : Promise<number> {
  const lendingPoolData = await this.getFullLendingPool(uniswapV2PairAddress);
  if (poolTokenType === PoolTokenType.Collateral) {
    return parse18(lendingPoolData.totalLp);
  }
  if (poolTokenType === PoolTokenType.BorrowableA) {
    return parse18(BigNumber.from(lendingPoolData.kinkBorrowRate[0]));
  }
  if (poolTokenType === PoolTokenType.BorrowableB) {
    return parse18(BigNumber.from(lendingPoolData.kinkBorrowRate[1]));
  }
  return 0;
}
export async function getNextKinkBorrowRate(this: TarotRouter, uniswapV2PairAddress: Address, poolTokenType: PoolTokenType) : Promise<number> {
  const lendingPoolData = await this.getFullLendingPool(uniswapV2PairAddress);
  if (poolTokenType === PoolTokenType.Collateral) {
    return parse18(lendingPoolData.totalLp);
  }
  if (poolTokenType === PoolTokenType.BorrowableA) {
    return parse18(BigNumber.from(lendingPoolData.nextKinkBorrowRate[0]));
  }
  if (poolTokenType === PoolTokenType.BorrowableB) {
    return parse18(BigNumber.from(lendingPoolData.nextKinkBorrowRate[1]));
  }
  return 0;
}

// Kink Utilization Rate
export async function getKinkUtilizationRate(this: TarotRouter, uniswapV2PairAddress: Address, poolTokenType: PoolTokenType) : Promise<number> {
  const poolDetails = LENDING_POOL_DETAILS_MAP[uniswapV2PairAddress.toLowerCase()];
  if (poolTokenType === PoolTokenType.BorrowableA) {
    return parse18(BigNumber.from(poolDetails.kinkUtilizationRate0));
  }
  if (poolTokenType === PoolTokenType.BorrowableB) {
    return parse18(BigNumber.from(poolDetails.kinkUtilizationRate1));
  }
  return 0;
}
export async function getKinkUtilizationRates(this: TarotRouter, uniswapV2PairAddress: Address, poolTokenType: PoolTokenType) : Promise<[number, number]> {
  const poolDetails = LENDING_POOL_DETAILS_MAP[uniswapV2PairAddress.toLowerCase()];
  if (poolTokenType === PoolTokenType.BorrowableA) {
    return [
      parse18(BigNumber.from(poolDetails.kinkUtilizationRateLower0)),
      parse18(BigNumber.from(poolDetails.kinkUtilizationRateUpper0))
    ];
  }
  if (poolTokenType === PoolTokenType.BorrowableB) {
    return [
      parse18(BigNumber.from(poolDetails.kinkUtilizationRateLower1)),
      parse18(BigNumber.from(poolDetails.kinkUtilizationRateUpper1))
    ];
  }
  return [0, 0];
}

// Accrue Timestamp
export async function getAccrualTimestamp(this: TarotRouter, uniswapV2PairAddress: Address, poolTokenType: PoolTokenType) : Promise<number> {
  const lendingPoolData = await this.getFullLendingPool(uniswapV2PairAddress);
  if (poolTokenType === PoolTokenType.BorrowableA) {
    return lendingPoolData.accrualTimestamp[0];
  }
  if (poolTokenType === PoolTokenType.BorrowableB) {
    return lendingPoolData.accrualTimestamp[1];
  }
  return 0;
}

// Total borrows
export async function getTotalBorrows(this: TarotRouter, uniswapV2PairAddress: Address, poolTokenType: PoolTokenType) : Promise<number> {
  const lendingPoolData = await this.getFullLendingPool(uniswapV2PairAddress);
  const poolDetails = LENDING_POOL_DETAILS_MAP[uniswapV2PairAddress.toLowerCase()];
  if (poolTokenType === PoolTokenType.BorrowableA) {
    return parseFloat(formatUnits(BigNumber.from(lendingPoolData.totalBorrows[0]), poolDetails.decimals0));
  }
  if (poolTokenType === PoolTokenType.BorrowableB) {
    return parseFloat(formatUnits(BigNumber.from(lendingPoolData.totalBorrows[1]), poolDetails.decimals1));
  }
  return 0;
}
export async function getTotalBorrowsUSD(this: TarotRouter, uniswapV2PairAddress: Address, poolTokenType: PoolTokenType) : Promise<number> {
  const lendingPoolData = await this.getFullLendingPool(uniswapV2PairAddress);
  if (poolTokenType === PoolTokenType.BorrowableA) {
    return lendingPoolData.totalBorrowedUSD[0];
  }
  if (poolTokenType === PoolTokenType.BorrowableB) {
    return lendingPoolData.totalBorrowedUSD[1];
  }
  return 0;
}

export async function getBorrowRate(this: TarotRouter, uniswapV2PairAddress: Address, poolTokenType: PoolTokenType) : Promise<BigNumber> {
  const lendingPoolData = await this.getFullLendingPool(uniswapV2PairAddress);
  if (poolTokenType === PoolTokenType.BorrowableA) {
    return BigNumber.from(lendingPoolData.borrowRate[0]);
  }
  if (poolTokenType === PoolTokenType.BorrowableB) {
    return BigNumber.from(lendingPoolData.borrowRate[1]);
  }
  return BigNumber.from(0);
}

export async function getBorrowAPY(this: TarotRouter, uniswapV2PairAddress: Address, poolTokenType: PoolTokenType) : Promise<number> {
  const lendingPoolData = await this.getFullLendingPool(uniswapV2PairAddress);
  if (poolTokenType === PoolTokenType.BorrowableA) {
    return lendingPoolData.currBorrowAPR[0];
  }
  if (poolTokenType === PoolTokenType.BorrowableB) {
    return lendingPoolData.currBorrowAPR[1];
  }
  return 0;
}
export async function getNextBorrowRate(this: TarotRouter, uniswapV2PairAddress: Address, poolTokenType: PoolTokenType, borrowAmount: number) : Promise<number> {
  const [totalBorrows, supply, kinkBorrowRate, kinkUtilizationRate] = await Promise.all([
    this.getTotalBorrows(uniswapV2PairAddress, poolTokenType),
    this.getSupply(uniswapV2PairAddress, poolTokenType),
    (!borrowAmount || borrowAmount === 0) ? this.getKinkBorrowRate(uniswapV2PairAddress, poolTokenType) : this.getNextKinkBorrowRate(uniswapV2PairAddress, poolTokenType),
    this.getKinkUtilizationRate(uniswapV2PairAddress, poolTokenType)
  ]);
  const poolDetails = LENDING_POOL_DETAILS_MAP[uniswapV2PairAddress.toLowerCase()];
  const kinkMultiplier = FACTORY_DETAILS_MAP[LENDING_POOL_DETAILS_MAP[uniswapV2PairAddress.toLowerCase()].tarotFactoryAddress].kinkMultiplier;
  const utilizationRate = (borrowAmount + totalBorrows) / supply;
  if (poolDetails.stable) {
    const [kinkLower, kinkUpper] = await this.getKinkUtilizationRates(uniswapV2PairAddress, poolTokenType);
    if (utilizationRate < kinkLower) {
      return utilizationRate / kinkLower * kinkBorrowRate;
    }
    if (utilizationRate < kinkUpper) {
      return kinkBorrowRate;
    }
    return ((utilizationRate - kinkUpper) / (1 - kinkUpper) * (kinkMultiplier - 1) + 1) * kinkBorrowRate;
  }
  if (utilizationRate < kinkUtilizationRate) return utilizationRate / kinkUtilizationRate * kinkBorrowRate;
  return ((utilizationRate - kinkUtilizationRate) / (1 - kinkUtilizationRate) * (kinkMultiplier - 1) + 1) * kinkBorrowRate;
}
export async function getNextBorrowAPY(this: TarotRouter, uniswapV2PairAddress: Address, poolTokenType: PoolTokenType, borrowAmount: number) : Promise<number> {
  const borrowRate = await this.getNextBorrowRate(uniswapV2PairAddress, poolTokenType, borrowAmount);
  return toAPY(borrowRate);
}

// Supply
export async function getSupply(this: TarotRouter, uniswapV2PairAddress: Address, poolTokenType: PoolTokenType) : Promise<number> {
  const [totalBalance, totalBorrows] = await Promise.all([
    this.getTotalBalance(uniswapV2PairAddress, poolTokenType),
    this.getTotalBorrows(uniswapV2PairAddress, poolTokenType)
  ]);
  return parseNumber(totalBalance) + totalBorrows;
}
export async function getSupplyUSD(this: TarotRouter, uniswapV2PairAddress: Address, poolTokenType: PoolTokenType) : Promise<number> {
  const lendingPoolData = await this.getFullLendingPool(uniswapV2PairAddress);
  if (poolTokenType === PoolTokenType.BorrowableA) {
    return lendingPoolData.totalSupplyUSD[0];
  }
  if (poolTokenType === PoolTokenType.BorrowableB) {
    return lendingPoolData.totalSupplyUSD[1];
  }
  return 0;
}

// Utilization Rate
export async function getUtilizationRate(this: TarotRouter, uniswapV2PairAddress: Address, poolTokenType: PoolTokenType) : Promise<number> {
  const lendingPoolData = await this.getFullLendingPool(uniswapV2PairAddress);
  if (poolTokenType === PoolTokenType.BorrowableA) {
    return lendingPoolData.utilization[0];
  }
  if (poolTokenType === PoolTokenType.BorrowableB) {
    return lendingPoolData.utilization[1];
  }
  return 0;
}

export async function getSupplyAPY(this: TarotRouter, uniswapV2PairAddress: Address, poolTokenType: PoolTokenType) : Promise<number> {
  const lendingPoolData = await this.getFullLendingPool(uniswapV2PairAddress);
  if (poolTokenType === PoolTokenType.BorrowableA) {
    return lendingPoolData.currSupplyAPR[0];
  }
  if (poolTokenType === PoolTokenType.BorrowableB) {
    return lendingPoolData.currSupplyAPR[1];
  }
  return 0;
}
export async function getNextSupplyRate(this: TarotRouter, uniswapV2PairAddress: Address, poolTokenType: PoolTokenType, supplyAmount: number) : Promise<number> {
  const [
    totalBorrows,
    supply,
    kinkBorrowRate,
    kinkUtilizationRate,
    reserveFactor
  ] = await Promise.all([
    this.getTotalBorrows(uniswapV2PairAddress, poolTokenType),
    this.getSupply(uniswapV2PairAddress, poolTokenType),
    (!supplyAmount || supplyAmount === 0) ? this.getKinkBorrowRate(uniswapV2PairAddress, poolTokenType) : this.getNextKinkBorrowRate(uniswapV2PairAddress, poolTokenType),
    this.getKinkUtilizationRate(uniswapV2PairAddress, poolTokenType),
    this.getReserveFactor(uniswapV2PairAddress, poolTokenType)
  ]);
  const poolDetails = LENDING_POOL_DETAILS_MAP[uniswapV2PairAddress.toLowerCase()];
  const kinkMultiplier = FACTORY_DETAILS_MAP[LENDING_POOL_DETAILS_MAP[uniswapV2PairAddress.toLowerCase()].tarotFactoryAddress].kinkMultiplier;
  const utilizationRate = totalBorrows / (supply + supplyAmount);
  if (poolDetails.stable) {
    const [kinkLower, kinkUpper] = await this.getKinkUtilizationRates(uniswapV2PairAddress, poolTokenType);
    if (utilizationRate < kinkLower) {
      return utilizationRate / kinkLower * kinkBorrowRate * utilizationRate * (1 - reserveFactor);
    }
    if (utilizationRate < kinkUpper) {
      return kinkBorrowRate * utilizationRate * (1 - reserveFactor);
    }
    return ((utilizationRate - kinkUpper) / (1 - kinkUpper) * (kinkMultiplier - 1) + 1) * kinkBorrowRate * utilizationRate * (1 - reserveFactor);
  }
  if (utilizationRate < kinkUtilizationRate) return utilizationRate / kinkUtilizationRate * kinkBorrowRate * utilizationRate * (1 - reserveFactor);
  return ((utilizationRate - kinkUtilizationRate) / (1 - kinkUtilizationRate) * (kinkMultiplier - 1) + 1) * kinkBorrowRate * utilizationRate * (1 - reserveFactor);
}
export async function getNextSupplyAPY(this: TarotRouter, uniswapV2PairAddress: Address, poolTokenType: PoolTokenType, supplyAmount: number) : Promise<number> {
  const supplyRate = await this.getNextSupplyRate(uniswapV2PairAddress, poolTokenType, supplyAmount);
  return toAPY(supplyRate);
}

// Utilization Rate
export async function getDexAPY(this: TarotRouter, uniswapV2PairAddress: Address) : Promise<number> {
  const lendingPoolData = await this.getFullLendingPool(uniswapV2PairAddress);
  return lendingPoolData.dexAPR;
}

// Reward Speed
export async function getRewardSpeed(this: TarotRouter, uniswapV2PairAddress: Address, poolTokenType: PoolTokenType) : Promise<number> {
  const lendingPoolData = await this.getFullLendingPool(uniswapV2PairAddress);
  if (poolTokenType === PoolTokenType.BorrowableA) {
    return lendingPoolData.rewardSpeed[0];
  }
  if (poolTokenType === PoolTokenType.BorrowableB) {
    return lendingPoolData.rewardSpeed[1];
  }
  return 0;
}

export async function getFarmingAPY(this: TarotRouter, uniswapV2PairAddress: Address, poolTokenType: PoolTokenType) : Promise<number> {
  const lendingPoolData = await this.getFullLendingPool(uniswapV2PairAddress);
  if (poolTokenType === PoolTokenType.BorrowableA) {
    return lendingPoolData.farmingPoolAPR[0];
  }
  if (poolTokenType === PoolTokenType.BorrowableB) {
    return lendingPoolData.farmingPoolAPR[1];
  }
  return 0;
}
export async function getNextFarmingAPY(this: TarotRouter, uniswapV2PairAddress: Address, poolTokenType: PoolTokenType, borrowAmount: number, borrowablePrice: number, tarotPrice: number) : Promise<number> {
  const [
    rewardSpeed,
    currentBorrowedUSD
  ] = await Promise.all([
    this.getRewardSpeed(uniswapV2PairAddress, poolTokenType),
    this.getTotalBorrowsUSD(uniswapV2PairAddress, poolTokenType)
  ]);
  const additionalBorrowsUSD = borrowAmount * borrowablePrice;
  const totalBorrowedUSD = currentBorrowedUSD + additionalBorrowsUSD;
  if (totalBorrowedUSD === 0) return 0;
  return toAPY(tarotPrice * rewardSpeed / totalBorrowedUSD);
}

// Vault
export async function isVaultToken(this: TarotRouter, uniswapV2PairAddress: Address) : Promise<boolean> {
  const poolDetails = LENDING_POOL_DETAILS_MAP[uniswapV2PairAddress.toLowerCase()];
  return poolDetails.isTarotVault;
}
export async function getVaultRewardsTokensDecimals(this: TarotRouter, uniswapV2PairAddress: Address) : Promise<number[]> {
  const lendingPoolData = await this.getFullLendingPool(uniswapV2PairAddress);
  return lendingPoolData.rewardsTokensDecimals;
}
export async function getVaultRewardsTokensSymbols(this: TarotRouter, uniswapV2PairAddress: Address) : Promise<string[]> {
  const lendingPoolData = await this.getFullLendingPool(uniswapV2PairAddress);
  return lendingPoolData.rewardsTokensSymbols;
}
export async function getVaultRewardsTokensAddresses(this: TarotRouter, uniswapV2PairAddress: Address) : Promise<string[]> {
  const lendingPoolData = await this.getFullLendingPool(uniswapV2PairAddress);
  return lendingPoolData.rewardsTokensAddresses;
}

// Shown leverage
export async function getShownLeverage(this: TarotRouter, uniswapV2PairAddress: Address) : Promise<number> {
  const safetyMargin = await this.getSafetyMargin(uniswapV2PairAddress);
  if (safetyMargin < 1.011) {
    return 50;
  }
  if (safetyMargin < 1.051) {
    return 20;
  }
  if (safetyMargin < 1.51) {
    return 10;
  }
  if (safetyMargin < 2.01) {
    return 5;
  }
  return 3;
}