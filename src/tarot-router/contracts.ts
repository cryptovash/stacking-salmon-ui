/* eslint-disable no-invalid-this */
// TODO: <
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
// TODO: >

import { LENDING_POOL_DETAILS_MAP } from '../config/web3/contracts/lending-pools';
import TarotRouter from '.';
import { Address, LendingPool, PoolTokenType, Contract, FarmingPoolContract, ClaimableContract } from '../types/interfaces';

export function getLendingPoolCache(this: TarotRouter, uniswapV2PairAddress: Address) : LendingPool {
  if (!(uniswapV2PairAddress in this.lendingPoolCache)) {
    this.lendingPoolCache[uniswapV2PairAddress] = {};
  }
  return this.lendingPoolCache[uniswapV2PairAddress];
}

export async function initializeLendingPool(
  this: TarotRouter,
  uniswapV2PairAddress: Address
) : Promise<LendingPool> {
  const pool = LENDING_POOL_DETAILS_MAP[uniswapV2PairAddress.toLowerCase()];

  return {
    uniswapV2Pair: this.newUniswapV2Pair(pool.uniswapV2PairAddress),
    tokenA: this.newERC20(pool.tokenAddress0),
    tokenB: this.newERC20(pool.tokenAddress1),
    collateral: this.newCollateral(pool.collateralAddress),
    borrowableA: this.newBorrowable(pool.borrowableAddress0),
    borrowableB: this.newBorrowable(pool.borrowableAddress1),
    farmingPoolA: pool.farmingPoolAddress0 === '0x0000000000000000000000000000000000000000' ? null : this.newFarmingPool(pool.farmingPoolAddress0),
    farmingPoolB: pool.farmingPoolAddress0 === '0x0000000000000000000000000000000000000000' ? null : this.newFarmingPool(pool.farmingPoolAddress1),
    vaultToken: pool.isTarotVault ? this.newVaultToken(pool.lendingPoolAddress) : null
  };
}

export async function getLendingPool(this: TarotRouter, uniswapV2PairAddress: Address) : Promise<LendingPool> {
  const cache = this.getLendingPoolCache(uniswapV2PairAddress);
  if (!cache.lendingPool) {
    cache.lendingPool = this.initializeLendingPool(uniswapV2PairAddress);
  }
  return cache.lendingPool;
}

export async function getContracts(
  this: TarotRouter,
  uniswapV2PairAddress: Address,
  poolTokenType: PoolTokenType
) : Promise<[Contract, Contract, Contract | null]> {
  const lendingPool = await this.getLendingPool(uniswapV2PairAddress);

  if (poolTokenType === PoolTokenType.BorrowableA) {
    return [
      lendingPool.borrowableA,
      lendingPool.tokenA,
      lendingPool.vaultToken
    ];
  }

  if (poolTokenType === PoolTokenType.BorrowableB) {
    return [
      lendingPool.borrowableB,
      lendingPool.tokenB,
      lendingPool.vaultToken
    ];
  }

  return [
    lendingPool.collateral,
    lendingPool.uniswapV2Pair,
    lendingPool.vaultToken
  ];
}

export async function getPoolToken(
  this: TarotRouter,
  uniswapV2PairAddress: Address,
  poolTokenType: PoolTokenType
) : Promise<Contract> {
  const [poolToken] = await this.getContracts(uniswapV2PairAddress, poolTokenType);

  return poolToken;
}

export async function getToken(
  this: TarotRouter,
  uniswapV2PairAddress: Address,
  poolTokenType: PoolTokenType
) : Promise<Contract> {
  const [, token] = await this.getContracts(uniswapV2PairAddress, poolTokenType);

  return token;
}

export async function getVaultToken(
  this: TarotRouter,
  uniswapV2PairAddress: Address
) : Promise<Contract> {
  const lendingPool = await this.getLendingPool(uniswapV2PairAddress);
  return lendingPool.vaultToken;
}

export async function getFarmingPool(
  this: TarotRouter,
  uniswapV2PairAddress: Address,
  poolTokenType: PoolTokenType
) : Promise<FarmingPoolContract> {
  const lendingPool = await this.getLendingPool(uniswapV2PairAddress);

  if (poolTokenType === PoolTokenType.BorrowableA) {
    return lendingPool.farmingPoolA;
  }

  if (poolTokenType === PoolTokenType.BorrowableB) {
    return lendingPool.farmingPoolB;
  }

  return null;
}

// Claimable
export function getClaimableCache(this: TarotRouter, claimableAddress: Address) {
  if (!(claimableAddress in this.claimableCache)) {
    this.claimableCache[claimableAddress] = {};
  }
  return this.claimableCache[claimableAddress];
}
export async function initializeClaimable(
  this: TarotRouter,
  claimableAddress: Address
) : Promise<ClaimableContract> {
  return this.newClaimable(claimableAddress);
}
export async function getClaimable(
  this: TarotRouter,
  claimableAddress: Address
) : Promise<ClaimableContract> {
  const cache = this.getClaimableCache(claimableAddress);
  if (!cache.contract) cache.contract = this.initializeClaimable(claimableAddress);
  return cache.contract;
}

// Address
export async function getPoolTokenAddress(
  this: TarotRouter,
  uniswapV2PairAddress: Address,
  poolTokenType: PoolTokenType
) : Promise<string> {
  const [poolToken] = await this.getContracts(uniswapV2PairAddress, poolTokenType);

  return poolToken.address;
}

export async function getTokenAddress(
  this: TarotRouter,
  uniswapV2PairAddress: Address,
  poolTokenType: PoolTokenType
) : Promise<string> {
  const [, token] = await this.getContracts(uniswapV2PairAddress, poolTokenType);

  return token.address;
}
