/* eslint-disable no-invalid-this */
import { Address, PoolTokenType, Borrowable, LendingPoolData, FarmingPool } from '../types/interfaces';
import Subgraph from '.';
import toAPY from '../services/to-apy';
import { FACTORY_DETAILS_MAP } from '../config/web3/contracts/tarot-factories';
import { LENDING_POOL_IDS, LENDING_POOL_DETAILS_MAP, TAROT_LENDING_POOLS } from '../config/web3/contracts/lending-pools';

// All Pools
export async function getLendingPools(this: Subgraph) : Promise<LendingPoolData[]> {
  if (!this.chainId) {
    return [];
  }
  const lendingPoolData = await this.getLendingPoolsData();
  const allLendingPools = Object.keys(lendingPoolData).filter(pair => LENDING_POOL_IDS.includes(pair.toLowerCase()));
  const tarotPools = [];
  const nonTarotPools = [];
  for (const lendingPool of allLendingPools) {
    if (TAROT_LENDING_POOLS.includes(lendingPool.toLowerCase())) {
      tarotPools.push(lendingPoolData[lendingPool]);
    } else {
      nonTarotPools.push(lendingPoolData[lendingPool]);
    }
  }
  return [
    ...tarotPools,
    ...nonTarotPools
  ];
}

// Total balance
export async function getTotalBalance(this: Subgraph, uniswapV2PairAddress: Address, poolTokenType: PoolTokenType) : Promise<number> {
  const lendingPoolData = await this.getLendingPoolData(uniswapV2PairAddress);
  return parseFloat(lendingPoolData[poolTokenType].totalBalance);
}
export async function getTotalBalanceUSD(this: Subgraph, uniswapV2PairAddress: Address, poolTokenType: PoolTokenType, price: number) : Promise<number> {
  const lendingPoolData = await this.getLendingPoolData(uniswapV2PairAddress);
  return parseFloat(lendingPoolData[poolTokenType].totalBalance) * price;
}

// Safety Margin
export async function getSafetyMargin(this: Subgraph, uniswapV2PairAddress: Address) : Promise<number> {
  const lendingPoolData = await this.getLendingPoolData(uniswapV2PairAddress);
  return parseFloat(lendingPoolData[PoolTokenType.Collateral].safetyMargin);
}

// Liquidation Incentive
export async function getLiquidationIncentive(this: Subgraph, uniswapV2PairAddress: Address) : Promise<number> {
  const lendingPoolData = await this.getLendingPoolData(uniswapV2PairAddress);
  return parseFloat(lendingPoolData[PoolTokenType.Collateral].liquidationPenalty);
}

// Reserve Factor
export async function getReserveFactor(this: Subgraph, uniswapV2PairAddress: Address, poolTokenType: PoolTokenType) : Promise<number> {
  const lendingPoolData = await this.getLendingPoolData(uniswapV2PairAddress);
  return parseFloat((lendingPoolData[poolTokenType] as Borrowable).reserveFactor);
}

// Kink Borrow Rate
export async function getKinkBorrowRate(this: Subgraph, uniswapV2PairAddress: Address, poolTokenType: PoolTokenType) : Promise<number> {
  const lendingPoolData = await this.getLendingPoolData(uniswapV2PairAddress);
  return parseFloat((lendingPoolData[poolTokenType] as Borrowable).kinkBorrowRate);
}

// Kink Utilization Rate
export async function getKinkUtilizationRate(this: Subgraph, uniswapV2PairAddress: Address, poolTokenType: PoolTokenType) : Promise<number> {
  const lendingPoolData = await this.getLendingPoolData(uniswapV2PairAddress);
  return parseFloat((lendingPoolData[poolTokenType] as Borrowable).kinkUtilizationRate);
}

// Borrow Index
export async function getBorrowIndex(this: Subgraph, uniswapV2PairAddress: Address, poolTokenType: PoolTokenType) : Promise<number> {
  const lendingPoolData = await this.getLendingPoolData(uniswapV2PairAddress);
  return parseFloat((lendingPoolData[poolTokenType] as Borrowable).borrowIndex);
}

// Accrue Timestamp
export async function getAccrualTimestamp(this: Subgraph, uniswapV2PairAddress: Address, poolTokenType: PoolTokenType) : Promise<number> {
  const lendingPoolData = await this.getLendingPoolData(uniswapV2PairAddress);
  return parseFloat((lendingPoolData[poolTokenType] as Borrowable).accrualTimestamp);
}

// Total borrows
export async function getTotalBorrows(this: Subgraph, uniswapV2PairAddress: Address, poolTokenType: PoolTokenType) : Promise<number> {
  const lendingPoolData = await this.getLendingPoolData(uniswapV2PairAddress);
  return parseFloat((lendingPoolData[poolTokenType] as Borrowable).totalBorrows);
}
export async function getCurrentTotalBorrows(this: Subgraph, uniswapV2PairAddress: Address, poolTokenType: PoolTokenType) : Promise<number> {
  const [storedAmount, accrualTimestamp, borrowRate] = await Promise.all([
    this.getTotalBorrows(uniswapV2PairAddress, poolTokenType),
    this.getAccrualTimestamp(uniswapV2PairAddress, poolTokenType),
    this.getBorrowRate(uniswapV2PairAddress, poolTokenType)
  ]);
  return storedAmount * (1 + (Date.now() / 1000 - accrualTimestamp) * borrowRate);
}
export async function getTotalBorrowsUSD(this: Subgraph, uniswapV2PairAddress: Address, poolTokenType: PoolTokenType, price: number) : Promise<number> {
  const totalBorrows = await this.getCurrentTotalBorrows(uniswapV2PairAddress, poolTokenType);
  return totalBorrows * price;
}

// Borrow rate
export async function getBorrowRate(this: Subgraph, uniswapV2PairAddress: Address, poolTokenType: PoolTokenType) : Promise<number> {
  const lendingPoolData = await this.getLendingPoolData(uniswapV2PairAddress);
  return parseFloat((lendingPoolData[poolTokenType] as Borrowable).borrowRate);
}
export async function getBorrowAPY(this: Subgraph, uniswapV2PairAddress: Address, poolTokenType: PoolTokenType) : Promise<number> {
  const borrowRate = await this.getBorrowRate(uniswapV2PairAddress, poolTokenType);
  return toAPY(borrowRate);
}
export async function getNextBorrowRate(this: Subgraph, uniswapV2PairAddress: Address, poolTokenType: PoolTokenType, borrowAmount: number) : Promise<number> {
  const [totalBorrows, supply, kinkBorrowRate, kinkUtilizationRate] = await Promise.all([
    this.getTotalBorrows(uniswapV2PairAddress, poolTokenType),
    this.getSupply(uniswapV2PairAddress, poolTokenType),
    this.getKinkBorrowRate(uniswapV2PairAddress, poolTokenType),
    this.getKinkUtilizationRate(uniswapV2PairAddress, poolTokenType)
  ]);
  const kinkMultiplier = FACTORY_DETAILS_MAP[LENDING_POOL_DETAILS_MAP[uniswapV2PairAddress.toLowerCase()].tarotFactoryAddress].kinkMultiplier;
  const utilizationRate = (borrowAmount + totalBorrows) / supply;
  if (utilizationRate < kinkUtilizationRate) return utilizationRate / kinkUtilizationRate * kinkBorrowRate;
  return ((utilizationRate - kinkUtilizationRate) / (1 - kinkUtilizationRate) * (kinkMultiplier - 1) + 1) * kinkBorrowRate;
}
export async function getNextBorrowAPY(this: Subgraph, uniswapV2PairAddress: Address, poolTokenType: PoolTokenType, borrowAmount: number) : Promise<number> {
  const borrowRate = await this.getNextBorrowRate(uniswapV2PairAddress, poolTokenType, borrowAmount);
  return toAPY(borrowRate);
}

// Supply
export async function getSupply(this: Subgraph, uniswapV2PairAddress: Address, poolTokenType: PoolTokenType) : Promise<number> {
  const [totalBalance, totalBorrows] = await Promise.all([
    this.getTotalBalance(uniswapV2PairAddress, poolTokenType),
    this.getTotalBorrows(uniswapV2PairAddress, poolTokenType)
  ]);
  return totalBalance + totalBorrows;
}
export async function getCurrentSupply(this: Subgraph, uniswapV2PairAddress: Address, poolTokenType: PoolTokenType) : Promise<number> {
  const [storedAmount, accrualTimestamp, supplyRate] = await Promise.all([
    this.getSupply(uniswapV2PairAddress, poolTokenType),
    this.getAccrualTimestamp(uniswapV2PairAddress, poolTokenType),
    this.getSupplyRate(uniswapV2PairAddress, poolTokenType)
  ]);
  return storedAmount * (1 + (Date.now() / 1000 - accrualTimestamp) * supplyRate);
}
export async function getSupplyUSD(this: Subgraph, uniswapV2PairAddress: Address, poolTokenType: PoolTokenType, price: number) : Promise<number> {
  const supply = await this.getCurrentSupply(uniswapV2PairAddress, poolTokenType);
  return supply * price;
}

// Utilization Rate
export async function getUtilizationRate(this: Subgraph, uniswapV2PairAddress: Address, poolTokenType: PoolTokenType) : Promise<number> {
  const supply = await this.getSupply(uniswapV2PairAddress, poolTokenType);
  if (supply === 0) return 0;
  const totalBalance = await this.getTotalBorrows(uniswapV2PairAddress, poolTokenType);
  return totalBalance / supply;
}

// Supply Rate
export async function getSupplyRate(this: Subgraph, uniswapV2PairAddress: Address, poolTokenType: PoolTokenType) : Promise<number> {
  const [borrowRate, utilizationRate, reserveFactor] = await Promise.all([
    this.getBorrowRate(uniswapV2PairAddress, poolTokenType),
    this.getUtilizationRate(uniswapV2PairAddress, poolTokenType),
    this.getReserveFactor(uniswapV2PairAddress, poolTokenType)
  ]);
  return borrowRate * utilizationRate * (1 - reserveFactor);
}
export async function getSupplyAPY(this: Subgraph, uniswapV2PairAddress: Address, poolTokenType: PoolTokenType) : Promise<number> {
  const supplyRate = await this.getSupplyRate(uniswapV2PairAddress, poolTokenType);
  return toAPY(supplyRate);
}
export async function getNextSupplyRate(this: Subgraph, uniswapV2PairAddress: Address, poolTokenType: PoolTokenType, supplyAmount: number) : Promise<number> {
  const [
    totalBorrows,
    supply,
    kinkBorrowRate,
    kinkUtilizationRate,
    reserveFactor
  ] = await Promise.all([
    this.getTotalBorrows(uniswapV2PairAddress, poolTokenType),
    this.getSupply(uniswapV2PairAddress, poolTokenType),
    this.getKinkBorrowRate(uniswapV2PairAddress, poolTokenType),
    this.getKinkUtilizationRate(uniswapV2PairAddress, poolTokenType),
    this.getReserveFactor(uniswapV2PairAddress, poolTokenType)
  ]);
  const utilizationRate = totalBorrows / (supply + supplyAmount);
  if (utilizationRate < kinkUtilizationRate) return utilizationRate / kinkUtilizationRate * kinkBorrowRate * utilizationRate * (1 - reserveFactor);
  const kinkMultiplier = FACTORY_DETAILS_MAP[LENDING_POOL_DETAILS_MAP[uniswapV2PairAddress.toLowerCase()].tarotFactoryAddress].kinkMultiplier;
  return ((utilizationRate - kinkUtilizationRate) / (1 - kinkUtilizationRate) * (kinkMultiplier - 1) + 1) * kinkBorrowRate * utilizationRate * (1 - reserveFactor);
}
export async function getNextSupplyAPY(this: Subgraph, uniswapV2PairAddress: Address, poolTokenType: PoolTokenType, supplyAmount: number) : Promise<number> {
  const supplyRate = await this.getNextSupplyRate(uniswapV2PairAddress, poolTokenType, supplyAmount);
  return toAPY(supplyRate);
}

// Utilization Rate
export async function getDexAPY(this: Subgraph, uniswapV2PairAddress: Address) : Promise<number> {
  const lendingPoolData = await this.getLendingPoolData(uniswapV2PairAddress);
  return lendingPoolData.pair.dexAPY;
}

// Reward Speed
export async function getRewardSpeed(this: Subgraph, uniswapV2PairAddress: Address, poolTokenType: PoolTokenType) : Promise<number> {
  const lendingPoolData = await this.getLendingPoolData(uniswapV2PairAddress);
  const farmingPoolData = (lendingPoolData[poolTokenType] as Borrowable).farmingPool;
  if (farmingPoolData === null) return 0;
  const segmentLength = parseInt(farmingPoolData.segmentLength);
  const epochBegin = parseInt(farmingPoolData.epochBegin);
  const epochAmount = parseFloat(farmingPoolData.epochAmount);
  const epochEnd = epochBegin + segmentLength;
  const timestamp = (new Date()).getTime() / 1000;
  if (timestamp > epochEnd) {
    // How to manage better this case? Maybe check shares on distributor
    return 0;
  }
  return epochAmount / segmentLength;
}

// Farming
export async function getFarmingPool(this: Subgraph, uniswapV2PairAddress: Address, poolTokenType: PoolTokenType) : Promise<FarmingPool> {
  const lendingPoolData = await this.getLendingPoolData(uniswapV2PairAddress);
  const farmingPoolData = (lendingPoolData[poolTokenType] as Borrowable).farmingPool;
  return farmingPoolData;
}

export async function getFarmingAPY(this: Subgraph, uniswapV2PairAddress: Address, poolTokenType: PoolTokenType, borrowablePrice: number, tarotPrice: number) : Promise<number> {
  return this.getNextFarmingAPY(uniswapV2PairAddress, poolTokenType, 0, borrowablePrice, tarotPrice);
}
export async function getNextFarmingAPY(this: Subgraph, uniswapV2PairAddress: Address, poolTokenType: PoolTokenType, borrowAmount: number, borrowablePrice: number, tarotPrice: number) : Promise<number> {
  const [
    rewardSpeed,
    currentBorrowedUSD
  ] = await Promise.all([
    this.getRewardSpeed(uniswapV2PairAddress, poolTokenType),
    this.getTotalBorrowsUSD(uniswapV2PairAddress, poolTokenType, borrowablePrice)
  ]);
  const additionalBorrowsUSD = borrowAmount * borrowablePrice;
  const totalBorrowedUSD = currentBorrowedUSD + additionalBorrowsUSD;
  if (totalBorrowedUSD === 0) return 0;
  return toAPY(tarotPrice * rewardSpeed / totalBorrowedUSD);
}

// Vault
export async function isVaultToken(this: Subgraph, uniswapV2PairAddress: Address) : Promise<boolean> {
  const lendingPoolData = await this.getLendingPoolData(uniswapV2PairAddress);
  return lendingPoolData.pair.isVaultToken;
}
export async function getVaultRewardsTokenDecimals(this: Subgraph, uniswapV2PairAddress: Address) : Promise<number> {
  const lendingPoolData = await this.getLendingPoolData(uniswapV2PairAddress);
  if (!lendingPoolData.pair.isVaultToken || !lendingPoolData.pair.rewardsToken) {
    return 0;
  }
  return parseInt(lendingPoolData.pair.rewardsToken.decimals);
}
export async function getVaultRewardsTokenSymbol(this: Subgraph, uniswapV2PairAddress: Address) : Promise<string> {
  const lendingPoolData = await this.getLendingPoolData(uniswapV2PairAddress);
  if (!lendingPoolData.pair.isVaultToken || !lendingPoolData.pair.rewardsToken) {
    return '';
  }
  return lendingPoolData.pair.rewardsToken.symbol;
}
export async function getVaultRewardsTokenAddress(this: Subgraph, uniswapV2PairAddress: Address) : Promise<string> {
  const lendingPoolData = await this.getLendingPoolData(uniswapV2PairAddress);
  if (!lendingPoolData.pair.isVaultToken || !lendingPoolData.pair.rewardsToken) {
    return '';
  }
  return lendingPoolData.pair.rewardsToken.id.toLowerCase();
}

// Shown leverage
export async function getShownLeverage(this: Subgraph, uniswapV2PairAddress: Address) : Promise<number> {
  // TODO: Handle 20 and 50 by checking pairAddress
  const safetyMargin = await this.getSafetyMargin(uniswapV2PairAddress);
  if (safetyMargin < 1.51) {
    return 10;
  }
  if (safetyMargin < 2.01) {
    return 5;
  }
  return 3;
}