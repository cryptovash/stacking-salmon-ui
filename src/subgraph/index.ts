// TODO: <
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
// TODO: >

import {
    LendingPoolData,
    Address,
    TvlData,
    UserData
  } from 'types/interfaces';
  import * as initializer from './initializer';
  import * as cacheData from './cacheData';
  import * as account from './account';
  
  class Subgraph {
    chainId: number;
    lendingPoolsData: Promise<{
      [key in Address]?: LendingPoolData
    }>;
    usersData: {
      [key in Address]?: Promise<UserData>
    };
    tvlData: Promise<TvlData>
  
    ID = Date.now() + '-' + Math.random();
  
    constructor(config: SubgraphConfigInterface) {
      this.chainId = config.chainId;
      this.usersData = {};
    }
  
    cleanCache(): void {
      this.lendingPoolsData = null;
      this.usersData = {};
      this.tvlData = null;
    }
  
    // Fetchers
    public fetchLendingPools = initializer.fetchLendingPools;
    public fetchLendingPoolsByUrls = initializer.fetchLendingPoolsByUrls;
    public initializeLendingPoolsData = initializer.initializeLendingPoolsData;
    public getLendingPoolsData = initializer.getLendingPoolsData;
    public getLendingPoolData = initializer.getLendingPoolData;
    public fetchUserData = initializer.fetchUserData;
    public fetchUserDataByUrls = initializer.fetchUserDataByUrls;
    public initializeUserData = initializer.initializeUserData;
    public getUserData = initializer.getUserData;
  
    // Data Getters
    public getLendingPools = cacheData.getLendingPools;
    public getTotalBalance = cacheData.getTotalBalance;
    public getTotalBalanceUSD = cacheData.getTotalBalanceUSD;
    public getSafetyMargin = cacheData.getSafetyMargin;
    public getLiquidationIncentive = cacheData.getLiquidationIncentive;
    public getReserveFactor = cacheData.getReserveFactor;
    public getKinkBorrowRate = cacheData.getKinkBorrowRate;
    public getKinkUtilizationRate = cacheData.getKinkUtilizationRate;
    public getBorrowIndex = cacheData.getBorrowIndex;
    public getAccrualTimestamp = cacheData.getAccrualTimestamp;
    public getTotalBorrows = cacheData.getTotalBorrows;
    public getCurrentTotalBorrows = cacheData.getCurrentTotalBorrows;
    public getTotalBorrowsUSD = cacheData.getTotalBorrowsUSD;
    public getBorrowRate = cacheData.getBorrowRate;
    public getBorrowAPY = cacheData.getBorrowAPY;
    public getNextBorrowRate = cacheData.getNextBorrowRate;
    public getNextBorrowAPY = cacheData.getNextBorrowAPY;
    public getSupply = cacheData.getSupply;
    public getCurrentSupply = cacheData.getCurrentSupply;
    public getSupplyUSD = cacheData.getSupplyUSD;
    public getUtilizationRate = cacheData.getUtilizationRate;
    public getSupplyRate = cacheData.getSupplyRate;
    public getSupplyAPY = cacheData.getSupplyAPY;
    public getNextSupplyRate = cacheData.getNextSupplyRate;
    public getNextSupplyAPY = cacheData.getNextSupplyAPY;
    public getDexAPY = cacheData.getDexAPY;
    public getRewardSpeed = cacheData.getRewardSpeed;
    public getFarmingAPY = cacheData.getFarmingAPY;
    public getNextFarmingAPY = cacheData.getNextFarmingAPY;
    public getFarmingPool = cacheData.getFarmingPool;
    public getShownLeverage = cacheData.getShownLeverage;
  
    // Vault
    public isVaultToken = cacheData.isVaultToken;
    public getVaultRewardsTokenDecimals = cacheData.getVaultRewardsTokenDecimals;
    public getVaultRewardsTokenSymbol = cacheData.getVaultRewardsTokenSymbol;
    public getVaultRewardsTokenAddress = cacheData.getVaultRewardsTokenAddress;
  
    // Account
    public getBorrowPositions = account.getBorrowPositions;
    public getSupplyPositions = account.getSupplyPositions;
  }
  
  export interface SubgraphConfigInterface {
    chainId: number;
  }
  
  export default Subgraph;  