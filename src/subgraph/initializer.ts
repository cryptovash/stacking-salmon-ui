/* eslint-disable no-invalid-this */
// TODO: <
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
// TODO: >

import gql from 'graphql-tag';

import apolloFetcher from '../services/apollo-fetcher';

import {
  Address,
  PoolTokenType,
  LendingPoolData,
  UserData,
  CollateralPosition,
  SupplyPosition,
  BorrowPosition
} from '../types/interfaces';
import Subgraph from '.';
import {
  TAROT_SUBGRAPH_URL, TAROT_SUBGRAPH_URL_2, TAROT_SUBGRAPH_URL_3
} from '../config/web3/subgraph';
import { LENDING_POOL_DETAILS_MAP } from '../config/web3/contracts/lending-pools';

async function fetchLendingPools(this: Subgraph): Promise<any[]> {
  const lendingPoolLists = await Promise.all(
    [
      TAROT_SUBGRAPH_URL[this.chainId],
      TAROT_SUBGRAPH_URL_2[this.chainId],
      TAROT_SUBGRAPH_URL_3[this.chainId]
    ].filter(subgraphUrls => subgraphUrls.length > 0)
      .map(subgraphUrls => this.fetchLendingPoolsByUrls(subgraphUrls))
  );
  return lendingPoolLists.flat();
}

async function fetchLendingPoolsByUrls(this: Subgraph, subgraphUrls: string[]): Promise<any[]> {
  const query = gql`{
    _meta {
      block {
        number
      }
    }
    lendingPools(first: 1000, orderBy: totalBorrowsUSD, orderDirection: desc) {
      id
      borrowable0 {
        ...borrowableFields
      }
      borrowable1 {
        ...borrowableFields
      }
      collateral {
        id
        totalBalance
        totalBalanceUSD
        safetyMargin
        liquidationIncentive
        exchangeRate 
      }
      pair {
        reserve0
        reserve1
        reserveUSD
        token0Price
        token1Price
        derivedUSD
        derivedETH
        totalSupply
        token0 {
          id
          derivedETH
          derivedUSD
        }
        token1 {
          id
          derivedETH
          derivedUSD
        }
        isVaultToken
        uniswapV2PairAddress
        rewardsToken {
          id
          symbol
          name
          decimals
          derivedUSD
        }
      }
    }
  }
 
  fragment borrowableFields on Borrowable {
    id
    underlying {
      id
      symbol
      name
      decimals
      derivedUSD
    }
    totalBalance
    totalBorrows
    borrowRate
    reserveFactor
    kinkBorrowRate
    kinkUtilizationRate
    borrowIndex
    accrualTimestamp
    exchangeRate
    totalBalanceUSD
    totalSupplyUSD
    totalBorrowsUSD
    farmingPool {
      id
      epochAmount
      epochBegin
      segmentLength
      vestingBegin
      sharePercentage
      distributor {
        id
      }
    }
  }`;

  const results = await Promise.all(subgraphUrls.map(subgraphUrl =>
    apolloFetcher(subgraphUrl, query)
  ));

  const sortedResults = [...results].sort((a, b) => b.data['_meta'].block.number - a.data['_meta'].block.number);
  const result = sortedResults[0];

  const lendingPoolIds = Object.keys(LENDING_POOL_DETAILS_MAP).map(x => x.toLowerCase());
  return result.data.lendingPools.filter(pool => lendingPoolIds.includes(pool.id.toLowerCase()));
}

async function initializeLendingPoolsData(this: Subgraph): Promise<{ [key in Address]?: LendingPoolData }> {
  const lendingPoolsData: { [key in Address]?: LendingPoolData } = {};
  try {
    const lendingPools = await this.fetchLendingPools();
    for (const lendingPool of lendingPools) {
      lendingPoolsData[lendingPool.id] = lendingPool;
    }
  } catch (error) {
    console.log('[initializeLendingPoolsData] error.message => ', error.message);
  }

  return lendingPoolsData;
}
async function getLendingPoolsData(this: Subgraph): Promise<{ [key in Address]: LendingPoolData }> {
  if (!this.lendingPoolsData) {
    this.lendingPoolsData = this.initializeLendingPoolsData();
  }

  return this.lendingPoolsData;
}
async function getLendingPoolData(
  this: Subgraph,
  uniswapV2PairAddress: Address
): Promise<LendingPoolData> {
  if (!uniswapV2PairAddress) {
    return undefined;
  }
  const lendingPoolsData = await this.getLendingPoolsData();
  const lowerCasedUniswapV2PairAddress = uniswapV2PairAddress.toLowerCase();
  const lendingPoolData = lendingPoolsData[lowerCasedUniswapV2PairAddress];

  return lendingPoolData;
}

async function fetchUserData(this: Subgraph, account: Address): Promise<{
  collateralPositions: CollateralPosition[],
  supplyPositions: SupplyPosition[],
  borrowPositions: BorrowPosition[],
}> {
  const userDataByUrls = await Promise.all(
    [
      TAROT_SUBGRAPH_URL[this.chainId],
      TAROT_SUBGRAPH_URL_2[this.chainId],
      TAROT_SUBGRAPH_URL_3[this.chainId]
    ].filter(subgraphUrls => subgraphUrls.length > 0)
      .map(subgraphUrls => this.fetchUserDataByUrls(subgraphUrls, account))
  );
  const collateralPositions: CollateralPosition[] = [];
  const supplyPositions: SupplyPosition[] = [];
  const borrowPositions: BorrowPosition[] = [];

  for (const data of userDataByUrls) {
    if (!data) {
      continue;
    }
    collateralPositions.push(...data.collateralPositions);
    supplyPositions.push(...data.supplyPositions);
    borrowPositions.push(...data.borrowPositions);
  }

  return {
    collateralPositions,
    supplyPositions,
    borrowPositions
  };
}

// User Data
async function fetchUserDataByUrls(this: Subgraph, subgraphUrls: string[], account: Address): Promise<{
  collateralPositions: CollateralPosition[],
  supplyPositions: SupplyPosition[],
  borrowPositions: BorrowPosition[],
}> {
  const query = gql`query ($userId: ID!) {
    _meta {
      block {
        number
      }
    }
    user(id: $userId) {
      collateralPositions(first:1000) {
        balance
        collateral {
          lendingPool {
            id
          }
        }
      }
      supplyPositions(first:1000) {
        balance
        borrowable {
          underlying {
            id
          }
          lendingPool {
            id
          }
        }
      }
      borrowPositions(first:1000) {
        borrowBalance
        borrowIndex
        borrowable {
          underlying {
            id
          }
          lendingPool {
            id
          }
        }
      }
    }
  }`;
  const results = await Promise.all(subgraphUrls.map(tarotSubgraphURL =>
    apolloFetcher(tarotSubgraphURL, query, {
      userId: account.toLowerCase()
    })
  ));

  const sortedResults = [...results].sort((a, b) => b.data['_meta'].block.number - a.data['_meta'].block.number);
  const result = sortedResults[0];
  return result.data.user;
}

async function initializeUserData(this: Subgraph, account: Address): Promise<UserData> {
  const result: UserData = {
    collateralPositions: {},
    supplyPositions: {},
    borrowPositions: {}
  };
  const data = await this.fetchUserData(account);
  if (!data) return null;
  for (const collateralPosition of data.collateralPositions) {
    result.collateralPositions[collateralPosition.collateral.lendingPool.id] = collateralPosition;
  }
  for (const supplyPositions of data.supplyPositions) {
    const uniswapV2PairAddress = supplyPositions.borrowable.lendingPool.id;
    const underlyingAddress = supplyPositions.borrowable.underlying.id;
    const addressA = LENDING_POOL_DETAILS_MAP[uniswapV2PairAddress.toLowerCase()].tokenAddress0;
    const poolTokenType = underlyingAddress.toLowerCase() === addressA.toLowerCase() ? PoolTokenType.BorrowableA : PoolTokenType.BorrowableB;
    if (!(uniswapV2PairAddress in result.supplyPositions)) result.supplyPositions[uniswapV2PairAddress] = {};
    result.supplyPositions[uniswapV2PairAddress][poolTokenType] = supplyPositions;
  }
  for (const borrowPositions of data.borrowPositions) {
    const uniswapV2PairAddress = borrowPositions.borrowable.lendingPool.id;
    const underlyingAddress = borrowPositions.borrowable.underlying.id;
    const addressA = LENDING_POOL_DETAILS_MAP[uniswapV2PairAddress.toLowerCase()].tokenAddress0;
    const poolTokenType = underlyingAddress.toLowerCase() === addressA.toLowerCase() ? PoolTokenType.BorrowableA : PoolTokenType.BorrowableB;
    if (!(uniswapV2PairAddress in result.borrowPositions)) result.borrowPositions[uniswapV2PairAddress] = {};
    result.borrowPositions[uniswapV2PairAddress][poolTokenType] = borrowPositions;
  }
  return result;
}
async function getUserData(this: Subgraph, account: Address): Promise<UserData> {
  if (!(account in this.usersData)) this.usersData[account] = this.initializeUserData(account);
  return this.usersData[account];
}

export {
  fetchLendingPools,
  fetchLendingPoolsByUrls,
  initializeLendingPoolsData,
  getLendingPoolsData,
  getLendingPoolData,
  fetchUserData,
  fetchUserDataByUrls,
  initializeUserData,
  getUserData
};