/* eslint-disable no-invalid-this */

import BoostMaxxerJSON from '../abis/contracts/BoostMaxxer.json';
import BaseV1PairJSON from '../abis/contracts/solidly/BaseV1Pair.json';
import GaugeJSON from '../abis/contracts/solidly/Gauge.json';
import { CHAIN_IDS } from '../config/web3/chains';
import { BOOSTMAXX_POOLS_LIST } from '../config/web3/contracts/boostmaxx-pools';
import { BOOSTMAXXER_ADDRESSES, SOLID_ADDRESSES } from '../config/web3/contracts/boostmaxxer';
import { BigNumber, BigNumberish, Contract } from 'ethers';
import { formatUnits, getAddress } from 'ethers/lib/utils';
import { BoostMaxxPoolInfo, TEN_18, ZERO } from '../types/interfaces';
import { chunkify } from '../utils/chunkify';
import TarotRouter from '.';

const getTokenIconPath = (tokenAddress: string) => {
  try {
    return `/assets/images/token-icons/${getAddress(tokenAddress)}.png`;
  } catch {
    // TODO: <
    // TODO: not working
    return '/assets/images/token-icons/default.png';
    // TODO: >
  }
};

export async function initializeBoostMaxxPools(this: TarotRouter): Promise<BoostMaxxPoolInfo[]> {
  const tokenPriceMapTask = this.getTokenPrices();
  const boostMaxxPools = BOOSTMAXX_POOLS_LIST.filter(x => this.chainId === (x.chainId || CHAIN_IDS.FANTOM));
  const poolChunks = chunkify(boostMaxxPools, 64);
  const allPools: BoostMaxxPoolInfo[] = [];
  await Promise.all(poolChunks.map(async pools => {
    const poolResults = await this.doMulticall(pools.flatMap(pool => {
      const boostMaxxer = new Contract(BOOSTMAXXER_ADDRESSES[this.chainId], BoostMaxxerJSON, this.readLibrary);
      const lp = new Contract(pool.id, BaseV1PairJSON, this.readLibrary);
      const gauge = new Contract(pool.gauge, GaugeJSON, this.readLibrary);
      return [
        [gauge, 'balanceOf', [BOOSTMAXXER_ADDRESSES[this.chainId]]],
        [gauge, 'rewardRate', [SOLID_ADDRESSES[this.chainId]]],
        [gauge, 'derivedBalance', [BOOSTMAXXER_ADDRESSES[this.chainId]]],
        [gauge, 'derivedSupply', []],
        [gauge, 'totalSupply', []],
        (this.account && this.account !== '') ? [boostMaxxer, 'userDepositedAmountInfo', [pool.id, this.account]] : [],
        (this.account && this.account !== '') ? [boostMaxxer, 'pendingReward', [this.account, pool.id]] : [],
        (this.account && this.account !== '') ? [lp, 'balanceOf', [this.account]] : [],
        [lp, 'totalSupply', []],
        [lp, 'getReserves', []]
      ] as any;
    }));
    const unfilteredPoolDetails = chunkify(poolResults, 10).map(([
      totalDeposits,
      rewardRate,
      derivedBalance,
      derivedSupply,
      gaugeSupply,
      userDeposits,
      pendingReward,
      userLpBalance,
      totalSupply,
      reserves
    ], i) => ({
      ...pools[i],
      totalDeposits,
      rewardRate,
      derivedBalance,
      derivedSupply,
      gaugeSupply,
      userDeposits: userDeposits || BigNumber.from(0),
      pendingReward: pendingReward || BigNumber.from(0),
      userLpBalance: userLpBalance || BigNumber.from(0),
      totalSupply,
      reserves,
      tokenIconA: getTokenIconPath(pools[i].token0),
      tokenIconB: getTokenIconPath(pools[i].token1),
      reservesUSD: [ZERO, ZERO],
      totalDepositsUSD: ZERO,
      userDepositsUSD: ZERO,
      pendingRewardUSD: ZERO,
      apr: ZERO
    } as BoostMaxxPoolInfo));

    const poolDetails = unfilteredPoolDetails.filter(pool => pool.totalDeposits.gt(0) || pool.rewardRate.gt(10000));
    allPools.push(...poolDetails);
  }));
  const tokenPriceMap = await tokenPriceMapTask;
  const valueOf = (tokenId: string, amount: BigNumberish, type: 'USD' | 'ETH' = 'USD') => {
    amount = BigNumber.from(amount);
    if (amount.isZero()) {
      return ZERO;
    }
    const tokenPrice = tokenPriceMap[tokenId];
    if (!tokenPrice) {
      return ZERO;
    }
    const price = type === 'USD' ? tokenPrice.priceUSD : tokenPrice.priceETH;
    const scale = BigNumber.from(10).pow(tokenPrice.decimals);
    return amount.mul(price.value).div(scale);
  };
  const lpValueOf = (
    opts: {
      symbol: string;
      token0: string;
      token1: string;
      reserves: [BigNumberish, BigNumberish];
      totalSupply: BigNumberish;
    },
    amount: BigNumberish,
    type: 'USD' | 'ETH' = 'USD') => {
    const { token0, token1, reserves } = opts;
    let { totalSupply } = opts;
    amount = BigNumber.from(amount);
    totalSupply = BigNumber.from(totalSupply);
    if (totalSupply.isZero() || amount.isZero()) {
      return ZERO;
    }
    const valueOfReserve0 = valueOf(token0, reserves[0], type);
    const valueOfReserve1 = valueOf(token1, reserves[1], type);
    return amount.mul(valueOfReserve0.add(valueOfReserve1)).div(totalSupply);
  };
  const calcAPR = (pool: BoostMaxxPoolInfo) => {
    if (pool.gaugeSupply.isZero() || lpValueOf(pool, pool.gaugeSupply).isZero()) {
      return ZERO;
    }
    let multiplier;

    if (pool.derivedBalance.gt(0) && pool.totalDeposits.gt(0)) {
      multiplier = TEN_18.mul(pool.derivedBalance).div(pool.totalDeposits);
    } else {
      multiplier = TEN_18;
    }

    return multiplier
      .mul(valueOf(SOLID_ADDRESSES[this.chainId], pool.rewardRate))
      .mul(24 * 60 * 60 * 365)
      .mul(85)
      .div(100)
      .div(lpValueOf(pool, pool.gaugeSupply));
  };
  const tarotPools = [];
  const otherPools = [];
  for (const pool of allPools) {
    pool.reservesUSD = [
      valueOf(pool.token0, pool.reserves[0]),
      valueOf(pool.token1, pool.reserves[1])
    ];
    pool.totalDepositsUSD = lpValueOf(pool, pool.totalDeposits);
    pool.userDepositsUSD = lpValueOf(pool, pool.userDeposits);
    pool.pendingRewardUSD = valueOf(SOLID_ADDRESSES[this.chainId], pool.pendingReward);
    pool.apr = calcAPR(pool);
    if ([
      '0x783f1eDBE336981dFCb74Bd0B803655F55AaDF48',
      '0x4FE782133af0f7604B9B89Bf95893ADDE265FEFD',
      '0xd0184791ADfa030Bdf8a1F2d626f823d1c2b0159'
    ].includes(pool.id)) {
      tarotPools.push(pool);
    } else {
      if (pool.totalDepositsUSD.gt(0)) {
        otherPools.push(pool);
      }
    }
  }
  return [
    ...tarotPools.sort((a, b) => parseFloat(formatUnits(b.userDepositsUSD)) - parseFloat(formatUnits(a.userDepositsUSD))),
    ...otherPools.sort((a, b) => parseFloat(formatUnits(b.userDepositsUSD)) - parseFloat(formatUnits(a.userDepositsUSD)))
  ];
}

export async function getBoostMaxxPools(this: TarotRouter) : Promise<BoostMaxxPoolInfo[]> {
  if (!this.boostMaxxPoolsCache) {
    this.boostMaxxPoolsCache = this.initializeBoostMaxxPools();
  }
  return this.boostMaxxPoolsCache;
}