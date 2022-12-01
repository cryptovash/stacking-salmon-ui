/* eslint-disable new-cap */
/* eslint-disable no-invalid-this */
// TODO: <
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
// TODO: >

import { Contract } from '@ethersproject/contracts';
import { BigNumber } from '@ethersproject/bignumber';
import { formatUnits } from '@ethersproject/units';
import FarmingPoolJSON from '../abis/contracts/IFarmingPool.json';

import TarotRouter from '.';
import {
  Address,
  PoolTokenType,
  ClaimEvent
} from '../types/interfaces';
import { LENDING_POOLS_LIST } from 'config/web3/contracts/lending-pools';
import { ZERO_ADDRESS } from 'utils/address';
import { CHAIN_IDS } from 'config/web3/chains';

// Farming Shares
export async function initializeFarmingShares(
  this: TarotRouter,
  uniswapV2PairAddress: Address,
  poolTokenType: PoolTokenType
) : Promise<number> {
  const farmingPool = await this.getFarmingPool(uniswapV2PairAddress, poolTokenType);
  if (!farmingPool) return 0;
  const { shares } = await farmingPool.recipients(this.account);
  return shares * 1;
}

export async function getFarmingShares(this: TarotRouter, uniswapV2PairAddress: Address, poolTokenType: PoolTokenType) : Promise<number> {
  const cache = this.getPoolTokenCache(uniswapV2PairAddress, poolTokenType);
  if (!cache.farmingShares) cache.farmingShares = this.initializeFarmingShares(uniswapV2PairAddress, poolTokenType);
  return cache.farmingShares;
}

// Total Available Farming Rewards
export async function getTotalAvailableReward(this: TarotRouter, account?: Address) : Promise<number> {
  const farmingPools = [];
  const lendingPools = LENDING_POOLS_LIST.filter(x => this.chainId === (x.chainId || CHAIN_IDS.FANTOM));
  for (const lendingPool of lendingPools) {
    if (lendingPool.farmingPoolAddress0 && lendingPool.farmingPoolAddress0 !== ZERO_ADDRESS) {
      farmingPools.push(new Contract(lendingPool.farmingPoolAddress0, FarmingPoolJSON, this.readLibrary));
    }
    if (lendingPool.farmingPoolAddress1 && lendingPool.farmingPoolAddress1 !== ZERO_ADDRESS) {
      farmingPools.push(new Contract(lendingPool.farmingPoolAddress1, FarmingPoolJSON, this.readLibrary));
    }
  }

  const claimAmounts = await this.doMulticall(
    farmingPools.map(farmingPool => ([farmingPool, 'claimAccount', [account ? account : this.account]])));
  let totalClaimAmount = BigNumber.from(0);
  for (const claimAmount of claimAmounts) {
    if (claimAmount.gt(0)) {
      totalClaimAmount = totalClaimAmount.add(claimAmount);
    }
  }
  return parseFloat(formatUnits(totalClaimAmount, 18));
}

// Available Reward
export async function initializeAvailableReward(this: TarotRouter, uniswapV2PairAddress: Address) : Promise<number> {
  const farmingPoolA = await this.getFarmingPool(uniswapV2PairAddress, PoolTokenType.BorrowableA);
  const farmingPoolB = await this.getFarmingPool(uniswapV2PairAddress, PoolTokenType.BorrowableB);
  let totalAmount = 0;
  if (farmingPoolA) {
    try {
      const fA = new Contract(farmingPoolA.address, farmingPoolA.interface, this.library.getSigner(this.account));
      const amount = await fA.callStatic.claim({ blockTag: 'latest' });
      totalAmount += parseFloat(formatUnits(amount));
    } catch (error) {
      console.error('[initializeAvailableReward] [farmingPoolA] error.message => ', error.message);
    }
  }
  if (farmingPoolB) {
    try {
      const fB = new Contract(farmingPoolB.address, farmingPoolB.interface, this.library.getSigner(this.account));
      const amount = await fB.callStatic.claim({ blockTag: 'latest' });
      totalAmount += parseFloat(formatUnits(amount));
    } catch (error) {
      console.error('[initializeAvailableReward] [farmingPoolB] error.message => ', error.message);
    }
  }
  return totalAmount;
}
export async function getAvailableReward(this: TarotRouter, uniswapV2PairAddress: Address) : Promise<number> {
  const cache = this.getLendingPoolCache(uniswapV2PairAddress);
  if (!cache.availableReward) cache.availableReward = this.initializeAvailableReward(uniswapV2PairAddress);
  return cache.availableReward;
}

// Claim History
export async function initializeClaimHistory(this: TarotRouter, uniswapV2PairAddress: Address) : Promise<ClaimEvent[]> {
  const result: Array<ClaimEvent> = [];
  try {
    const farmingPoolA = await this.getFarmingPool(uniswapV2PairAddress, PoolTokenType.BorrowableA);
    const farmingPoolB = await this.getFarmingPool(uniswapV2PairAddress, PoolTokenType.BorrowableB);
    const fA = new Contract(farmingPoolA.address, farmingPoolA.interface, this.readLibrary);
    const fB = new Contract(farmingPoolB.address, farmingPoolB.interface, this.readLibrary);
    const claimsA = await fA.queryFilter(fA.filters.Claim(this.account), this.readLibrary.blockNumber - 900);
    const claimsB = await fB.queryFilter(fB.filters.Claim(this.account), this.readLibrary.blockNumber - 900);
    const claims = claimsA.concat(claimsB);
    claims.sort((a: any, b: any) => b.blockNumber - a.blockNumber); // order from newest to oldest
    for (const claim of claims) {
      result.push({
        amount: claim.returnValues.amount / 1e18,
        transactionHash: claim.transactionHash
      });
    }
  } catch (error) {
    console.error('[initializeClaimHistory] error.message => ', error.message);
  }
  return result;
}
export async function getClaimHistory(this: TarotRouter, uniswapV2PairAddress: Address) : Promise<ClaimEvent[]> {
  const cache = this.getLendingPoolCache(uniswapV2PairAddress);
  if (!cache.claimHistory) cache.claimHistory = this.initializeClaimHistory(uniswapV2PairAddress);
  return cache.claimHistory;
}

// Claim Claimable
export async function initializeAvailableClaimable(
  this: TarotRouter,
  claimableAddress: Address
) : Promise<number> {
  try {
    const claimable = await this.getClaimable(claimableAddress);
    const c = new Contract(claimable.address, claimable.interface, this.library.getSigner(this.account));
    const amount = await c.callStatic.claim({ blockTag: 'latest' });
    return amount / 1e18;
  } catch (error) {
    console.error('[initializeAvailableClaimable] error.message => ', error.message);
    return 0;
  }
}

export async function getAvailableClaimable(this: TarotRouter, claimableAddress: Address) : Promise<number> {
  const cache = this.getClaimableCache(claimableAddress);
  if (!cache.availableClaimable) cache.availableClaimable = await this.initializeAvailableClaimable(claimableAddress);
  return cache.availableClaimable;
}

export async function getClaimed(this: TarotRouter, claimableAddress: Address) : Promise<number> {
  try {
    const claimable = this.newDistributor(claimableAddress);
    const { shares, lastShareIndex } = (await claimable.recipients(this.account));
    return parseFloat(formatUnits(lastShareIndex.mul(shares).div(BigNumber.from(2).pow(160)), 18));
  } catch (error) {
    console.error('[initializeClaimableSharePct] error.message => ', error.message);
    return 0;
  }
}

export async function initializeClaimableSharePct(
  this: TarotRouter,
  claimableAddress: Address
) : Promise<number> {
  try {
    const claimable = this.newDistributor(claimableAddress);
    const totalShares = await claimable.totalShares();
    const { shares } = (await claimable.recipients(this.account));
    return parseFloat(formatUnits(shares, 18)) / parseFloat(formatUnits(totalShares, 18));
  } catch (error) {
    console.error('[initializeClaimableSharePct] error.message => ', error.message);
    return 0;
  }
}

export async function getClaimableSharePct(this: TarotRouter, claimableAddress: Address) : Promise<number> {
  const cache = this.getClaimableCache(claimableAddress);
  if (!cache.claimableSharePct) cache.claimableSharePct = await this.initializeClaimableSharePct(claimableAddress);
  return cache.claimableSharePct;
}
