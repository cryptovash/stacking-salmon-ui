/* eslint-disable no-invalid-this */
// TODO: <
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
// TODO: >

import TarotRouter from '.';
import { Address, PoolDisplayDetails, PoolTokenType, SupplyVault, TEN_18, UserDistributionMap, ZERO } from '../types/interfaces';
import { formatUnits } from '../ethers/lib/utils';
import toAPY from '../services/to-apy';
import { TAROT_ADDRESSES, XTAROT_ADDRESSES } from '../config/web3/contracts/tarot';
import { PAGES, PARAMETERS } from '../utils/constants/links';
import { getVaultDetails, VaultType } from '../config/web3/contracts/vault-details';
import { DEPOSIT_FEE_BPS_MAP, LENDING_POOLS_LIST, LENDING_POOL_DETAILS_MAP, LENDING_POOL_IDS, TAROT_LENDING_POOLS } from '../config/web3/contracts/lending-pools';
import { DEX, DexDetails, getDexById } from '../config/web3/dexs';
import { chunkify } from '../utils/chunkify';
import ClaimableJSON from '../abis/contracts/IClaimable.json';
import GaugeJSON from '../abis/contracts/IGauge.json';
import SolidlyGaugeJSON from '../abis/contracts/solidly/Gauge.json';
import OxMultiRewardsJSON from '../abis/contracts/solidly/OxMultiRewards.json';
import GaugeVaultProxyJSON from '../abis/contracts/IGaugeVaultProxy.json';
import GaugeVaultProxyAdminJSON from '../abis/contracts/IGaugeVaultProxyAdmin.json';
import { BigNumber, Contract } from 'ethers';
import { ZERO_ADDRESS } from '../utils/address';
import { parse18 } from '../utils/big-amount';
import { FACTORY_DETAILS_MAP } from '../config/web3/contracts/tarot-factories';
import { SUPPLY_VAULTS } from '../config/web3/contracts/supply-vault';
import { FEE_DISTRIBUTOR_ADDRESSES } from '../config/web3/contracts/fee-distributors';
import { promiseProps } from '../utils/promise-props';
import { getLocalStorageItem, setLocalStorageItem } from '../utils/local-storage';
import { getTokenIcon, getTokenSymbol } from '../utils';
import gql from 'graphql-tag';
import apolloFetcher from '../services/apollo-fetcher';
import { getTwoBlockByTimestamps } from '../services/blocklytics';
import { DISTRIBUTOR_ADDRESSES } from '../config/web3/contracts/distributors';
import { TINSPIRIT_ADDRESS, XTINSPIRIT_ADDRESS, XTINSPIRIT_TOKEN_DISTRIBUTOR_ADDRESS } from '../config/web3/contracts/wrapped-escrow-spirit';
import { CHAIN_IDS } from '../config/web3/chains';

interface DexIdAndApy {
  apy: number;
  dexId: DEX;
}

interface SubgraphInfoPoolItem {
  dailyVolumeUSD: string;
  pairAddress: string;
  reserveUSD: string;
  dex: DEX;
}
interface SubgraphInfoPoolItemSushiPair {
  id: string
}
interface SubgraphInfoPoolItemSushi {
  volumeUSD: string;
  pair: SubgraphInfoPoolItemSushiPair;
  reserveUSD: string;
  dex: DEX;
}

const getSubgraphInfoForDex = async (lendingPoolAddresses: string[], path: string, dex: DEX): Promise<SubgraphInfoPoolItem[]> => {
  try {
    const uniswapV2PairAddresses = lendingPoolAddresses.filter(x => LENDING_POOL_DETAILS_MAP[x].dex === dex).map(x => LENDING_POOL_DETAILS_MAP[x].uniswapV2PairAddress);
    const url = `https://api.thegraph.com/subgraphs/name/${path}`;
    const day = 86400 * (Math.floor(Date.now() / 1000 / 86400) - 1);
    if (dex === DEX.SUSHI) {
      const query = gql`
      query days($pairs: [String!], $date: Int!) {
        pairDayDatas(first: 100, where: {pair_in: $pairs, date: $date}) {
          id
          pair {
            id
          }
          volumeUSD
          reserveUSD
          __typename
        }
      }
    `;
      const response = await apolloFetcher(url, query, {
        pairs: uniswapV2PairAddresses,
        date: day
      });
      const list: SubgraphInfoPoolItemSushi[] = response.data.pairDayDatas;
      const ret = [];
      for (const item of list) {
        ret.push({
          pairAddress: item.pair.id,
          dailyVolumeUSD: item.volumeUSD,
          reserveUSD: item.reserveUSD,
          dex: dex
        });
      }
      return ret;
    }
    if (dex === DEX.SPIRIT) {
      const ONE_DAY_SECONDS = 86400;
      const [currBlock, pastBlock] = await getTwoBlockByTimestamps(CHAIN_IDS.FANTOM, day, day - ONE_DAY_SECONDS);
      const query = gql`
      query days($pairs: [String!], $date: Int!) {
        pairDayDatas(first: 100, where: {pairAddress_in: $pairs, date: $date}) {
          id
          pairAddress
          dailyVolumeUSD
          reserveUSD
          __typename
        }
      }
      `;
      const pairQuery = gql`
          query pairInfo($pairs: [String!], $block: Int!) {
            pairs(block: {number: $block}, where: {id_in: $pairs}) {
              id
              untrackedVolumeUSD
            }
          }
          `;

      const [response, pairResponseCurr, pairResponsePast] = await Promise.all([
        apolloFetcher(url, query, {
          pairs: uniswapV2PairAddresses,
          date: day
        }),
        apolloFetcher(url, pairQuery, {
          pairs: uniswapV2PairAddresses,
          block: currBlock
        }),
        apolloFetcher(url, pairQuery, {
          pairs: uniswapV2PairAddresses,
          block: pastBlock
        })
      ]);
      const list: SubgraphInfoPoolItem[] = response.data.pairDayDatas;
      const pairListCurr = pairResponseCurr.data.pairs;
      const pairListPast = pairResponsePast.data.pairs;

      const pairMap: {[key: string]: {untrackedVolumeUSDCurr: string, untrackedVolumeUSDPast: string}} = {};
      for (const item of pairListCurr) {
        pairMap[item.id] = {
          untrackedVolumeUSDCurr: item.untrackedVolumeUSD || '0',
          untrackedVolumeUSDPast: '0'
        };
      }
      for (const item of pairListPast) {
        pairMap[item.id] = {
          ...pairMap[item.id],
          untrackedVolumeUSDPast: item.untrackedVolumeUSD || '0'
        };
      }
      const ret = [];
      for (const item of list) {
        ret.push({
          ...item,
          dex: dex,
          dailyVolumeUSD: item.dailyVolumeUSD === '0' ? `${(parseFloat(pairMap[item.pairAddress].untrackedVolumeUSDCurr) - parseFloat(pairMap[item.pairAddress].untrackedVolumeUSDPast))}` : item.dailyVolumeUSD
        });
      }
      return ret;
    }
    const query = gql`
    query days($pairs: [String!], $date: Int!) {
      pairDayDatas(first: 100, where: {pairAddress_in: $pairs, date: $date}) {
        id
        pairAddress
        dailyVolumeUSD
        reserveUSD
        __typename
      }
    }
  `;
    const response = await apolloFetcher(url, query, {
      pairs: uniswapV2PairAddresses,
      date: day
    });
    const list: SubgraphInfoPoolItem[] = response.data.pairDayDatas;
    const ret = [];
    for (const item of list) {
      ret.push({
        ...item,
        dex: dex
      });
    }
    return ret;
  } catch (e) {
    return [];
  }
};

const getSubgraphInfoForAllDexes = async (lendingPoolAddresses: string[]): Promise<SubgraphInfoPoolItem[]> => {
  const pathList = ['layer3org/spiritswap-analytics', 'sushiswap/fantom-exchange', 'eerieeight/spookyswap', 'jamjomjim/tomb-finance', 'nonamefits/zipswap'];
  const dexList = [DEX.SPIRIT, DEX.SUSHI, DEX.SPOOKY, DEX.TOMB, DEX.ZIP];
  const itemLists = await Promise.all(pathList.map((path, i) => getSubgraphInfoForDex(lendingPoolAddresses, path, dexList[i])));
  const items: SubgraphInfoPoolItem[] = [];
  for (const itemList of itemLists) {
    items.push(...itemList);
  }
  // TODO: Deduplicate
  return items;
};

export function getPoolTokenCache(
  this: TarotRouter,
  uniswapV2PairAddress: Address,
  poolTokenType: PoolTokenType
) {
  const cache = this.getLendingPoolCache(uniswapV2PairAddress);
  if (!cache.poolToken) cache.poolToken = {};
  if (!(poolTokenType in cache.poolToken)) cache.poolToken[poolTokenType] = {};
  return cache.poolToken[poolTokenType];
}

// Reserves
export async function initializeReserves(
  this: TarotRouter,
  uniswapV2PairAddress: Address
) : Promise<[number, number]> {
  const pools = await this.getFullLendingPoolsData();
  const poolDetails = LENDING_POOL_DETAILS_MAP[uniswapV2PairAddress.toLowerCase()];
  const pool = pools[uniswapV2PairAddress.toLowerCase()];

  return [
    parseFloat(formatUnits(pool.pairReserves[0], poolDetails.decimals0)),
    parseFloat(formatUnits(pool.pairReserves[1], poolDetails.decimals1))
  ];
}

export async function getReserves(this: TarotRouter, uniswapV2PairAddress: Address) : Promise<[number, number]> {
  const cache = this.getLendingPoolCache(uniswapV2PairAddress);
  if (!cache.reserves) cache.reserves = this.initializeReserves(uniswapV2PairAddress);
  return cache.reserves;
}

// Reserves
export async function initializeCollateralUnderlyingReserves(
  this: TarotRouter,
  uniswapV2PairAddress: Address
) : Promise<[number, number]> {
  const pools = await this.getFullLendingPoolsData();
  const poolDetails = LENDING_POOL_DETAILS_MAP[uniswapV2PairAddress.toLowerCase()];
  const pool = pools[uniswapV2PairAddress.toLowerCase()];

  return [
    parseFloat(formatUnits(pool.collateralUnderlyingReserves[0], poolDetails.decimals0)),
    parseFloat(formatUnits(pool.collateralUnderlyingReserves[1], poolDetails.decimals1))
  ];
}

export async function getCollateralUnderlyingReserves(this: TarotRouter, uniswapV2PairAddress: Address) : Promise<[number, number]> {
  const cache = this.getLendingPoolCache(uniswapV2PairAddress);
  if (!cache.collateralUnderlyingReserves) cache.collateralUnderlyingReserves = this.initializeCollateralUnderlyingReserves(uniswapV2PairAddress);
  return cache.collateralUnderlyingReserves;
}

// LP Total Supply
export async function initializeLPTotalSupply(
  this: TarotRouter,
  uniswapV2PairAddress: Address
) : Promise<number> {
  const pools = await this.getFullLendingPoolsData();
  const pool = pools[uniswapV2PairAddress.toLowerCase()];

  return parseFloat(formatUnits(pool.pairTotalSupply), 18);
}

export async function getLPTotalSupply(this: TarotRouter, uniswapV2PairAddress: Address) : Promise<number> {
  const cache = this.getLendingPoolCache(uniswapV2PairAddress);
  if (!cache.LPTotalSupply) cache.LPTotalSupply = this.initializeLPTotalSupply(uniswapV2PairAddress);
  return cache.LPTotalSupply;
}

// Price Denom LP
export async function initializePriceDenomLP(
  this: TarotRouter,
  uniswapV2PairAddress: Address
) : Promise<[number, number]> {
  try {
    const pools = await this.getFullLendingPoolsData();
    const poolDetails = LENDING_POOL_DETAILS_MAP[uniswapV2PairAddress.toLowerCase()];
    const pool = pools[uniswapV2PairAddress.toLowerCase()];

    let price0 = BigNumber.from(pool.collateralPrice0);
    let price1 = BigNumber.from(pool.collateralPrice1);

    const vaultTokenExchangeRate = BigNumber.from(pool.vaultTokenExchangeRate);

    if (poolDetails.isTarotVault) {
      price0 = price0.mul(vaultTokenExchangeRate).div(TEN_18);
      price1 = price1.mul(vaultTokenExchangeRate).div(TEN_18);
    }
    return [
      parse18(price0.mul(BigNumber.from(10).pow(poolDetails.decimals0)).div(TEN_18)),
      parse18(price1.mul(BigNumber.from(10).pow(poolDetails.decimals1)).div(TEN_18))
    ];
  } catch (e) {
    console.error(e);
    return [0, 0];
  }
}

export async function getPriceDenomLP(this: TarotRouter, uniswapV2PairAddress: Address) : Promise<[number, number]> {
  const cache = this.getLendingPoolCache(uniswapV2PairAddress);
  if (!cache.priceDenomLP) cache.priceDenomLP = this.initializePriceDenomLP(uniswapV2PairAddress);
  return cache.priceDenomLP;
}
export async function getBorrowablePriceDenomLP(this: TarotRouter, uniswapV2PairAddress: Address, poolTokenType: PoolTokenType) : Promise<number> {
  const [priceA, priceB] = await this.getPriceDenomLP(uniswapV2PairAddress);
  if (poolTokenType === PoolTokenType.BorrowableA) return priceA;
  return priceB;
}
export async function getMarketPriceDenomLP(this: TarotRouter, uniswapV2PairAddress: Address) : Promise<[number, number]> {
  const poolDetails = LENDING_POOL_DETAILS_MAP[uniswapV2PairAddress.toLowerCase()];
  const [[reserve0, reserve1], totalSupply] = await Promise.all([
    this.getReserves(uniswapV2PairAddress),
    this.getLPTotalSupply(uniswapV2PairAddress)
  ]);
  let ret;
  if (poolDetails.stable) {
    const x2 = reserve0 * reserve0;
    const y2 = reserve1 * reserve1;
    const f = (3 * x2 + y2) / (x2 + 3 * y2);
    ret = [
      totalSupply / reserve0 * f / (1 + f),
      totalSupply / reserve1 / (1 + f)
    ];
  } else {
    ret = [
      totalSupply / reserve0 / 2,
      totalSupply / reserve1 / 2
    ];
  }
  return ret;
}
export async function getBorrowableMarketPriceDenomLP(this: TarotRouter, uniswapV2PairAddress: Address, poolTokenType: PoolTokenType) : Promise<number> {
  const [priceA, priceB] = await this.getMarketPriceDenomLP(uniswapV2PairAddress);
  if (poolTokenType === PoolTokenType.BorrowableA) return priceA;
  return priceB;
}

// Market Price
export async function getMarketPrice(this: TarotRouter, uniswapV2PairAddress: Address) : Promise<number> {
  const poolDetails = LENDING_POOL_DETAILS_MAP[uniswapV2PairAddress.toLowerCase()];
  const [reserve0, reserve1] = await this.getReserves(uniswapV2PairAddress);

  if (poolDetails.stable) {
    const x2 = reserve0 * reserve0;
    const y2 = reserve1 * reserve1;
    const f = (3 * x2 + y2) / (x2 + 3 * y2);
    return this.priceInverted ? 1 * reserve0 / reserve1 / f : 1 * reserve1 / reserve0 * f;
  }
  return this.priceInverted ? 1 * reserve0 / reserve1 : 1 * reserve1 / reserve0;
}

// TWAP Price
export async function initializeTWAPPrice(
  this: TarotRouter,
  uniswapV2PairAddress: Address
) : Promise<number> {
  try {
    const pools = await this.fullLendingPoolsMap;
    const pool = pools[uniswapV2PairAddress.toLowerCase()];
    return pool.twapPrice;
  } catch (error) {
    // Oracle is not initialized yet
    console.error('[initializeTWAPPrice] error.message => ', error.message);
    return 0; // TODO: error-prone
  }
}

export async function getTWAPPrice(this: TarotRouter, uniswapV2PairAddress: Address) : Promise<number> {
  const cache = this.getLendingPoolCache(uniswapV2PairAddress);
  if (!cache.TWAPPrice) {
    cache.TWAPPrice = this.initializeTWAPPrice(uniswapV2PairAddress);
  }

  const twapPrice = await cache.TWAPPrice;

  if (twapPrice === 0) {
    return 0;
  }

  return this.priceInverted ? 1 / twapPrice : twapPrice;
}

export async function getPairSymbols(
  this: TarotRouter,
  uniswapV2PairAddress: Address
) : Promise<{symbol0: string, symbol1: string}> {
  try {
    const poolDetails = LENDING_POOL_DETAILS_MAP[uniswapV2PairAddress.toLowerCase()];

    return {
      symbol0: poolDetails.symbol0,
      symbol1: poolDetails.symbol1
    };
  } catch (error) {
    console.log('[getPairSymbols] error.message => ', error.message);

    return {
      symbol0: '',
      symbol1: ''
    };
  }
}

export async function initializeFullLendingPoolsData(this: TarotRouter): Promise<{ [key in Address]: PoolDisplayDetails}> {
  if (!this.chainId) {
    return {};
  }
  if (this.fullLendingPoolsMapTask) {
    return this.fullLendingPoolsMap;
  }
  const chainID = this.chainId;
  const tokenPriceMapTask = this.getTokenPrices();
  const dexApyMapTask = this.getDexInfo();
  const lendingPools = LENDING_POOLS_LIST.filter(x => this.chainId === (x.chainId || CHAIN_IDS.FANTOM)).map(pool =>
    ({ ...pool, id: pool.lendingPoolAddress }));
  const ret: {[key: string]: PoolDisplayDetails} = {};
  const poolChunks = chunkify(lendingPools, 32);
  const poolsWithVaultTokenInfo = {};
  await Promise.all(poolChunks.map(async pools => {
    await new Promise(r => setTimeout(r, Math.floor(20)));
    const poolResults = await this.doMulticall(pools.flatMap(pool => {
      const dexInfo = getDexById(this.chainId, pool.dex);
      const vaultDetails = getVaultDetails(pool.id);
      const dexDetails = {
        ...dexInfo,
        ...vaultDetails
      } as DexDetails;
      const tarotPriceOracle = this.newTarotPriceOracle(FACTORY_DETAILS_MAP[pool.tarotFactoryAddress].tarotPriceOracleAddress);
      const tarotSolidlyStablePriceOracle = this.newTarotSolidlyStablePriceOracle(FACTORY_DETAILS_MAP[pool.tarotFactoryAddress].tarotPriceOracleAddress);
      const collateral = this.newCollateral(pool.collateralAddress);
      const collateralUnderlying = this.newERC20(pool.id);
      const collateralUnderlyingLP = this.newUniswapV2Pair(pool.id);
      const pair = pool.dex === DEX.SOLIDLY ? this.newBaseV1Pair(pool.uniswapV2PairAddress) : this.newUniswapV2Pair(pool.uniswapV2PairAddress);
      const token0 = this.newERC20(pool.tokenAddress0);
      const token1 = this.newERC20(pool.tokenAddress1);
      const borrowable0 = this.newBorrowable(pool.borrowableAddress0);
      const borrowable1 = this.newBorrowable(pool.borrowableAddress1);
      const farmingPool0 = this.newFarmingPool(pool.farmingPoolAddress0);
      const farmingPool1 = this.newFarmingPool(pool.farmingPoolAddress1);
      if (!pool.isTarotVault) {
        return [
          [tarotPriceOracle, 'getResult', [pool.id]],
          [],
          [collateral, 'totalSupply', []],
          [collateral, 'getPrices', []],
          [collateralUnderlying, 'totalSupply', []],
          [pair, 'totalSupply', []],
          [collateralUnderlyingLP, 'getReserves', []],
          [pair, 'getReserves', []],
          [token0, 'balanceOf', [pool.borrowableAddress0]],
          [token1, 'balanceOf', [pool.borrowableAddress1]],
          [borrowable0, 'exchangeRate', []],
          [borrowable1, 'exchangeRate', []],
          [borrowable0, 'borrowRate', []],
          [borrowable1, 'borrowRate', []],
          [borrowable0, 'kinkBorrowRate', []],
          [borrowable1, 'kinkBorrowRate', []],
          [borrowable0, 'totalBorrows', []],
          [borrowable1, 'totalBorrows', []],
          [borrowable0, 'accrualTimestamp', []],
          [borrowable1, 'accrualTimestamp', []],
          [borrowable0, 'sync', []],
          [borrowable1, 'sync', []],
          [borrowable0, 'borrowRate', []],
          [borrowable1, 'borrowRate', []],
          [borrowable0, 'kinkBorrowRate', []],
          [borrowable1, 'kinkBorrowRate', []],
          [collateral, 'exchangeRate', []],
          pool.farmingPoolAddress0 === ZERO_ADDRESS ? [] : [farmingPool0, 'advance', []],
          pool.farmingPoolAddress1 === ZERO_ADDRESS ? [] : [farmingPool1, 'advance', []],
          pool.farmingPoolAddress0 === ZERO_ADDRESS ? [] : [farmingPool0, 'epochAmount', []],
          pool.farmingPoolAddress1 === ZERO_ADDRESS ? [] : [farmingPool1, 'epochAmount', []],
          pool.farmingPoolAddress0 === ZERO_ADDRESS ? [] : [farmingPool0, 'epochBegin', []],
          pool.farmingPoolAddress1 === ZERO_ADDRESS ? [] : [farmingPool1, 'epochBegin', []],
          [],
          [],
          [],
          [],
          [],
          [],
          [],
          [],
          [],
          [],
          [],
          [],
          [],
          [],
          [],
          [],
          [],
          [],
          [],
          [],
          [],
          [],
          []
        ];
      } else if (vaultDetails && [VaultType.SPIRIT_V2, VaultType.SPIRIT_BOOSTED, VaultType.SOLIDEX, VaultType.OXD, VaultType.VELODROME, VaultType.XCAL].includes(vaultDetails.type)) {
        const veTokenAddress = vaultDetails.veTokenAddress || ZERO_ADDRESS;
        const gaugeDepositorAddress = dexDetails.lpDepositorAddress || dexDetails.oxVoterProxyAddress || dexDetails.masterChefAddress || dexDetails.gaugeVaultProxyAddress || ZERO_ADDRESS;
        const veToken = this.newERC20(veTokenAddress);
        const gaugeAddress = pool.gaugeAddress || ZERO_ADDRESS;
        const gaugeVaultProxy = new Contract(dexDetails.masterChefAddress || ZERO_ADDRESS, GaugeVaultProxyJSON, this.readLibrary);
        const gaugeVaultProxyAdmin = new Contract(dexDetails.gaugeVaultProxyAdminAddress || ZERO_ADDRESS, GaugeVaultProxyAdminJSON, this.readLibrary);
        const gauge = new Contract(gaugeAddress, GaugeJSON, this.readLibrary);
        const solidlyGauge = new Contract(gaugeAddress, SolidlyGaugeJSON, this.readLibrary);
        const oxStaking = new Contract(pool.oxStakingAddress || ZERO_ADDRESS, OxMultiRewardsJSON, this.readLibrary);
        const vaultToken = this.newVaultToken(pool.id);
        return [
          pool.stable ? [] : [tarotPriceOracle, 'getResult', [pool.id]],
          pool.stable ? [tarotSolidlyStablePriceOracle, 'getResult', [pool.id]] : [],
          [collateral, 'totalSupply', []],
          [collateral, 'getPrices', []],
          [collateralUnderlying, 'totalSupply', []],
          [pair, 'totalSupply', []],
          [collateralUnderlyingLP, 'getReserves', []],
          [pair, 'getReserves', []],
          [token0, 'balanceOf', [pool.borrowableAddress0]],
          [token1, 'balanceOf', [pool.borrowableAddress1]],
          [borrowable0, 'exchangeRate', []],
          [borrowable1, 'exchangeRate', []],
          [borrowable0, 'borrowRate', []],
          [borrowable1, 'borrowRate', []],
          [borrowable0, 'kinkBorrowRate', []],
          [borrowable1, 'kinkBorrowRate', []],
          [borrowable0, 'totalBorrows', []],
          [borrowable1, 'totalBorrows', []],
          [borrowable0, 'accrualTimestamp', []],
          [borrowable1, 'accrualTimestamp', []],
          [borrowable0, 'sync', []],
          [borrowable1, 'sync', []],
          [borrowable0, 'borrowRate', []],
          [borrowable1, 'borrowRate', []],
          [borrowable0, 'kinkBorrowRate', []],
          [borrowable1, 'kinkBorrowRate', []],
          [collateral, 'exchangeRate', []],
          pool.farmingPoolAddress0 === ZERO_ADDRESS ? [] : [farmingPool0, 'advance', []],
          pool.farmingPoolAddress1 === ZERO_ADDRESS ? [] : [farmingPool1, 'advance', []],
          pool.farmingPoolAddress0 === ZERO_ADDRESS ? [] : [farmingPool0, 'epochAmount', []],
          pool.farmingPoolAddress1 === ZERO_ADDRESS ? [] : [farmingPool1, 'epochAmount', []],
          pool.farmingPoolAddress0 === ZERO_ADDRESS ? [] : [farmingPool0, 'epochBegin', []],
          pool.farmingPoolAddress1 === ZERO_ADDRESS ? [] : [farmingPool1, 'epochBegin', []],
          [vaultToken, 'REINVEST_BOUNTY', []],
          [vaultToken, 'REINVEST_FEE', []],
          [vaultToken, 'exchangeRate', []],
          [],
          [],
          [],
          [],
          [],
          [],
          [],
          [],
          pool.vaultType === VaultType.OXD ? [vaultToken, 'getOxTotalSupply', []] : [gauge, 'derivedSupply', []],
          [VaultType.SPIRIT_BOOSTED, VaultType.SPIRIT_V2].includes(pool.vaultType) ? [gauge, 'rewardRate', []] : [solidlyGauge, 'rewardRate', [dexDetails.rewardsTokenAddress]],
          [VaultType.SPIRIT_BOOSTED, VaultType.SPIRIT_V2].includes(pool.vaultType) ? [pool.vaultType === VaultType.SPIRIT_BOOSTED ? gaugeVaultProxy : gaugeVaultProxyAdmin, 'veLockBps', []] : [],
          [VaultType.SPIRIT_BOOSTED, VaultType.SPIRIT_V2].includes(pool.vaultType) ? [gauge, 'earned', [gaugeDepositorAddress]] : [VaultType.VELODROME, VaultType.XCAL].includes(pool.vaultType) ? [solidlyGauge, 'earned', [dexDetails.rewardsTokenAddress, pool.id]] : [],
          [gauge, 'balanceOf', [gaugeDepositorAddress]],
          [gauge, 'derivedBalance', [gaugeDepositorAddress]],
          [VaultType.VELODROME, VaultType.XCAL].includes(pool.vaultType) ? [] : [veToken, 'balanceOf', [gaugeDepositorAddress]],
          pool.vaultType === VaultType.OXD ? [oxStaking, 'rewardData', [dexDetails.rewardsTokenAddress]] : [],
          pool.vaultType === VaultType.OXD ? [oxStaking, 'rewardData', [dexDetails.rewardsTokenBAddress]] : [],
          pool.vaultType === VaultType.OXD ? [oxStaking, 'earned', [pool.oxUserProxyAddress, dexDetails.rewardsTokenAddress]] : [],
          pool.vaultType === VaultType.OXD ? [oxStaking, 'earned', [pool.oxUserProxyAddress, dexDetails.rewardsTokenBAddress]] : [],
          pool.vaultType === VaultType.SOLIDEX ? [vaultToken, 'getReward', []] : []
        ];
      } else {
        const masterChef = pool.vaultType === VaultType.ZIP ? this.newZipRewards(dexDetails.masterChefAddress) : pool.vaultType === VaultType.SPOOKY_V2 ? this.newMasterChefV2(dexDetails.masterChefAddress) : pool.vaultType === VaultType.LIF3 ? this.newLShareRewardPool(dexDetails.masterChefAddress) : this.newMasterChef(dexDetails.masterChefAddress);
        const rewardsToken = this.newERC20(dexDetails.rewardsTokenAddress);
        const vaultToken = pool.vaultType === VaultType.ZIP ? this.newZipVaultToken(pool.id) : pool.vaultType === VaultType.SPOOKY_V2 ? this.newSpookyV2VaultToken(pool.id) : this.newVaultToken(pool.id);
        const lpToken = this.newUniswapV2Pair(pool.uniswapV2PairAddress);
        return [
          [tarotPriceOracle, 'getResult', [pool.id]],
          [],
          [collateral, 'totalSupply', []],
          [collateral, 'getPrices', []],
          [collateralUnderlying, 'totalSupply', []],
          [pair, 'totalSupply', []],
          [collateralUnderlyingLP, 'getReserves', []],
          [pair, 'getReserves', []],
          [token0, 'balanceOf', [pool.borrowableAddress0]],
          [token1, 'balanceOf', [pool.borrowableAddress1]],
          [borrowable0, 'exchangeRate', []],
          [borrowable1, 'exchangeRate', []],
          [borrowable0, 'borrowRate', []],
          [borrowable1, 'borrowRate', []],
          [borrowable0, 'kinkBorrowRate', []],
          [borrowable1, 'kinkBorrowRate', []],
          [borrowable0, 'totalBorrows', []],
          [borrowable1, 'totalBorrows', []],
          [borrowable0, 'accrualTimestamp', []],
          [borrowable1, 'accrualTimestamp', []],
          [borrowable0, 'sync', []],
          [borrowable1, 'sync', []],
          [borrowable0, 'borrowRate', []],
          [borrowable1, 'borrowRate', []],
          [borrowable0, 'kinkBorrowRate', []],
          [borrowable1, 'kinkBorrowRate', []],
          [collateral, 'exchangeRate', []],
          pool.farmingPoolAddress0 === ZERO_ADDRESS ? [] : [farmingPool0, 'advance', []],
          pool.farmingPoolAddress1 === ZERO_ADDRESS ? [] : [farmingPool1, 'advance', []],
          pool.farmingPoolAddress0 === ZERO_ADDRESS ? [] : [farmingPool0, 'epochAmount', []],
          pool.farmingPoolAddress1 === ZERO_ADDRESS ? [] : [farmingPool1, 'epochAmount', []],
          pool.farmingPoolAddress0 === ZERO_ADDRESS ? [] : [farmingPool0, 'epochBegin', []],
          pool.farmingPoolAddress1 === ZERO_ADDRESS ? [] : [farmingPool1, 'epochBegin', []],
          [vaultToken, 'REINVEST_BOUNTY', []],
          [vaultToken, 'REINVEST_FEE', []],
          [vaultToken, 'exchangeRate', []],
          [masterChef, dexDetails.pendingRewardFunctionName, [pool.pid, pool.id]],
          [masterChef, 'totalAllocPoint', []],
          [masterChef, 'poolInfo', [pool.pid]],
          [rewardsToken, 'balanceOf', [pool.id]],
          [lpToken, 'balanceOf', [dexDetails.masterChefAddress]],
          [masterChef, dexDetails.rewardRateFunctionName, []],
          dexDetails.rewardEndFunctionName ? [masterChef, dexDetails.rewardEndFunctionName, []] : [],
          [VaultType.SPOOKY_V2, VaultType.ZIP].includes(pool.vaultType) ? [vaultToken, 'getRewardTokenInfoWithBalances', []] : [],
          [],
          [],
          [],
          [],
          [],
          [],
          [],
          [],
          [],
          [],
          [],
          []
        ];
      }
    }));
    const vaultInfo = chunkify(poolResults, poolResults.length / pools.length).map(([
      twapPrice,
      twapReserves,
      totalCollateral,
      collateralPrices,
      collateralUnderlyingTotalSupply,
      pairTotalSupply,
      collateralUnderlyingReserves,
      pairReserves,
      excessSupply0,
      excessSupply1,
      borrowableExchangeRate0,
      borrowableExchangeRate1,
      borrowRate0,
      borrowRate1,
      kinkBorrowRate0,
      kinkBorrowRate1,
      totalBorrows0,
      totalBorrows1,
      accrualTimestamp0,
      accrualTimestamp1,
      discardSync0,
      discardSync1,
      nextBorrowRate0,
      nextBorrowRate1,
      nextKinkBorrowRate0,
      nextKinkBorrowRate1,
      collateralExchangeRate,
      discardAdvance0,
      discardAdvance1,
      epochAmount0,
      epochAmount1,
      epochBegin0,
      epochBegin1,
      reinvestBountyFactor,
      reinvestFee,
      vaultTokenExchangeRate,
      pendingRewardsInMasterChef,
      totalAllocPoint,
      poolInfo,
      rewardsTokenBalance,
      vaultVaultTotalSupply,
      vaultRewardRate,
      rewardEnd,
      rewardTokenInfoWithBalances,
      gaugeVaultTotalSupply,
      gaugeRewardRate,
      veLockBps,
      gaugeEarned,
      balance,
      derivedBalance,
      veBalance,
      oxRewardData,
      oxRewardDataB,
      oxPendingRewards,
      oxPendingRewardsB,
      solidexPendingRewards
    ], i) => ({
      pool: pools[i],
      twapPrice: twapPrice && twapPrice.price ? twapPrice.price : 0,
      twapReserves: twapReserves && twapReserves.reserve0 && twapReserves.reserve1 ? [twapReserves.reserve0, twapReserves.reserve1] : undefined,
      collateralPrices: collateralPrices || { price0: BigNumber.from(0), price1: BigNumber.from(0) },
      totalCollateral,
      collateralUnderlyingTotalSupply,
      pairTotalSupply,
      collateralUnderlyingReserves,
      pairReserves,
      excessSupply0,
      excessSupply1,
      borrowableExchangeRate0,
      borrowableExchangeRate1,
      borrowRate0,
      borrowRate1,
      kinkBorrowRate0,
      kinkBorrowRate1,
      totalBorrows0,
      totalBorrows1,
      accrualTimestamp0,
      accrualTimestamp1,
      discardSync0,
      discardSync1,
      nextBorrowRate0,
      nextBorrowRate1,
      nextKinkBorrowRate0,
      nextKinkBorrowRate1,
      collateralExchangeRate,
      discardAdvance0,
      discardAdvance1,
      epochAmount0,
      epochAmount1,
      epochBegin0,
      epochBegin1,
      reinvestBountyFactor: reinvestBountyFactor || BigNumber.from(10).pow(16),
      reinvestFee: reinvestFee || BigNumber.from(0),
      vaultTokenExchangeRate,
      pendingRewardsInMasterChef,
      totalAllocPoint,
      poolInfo,
      rewardsTokenBalance,
      vaultTotalSupply: vaultVaultTotalSupply || gaugeVaultTotalSupply,
      rewardRate: oxRewardData ? oxRewardData.periodFinish > Math.floor(Date.now() / 1000) ? oxRewardData.rewardRate : ZERO : vaultRewardRate || gaugeRewardRate,
      rewardRateB: oxRewardDataB ? oxRewardDataB.periodFinish > Math.floor(Date.now() / 1000) ? oxRewardDataB.rewardRate : ZERO : ZERO,
      oxPendingRewards,
      oxPendingRewardsB,
      rewardEnd,
      rewardTokenInfoWithBalances: rewardTokenInfoWithBalances,
      veLockBps,
      gaugeEarned,
      balance,
      derivedBalance,
      veBalance,
      solidexPendingRewards: solidexPendingRewards || BigNumber.from(0)
    }));
    vaultInfo.forEach(v => {
      if (!v.pool.isTarotVault) {
        poolsWithVaultTokenInfo[v.pool.id] = {
          ...v.pool,
          collateralPrices: v.collateralPrices,
          twapPrice: v.twapPrice,
          totalCollateral: v.totalCollateral,
          collateralUnderlyingTotalSupply: v.collateralUnderlyingTotalSupply,
          pairTotalSupply: v.pairTotalSupply,
          collateralUnderlyingReserves: v.collateralUnderlyingReserves,
          pairReserves: v.pairReserves,
          excessSupply0: v.excessSupply0,
          excessSupply1: v.excessSupply1,
          borrowRate0: v.borrowRate0,
          borrowRate1: v.borrowRate1,
          kinkBorrowRate0: v.kinkBorrowRate0,
          kinkBorrowRate1: v.kinkBorrowRate1,
          nextBorrowRate0: v.nextBorrowRate0,
          nextBorrowRate1: v.nextBorrowRate1,
          nextKinkBorrowRate0: v.nextKinkBorrowRate0,
          nextKinkBorrowRate1: v.nextKinkBorrowRate1,
          totalBorrows0: v.totalBorrows0,
          totalBorrows1: v.totalBorrows1,
          accrualTimestamp0: v.accrualTimestamp0,
          accrualTimestamp1: v.accrualTimestamp1,
          collateralExchangeRate: v.collateralExchangeRate,
          borrowableExchangeRate0: v.borrowableExchangeRate0,
          borrowableExchangeRate1: v.borrowableExchangeRate1,
          vaultTokenExchangeRate: BigNumber.from(TEN_18),
          epochAmount0: v.epochAmount0,
          epochAmount1: v.epochAmount1,
          epochBegin0: v.epochBegin0,
          epochBegin1: v.epochBegin1
        };
      } else if ([VaultType.SPIRIT_V2, VaultType.SPIRIT_BOOSTED, VaultType.SOLIDEX, VaultType.OXD, VaultType.VELODROME, VaultType.XCAL].includes(v.pool.vaultType)) {
        const TEN_K = BigNumber.from(10000);
        const veLockNumerator = BigNumber.from(TEN_K).sub(v.veLockBps || 1500);
        const veLockDenominator = BigNumber.from(TEN_K);
        let pendingRewards = ZERO;
        let pendingRewardsB = ZERO;
        let boostMultiplier = TEN_18;
        if ([VaultType.SPIRIT_BOOSTED, VaultType.SPIRIT_V2].includes(v.pool.vaultType)) {
          pendingRewards = v.gaugeEarned.mul(veLockNumerator).div(veLockDenominator);
          boostMultiplier = v.veBalance.isZero() || !v.derivedBalance || v.derivedBalance.isZero() ? TEN_18.mul(10).div(4) : TEN_18.mul(10).div(4).mul(v.derivedBalance).div(v.balance);
        }
        if ([VaultType.VELODROME, VaultType.XCAL].includes(v.pool.vaultType)) {
          pendingRewards = v.gaugeEarned;
        }
        if (v.pool.vaultType === VaultType.SOLIDEX) {
          pendingRewards = v.solidexPendingRewards;
        }
        if (v.pool.vaultType === VaultType.OXD) {
          pendingRewards = v.oxPendingRewards;
          pendingRewardsB = v.oxPendingRewardsB;
        }
        const reinvestBounty = ZERO;
        let gaugeMultiplier = TEN_18.sub(v.reinvestBountyFactor).sub(v.reinvestFee);
        if ([VaultType.SPIRIT_V2, VaultType.SPIRIT_BOOSTED, VaultType.SOLIDEX].includes(v.pool.vaultType)) {
          gaugeMultiplier = gaugeMultiplier.mul(veLockNumerator).div(veLockDenominator);
        }
        if ([VaultType.SPIRIT_BOOSTED, VaultType.SPIRIT_V2].includes(v.pool.vaultType) && v.veBalance.isZero()) {
          gaugeMultiplier = gaugeMultiplier.mul(4).div(10);
        } else if ([VaultType.SPIRIT_V2, VaultType.SPIRIT_BOOSTED, VaultType.SOLIDEX].includes(v.pool.vaultType) && !v.derivedBalance.isZero() && !v.balance.isZero()) {
          gaugeMultiplier = gaugeMultiplier.mul(v.derivedBalance).div(v.balance);
        }
        poolsWithVaultTokenInfo[v.pool.id] = {
          ...v.pool,
          collateralPrices: v.collateralPrices,
          twapPrice: v.twapPrice,
          twapReserves: v.twapReserves,
          totalCollateral: v.totalCollateral,
          collateralUnderlyingTotalSupply: v.collateralUnderlyingTotalSupply,
          pairTotalSupply: v.pairTotalSupply,
          collateralUnderlyingReserves: v.collateralUnderlyingReserves,
          pairReserves: v.pairReserves,
          excessSupply0: v.excessSupply0,
          excessSupply1: v.excessSupply1,
          borrowRate0: v.borrowRate0,
          borrowRate1: v.borrowRate1,
          kinkBorrowRate0: v.kinkBorrowRate0,
          kinkBorrowRate1: v.kinkBorrowRate1,
          nextBorrowRate0: v.nextBorrowRate0,
          nextBorrowRate1: v.nextBorrowRate1,
          nextKinkBorrowRate0: v.nextKinkBorrowRate0,
          nextKinkBorrowRate1: v.nextKinkBorrowRate1,
          totalBorrows0: v.totalBorrows0,
          totalBorrows1: v.totalBorrows1,
          accrualTimestamp0: v.accrualTimestamp0,
          accrualTimestamp1: v.accrualTimestamp1,
          collateralExchangeRate: v.collateralExchangeRate,
          borrowableExchangeRate0: v.borrowableExchangeRate0,
          borrowableExchangeRate1: v.borrowableExchangeRate1,
          pendingRewards: pendingRewards,
          pendingRewardsB: pendingRewardsB,
          vaultTotalSupply: v.vaultTotalSupply,
          vaultRewardRate: v.rewardRate,
          vaultRewardRateB: v.rewardRateB,
          reinvestBounty: reinvestBounty,
          isVaultActive: v.rewardRate.gt(0),
          reinvestBountyFactor: v.reinvestBountyFactor,
          reinvestFee: v.reinvestFee,
          multiplier: gaugeMultiplier,
          boostMultiplier: boostMultiplier,
          vaultTokenExchangeRate: v.vaultTokenExchangeRate,
          epochAmount0: v.epochAmount0,
          epochAmount1: v.epochAmount1,
          epochBegin0: v.epochBegin0,
          epochBegin1: v.epochBegin1
        };
      } else {
        let allocPoint = ZERO;
        if (v.poolInfo) {
          allocPoint = v.poolInfo.allocPoint;
        }
        let rewardTokensPerSecond = ZERO;
        if (
          [
            VaultType.OXD_V1,
            VaultType.TOMB,
            VaultType.LIF3,
            VaultType.T2OMB,
            VaultType.T3OMB,
            VaultType.BASED
          ].includes(v.pool.vaultType) &&
          v.rewardEnd !== undefined &&
          v.rewardEnd.lte(Math.floor(Date.now() / 1000))) {
          rewardTokensPerSecond = ZERO;
        } else if (
          (VaultType.VEDAO === v.pool.vaultType &&
            v.rewardEnd.lte(this.readLibrary.blockNumber))
        ) {
          rewardTokensPerSecond = ZERO;
        } else if (v.pool.dex === DEX.SPIRIT) {
          rewardTokensPerSecond = v.rewardRate.mul(this.networkBlocksPerSecond).div(TEN_18);
        } else {
          rewardTokensPerSecond = v.rewardRate;
        }
        const vaultRewardRate = v.totalAllocPoint.isZero() ? ZERO : rewardTokensPerSecond.mul(allocPoint).div(v.totalAllocPoint);
        const pendingRewards = (v.pendingRewardsInMasterChef || BigNumber.from(0)).add(v.rewardsTokenBalance);
        const reinvestBounty = pendingRewards.mul(v.reinvestBountyFactor).div(TEN_18);

        poolsWithVaultTokenInfo[v.pool.id] = {
          ...v.pool,
          collateralPrices: v.collateralPrices,
          twapPrice: v.twapPrice,
          totalCollateral: v.totalCollateral,
          collateralUnderlyingTotalSupply: v.collateralUnderlyingTotalSupply,
          pairTotalSupply: v.pairTotalSupply,
          collateralUnderlyingReserves: v.collateralUnderlyingReserves,
          pairReserves: v.pairReserves,
          excessSupply0: v.excessSupply0,
          excessSupply1: v.excessSupply1,
          borrowRate0: v.borrowRate0,
          borrowRate1: v.borrowRate1,
          kinkBorrowRate0: v.kinkBorrowRate0,
          kinkBorrowRate1: v.kinkBorrowRate1,
          nextBorrowRate0: v.nextBorrowRate0,
          nextBorrowRate1: v.nextBorrowRate1,
          nextKinkBorrowRate0: v.nextKinkBorrowRate0,
          nextKinkBorrowRate1: v.nextKinkBorrowRate1,
          totalBorrows0: v.totalBorrows0,
          totalBorrows1: v.totalBorrows1,
          accrualTimestamp0: v.accrualTimestamp0,
          accrualTimestamp1: v.accrualTimestamp1,
          collateralExchangeRate: v.collateralExchangeRate,
          borrowableExchangeRate0: v.borrowableExchangeRate0,
          borrowableExchangeRate1: v.borrowableExchangeRate1,
          pendingRewards: pendingRewards,
          vaultTotalSupply: v.vaultTotalSupply,
          vaultRewardRate: vaultRewardRate,
          reinvestBounty: reinvestBounty,
          reinvestBountyFactor: v.reinvestBountyFactor,
          reinvestFee: v.reinvestFee,
          isVaultActive: [VaultType.SPOOKY_V2, VaultType.ZIP].includes(v.pool.vaultType) || allocPoint.gt(0),
          multiplier: TEN_18.sub(v.reinvestBountyFactor).sub(v.reinvestFee),
          vaultTokenExchangeRate: v.vaultTokenExchangeRate,
          epochAmount0: v.epochAmount0,
          epochAmount1: v.epochAmount1,
          epochBegin0: v.epochBegin0,
          epochBegin1: v.epochBegin1,
          rewardTokenInfoWithBalances: v.rewardTokenInfoWithBalances,
          depositFeeBps: v.poolInfo && v.poolInfo.depositFee ? v.poolInfo.depositFee : BigNumber.from(0)
        };
      }
    });
  }));

  const tokenPriceMap = await tokenPriceMapTask;
  for (const pool of Object.values(poolsWithVaultTokenInfo)) {
    const safetyMargin = Math.pow(parse18(pool.safetyMarginSqrt), 2);
    if (safetyMargin < 1.51) {
      pool.shownLeverage = 10;
    } else if (safetyMargin < 2.01) {
      pool.shownLeverage = 5;
    } else {
      pool.shownLeverage = 3;
    }
    if (pool.stable && pool.twapReserves) {
      const d0 = BigNumber.from(10).pow(pool.decimals0);
      const d1 = BigNumber.from(10).pow(pool.decimals1);
      const x = pool.twapReserves[0].mul(TEN_18).div(d0);
      const y = pool.twapReserves[1].mul(TEN_18).div(d1);
      const x2 = x.mul(x).div(TEN_18);
      const y2 = y.mul(y).div(TEN_18);
      const f = x2.mul(3).add(y2).mul(TEN_18).div(y2.mul(3).add(x2));
      pool.twapPrice = parse18(y.mul(f).div(x));
    } else {
      pool.twapPrice = parse18(TEN_18.mul(pool.twapPrice)
        .mul(BigNumber.from(10).pow(pool.decimals0))
        .div(BigNumber.from(2).pow(112))
        .div(BigNumber.from(10).pow(pool.decimals1)));
    }
    if (pool.isTarotVault) {
      const dexInfo = getDexById(this.chainId, pool.dex);
      const vaultDetails = getVaultDetails(pool.id);
      const dexDetails = {
        ...dexInfo,
        ...vaultDetails
      } as DexDetails;
      if (dexDetails.rewardsTokenAddress) {
        pool.pendingReward = parse18(TEN_18.mul(pool.pendingRewards).div(BigNumber.from(10).pow(dexDetails.rewardsTokenDecimals || 18)));
        pool.reinvestBounty = parse18(TEN_18.mul(pool.pendingRewards).mul(pool.reinvestBountyFactor).div(TEN_18).div(BigNumber.from(10).pow(dexDetails.rewardsTokenDecimals || 18)));
      } else {
        pool.pendingReward = 0;
        pool.reinvestBounty = 0;
      }
      const rewardsTokenPrice = tokenPriceMap[dexDetails.rewardsTokenAddress.toLowerCase()].priceUSD.value;
      let rewardsTokenBPrice = ZERO;
      let rewardRateB = ZERO;

      if (vaultDetails && [VaultType.SOLIDEX, VaultType.OXD].includes(pool.vaultType) && vaultDetails.rewardsTokenBAddress) {
        rewardsTokenBPrice = tokenPriceMap[vaultDetails.rewardsTokenBAddress.toLowerCase()].priceUSD.value;

        if (pool.vaultType === VaultType.SOLIDEX) {
          rewardRateB = pool.vaultRewardRate.mul(10000).div(42069);
        }
        if (pool.vaultType === VaultType.OXD) {
          rewardRateB = pool.vaultRewardRateB;
          pool.pendingReward = parse18(pool.pendingRewards.add(pool.pendingRewardsB.mul(rewardsTokenBPrice).div(rewardsTokenPrice)));
          pool.reinvestBounty = parse18(pool.pendingRewards.add(pool.pendingRewardsB.mul(rewardsTokenBPrice).div(rewardsTokenPrice)).mul(pool.reinvestBountyFactor).div(TEN_18));
        }
      }

      if (
        [VaultType.SPOOKY_V2, VaultType.ZIP].includes(pool.vaultType) &&
        pool.rewardTokenInfoWithBalances && pool.rewardTokenInfoWithBalances.rewardTokens &&
        pool.rewardTokenInfoWithBalances.rewardTokens.length > 0
      ) {
        rewardsTokenBPrice = tokenPriceMap[pool.rewardTokenInfoWithBalances.rewardTokens[0].toLowerCase()].priceUSD.value;
        rewardRateB = pool.vaultType === VaultType.ZIP ? BigNumber.from(0) : pool.rewardTokenInfoWithBalances.rewardRates[0];
      }

      const lpTokenPrice = tokenPriceMap[pool.uniswapV2PairAddress.toLowerCase()].priceUSD.value;
      let vaultAPR = ZERO;
      const { isVaultActive, multiplier, vaultRewardRate, vaultTotalSupply } = pool;
      const depositFeeBps = BigNumber.from(DEPOSIT_FEE_BPS_MAP[pool.id.toLowerCase()] || '0');
      const TEN_K = BigNumber.from(10000);
      const depositFeeNumerator = BigNumber.from(TEN_K).sub(depositFeeBps);
      const depositFeeDenominator = BigNumber.from(TEN_K);
      if (
        isVaultActive &&
        !vaultTotalSupply.isZero() &&
        !lpTokenPrice.isZero()
      ) {
        vaultAPR = multiplier
          .mul(depositFeeNumerator)
          .div(depositFeeDenominator)
          .mul(365 * 24 * 60 * 60)
          .mul(rewardsTokenPrice.mul(vaultRewardRate).add(rewardsTokenBPrice.mul(rewardRateB)))
          .div(vaultTotalSupply.mul(lpTokenPrice));
      }
      pool.vaultAPR = parse18(vaultAPR);
    }
  }

  const x = await Promise.all(
    lendingPools.map(lendingPool => Promise.all([
      poolsWithVaultTokenInfo[lendingPool.id].shownLeverage,
      poolsWithVaultTokenInfo[lendingPool.id] && poolsWithVaultTokenInfo[lendingPool.id].isVaultActive,
      (poolsWithVaultTokenInfo[lendingPool.id] && poolsWithVaultTokenInfo[lendingPool.id].vaultAPR) || 0,
      poolsWithVaultTokenInfo[lendingPool.id].collateralPrices,
      poolsWithVaultTokenInfo[lendingPool.id].twapPrice,
      poolsWithVaultTokenInfo[lendingPool.id].twapReserves,
      poolsWithVaultTokenInfo[lendingPool.id].totalCollateral,
      poolsWithVaultTokenInfo[lendingPool.id].collateralUnderlyingTotalSupply,
      poolsWithVaultTokenInfo[lendingPool.id].pairTotalSupply,
      poolsWithVaultTokenInfo[lendingPool.id].collateralUnderlyingReserves,
      poolsWithVaultTokenInfo[lendingPool.id].pairReserves,
      poolsWithVaultTokenInfo[lendingPool.id].excessSupply0,
      poolsWithVaultTokenInfo[lendingPool.id].excessSupply1,
      poolsWithVaultTokenInfo[lendingPool.id].borrowRate0,
      poolsWithVaultTokenInfo[lendingPool.id].borrowRate1,
      poolsWithVaultTokenInfo[lendingPool.id].kinkBorrowRate0,
      poolsWithVaultTokenInfo[lendingPool.id].kinkBorrowRate1,
      poolsWithVaultTokenInfo[lendingPool.id].nextBorrowRate0,
      poolsWithVaultTokenInfo[lendingPool.id].nextBorrowRate1,
      poolsWithVaultTokenInfo[lendingPool.id].nextKinkBorrowRate0,
      poolsWithVaultTokenInfo[lendingPool.id].nextKinkBorrowRate1,
      poolsWithVaultTokenInfo[lendingPool.id].totalBorrows0,
      poolsWithVaultTokenInfo[lendingPool.id].totalBorrows1,
      poolsWithVaultTokenInfo[lendingPool.id].accrualTimestamp0,
      poolsWithVaultTokenInfo[lendingPool.id].accrualTimestamp1,
      poolsWithVaultTokenInfo[lendingPool.id].collateralExchangeRate,
      poolsWithVaultTokenInfo[lendingPool.id].borrowableExchangeRate0,
      poolsWithVaultTokenInfo[lendingPool.id].borrowableExchangeRate1,
      poolsWithVaultTokenInfo[lendingPool.id].pendingReward,
      poolsWithVaultTokenInfo[lendingPool.id].reinvestBounty,
      poolsWithVaultTokenInfo[lendingPool.id].reinvestBountyFactor,
      poolsWithVaultTokenInfo[lendingPool.id].reinvestFee,
      poolsWithVaultTokenInfo[lendingPool.id].vaultTokenExchangeRate,
      poolsWithVaultTokenInfo[lendingPool.id].epochAmount0,
      poolsWithVaultTokenInfo[lendingPool.id].epochAmount1,
      poolsWithVaultTokenInfo[lendingPool.id].epochBegin0,
      poolsWithVaultTokenInfo[lendingPool.id].epochBegin1,
      poolsWithVaultTokenInfo[lendingPool.id].rewardTokenInfoWithBalances,
      poolsWithVaultTokenInfo[lendingPool.id].depositFeeBps,
      poolsWithVaultTokenInfo[lendingPool.id].boostMultiplier
    ]))
  );

  let i = 0;
  for (const lendingPool of lendingPools) {
    const [
      leverage,
      vaultActive,
      vaultAPY,
      collateralPrices,
      twapPrice,
      twapReserves,
      totalCollateral,
      collateralUnderlyingTotalSupply,
      pairTotalSupply,
      collateralUnderlyingReserves,
      pairReserves,
      excessSupply0,
      excessSupply1,
      borrowRate0,
      borrowRate1,
      kinkBorrowRate0,
      kinkBorrowRate1,
      nextBorrowRate0,
      nextBorrowRate1,
      nextKinkBorrowRate0,
      nextKinkBorrowRate1,
      totalBorrows0,
      totalBorrows1,
      accrualTimestamp0,
      accrualTimestamp1,
      collateralExchangeRate,
      borrowableExchangeRate0,
      borrowableExchangeRate1,
      pendingReward,
      reinvestBounty,
      reinvestBountyFactor,
      reinvestFee,
      vaultTokenExchangeRate,
      epochAmount0,
      epochAmount1,
      epochBegin0,
      epochBegin1,
      rewardTokenInfoWithBalances,
      depositFeeBps,
      boostMultiplier
    ] = x[i];
    i++;

    const dexApyMap = await dexApyMapTask;
    const tarotAddress = TAROT_ADDRESSES[chainID];

    const lendingPoolURL =
      PAGES.LENDING_POOL
        .replace(`:${PARAMETERS.CHAIN_ID}`, chainID.toString())
        .replace(`:${PARAMETERS.UNISWAP_V2_PAIR_ADDRESS}`, lendingPool.id);

    const poolDetails = LENDING_POOL_DETAILS_MAP[lendingPool.id.toLowerCase()];

    const tokenPrice0 = parse18(tokenPriceMap[poolDetails.tokenAddress0.toLowerCase()].priceUSD.value);
    const tokenPrice1 = parse18(tokenPriceMap[poolDetails.tokenAddress1.toLowerCase()].priceUSD.value);
    const lpOrVaultTokenPrice = parse18(tokenPriceMap[poolDetails.uniswapV2PairAddress.toLowerCase()].priceUSD.value.mul(vaultTokenExchangeRate).div(TEN_18));
    const oracleIsInitialized = twapPrice !== 0;
    const dexAPY = dexApyMap[poolDetails.uniswapV2PairAddress.toLowerCase()].apy;
    const dex = getDexById(this.chainId, poolDetails.dex);
    const tokenIconA = getTokenIcon(poolDetails.tokenAddress0);
    const tokenIconB = getTokenIcon(poolDetails.tokenAddress1);
    const hasFarmingA = poolDetails.farmingPoolAddress0 !== ZERO_ADDRESS;
    const hasFarmingB = poolDetails.farmingPoolAddress1 !== ZERO_ADDRESS;
    const symbolA = getTokenSymbol(lendingPool.id, PoolTokenType.BorrowableA);
    const symbolB = getTokenSymbol(lendingPool.id, PoolTokenType.BorrowableB);
    const scaleA = BigNumber.from(10).pow(poolDetails.decimals0);
    const scaleB = BigNumber.from(10).pow(poolDetails.decimals1);
    const totalSupplyUSDA = parse18(totalBorrows0.add(excessSupply0).mul(TEN_18).div(scaleA)) * tokenPrice0;
    const totalSupplyUSDB = parse18(totalBorrows1.add(excessSupply1).mul(TEN_18).div(scaleB)) * tokenPrice1;
    const totalBorrowsUSDA = parse18(totalBorrows0.mul(TEN_18).div(scaleA)) * tokenPrice0;
    const totalBorrowsUSDB = parse18(totalBorrows1.mul(TEN_18).div(scaleB)) * tokenPrice1;
    const utilizationRateA = totalSupplyUSDA === 0 ? 0 : Math.min(1, totalBorrowsUSDA / totalSupplyUSDA);
    const utilizationRateB = totalSupplyUSDB === 0 ? 0 : Math.min(1, totalBorrowsUSDB / totalSupplyUSDB);

    const currSupplyAPYA = toAPY(parse18(borrowRate0) * utilizationRateA * parse18(TEN_18.sub(poolDetails.reserveFactor0)));
    const currSupplyAPYB = toAPY(parse18(borrowRate1) * utilizationRateB * parse18(TEN_18.sub(poolDetails.reserveFactor1)));
    const currBorrowAPYA = toAPY(parse18(borrowRate0));
    const currBorrowAPYB = toAPY(parse18(borrowRate1));
    const supplyAPYA = toAPY(parse18(nextBorrowRate0) * utilizationRateA * parse18(TEN_18.sub(poolDetails.reserveFactor0)));
    const supplyAPYB = toAPY(parse18(nextBorrowRate1) * utilizationRateB * parse18(TEN_18.sub(poolDetails.reserveFactor1)));
    const borrowAPYA = toAPY(parse18(nextBorrowRate0));
    const borrowAPYB = toAPY(parse18(nextBorrowRate1));

    const tarotPrice = chainID === CHAIN_IDS.FANTOM ? parse18(tokenPriceMap[tarotAddress.toLowerCase()].priceUSD.value) : 0;
    const segmentLength = 14 * 86400;
    const now = Date.now() / 1000;
    const epochEnd0 = epochBegin0 ? epochBegin0.add(segmentLength).toNumber() : 0;
    const epochEnd1 = epochBegin1 ? epochBegin1.add(segmentLength).toNumber() : 0;
    let rewardSpeedA = 0;
    let rewardSpeedB = 0;
    let farmingPoolAPYA;
    if (epochAmount0 === undefined || now > epochEnd0 || totalBorrowsUSDA === 0) {
      farmingPoolAPYA = 0;
    } else {
      rewardSpeedA = parse18(BigNumber.from(epochAmount0).div(segmentLength));
      farmingPoolAPYA = toAPY(tarotPrice * rewardSpeedA / totalBorrowsUSDA);
    }
    let farmingPoolAPYB;
    if (epochAmount1 === undefined || now > epochEnd1 || totalBorrowsUSDB === 0) {
      farmingPoolAPYB = 0;
    } else {
      rewardSpeedB = parse18(BigNumber.from(epochAmount1).div(segmentLength));
      farmingPoolAPYB = toAPY(tarotPrice * rewardSpeedB / totalBorrowsUSDB);
    }
    let f = 1;
    if (poolDetails.stable) {
      const x = parseFloat(formatUnits(pairReserves[0], poolDetails.decimals0));
      const y = parseFloat(formatUnits(pairReserves[1], poolDetails.decimals1));
      const x2 = x * x;
      const y2 = y * y;
      f = (3 * x2 + y2) / (x2 + 3 * y2);
    }
    const averageAPY = (borrowAPYA - farmingPoolAPYA) * f / (1 + f) + (borrowAPYB - farmingPoolAPYB) / (1 + f);
    const leveragedAPY = (dexAPY + vaultAPY) * leverage - averageAPY * (leverage - 1);
    const unleveragedAPY = (dexAPY + vaultAPY);

    const vaultDetails = getVaultDetails(lendingPool.id);

    let pendingRewardB = 0;
    let rewardTokenB = undefined;
    if (
      [VaultType.SPOOKY_V2, VaultType.ZIP].includes(lendingPool.vaultType) &&
      rewardTokenInfoWithBalances &&
      rewardTokenInfoWithBalances.balances &&
      rewardTokenInfoWithBalances.balances.length > 0 &&
      rewardTokenInfoWithBalances.rewardTokens &&
      rewardTokenInfoWithBalances.rewardTokens.length > 0
    ) {
      pendingRewardB = parse18(rewardTokenInfoWithBalances.pendingAmounts[0].add(rewardTokenInfoWithBalances.balances[0]));
      rewardTokenB = rewardTokenInfoWithBalances.rewardTokens[0].toLowerCase();
    }

    ret[lendingPool.id] = {
      id: lendingPool.id,
      collateralPrice0: collateralPrices.price0.toString(),
      collateralPrice1: collateralPrices.price1.toString(),
      twapPrice: twapPrice,
      twapReserves: twapReserves ? [twapReserves[0].toString(), twapReserves[1].toString()] : undefined,
      totalCollateral: parse18(totalCollateral),
      totalLp: totalCollateral.mul(collateralExchangeRate).div(TEN_18).mul(vaultTokenExchangeRate).div(TEN_18).toString(),
      totalCollateralUSD: parse18(totalCollateral) * lpOrVaultTokenPrice,
      collateralUnderlyingTotalSupply: collateralUnderlyingTotalSupply.toString(),
      pairTotalSupply: pairTotalSupply.toString(),
      priceFactor: f,
      stable: poolDetails.stable || false,
      collateralUnderlyingReserves: collateralUnderlyingReserves ? [collateralUnderlyingReserves[0].toString(), collateralUnderlyingReserves[1].toString()] : [pairReserves[0].toString(), pairReserves[1].toString()],
      pairReserves: [pairReserves[0].toString(), pairReserves[1].toString()],
      excessSupply: [excessSupply0.toString(), excessSupply1.toString()],
      totalBorrows: [totalBorrows0.toString(), totalBorrows1.toString()],
      totalSupplyUSD: [totalSupplyUSDA, totalSupplyUSDB],
      totalBorrowedUSD: [totalBorrowsUSDA, totalBorrowsUSDB],
      utilization: [utilizationRateA, utilizationRateB],
      supplyAPR: [supplyAPYA, supplyAPYB],
      borrowAPR: [borrowAPYA, borrowAPYB],
      currSupplyAPR: [currSupplyAPYA, currSupplyAPYB],
      currBorrowAPR: [currBorrowAPYA, currBorrowAPYB],
      unleveragedAPR: unleveragedAPY,
      leveragedAPR: leveragedAPY,
      multiplier: leverage,
      boostMultiplier: boostMultiplier ? boostMultiplier : TEN_18,
      vaultDetails: vaultDetails,
      dex: dex,
      pendingRewards: vaultDetails && vaultDetails.type === VaultType.ZIP ?
        lendingPool.pid === 5 ? [0] : [pendingReward] :
        vaultDetails && vaultDetails.type === VaultType.SPOOKY_V2 ?
          lendingPool.id.toLowerCase() === '0x92eb021eda4c3c841d48475a3fa0310d9d5c307e' ?
            [pendingReward] :
            ['0x18fc05a12ce30d7514e8c59c035b7b5cc68a98e0', '0x86fbecb2e655102e97019358855d0aad9adff26b'].includes(lendingPool.id.toLowerCase()) ?
              [pendingRewardB] :
              [pendingReward] :
          (typeof pendingReward === 'undefined') ?
            [] :
            [pendingReward],
      reinvestBounties: vaultDetails && vaultDetails.type === VaultType.ZIP ?
        lendingPool.pid === 5 ? [0] : [pendingReward * .01] :
        vaultDetails && vaultDetails.type === VaultType.SPOOKY_V2 ?
          lendingPool.id.toLowerCase() === '0x92eb021eda4c3c841d48475a3fa0310d9d5c307e' ?
            [pendingReward * .01] :
            ['0x18fc05a12ce30d7514e8c59c035b7b5cc68a98e0', '0x86fbecb2e655102e97019358855d0aad9adff26b'].includes(lendingPool.id.toLowerCase()) ?
              [pendingRewardB * .01] :
              [pendingReward * .01] :
          (typeof reinvestBounty === 'undefined') ?
            [] :
            [reinvestBounty],
      rewardsTokensDecimals: vaultDetails && vaultDetails.type === VaultType.ZIP ?
        lendingPool.pid === 5 ? [18] : [18] :
        vaultDetails && vaultDetails.type === VaultType.SPOOKY_V2 ?
          lendingPool.id.toLowerCase() === '0x92eb021eda4c3c841d48475a3fa0310d9d5c307e' ?
            [18] :
            ['0x18fc05a12ce30d7514e8c59c035b7b5cc68a98e0', '0x86fbecb2e655102e97019358855d0aad9adff26b'].includes(lendingPool.id.toLowerCase()) ?
              [18] :
              [18] :
          vaultDetails && vaultDetails.rewardsTokenDecimals ?
            [vaultDetails.rewardsTokenDecimals] :
            dex && (dex as DexDetails).rewardsTokenDecimals ?
              [(dex as DexDetails).rewardsTokenDecimals] :
              [],
      rewardsTokensAddresses: vaultDetails && vaultDetails.type === VaultType.ZIP ?
        lendingPool.pid === 5 ? [vaultDetails.rewardsTokenAddress] : [vaultDetails.rewardsTokenAddress] :
        vaultDetails && vaultDetails.type === VaultType.SPOOKY_V2 ?
          lendingPool.id.toLowerCase() === '0x92eb021eda4c3c841d48475a3fa0310d9d5c307e' ?
            [vaultDetails.rewardsTokenAddress] :
            ['0x18fc05a12ce30d7514e8c59c035b7b5cc68a98e0', '0x86fbecb2e655102e97019358855d0aad9adff26b'].includes(lendingPool.id.toLowerCase()) ?
              [rewardTokenB] :
              [vaultDetails.rewardsTokenAddress] :
          vaultDetails && vaultDetails.rewardsTokenAddress ?
            [vaultDetails.rewardsTokenAddress] :
            dex && (dex as DexDetails).rewardsTokenAddress ?
              [(dex as DexDetails).rewardsTokenAddress] :
              [],
      rewardsTokensSymbols: vaultDetails && vaultDetails.type === VaultType.ZIP ?
        lendingPool.pid === 5 ? ['ZIP'] : ['ZIP'] :
        vaultDetails && vaultDetails.type === VaultType.SPOOKY_V2 ?
          lendingPool.id.toLowerCase() === '0x92eb021eda4c3c841d48475a3fa0310d9d5c307e' ?
            ['BOO'] :
            ['0x18fc05a12ce30d7514e8c59c035b7b5cc68a98e0', '0x86fbecb2e655102e97019358855d0aad9adff26b'].includes(lendingPool.id.toLowerCase()) ?
              ['DEUS'] :
              ['BOO'] :
          vaultDetails && vaultDetails.rewardsTokenSymbol ?
            [vaultDetails.rewardsTokenSymbol] :
            dex && (dex as DexDetails).rewardsTokenSymbol ?
              [(dex as DexDetails).rewardsTokenSymbol] :
              [],
      reinvestFee: reinvestBountyFactor && parse18(reinvestBountyFactor.add(reinvestFee)),
      symbol: [symbolA, symbolB],
      oracleIsInitialized: oracleIsInitialized || true, // TODO: Revisit setting of oracleIsInitialized
      vaultAPR: poolDetails.poolDisabled ? 0 : vaultAPY,
      dexAPR: dexAPY,
      hasFarming: [hasFarmingA, hasFarmingB],
      tokenIcon: [tokenIconA, tokenIconB],
      lendingPool: lendingPool,
      lendingPoolUrl: lendingPoolURL,
      farmingPoolAPR: [farmingPoolAPYA, farmingPoolAPYB],
      vaultActive: vaultActive,
      vaultTokenExchangeRate: vaultTokenExchangeRate.toString(),
      collateralExchangeRate: collateralExchangeRate.toString(),
      borrowableExchangeRate0: borrowableExchangeRate0.toString(),
      borrowableExchangeRate1: borrowableExchangeRate1.toString(),
      accrualTimestamp: [BigNumber.from(accrualTimestamp0 || 0).toNumber(), BigNumber.from(accrualTimestamp1 || 0).toNumber()],
      borrowRate: [borrowRate0.toString(), borrowRate1.toString()],
      nextKinkBorrowRate: [nextKinkBorrowRate0.toString(), nextKinkBorrowRate1.toString()],
      kinkBorrowRate: [kinkBorrowRate0.toString(), kinkBorrowRate1.toString()],
      rewardSpeed: [rewardSpeedA, rewardSpeedB],
      poolDisabled: poolDetails.poolDisabled || false,
      poolDeactivated: poolDetails.poolDeactivated || false,
      depositFeeBps: depositFeeBps ? depositFeeBps.toString() : '0'
    };
  }

  // Cache for future use
  this.fullLendingPoolsMap = ret;

  setLocalStorageItem(`flpm-${this.chainId}`, ret, 60 * 5);

  return ret;
}

export async function getFullLendingPoolsData(this: TarotRouter) : Promise<{[key: string]: PoolDisplayDetails}> {
  if (this.fullLendingPoolsMap) {
    return Promise.resolve(this.fullLendingPoolsMap);
  }
  if (!this.fullLendingPoolsMapTask) {
    this.fullLendingPoolsMapTask = this.initializeFullLendingPoolsData();
  }
  return this.fullLendingPoolsMapTask;
}

export async function getFullLendingPool(this: TarotRouter, lendingPoolId: string) : Promise<PoolDisplayDetails> {
  const lendingPoolsData = await this.getFullLendingPoolsData();
  return lendingPoolsData[lendingPoolId.toLowerCase()];
}

export async function getFullLendingPools(this: TarotRouter) : Promise<PoolDisplayDetails[]> {
  if (!this.chainId) {
    return [];
  }
  const lendingPoolData = await this.getFullLendingPoolsData();
  const allLendingPools = Object.keys(lendingPoolData).filter(pair => LENDING_POOL_IDS.includes(pair.toLowerCase()));
  const tarotPools = [];
  const nonTarotPools = [];
  const highlightPools = [];
  const highlightPoolIds = []; // ['0x7a2edc2041e130d61e18eb93a32bb13c331067a0', '0x7bc34e4aae7842637b4815f90bd50ce32cfaa58a'];
  for (const lendingPool of allLendingPools) {
    if (TAROT_LENDING_POOLS.includes(lendingPool.toLowerCase())) {
      tarotPools.push(lendingPoolData[lendingPool]);
    } else if (highlightPoolIds.includes(lendingPool.toLowerCase())) {
      highlightPools.push(lendingPoolData[lendingPool]);
    } else {
      nonTarotPools.push(lendingPoolData[lendingPool]);
    }
  }
  return [
    ...(tarotPools.sort((a, b) => b.totalCollateralUSD - a.totalCollateralUSD)),
    ...highlightPools,
    ...(nonTarotPools.sort((a, b) => b.totalCollateralUSD - a.totalCollateralUSD))
  ];
}

export async function initializeFullSupplyVaultsData(this: TarotRouter) : Promise<{ [key in Address]: SupplyVault}> {
  if (!this.chainId) {
    return {};
  }
  if (this.supplyVaultsMapTask) {
    return this.supplyVaultsMapTask;
  }
  const supplyVaultTasks = [
    FEE_DISTRIBUTOR_ADDRESSES[this.chainId] ? this.tarot.balanceOf(FEE_DISTRIBUTOR_ADDRESSES[this.chainId]) : BigNumber.from(0),
    this.chainId === CHAIN_IDS.FANTOM ? this.feeDistributor.periodLength() : BigNumber.from(30 * 86400),
    this.chainId === CHAIN_IDS.FANTOM ? this.newERC20(TINSPIRIT_ADDRESS).balanceOf(XTINSPIRIT_TOKEN_DISTRIBUTOR_ADDRESS) : 0,
    this.chainId === CHAIN_IDS.FANTOM ? this.xtinSpiritTokenDistributor.periodLength() : BigNumber.from(30 * 86400)
  ];
  const supplyVaultInfoMap = SUPPLY_VAULTS[this.chainId] || {};
  const supplyVaultAddresses = Object.keys(supplyVaultInfoMap);
  const ret: {[key: string]: SupplyVault} = {};
  const supplyVaultAddressChunks = chunkify(supplyVaultAddresses, 64);
  const supplyVaultsWithInfo = {};
  await Promise.all(supplyVaultAddressChunks.map(async supplyVaultAddresses => {
    const supplyVaultResults = await this.doMulticall(supplyVaultAddresses.flatMap(supplyVaultAddress => {
      const supplyVaultInfo = supplyVaultInfoMap[supplyVaultAddress];
      const supplyVault = this.newSupplyVault(supplyVaultAddress);
      return [
        [supplyVault, 'shareValuedAsUnderlying', [BigNumber.from(10).pow(supplyVaultInfo.decimals)]],
        [supplyVault, 'getTotalUnderlying', []],
        [supplyVault, 'getSupplyRate', []],
        [supplyVault, 'feeBps', []]
      ];
    }));
    const vaultInfo = chunkify(supplyVaultResults, supplyVaultResults.length / supplyVaultAddresses.length).map(([
      shareValuedAsUnderlying,
      totalUnderlying,
      supplyRate,
      feeBps
    ], i) => ({
      supplyVaultAddress: supplyVaultAddresses[i],
      supplyVaultInfo: supplyVaultInfoMap[supplyVaultAddresses[i]],
      shareValuedAsUnderlying,
      totalUnderlying,
      supplyRate,
      feeBps
    }));
    vaultInfo.forEach(v => {
      supplyVaultsWithInfo[v.supplyVaultAddress] = {
        supplyVaultAddress: v.supplyVaultAddress,
        ...v.supplyVaultInfo,
        shareValuedAsUnderlying: v.shareValuedAsUnderlying || BigNumber.from(10).pow(v.supplyVaultInfo.underlyingDecimals),
        totalUnderlying: v.totalUnderlying,
        supplyRate: v.supplyRate,
        feeBps: v.feeBps
      };
    });
  }));

  const [feeDistributorBalance, periodLength, tokenDistributorBalance, tokenDistributorPeriodLength] = await Promise.all(supplyVaultTasks);
  const MAX_BPS = BigNumber.from('10000');
  for (const vault of Object.values(supplyVaultsWithInfo)) {
    ret[vault.supplyVaultAddress] = {
      shareValuedAsUnderlying: {
        amount: vault.shareValuedAsUnderlying,
        decimals: vault.underlyingDecimals
      },
      totalUnderlying: {
        amount: vault.totalUnderlying,
        decimals: vault.underlyingDecimals
      },
      supplyRate: {
        amount: vault.supplyVaultAddress.toLowerCase() === XTAROT_ADDRESSES[this.chainId].toLowerCase() || vault.supplyVaultAddress.toLowerCase() === XTINSPIRIT_ADDRESS.toLowerCase() ? vault.supplyRate : vault.supplyRate.mul(MAX_BPS.sub(vault.feeBps)).div(MAX_BPS),
        decimals: BigNumber.from(18)
      },
      feeDistributorRate: vault.supplyVaultAddress.toLowerCase() === XTAROT_ADDRESSES[this.chainId].toLowerCase() ?
        {
          amount: feeDistributorBalance.mul(TEN_18).div(vault.totalUnderlying).div(periodLength),
          decimals: BigNumber.from(18)
        } : vault.supplyVaultAddress.toLowerCase() === XTINSPIRIT_ADDRESS.toLowerCase() ?
          {
            amount: vault.totalUnderlying.isZero() ? ZERO : tokenDistributorBalance.mul(TEN_18).div(vault.totalUnderlying).div(tokenDistributorPeriodLength),
            decimals: BigNumber.from(18)
          } :
          undefined
    };
  }

  // Cache for future use
  this.supplyVaultsMap = ret;

  return ret;
}

export function getFullSupplyVaultsData(this: TarotRouter) : Promise<TokenPriceMap> {
  if (this.supplyVaultsMap) {
    return Promise.resolve(this.supplyVaultsMap);
  }
  if (!this.supplyVaultsMapTask) {
    this.supplyVaultsMapTask = this.initializeFullSupplyVaultsData();
  }
  return this.supplyVaultsMapTask;
}

export async function getFullSupplyVaults(this: TarotRouter) : Promise<SupplyVault[]> {
  if (!this.chainId) {
    return [];
  }
  const supplyVaultData = await this.getFullSupplyVaultsData();
  return Object.values(supplyVaultData);
}

export async function initializeUserPositions(this: TarotRouter, account: string) : Promise<{collateralPositions: string[], supplyPositions: string[]}> {
  const ret = {
    collateralPositions: [],
    supplyPositions: []
  };
  if (!this.chainId) {
    return ret;
  }
  const poolChunks = chunkify(LENDING_POOLS_LIST.filter(x => this.chainId === (x.chainId || CHAIN_IDS.FANTOM)), 64);
  await Promise.all(poolChunks.map(async pools => {
    const poolResults = await this.doMulticall(pools.flatMap(pool => {
      const collateral = this.newCollateral(pool.collateralAddress);
      const borrowable0 = this.newBorrowable(pool.borrowableAddress0);
      const borrowable1 = this.newBorrowable(pool.borrowableAddress1);
      return [
        [collateral, 'balanceOf', [account]],
        [borrowable0, 'balanceOf', [account]],
        [borrowable1, 'balanceOf', [account]]
      ];
    }));
    const poolInfo = chunkify(poolResults, poolResults.length / pools.length).map(([
      collateralBalance,
      supplyBalance0,
      supplyBalance1
    ], i) => ({
      pool: pools[i],
      collateralBalance,
      supplyBalance0,
      supplyBalance1
    }));
    poolInfo.forEach(p => {
      if (p.collateralBalance && p.collateralBalance.gt(0)) {
        ret.collateralPositions.push(p.pool.lendingPoolAddress);
      }
      if ((p.supplyBalance0 && p.supplyBalance0.gt(0)) || (p.supplyBalance1 && p.supplyBalance1.gt(0))) {
        ret.supplyPositions.push(p.pool.lendingPoolAddress);
      }
    });
  }));
  return {
    collateralPositions: ret.collateralPositions.sort((a, b) => a.localeCompare(b)),
    supplyPositions: ret.supplyPositions.sort((a, b) => a.localeCompare(b))
  };
}

export async function getUserPositions(this: TarotRouter, account: string) : Promise<{collateralPositions: string[], supplyPositions: string[]}> {
  if (!this.userPositionsMap) {
    this.userPositionsMap = {};
  }
  if (!this.userPositionsMap[account.toLowerCase()]) {
    this.userPositionsMap[account.toLowerCase()] = this.initializeUserPositions(account);
  }
  return this.userPositionsMap[account.toLowerCase()];
}

export async function initializeUserDistributionMap(this: TarotRouter) : Promise<UserDistributionMap> {
  if (!this.account) {
    return {};
  }
  const distributors = DISTRIBUTOR_ADDRESSES[this.chainId];
  const ret: UserDistributionMap = {};
  const availableClaimableMapTasks = {};
  const distributorResults = await this.doMulticall(distributors.flatMap(distributorConfig => {
    const claimable = new Contract(distributorConfig.claimableAddress, ClaimableJSON, this.library.getSigner(this.account));
    availableClaimableMapTasks[distributorConfig.claimableAddress] = claimable.callStatic.claim().catch(() => (BigNumber.from(0)));
    const distributor = this.newDistributor(distributorConfig.claimableAddress);
    return [
      [distributor, 'recipients', [this.account]],
      [distributor, 'totalShares', []]
    ];
  }));
  const distributorInfo = chunkify(distributorResults, distributorResults.length / distributors.length).map(([
    { shares, lastShareIndex },
    totalShares
  ], i) => ({
    distributorConfig: distributors[i],
    shares,
    lastShareIndex,
    totalShares
  }));
  const availableClaimableMap = await promiseProps(availableClaimableMapTasks);
  distributorInfo.forEach(d => {
    if (!d.shares || d.shares.isZero()) {
      return;
    }
    const totalDistribution = BigNumber.from(d.distributorConfig.totalDistribution).mul(TEN_18);
    const claimableSharePct = TEN_18.mul(d.shares).div(d.totalShares);
    const claimed = d.lastShareIndex.mul(d.shares).div(BigNumber.from(2).pow(160));
    ret[d.distributorConfig.claimableAddress] = {
      config: d.distributorConfig,
      totalClaim: totalDistribution.mul(claimableSharePct).div(TEN_18).toString(),
      totalDistribution: totalDistribution.toString(),
      claimableSharePct: claimableSharePct.toString(),
      claimed: claimed.toString(),
      availableClaimable: (availableClaimableMap[d.distributorConfig.claimableAddress]).toString()
    };
  });
  return ret;
}

export async function getUserDistributionMap(this: TarotRouter) : Promise<UserDistributionMap> {
  if (this.userDistributionMap) {
    return Promise.resolve(this.userDistributionMap);
  }
  this.userDistributionMap = this.initializeUserDistributionMap();
  return this.userDistributionMap;
}

export async function initializeDexInfo(this: TarotRouter) : Proimse<{ [key in Address]: DexIdAndApy }> {
  if (this.dexInfoMapTask) {
    return this.dexInfoMap;
  }

  const dimFromStorage = getLocalStorageItem(`dim-${this.chainId}`);
  if (dimFromStorage) {
    this.dexInfoMap = dimFromStorage;
    return dimFromStorage;
  }

  const filteredLendingPools = LENDING_POOLS_LIST.filter(x => this.chainId === (x.chainId || CHAIN_IDS.FANTOM));
  const subgraphItems = await getSubgraphInfoForAllDexes(filteredLendingPools.map(x => x.lendingPoolAddress));
  const subgraphItemsByPairId: {[pairId: string]: SubgraphInfoPoolItem} = {};
  for (const item of subgraphItems) {
    subgraphItemsByPairId[item.pairAddress.toLowerCase()] = item;
  }

  const dexIdAndApy: {[key in Address]: DexIdAndApy} = {};

  for (const lendingPool of filteredLendingPools) {
    const uniswapV2PairAddress = lendingPool.uniswapV2PairAddress.toLowerCase();
    const item = subgraphItemsByPairId[uniswapV2PairAddress];
    const dex = item ? (getDexById(this.chainId, item.dex) as DexDetails) : null;
    if (!item || !dex || typeof dex.id === 'undefined' || typeof dex.lpFee === 'undefined') {
      dexIdAndApy[uniswapV2PairAddress] = {
        apy: 0,
        dexId: lendingPool.dex
      };
      continue;
    }
    const yearlyVolume = parseFloat(item.dailyVolumeUSD) * 365;
    const yearlyFee = yearlyVolume * dex.lpFee;
    const reserveUSD = parseFloat(item.reserveUSD);
    dexIdAndApy[uniswapV2PairAddress] = {
      apy: reserveUSD > 0 ? yearlyFee / reserveUSD : 0,
      dexId: dex.id
    };
  }

  // Cache for future use
  this.dexInfoMap = dexIdAndApy;

  setLocalStorageItem(`dim-${this.chainId}`, dexIdAndApy, 60 * 15);

  return dexIdAndApy;
}

export async function getDexInfo(this: TarotRouter): Promise<{ [key in Address]: DexIdAndApy }> {
  if (this.dexInfoMap) {
    return Promise.resolve(this.dexInfoMap);
  }
  if (!this.dexInfoMapTask) {
    this.dexInfoMapTask = this.initializeDexInfo();
  }
  return this.dexInfoMapTask;
}