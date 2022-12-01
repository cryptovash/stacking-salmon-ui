/* eslint-disable no-invalid-this */
import { BigNumber } from '@ethersproject/bignumber';
import { SUPPLY_VAULTS } from '../config/web3/contracts/supply-vault';
import { TAROT_ADDRESSES, XTAROT_ADDRESSES } from '../config/web3/contracts/tarot';
import { X_STAKING_POOLS } from '../config/web3/contracts/x-staking-pool';
import { Address, EMPTY_X_STAKING_POOL, EMPTY_X_STAKING_POOL_ACCOUNT_INFO, XStakingPool, XStakingPoolAccountInfo } from '../types/interfaces';
import { parse18, parseNumber } from '../utils/big-amount';
import TarotRouter from '.';

type XStakingPoolControllerPoolInfo =
[
  string,
  BigNumber,
  BigNumber,
  BigNumber,
  BigNumber,
  BigNumber,
  BigNumber,
  BigNumber,
  BigNumber,
  string
] & {
  RewardToken: string;
  RewardPerSecond: BigNumber;
  TokenPrecision: BigNumber;
  xTAROTStakedAmount: BigNumber;
  lastRewardTime: BigNumber;
  accRewardPerShare: BigNumber;
  endTime: BigNumber;
  startTime: BigNumber;
  userLimitEndTime: BigNumber;
  protocolOwnerAddress: string;
};

type XStakingPoolControllerUserInfo =
[
  BigNumber,
  BigNumber
] & {
  amount: BigNumber;
  rewardDebt: BigNumber;
};

export async function initializeXStakingPool(this: TarotRouter, poolId: number) : Promise<XStakingPool> {
  try {
    const xStakingPoolInfo = X_STAKING_POOLS[this.chainId][poolId];
    let rewardTokenPrice = 1;
    const tokenPriceMapTask = this.getTokenPrices();
    if (xStakingPoolInfo.rewardTokenIsSupplyVaultToken) {
      const supplyVaultConfigInfo = SUPPLY_VAULTS[this.chainId][xStakingPoolInfo.rewardTokenAddress.toLowerCase()];
      const [tokenPriceMap, supplyVaultInfo] = await Promise.all([
        tokenPriceMapTask,
        this.getSupplyVault(xStakingPoolInfo.rewardTokenAddress)
      ]);
      const underlyingPrice = parse18(tokenPriceMap[supplyVaultConfigInfo.underlyingAddress.toLowerCase()].priceUSD.value);
      rewardTokenPrice = parseNumber(supplyVaultInfo.shareValuedAsUnderlying) * underlyingPrice;
    } else {
      const tokenPriceMap = await tokenPriceMapTask;
      rewardTokenPrice = await parse18(tokenPriceMap[xStakingPoolInfo.rewardTokenAddress.toLowerCase()].priceUSD.value);
    }

    const controllerPoolInfo: XStakingPoolControllerPoolInfo = await this.xStakingPoolController.poolInfo(poolId);
    const ret: XStakingPool = {
      stakedBalance: {
        amount: controllerPoolInfo.xTAROTStakedAmount,
        decimals: BigNumber.from(18)
      },
      rewardTokensPerSecond: {
        amount: controllerPoolInfo.RewardPerSecond,
        decimals: xStakingPoolInfo.rewardTokenDecimals
      },
      rewardTokenPrice: rewardTokenPrice,
      start: controllerPoolInfo.startTime.toNumber(),
      end: controllerPoolInfo.endTime.toNumber()
    };
    return ret;
  } catch (error) {
    return EMPTY_X_STAKING_POOL;
  }
}

export async function getXStakingPool(this: TarotRouter, poolId: number) : Promise<XStakingPool> {
  if (!this.xStakingPoolCache[poolId]) {
    this.xStakingPoolCache[poolId] = this.initializeXStakingPool(poolId);
  }
  return this.xStakingPoolCache[poolId];
}

export async function initializeXStakingPoolAccountInfo(this: TarotRouter, poolId: number, account: Address) : Promise<XStakingPoolAccountInfo> {
  try {
    const xStakingPoolInfo = X_STAKING_POOLS[this.chainId][poolId];
    const [controllerUserInfo, pendingReward] = await Promise.all([
      this.xStakingPoolController.userInfo(poolId, account) as Promise<XStakingPoolControllerUserInfo>,
      this.xStakingPoolController.pendingReward(poolId, account)
    ]);
    return {
      pendingReward: {
        amount: pendingReward,
        decimals: xStakingPoolInfo.rewardTokenDecimals
      },
      stakedBalance: {
        amount: controllerUserInfo.amount,
        decimals: BigNumber.from(18)
      }
    };
  } catch (error) {
    return EMPTY_X_STAKING_POOL_ACCOUNT_INFO;
  }
}

export async function getXStakingPoolAccountInfo(this: TarotRouter, poolId: number, account?: Address) : Promise<XStakingPoolAccountInfo> {
  account = account || this.account;
  if (!this.xStakingPoolAccountInfoCache[account]) {
    this.xStakingPoolAccountInfoCache[account] = {};
  }
  if (!this.xStakingPoolAccountInfoCache[account][poolId]) {
    this.xStakingPoolAccountInfoCache[account][poolId] = this.initializeXStakingPoolAccountInfo(poolId, account);
  }
  return this.xStakingPoolAccountInfoCache[account][poolId];
}

export async function getXStakingPoolTVLForAccount(this: TarotRouter, account?: Address) : Promise<number> {
  account = account || this.account;
  let tvl = 0;
  const xStakingPools = Object.keys(X_STAKING_POOLS[this.chainId] || {});
  if (xStakingPools.length === 0) {
    return 0;
  }
  const [xTAROTInfo, tokenPriceMap, accountInfoList] = await Promise.all([
    this.getSupplyVault(XTAROT_ADDRESSES[this.chainId]),
    this.getTokenPrices(),
    Promise.all(xStakingPools.map((poolId: any) => this.getXStakingPoolAccountInfo(poolId, account) as Promise<XStakingPoolAccountInfo>))
  ]);
  const xTAROTPrice = parseNumber(xTAROTInfo.shareValuedAsUnderlying) * parse18(tokenPriceMap[TAROT_ADDRESSES[this.chainId].toLowerCase()].priceUSD.value);
  for (let i = 0; i < accountInfoList.length; i++) {
    const accountInfo = accountInfoList[i];
    tvl += (parseNumber(accountInfo.stakedBalance) * xTAROTPrice);
  }
  return tvl;
}