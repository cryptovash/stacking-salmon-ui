// TODO: <
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
// TODO: >

import { Contract } from '@ethersproject/contracts';
import { JsonRpcBatchProvider, Web3Provider, StaticJsonRpcProvider } from '@ethersproject/providers';

import ERC20JSON from '../abis/contracts/IERC20.json';
import UniswapV2PairJSON from '../abis/contracts/IUniswapV2Pair.json';
import BaseV1PairJSON from '../abis/contracts/solidly/BaseV1Pair.json';
import UniswapV2FactoryJSON from '../abis/contracts/IUniswapV2Factory.json';
import Router02JSON from '../abis/contracts/IRouter02.json';
import BorrowableJSON from '../abis/contracts/IBorrowable.json';
import CollateralSON from '../abis/contracts/ICollateral.json';
import FactoryJSON from '../abis/contracts/IFactory.json';
import TarotPriceOracleJSON from '../abis/contracts/ITarotPriceOracle.json';
import TarotSolidlyStablePriceOracleJSON from '../abis/contracts/ITarotSolidlyStablePriceOracle.json';
import VaultTokenJSON from '../abis/contracts/IVaultToken.json';
import SpookyV2VaultTokenJSON from '../abis/contracts/ISpookyV2VaultToken.json';
import ZipVaultTokenJSON from '../abis/contracts/IZipVaultToken.json';
import MasterChefJSON from '../abis/contracts/IMasterChef.json';
import MasterChefV2JSON from '../abis/contracts/IMasterChefV2.json';
import LShareRewardPoolJSON from '../abis/contracts/LShareRewardPool.json';
import ZipRewardsJSON from '../abis/contracts/IZipRewards.json';
import FarmingPoolJSON from '../abis/contracts/IFarmingPool.json';
import ClaimAggregatorJSON from '../abis/contracts/ClaimAggregator.json';
import ClaimableJSON from '../abis/contracts/IClaimable.json';
import DistributorJSON from '../abis/contracts/IDistributor.json';
import LiquidityGeneratorJSON from '../abis/contracts/ILiquidityGenerator.json';
import SupplyVaultJSON from '../abis/contracts/ISupplyVault.json';
import FeeDistributorJSON from '../abis/contracts/IFeeDistributor.json';
import XStakingPoolControllerJSON from '../abis/contracts/XStakingPoolController.json';
import Multicall2JSON from '../abis/contracts/Multicall2.json';
import {
  Address,
  LendingPool,
  PoolTokenType,
  TarotRouterConfigInterface,
  AirdropData,
  ClaimAggregatorContract,
  ClaimEvent,
  ClaimableContract,
  UniswapV2FactoryContract,
  LiquidityGeneratorContract,
  BigAmount,
  SupplyVault,
  FeeDistributorContract,
  TarotContract,
  XStakingPoolControllerContract,
  XStakingPool,
  XStakingPoolAccountInfo,
  BoostMaxxPoolInfo,
  TEN_18,
  PoolDisplayDetailsMap,
  SupplyVaultsMap,
  UserDistributionMap
} from '../types/interfaces';
import * as contracts from './contracts';
import * as cacheData from './cacheData';
import * as fetchers from './fetchers';
import * as utils from './utils';
import * as approve from './approve';
import * as interactions from './interactions';
import * as account from './account';
import * as tarot from './tarot';
import * as supplyVault from './supplyVault';
import * as xStakingPool from './xStakingPool';
import * as vaultToken from './vaultToken';
import * as liquidityGen from './liquidityGenerator';
import * as boostMaxx from './boostmaxx';
import * as tokenPrices from './tokenPrices';
import Subgraph from '../subgraph';
import { CLAIM_AGGREGATOR_ADDRESSES } from '../config/web3/contracts/claim-aggregators';
import { LIQUIDITY_GENERATOR_ADDRESSES } from '../config/web3/contracts/liquidity-generator';
import { CHAIN_DETAILS, CHAIN_IDS, POLLING_INTERVAL } from '../config/web3/chains';
import { TAROT_ADDRESSES } from '../config/web3/contracts/tarot';
import { FEE_DISTRIBUTOR_ADDRESSES } from '../config/web3/contracts/fee-distributors';
import { X_STAKING_POOL_CONTROLLER_ADDRESSES } from '../config/web3/contracts/x-staking-pool';
import { LENDING_POOL_DETAILS_MAP } from '../config/web3/contracts/lending-pools';
import { BigNumber, BigNumberish } from 'ethers';
import { Abi } from 'ethers-multicall/dist/abi';
import { MULTICALL_ADDRESSES } from '../config/web3/contracts/multicall';
import { MulticallContract } from '../utils/helpers/web3/multicall-contract';
import { getLocalStorageItem } from '../utils/local-storage';
import { chunkify } from '../utils/chunkify';
import { JsonRpcBatchProviderWithRetry, StaticJsonRpcProviderWithRetry } from '../utils/helpers/web3/provider';
import { XTINSPIRIT_TOKEN_DISTRIBUTOR_ADDRESS } from '../config/web3/contracts/wrapped-escrow-spirit';

async function all<T extends any[] = any[]>(
  multicallAddress: string,
  provider: ethers.providers.Provider,
  calls: ContractCall[],
  from?: string | 'multicall'
): Promise<T> {
  const multicall = new Contract(multicallAddress, Multicall2JSON, provider);
  const callRequests = calls.map(call => {
    const callData = Abi.encode(call.name, call.inputs, call.params);
    return {
      target: call.contract.address,
      callData
    };
  });
  const response = await multicall.callStatic.tryBlockAndAggregate(false, callRequests, {
    from: from === 'multicall' ? multicallAddress : from
  });
  const callCount = calls.length;
  const callResult = [] as T;
  for (let i = 0; i < callCount; i++) {
    const outputs = calls[i].outputs;
    const returnData = response.returnData[i];
    let result = undefined;
    if (returnData.success) {
      const params = Abi.decode(outputs, returnData.returnData);
      result = outputs.length === 1 ? params[0] : params;
    }
    callResult.push(result);
  }
  return callResult;
}

function createMulticallProvider(chainId: number, provider: ethers.providers.JsonRpcProvider) {
  const multicallAddress = MULTICALL_ADDRESSES[chainId];
  const doMulticall = async (tasks: MulticallTask[], from?: string | 'multicall') => {
    const nonEmptyTasks = tasks.filter(task => task.length === 3);
    const results = await all(
      multicallAddress,
      provider,
      nonEmptyTasks.map(task => {
        if (Array.isArray(task)) {
          return new MulticallContract(task[0].address, [
            ...task[0].interface.fragments
          ])[task[1]](...task[2]);
        }
        return new MulticallContract(task.contract.address, [
          ...task.contract.interface.fragments
        ])[task.method](...task.args);
      }
      ), from);
    let index = 0;
    return tasks.map(task =>
      task.length === 3 ?
        results[index++] :
        undefined
    );
  };
  const doMulticallParallel = async (allTasks: MulticallTask[], chunkSize: number, from?: string | 'multicall') => {
    const chunkResults = await Promise.all(chunkify(allTasks, chunkSize).map(tasks => doMulticall(tasks, from)));
    return chunkResults.flat();
  };

  const doMulticallSeries = async (allTasks: MulticallTask[], chunkSize: number, from?: string | 'multicall') => {
    const results: any[] = [];
    for (const tasks of chunkify(allTasks, chunkSize)) {
      const chunkResult = await doMulticall(tasks, from);
      results.push(...chunkResult);
    }
    return results;
  };

  return {
    doMulticall,
    doMulticallParallel,
    doMulticallSeries
  };
}

type CreateMultiCallResult = ReturnType<typeof createMulticallProvider>;
type DoMulticall = CreateMultiCallResult['doMulticall'];
type DoMulticallParallel = CreateMultiCallResult['doMulticallParallel'];
type DoMulticallSeries = CreateMultiCallResult['doMulticallSeries'];

class TarotRouter {
  isWaitingForBlock = false;
  subgraph: Subgraph;
  library: Web3Provider;
  readLibrary: JsonRpcBatchProvider;
  mcLibrary: StaticJsonRpcProvider;
  mcLibrary2: JsonRpcBatchProvider;
  doMulticall: DoMulticall;
  doMulticallParallel: DoMulticallParallel;
  doMulticallSeries: DoMulticallSeries;
  web3: any;
  chainId: number;
  uiMargin: number;
  uiMarginStable: number;
  dust: number;
  uniswapV2Factory: UniswapV2FactoryContract;
  claimAggregator: ClaimAggregatorContract;
  liquidityGenerator?: LiquidityGeneratorContract;
  tarot: TarotContract;
  feeDistributor: FeeDistributorContract;
  xtinSpiritTokenDistributor: FeeDistributorContract;
  xStakingPoolController: XStakingPoolControllerContract;
  account: Address;
  priceInverted: boolean;
  supplyVaultCache: {
    [key in Address]: Promise<SupplyVault>
  };
  supplyVaultUnderlyingBalanceCache: {
    [key in Address]: {
      [key in Address]: Promise<BigAmount>
    }
  };
  xStakingPoolCache: {
    [key in number]: Promise<XStakingPool>
  };
  boostMaxxLpAddressesCache: Promise<{
    [key in string]: boolean
  }>;
  boostMaxxPoolsCache: Promise<BoostMaxxPoolInfo[]>;
  xStakingPoolAccountInfoCache: {
    [key in Address]: {
      [key in number]: Promise<XStakingPoolAccountInfo>
    }
  };
  tokenListCache: Promise<tokenPrices.Token[]>;
  tokenPairIdCache:
    Promise<{
      token0: string;
      token1: string;
      pairIds: string[];
    }[]>;
  tokenPriceMapTask: Promise<TokenPriceMap>;
  tokenPriceMap: TokenPriceMap = {};
  priceProgress: number;
  userDistributionsMap: Promise<UserDistributionMap>;
  userPositionsMap: {[account:string]: {collateralPositions: string[], supplyPositions: string[]}} = {};
  fullLendingPoolsMapTask: Promise<PoolDisplayDetailsMap>;
  fullLendingPoolsMap: PoolDisplayDetailsMap = {};
  dexInfoMapTask: Promise<{[key in Address]: DexIdAndApy}>;
  dexInfoMap: {[key in Address]: DexIdAndApy} = {};
  supplyVaultsMapTask: Promise<SupplyVaultsMap>;
  supplyVaultsMap: SupplyVaultsMap = {};
  tokenBalanceCache: {
    [key in Address]?: {
      [key in Address]?: Promise<BigAmount>
    }
  };
  lendingPoolCache: {
    [key in Address]?: {
      lendingPool?: Promise<LendingPool>,
      reserves?: Promise<[number, number]>,
      LPTotalSupply?: Promise<number>,
      marketPrice?: Promise<number>,
      priceDenomLP?: Promise<[number, number]>,
      TWAPPrice?: Promise<number>,
      availableReward?: Promise<number>,
      claimHistory?: Promise<ClaimEvent[]>,
      poolToken?: {
        [key in PoolTokenType]?: {
          exchangeRate?: Promise<number>,
          availableBalance?: Promise<number>,
          deposited?: Promise<number>,
          borrowed?: Promise<number>,
          rewardSpeed?: Promise<number>,
          farmingShares?: Promise<number>,
        }
      },
    }
  };
  tarotCache: {
    airdropData?: AirdropData,
  };
  claimableCache: {
    [key in Address]?: {
      contract?: ClaimableContract,
      availableClaimable?: number,
      claimableSharePct?: number
    }
  };
  networkBlocksPerSecond: Promise<BigNumberish>;

  constructor(config: TarotRouterConfigInterface) {
    this.subgraph = config.subgraph;
    this.library = config.library;
    this.readLibrary = new JsonRpcBatchProviderWithRetry(CHAIN_DETAILS[config.chainId].rpcUrls[0]);
    this.readLibrary._cache['detectNetwork'] = Promise.resolve({
      chainId: config.chainId,
      name: CHAIN_DETAILS[config.chainId].chainName
    });
    this.mcLibrary = new StaticJsonRpcProviderWithRetry(CHAIN_DETAILS[config.chainId].rpcUrls[CHAIN_DETAILS[config.chainId].rpcUrls.length > 1 && process.env.REACT_APP_VERCEL_ENV === 'preview' ? 1 : 0]);
    this.mcLibrary._cache['detectNetwork'] = Promise.resolve({
      chainId: config.chainId,
      name: CHAIN_DETAILS[config.chainId].chainName
    });
    this.mcLibrary2 = new StaticJsonRpcProviderWithRetry(CHAIN_DETAILS[config.chainId].rpcUrls[CHAIN_DETAILS[config.chainId].rpcUrls.length > 1 && process.env.REACT_APP_VERCEL_ENV === 'preview' ? 1 : 0]);
    this.mcLibrary2._cache['detectNetwork'] = Promise.resolve({
      chainId: config.chainId,
      name: CHAIN_DETAILS[config.chainId].chainName
    });
    const multicallProvider = createMulticallProvider(config.chainId, this.mcLibrary);
    const multicallProvider2 = createMulticallProvider(config.chainId, this.mcLibrary2);
    this.doMulticall = multicallProvider.doMulticall;
    this.doMulticallParallel = multicallProvider2.doMulticallParallel;
    this.doMulticallSeries = multicallProvider2.doMulticallSeries;
    this.readLibrary.pollingInterval = POLLING_INTERVAL;
    this.mcLibrary.pollingInterval = POLLING_INTERVAL;
    this.mcLibrary2.pollingInterval = POLLING_INTERVAL;
    this.chainId = config.chainId;
    this.uiMargin = 1.1;
    this.uiMarginStable = 1.04;
    this.dust = 1.000001;
    if (config.chainId === CHAIN_IDS.FANTOM) {
      this.claimAggregator = this.newClaimAggregator(CLAIM_AGGREGATOR_ADDRESSES[config.chainId]);
      if (LIQUIDITY_GENERATOR_ADDRESSES[config.chainId]) {
        this.liquidityGenerator = this.newLiquidityGenerator(LIQUIDITY_GENERATOR_ADDRESSES[config.chainId]);
      }
      this.tarot = this.newERC20(TAROT_ADDRESSES[config.chainId]);
      this.feeDistributor = this.newFeeDistributor(FEE_DISTRIBUTOR_ADDRESSES[config.chainId]);
      this.xtinSpiritTokenDistributor = this.newFeeDistributor(XTINSPIRIT_TOKEN_DISTRIBUTOR_ADDRESS);
      this.xStakingPoolController = this.newXStakingPoolController(X_STAKING_POOL_CONTROLLER_ADDRESSES[config.chainId]);
    }
    this.priceInverted = config.priceInverted;
    this.supplyVaultCache = {};
    this.supplyVaultUnderlyingBalanceCache = {};
    this.xStakingPoolCache = {};
    this.xStakingPoolAccountInfoCache = {};
    this.tokenBalanceCache = {};
    this.lendingPoolCache = {};
    this.tarotCache = {};
    this.claimableCache = {};
    this.boostMaxxLpAddressesCache = undefined;
    this.boostMaxxPoolsCache = undefined;

    this.fullLendingPoolsMap = undefined;
    this.supplyVaultsMap = undefined;
    this.tokenListCache = undefined;
    this.tokenPairIdCache = undefined;
    this.networkBlocksPerSecond = CHAIN_DETAILS[this.chainId].defaultBlocksPerSecond || '1000000000000000000';
    this.dexInfoMap = undefined;
    this.tokenPriceMap = undefined;
    this.priceProgress = 0;
    let tpmInStorage = false;
    const tpmFromStorage = getLocalStorageItem(`tpm-${this.chainId}`);
    if (tpmFromStorage) {
      for (const key of Object.keys(tpmFromStorage)) {
        tpmFromStorage[key].priceUSD.value = BigNumber.from(tpmFromStorage[key].priceUSD.value);
        tpmFromStorage[key].priceETH.value = BigNumber.from(tpmFromStorage[key].priceETH.value);
      }
      this.tokenPriceMap = tpmFromStorage;
      this.updatePriceProgress(100);
      tpmInStorage = true;
    }
    if (!tpmInStorage) {
      this.getTokenPrices();
    }
    let dimInStorage = false;
    const dimFromStorage = getLocalStorageItem(`dim-${this.chainId}`);
    if (dimFromStorage) {
      this.dexInfoMap = dimFromStorage;
      dimInStorage = true;
    }
    this.updateNetworkBlocksPerSecond();
    let flpmInStorage = false;
    const flpmFromStorage = getLocalStorageItem(`flpm-${this.chainId}`);
    if (flpmFromStorage) {
      this.fullLendingPoolsMap = flpmFromStorage;
      flpmInStorage = true;
    }

    if (flpmInStorage) {
      // this.initializeFullLendingPoolsData();
    } else {
      this.getFullLendingPools();
    } if (tpmInStorage) {
      this.initializeTokenPrices();
    }
    if (dimInStorage) {
      this.initializeDexInfo();
    }
  }

  async updateNetworkBlocksPerSecond(): Promise<void> {
    try {
      const LOOKBACK_PERIOD = 1800;
      const pastBlock = await this.readLibrary.getBlock(0 - LOOKBACK_PERIOD);
      const now = Math.floor(Date.now() / 1000);
      const elapsed = Math.max(now - pastBlock.timestamp, 1);
      this.networkBlocksPerSecond = BigNumber.from(TEN_18).mul(LOOKBACK_PERIOD).div(elapsed);
    } catch (err) {
      console.error('Exception in updateNetworkBlocksPerSecond', err);
    }
  }

  private onProgress: () => void;

  updatePriceProgress(value: number): void {
    if (value < this.priceProgress) {
      return;
    }
    if (this.priceProgress === 100) {
      return;
    }
    this.priceProgress = value;
    if (this.onProgress) {
      this.onProgress();
    }
  }

  subscribeProgress(cb: () => void) : void {
    this.onProgress = cb;
  }

  getRouterByLendingPoolId(lendingPoolId: string) : string {
    return LENDING_POOL_DETAILS_MAP[lendingPoolId.toLowerCase()].tarotRouterAddress;
  }

  getFactoryByLendingPoolId(lendingPoolId: string) : string {
    return LENDING_POOL_DETAILS_MAP[lendingPoolId.toLowerCase()].tarotFactoryAddress;
  }

  newRouter(address: Address): Contract {
    return new Contract(address, Router02JSON, this.readLibrary);
  }

  newFactory(address: Address): Contract {
    return new Contract(address, FactoryJSON, this.readLibrary);
  }

  newTarotPriceOracle(address: Address): Contract {
    return new Contract(address, TarotPriceOracleJSON, this.readLibrary);
  }

  newTarotSolidlyStablePriceOracle(address: Address): Contract {
    return new Contract(address, TarotSolidlyStablePriceOracleJSON, this.readLibrary);
  }

  newUniswapV2Pair(address: Address): Contract {
    return new Contract(address, UniswapV2PairJSON, this.readLibrary);
  }

  newBaseV1Pair(address: Address): Contract {
    return new Contract(address, BaseV1PairJSON, this.readLibrary);
  }

  newUniswapV2Factory(address: Address): Contract {
    return new Contract(address, UniswapV2FactoryJSON, this.readLibrary);
  }

  newERC20(address: Address): Contract {
    return new Contract(address, ERC20JSON, this.readLibrary);
  }

  newSupplyVault(address: Address): Contract {
    return new Contract(address, SupplyVaultJSON, this.readLibrary);
  }

  newCollateral(address: Address): Contract {
    return new Contract(address, CollateralSON, this.readLibrary);
  }

  newBorrowable(address: Address): Contract {
    return new Contract(address, BorrowableJSON, this.readLibrary);
  }

  newVaultToken(address: Address): Contract {
    return new Contract(address, VaultTokenJSON, this.readLibrary);
  }

  newSpookyV2VaultToken(address: Address): Contract {
    return new Contract(address, SpookyV2VaultTokenJSON, this.readLibrary);
  }

  newZipVaultToken(address: Address): Contract {
    return new Contract(address, ZipVaultTokenJSON, this.readLibrary);
  }

  newMasterChef(address: Address): Contract {
    return new Contract(address, MasterChefJSON, this.readLibrary);
  }

  newMasterChefV2(address: Address): Contract {
    return new Contract(address, MasterChefV2JSON, this.readLibrary);
  }

  newLShareRewardPool(address: Address): Contract {
    return new Contract(address, LShareRewardPoolJSON, this.readLibrary);
  }

  newZipRewards(address: Address): Contract {
    return new Contract(address, ZipRewardsJSON, this.readLibrary);
  }

  newFarmingPool(address: Address): Contract {
    return new Contract(address, FarmingPoolJSON, this.readLibrary);
  }

  newClaimAggregator(address: Address): Contract {
    return new Contract(address, ClaimAggregatorJSON, this.readLibrary);
  }

  newClaimable(address: Address): Contract {
    return new Contract(address, ClaimableJSON, this.readLibrary);
  }

  newDistributor(address: Address): Contract {
    return new Contract(address, DistributorJSON, this.readLibrary);
  }

  newLiquidityGenerator(address: Address): Contract {
    return new Contract(address, LiquidityGeneratorJSON, this.readLibrary);
  }

  newFeeDistributor(address: Address): Contract {
    return new Contract(address, FeeDistributorJSON, this.readLibrary);
  }

  newXStakingPoolController(address: Address): Contract {
    return new Contract(address, XStakingPoolControllerJSON, this.readLibrary);
  }

  unlockWallet(library: Web3Provider, account: Address): void {
    this.library = library;
    this.account = account;
    this.cleanCache(false);
  }

  cleanCache(afterInit = true): void {
    if (this.cleaningCache) {
      return;
    }
    this.cleaningCache = true;
    this.supplyVaultCache = {};
    this.supplyVaultUnderlyingBalanceCache = {};
    this.xStakingPoolCache = {};
    this.xStakingPoolAccountInfoCache = {};
    this.tokenBalanceCache = {};
    this.lendingPoolCache = {};
    this.tarotCache = {};
    this.claimableCache = {};
    // this.boostMaxxLpAddressesCache = undefined;
    this.boostMaxxPoolsCache = undefined;
    if (this.tokenPriceMap) {
      this.tokenPriceMapTask = undefined;
    }
    if (this.dexInfoMap) {
      this.dexInfoMapTask = undefined;
    }
    if (this.fullLendingPoolsMap) {
      this.fullLendingPoolsMapTask = undefined;
    }
    if (this.supplyVaultsMap) {
      this.supplyVaultsMapTask = undefined;
    }
    this.userDistributionMap = undefined;
    // this.fullLendingPoolsMap = undefined;
    // this.supplyVaultsMap = undefined;
    this.tarotVaultCacheTask = undefined;
    this.tarotVaultCache = {};
    this.userPositionsMap = {};
    // this.tokenPriceMap = undefined;
    if (afterInit) {
      Promise.all([
        this.updateNetworkBlocksPerSecond(),
        this.initializeTokenPrices(),
        this.initializeDexInfo(),
        this.initializeFullLendingPoolsData(),
        this.initializeFullSupplyVaultsData()
      ]).finally(() => {
        this.cleaningCache = false;
      });
    } else {
      this.cleaningCache = false;
    }
  }

  setPriceInverted(priceInverted: boolean): void {
    this.priceInverted = priceInverted;
  }

  // Contracts
  public initializeLendingPool = contracts.initializeLendingPool;
  public initializeClaimable = contracts.initializeClaimable;
  public getLendingPoolCache = contracts.getLendingPoolCache;
  public getClaimableCache = contracts.getClaimableCache;
  public getLendingPool = contracts.getLendingPool;
  public getContracts = contracts.getContracts;
  public getPoolToken = contracts.getPoolToken;
  public getToken = contracts.getToken;
  public getVaultToken = contracts.getVaultToken;
  public getFarmingPool = contracts.getFarmingPool;
  public getClaimable = contracts.getClaimable;
  public getPoolTokenAddress = contracts.getPoolTokenAddress;
  public getTokenAddress = contracts.getTokenAddress;

  // Cache Data
  public getPoolTokenPrice = cacheData.getPoolTokenPrice;

  // Cache Data (Mirrored from subgraph)
  public getTotalBalance = cacheData.getTotalBalance;
  public getTotalBorrows = cacheData.getTotalBorrows;
  public getAccrualTimestamp = cacheData.getAccrualTimestamp;
  public getSupply = cacheData.getSupply;
  public getLiquidationPenalty = cacheData.getLiquidationPenalty;
  public getNextKinkBorrowRate = cacheData.getNextKinkBorrowRate;
  public getKinkBorrowRate = cacheData.getKinkBorrowRate;
  public getKinkUtilizationRate = cacheData.getKinkUtilizationRate;
  public getKinkUtilizationRates = cacheData.getKinkUtilizationRates;
  public getBorrowRate = cacheData.getBorrowRate;
  public getSupplyAPY = cacheData.getSupplyAPY;
  public getBorrowAPY = cacheData.getBorrowAPY;
  public getNextBorrowRate = cacheData.getNextBorrowRate;
  public getNextBorrowAPY = cacheData.getNextBorrowAPY;
  public getNextFarmingAPY = cacheData.getNextFarmingAPY;
  public getNextSupplyAPY = cacheData.getNextSupplyAPY;
  public getReserveFactor = cacheData.getReserveFactor;
  public getNextSupplyRate = cacheData.getNextSupplyRate;
  public getRewardSpeed = cacheData.getRewardSpeed;
  public getTotalBorrowsUSD = cacheData.getTotalBorrowsUSD;
  public getSafetyMargin = cacheData.getSafetyMargin;
  public getShownLeverage = cacheData.getShownLeverage;
  public getVaultRewardsTokensSymbols = cacheData.getVaultRewardsTokensSymbols;
  public getVaultRewardsTokensAddresses = cacheData.getVaultRewardsTokensAddresses;

  // Fetchers
  public initializeDexInfo = fetchers.initializeDexInfo;
  public getDexInfo = fetchers.getDexInfo;
  public initializeUserPositions = fetchers.initializeUserPositions;
  public getUserPositions = fetchers.getUserPositions;
  public getPoolTokenCache = fetchers.getPoolTokenCache;
  public initializeReserves = fetchers.initializeReserves;
  public initializeCollateralUnderlyingReserves = fetchers.initializeCollateralUnderlyingReserves;
  public initializeLPTotalSupply = fetchers.initializeLPTotalSupply;
  public initializePriceDenomLP = fetchers.initializePriceDenomLP;
  public initializeTWAPPrice = fetchers.initializeTWAPPrice;
  public getReserves = fetchers.getReserves;
  public getCollateralUnderlyingReserves = fetchers.getCollateralUnderlyingReserves;
  public getLPTotalSupply = fetchers.getLPTotalSupply;
  public getPriceDenomLP = fetchers.getPriceDenomLP;
  public getBorrowablePriceDenomLP = fetchers.getBorrowablePriceDenomLP;
  public getMarketPriceDenomLP = fetchers.getMarketPriceDenomLP;
  public getBorrowableMarketPriceDenomLP = fetchers.getBorrowableMarketPriceDenomLP;
  public getMarketPrice = fetchers.getMarketPrice;
  public getTWAPPrice = fetchers.getTWAPPrice;
  public getPairSymbols = fetchers.getPairSymbols;
  public initializeFullLendingPoolsData = fetchers.initializeFullLendingPoolsData;
  public getFullLendingPoolsData = fetchers.getFullLendingPoolsData;
  public getFullLendingPool = fetchers.getFullLendingPool;
  public getFullLendingPools = fetchers.getFullLendingPools;
  public initializeFullSupplyVaultsData = fetchers.initializeFullSupplyVaultsData;
  public getFullSupplyVaultsData = fetchers.getFullSupplyVaultsData;
  public getFullSupplyVaults = fetchers.getFullSupplyVaults;
  public initializeUserDistributionMap = fetchers.initializeUserDistributionMap;
  public getUserDistributionMap = fetchers.getUserDistributionMap;

  // Account
  public initializeExchangeRate = account.initializeExchangeRate;
  public initializeAvailableBalance = account.initializeAvailableBalance;
  public initializeBorrowed = account.initializeBorrowed;
  public initializeDeposited = account.initializeDeposited;
  public getExchangeRate = account.getExchangeRate;
  public getAvailableETH = account.getAvailableETH;
  public getTokenBalance = account.getTokenBalance;
  public initializeTokenBalance = account.initializeTokenBalance;
  public getAvailableBalance = account.getAvailableBalance;
  public getBorrowed = account.getBorrowed;
  public getBorrowedUSD = account.getBorrowedUSD;
  public getDeposited = account.getDeposited;
  public getDepositedUSD = account.getDepositedUSD;
  public getBalanceUSD = account.getBalanceUSD;
  public getSuppliedUSD = account.getSuppliedUSD;
  public getDebtUSD = account.getDebtUSD;
  public getEquityUSD = account.getEquityUSD;
  public getLPEquity = account.getLPEquity;
  public getLPEquityUSD = account.getLPEquityUSD;
  public getAccountAPY = account.getAccountAPY;
  public getValuesFromPrice = account.getValuesFromPrice;
  public getValues = account.getValues;
  public getMarketValues = account.getMarketValues;
  public getNewLeverage = account.getNewLeverage;
  public getNewLiquidationPriceSwings = account.getNewLiquidationPriceSwings;
  public getNewLiquidationPrices = account.getNewLiquidationPrices;
  public getLeverage = account.getLeverage;
  public calculateLiquidity = account.calculateLiquidity;
  public getLiquidationPriceSwings = account.getLiquidationPriceSwings;
  public getLiquidationPrices = account.getLiquidationPrices;
  public getMaxWithdrawable = account.getMaxWithdrawable;
  public getMaxBorrowable = account.getMaxBorrowable;
  public getMaxLeverage = account.getMaxLeverage;
  public getMaxDeleverage = account.getMaxDeleverage;
  public getAccountTotalValueLocked = account.getAccountTotalValueLocked;
  public getAccountTotalValueSupplied = account.getAccountTotalValueSupplied;
  public getAccountTotalValueBorrowed = account.getAccountTotalValueBorrowed;

  // TAROT
  public initializeFarmingShares = tarot.initializeFarmingShares
  public initializeAvailableReward = tarot.initializeAvailableReward;
  public initializeClaimHistory = tarot.initializeClaimHistory;
  public initializeAvailableClaimable = tarot.initializeAvailableClaimable;
  public getFarmingShares = tarot.getFarmingShares;
  public getTotalAvailableReward = tarot.getTotalAvailableReward;
  public getAvailableReward = tarot.getAvailableReward;
  public getClaimHistory = tarot.getClaimHistory;
  public getAvailableClaimable = tarot.getAvailableClaimable;
  public getClaimed = tarot.getClaimed;
  public initializeClaimableSharePct = tarot.initializeClaimableSharePct;
  public getClaimableSharePct = tarot.getClaimableSharePct;

  // Staking
  public getSupplyVault = supplyVault.getSupplyVault;
  public initializeSupplyVaultUnderlyingBalance = supplyVault.initializeSupplyVaultUnderlyingBalance;
  public getSupplyVaultUnderlyingBalance = supplyVault.getSupplyVaultUnderlyingBalance;
  public getSupplyVaultTVLForAccount = supplyVault.getSupplyVaultTVLForAccount;
  public initializeXStakingPool = xStakingPool.initializeXStakingPool;
  public getXStakingPool = xStakingPool.getXStakingPool;
  public initializeXStakingPoolAccountInfo = xStakingPool.initializeXStakingPoolAccountInfo;
  public getXStakingPoolAccountInfo = xStakingPool.getXStakingPoolAccountInfo;
  public getXStakingPoolTVLForAccount = xStakingPool.getXStakingPoolTVLForAccount;

  // Vault Token
  public getPendingRewards = vaultToken.getPendingRewards;
  public getReinvestBounties = vaultToken.getReinvestBounties;
  public isVaultActive = vaultToken.isVaultActive;
  public getVaultAPY = vaultToken.getVaultAPY;

  // Liquidity Generator
  public getLiquidityGenDistributorTotalShares = liquidityGen.getLiquidityGenDistributorTotalShares;
  public getLiquidityGenBonusDistributorTotalShares = liquidityGen.getLiquidityGenBonusDistributorTotalShares;
  public getLiquidityGenDistributorShares = liquidityGen.getLiquidityGenDistributorShares;
  public getLiquidityGenBonusDistributorShares = liquidityGen.getLiquidityGenBonusDistributorShares;
  public getLGEPeriodBegin = liquidityGen.getLGEPeriodBegin;
  public getLGEPeriodEnd = liquidityGen.getLGEPeriodEnd;
  public getLGEBonusEnd = liquidityGen.getLGEBonusEnd;

  // Utils
  public normalize = utils.normalize;
  public getDeadline = utils.getDeadline;

  // Approve
  public getOwnerSpender = approve.getOwnerSpender;
  public approve = approve.approve;
  public approveMint = approve.approveMint;
  public approveStake = approve.approveStake;
  public approveXStake = approve.approveXStake;
  public approveBoostStake = approve.approveBoostStake;
  public approveMigrate = approve.approveMigrate;
  public getAllowance = approve.getAllowance;
  public getMintAllowance = approve.getMintAllowance;
  public getStakeAllowance = approve.getStakeAllowance;
  public getXStakeAllowance = approve.getXStakeAllowance;
  public getBoostStakeAllowance = approve.getBoostStakeAllowance;
  public getMigrateAllowance = approve.getMigrateAllowance;
  public getPermitData = approve.getPermitData;

  // BoostMaxx Data
  public initializeBoostMaxxPools = boostMaxx.initializeBoostMaxxPools;
  public getBoostMaxxPools = boostMaxx.getBoostMaxxPools;

  // Token Prices
  public intiializeTokenList = tokenPrices.initializeTokenList;
  public getTokenList = tokenPrices.getTokenList;
  public initializeTokenPairIds = tokenPrices.initializeTokenPairIds;
  public getTokenPairIds = tokenPrices.getTokenPairIds;
  public initializeTokenPrices = tokenPrices.initializeTokenPrices;
  public getTokenPrices = tokenPrices.getTokenPrices;

  // Interactions
  public gaugeVaultProxyManagerDeposit = interactions.gaugeVaultProxyManagerDeposit;
  public migrate = interactions.migrate;
  public xStake = interactions.xStake;
  public xUnstake = interactions.xUnstake;
  public boostStake = interactions.boostStake;
  public boostUnstake = interactions.boostUnstake;
  public stake = interactions.stake;
  public unstake = interactions.unstake;
  public deposit = interactions.deposit;
  public withdraw = interactions.withdraw;
  public borrow = interactions.borrow;
  public repay = interactions.repay;
  public getLeverageAmounts = interactions.getLeverageAmounts;
  public leverage = interactions.leverage;
  public getDeleverageAmounts = interactions.getDeleverageAmounts;
  public deleverage = interactions.deleverage;
  public trackBorrows = interactions.trackBorrows;
  public claimXStakingReward = interactions.claimXStakingReward;
  public claimAllFarmingRewards = interactions.claimAllFarmingRewards;
  public claims = interactions.claims;
  public claimDistributor = interactions.claimDistributor;
  public reinvest = interactions.reinvest;
  public liquidityGeneratorDeposit = interactions.liquidityGeneratorDeposit;
  public claimBoostReward = interactions.claimBoostReward;
}

export type MulticallTask = {
  contract: Contract;
  method: string;
  args: any[];
} | [Contract, string, any[]];

export default TarotRouter;
