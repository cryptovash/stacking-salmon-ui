// TODO: <
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
// TODO: >

import { PoolTokenType, Changes, ClaimEvent, Address, BigAmount, SupplyVault, EMPTY_SUPPLY_VAULT, ZERO_BIG_AMOUNT, XStakingPool, EMPTY_X_STAKING_POOL, XStakingPoolAccountInfo, EMPTY_X_STAKING_POOL_ACCOUNT_INFO, PoolDisplayDetails, BoostMaxxPoolInfo, EMPTY_TOKEN_PRICE_ENTRY, UserDistributionMap, TEN_18 } from '../types/interfaces';
import usePoolToken from './usePoolToken';
import usePairAddress from './usePairAddress';
import { useState } from 'react';
import { useRouterCallback } from './useTarotRouter';
import { BigNumber } from '@ethersproject/bignumber';
import { decimalToBalance } from '../utils/ether-utils';
import useAccount from './useAccount';
import { X_STAKING_POOLS } from '../config/web3/contracts/x-staking-pool';
import { TokenPriceEntry } from '../tarot-router/tokenPrices';
import { parse18 } from '../utils/big-amount';
import { WETH_ADDRESSES } from '../config/web3/contracts/weth';
import { TAROT_ADDRESSES } from '../config/web3/contracts/tarot';
import { getTokenSymbol } from '../utils';
import { LENDING_POOL_DETAILS_MAP } from '../config/web3/contracts/lending-pools';
import { formatUnits } from 'ethers/lib/utils';
import { CHAIN_IDS } from '../config/web3/chains';

export function useToken(poolTokenTypeArg?: PoolTokenType) {
  const uniswapV2PairAddress = usePairAddress();
  // TODO: <
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const poolTokenType = poolTokenTypeArg ? poolTokenTypeArg : usePoolToken();
  // TODO: >
  return { uniswapV2PairAddress, poolTokenType };
}

export function useFullSupplyVaultsData() : {[x: string]: SupplyVault} {
  const [fullSupplyVaultsData, setFullSupplyVaultsData] = useState<{[x: string]: SupplyVault}>();
  useRouterCallback(async router => setFullSupplyVaultsData(await router.getFullSupplyVaultsData()));
  return fullSupplyVaultsData;
}

export function useFullLendingPoolsData() : {[x: string]: PoolDisplayDetails} {
  const [fullLendingPoolsData, setFullLendingPoolsData] = useState<{[x: string]: PoolDisplayDetails}>();
  useRouterCallback(async router => setFullLendingPoolsData(await router.getFullLendingPoolsData()));
  return fullLendingPoolsData;
}

export function useFullLendingPools() : PoolDisplayDetails[] {
  const [fullLendingPools, setFullLendingPools] = useState<PoolDisplayDetails[]>();
  useRouterCallback(async router => setFullLendingPools(await router.getFullLendingPools()));

  return fullLendingPools;
}

export function useBorrowableAddresses() : [Address, Address] {
  const uniswapV2PairAddress = usePairAddress();
  const [tokens, setTokens] = useState<[Address, Address]>([null, null]);
  useRouterCallback(async router => setTokens([
    (await router.getContracts(uniswapV2PairAddress, PoolTokenType.BorrowableA))[0].address,
    (await router.getContracts(uniswapV2PairAddress, PoolTokenType.BorrowableB))[0].address
  ]));
  return tokens;
}

export function useDecimals(poolTokenTypeArg?: PoolTokenType) : number {
  const { uniswapV2PairAddress, poolTokenType } = useToken(poolTokenTypeArg);
  const poolDetails = LENDING_POOL_DETAILS_MAP[uniswapV2PairAddress.toLowerCase()];
  return poolTokenType === PoolTokenType.BorrowableA ? poolDetails.decimals0 : poolTokenType === PoolTokenType.BorrowableB ? poolDetails.decimals1 : 18;
}

export function useSymbol(poolTokenTypeArg?: PoolTokenType) : string {
  const { uniswapV2PairAddress, poolTokenType } = useToken(poolTokenTypeArg);
  return getTokenSymbol(uniswapV2PairAddress, poolTokenType);
}

export function useExchangeRate(poolTokenTypeArg?: PoolTokenType) : BigNumber {
  const { uniswapV2PairAddress, poolTokenType } = useToken(poolTokenTypeArg);
  const [exchangeRate, setExchangeRate] = useState<BigNumber>(TEN_18);
  useRouterCallback(async router => setExchangeRate(await router.getExchangeRate(uniswapV2PairAddress, poolTokenType)));
  return exchangeRate;
}

export function useTokenPrice(poolTokenTypeArg?: PoolTokenType) : number {
  const { uniswapV2PairAddress, poolTokenType } = useToken(poolTokenTypeArg);
  const [tokenPrice, setTokenPrice] = useState<number>(0);
  useRouterCallback(async router => setTokenPrice(await router.getPoolTokenPrice(uniswapV2PairAddress, poolTokenType)));
  return tokenPrice;
}

export function useWethPrice() : number {
  const [tokenPrice, setTokenPrice] = useState<number>(0);
  useRouterCallback(async router => {
    const tokenPriceMap = await router.getTokenPrices();
    const price = parse18(tokenPriceMap[WETH_ADDRESSES[router.chainId].toLowerCase()].priceUSD.value);
    setTokenPrice(price);
  });
  return tokenPrice;
}

export function useTarotPrice() : number {
  const [tokenPrice, setTokenPrice] = useState<number>(0);
  useRouterCallback(async router => {
    const tokenPriceMap = await router.getTokenPrices();
    const price = parse18(TAROT_ADDRESSES[router.chainId] ? tokenPriceMap[TAROT_ADDRESSES[router.chainId].toLowerCase()].priceUSD.value : '0');
    setTokenPrice(price);
  });
  return tokenPrice;
}

export function useMarketPrice() : number {
  const uniswapV2PairAddress = usePairAddress();
  const [marketPrice, setMarketPrice] = useState<number>(null);
  useRouterCallback(async router => setMarketPrice(await router.getMarketPrice(uniswapV2PairAddress)));
  return marketPrice;
}

export function useOracleIsInitialized() : boolean {
  const uniswapV2PairAddress = usePairAddress();
  const [oracleIsInitialized, setOracleIsInitialized] = useState<boolean>(true);
  useRouterCallback(async router => setOracleIsInitialized(await router.getTWAPPrice(uniswapV2PairAddress) !== 0));
  return oracleIsInitialized;
}

export function useTWAPPrice() : number {
  const uniswapV2PairAddress = usePairAddress();
  const [TWAPPrice, setTWAPPrice] = useState<number>(null);
  useRouterCallback(async router => setTWAPPrice(await router.getTWAPPrice(uniswapV2PairAddress)));
  return TWAPPrice;
}

export function usePriceDenomLP() : [number, number] {
  const uniswapV2PairAddress = usePairAddress();
  const [priceDenomLP, setPriceDenomLP] = useState<[number, number]>([1, 1]);
  useRouterCallback(async router => setPriceDenomLP(await router.getPriceDenomLP(uniswapV2PairAddress)));
  return priceDenomLP;
}

export function useMarketPriceDenomLP() : [number, number] {
  const uniswapV2PairAddress = usePairAddress();
  const [priceDenomLP, setPriceDenomLP] = useState<[number, number]>([1, 1]);
  useRouterCallback(async router => setPriceDenomLP(await router.getMarketPriceDenomLP(uniswapV2PairAddress)));
  return priceDenomLP;
}

export function useVaultAPY() : number {
  const uniswapV2PairAddress = usePairAddress();
  const [vaultAPY, setVaultAPY] = useState<number>(0);
  useRouterCallback(async router => setVaultAPY(await router.getVaultAPY(uniswapV2PairAddress)));
  return vaultAPY;
}

export function useVaultActive() : boolean {
  const uniswapV2PairAddress = usePairAddress();
  const [vaultActive, setVaultActive] = useState<boolean>(false);
  useRouterCallback(async router => setVaultActive(await router.isVaultActive(uniswapV2PairAddress)));
  return vaultActive;
}

export function useNextSupplyAPY(supplyAmount: number, poolTokenTypeArg?: PoolTokenType) : number {
  const { uniswapV2PairAddress, poolTokenType } = useToken(poolTokenTypeArg);
  const [nextSupplyAPY, setNextSupplyAPY] = useState<number>(0);
  useRouterCallback(
    async router => setNextSupplyAPY(await router.getNextSupplyAPY(uniswapV2PairAddress, poolTokenType, supplyAmount))
    , [supplyAmount]
  );
  return nextSupplyAPY;
}

export function useNextBorrowAPY(borrowAmount: number, poolTokenTypeArg?: PoolTokenType) : number {
  const { uniswapV2PairAddress, poolTokenType } = useToken(poolTokenTypeArg);
  const [nextBorrowAPY, setNextBorrowAPY] = useState<number>(0);
  useRouterCallback(
    async router => setNextBorrowAPY(await router.getNextBorrowAPY(uniswapV2PairAddress, poolTokenType, borrowAmount))
    , [borrowAmount]
  );
  return nextBorrowAPY;
}

export function useNextFarmingAPY(borrowAmount: number, poolTokenTypeArg?: PoolTokenType) : number {
  const { uniswapV2PairAddress, poolTokenType } = useToken(poolTokenTypeArg);
  const [nextFarmingAPY, setNextFarmingAPY] = useState<number>(0);
  useRouterCallback(async router => {
    const tokenPriceMap = await router.getTokenPrices();
    const tarotPrice = router.chainId === CHAIN_IDS.FANTOM ? parse18(tokenPriceMap[TAROT_ADDRESSES[router.chainId].toLowerCase()].priceUSD.value) : 0;
    const price = await router.getPoolTokenPrice(uniswapV2PairAddress, poolTokenType);
    setNextFarmingAPY(await router.getNextFarmingAPY(uniswapV2PairAddress, poolTokenType, borrowAmount, price, tarotPrice));
  }, [borrowAmount]);
  return nextFarmingAPY;
}

export function useRewardSpeed(poolTokenTypeArg?: PoolTokenType) : number {
  const { uniswapV2PairAddress, poolTokenType } = useToken(poolTokenTypeArg);
  const [rewardSpeed, setRewardSpeed] = useState<number>(0);
  useRouterCallback(async router => setRewardSpeed(await router.getRewardSpeed(uniswapV2PairAddress, poolTokenType)));
  return rewardSpeed;
}

export function useFarmingShares(poolTokenTypeArg?: PoolTokenType) : number {
  const { uniswapV2PairAddress, poolTokenType } = useToken(poolTokenTypeArg);
  const [farmingShares, setFarmingShares] = useState<number>(0);
  useRouterCallback(async router => setFarmingShares(await router.getFarmingShares(uniswapV2PairAddress, poolTokenType)));
  return farmingShares;
}

export function useShownLeverage() : number {
  const uniswapV2PairAddress = usePairAddress();
  const [shownLeverage, setShownLeverage] = useState<number>(0);
  useRouterCallback(async router => setShownLeverage(await router.getShownLeverage(uniswapV2PairAddress)));
  return shownLeverage;
}

export function usePairSymbols(uniswapV2PairAddress: Address) : {symbol0: string, symbol1: string} {
  const [pairSymbols, setPairSymbols] = useState<{symbol0: string, symbol1: string}>({ symbol0: '', symbol1: '' });
  useRouterCallback(async router => {
    setPairSymbols(await router.getPairSymbols(uniswapV2PairAddress));
  }, [uniswapV2PairAddress]);
  return pairSymbols;
}

export function useTotalAvailableReward(account?: Address) : number {
  const [totalAvailableReward, setTotalAvailableReward] = useState<number>(0);
  useRouterCallback(async router => setTotalAvailableReward(await router.getTotalAvailableReward(account)), [account]);
  return totalAvailableReward;
}

export function useAvailableReward() : number {
  const uniswapV2PairAddress = usePairAddress();
  const [availableReward, setAvailableReward] = useState<number>(0);
  useRouterCallback(async router => setAvailableReward(await router.getAvailableReward(uniswapV2PairAddress)));
  return availableReward;
}

export function useDeposited(poolTokenTypeArg?: PoolTokenType) : BigAmount {
  const { uniswapV2PairAddress, poolTokenType } = useToken(poolTokenTypeArg);
  const [deposited, setDeposited] = useState<BigAmount>(ZERO_BIG_AMOUNT);
  useRouterCallback(async router => setDeposited(await router.getDeposited(uniswapV2PairAddress, poolTokenType)));
  return deposited;
}

export function useDepositedUSD(poolTokenTypeArg?: PoolTokenType) : number {
  const { uniswapV2PairAddress, poolTokenType } = useToken(poolTokenTypeArg);
  const [depositedUSD, setDepositedUSD] = useState<number>(0);
  useRouterCallback(async router => setDepositedUSD(await router.getDepositedUSD(uniswapV2PairAddress, poolTokenType)));
  return depositedUSD;
}

export function useBorrowed(poolTokenTypeArg?: PoolTokenType) : BigAmount {
  const { uniswapV2PairAddress, poolTokenType } = useToken(poolTokenTypeArg);
  const [borrowed, setBorrowed] = useState<number>(ZERO_BIG_AMOUNT);
  useRouterCallback(async router => setBorrowed(await router.getBorrowed(uniswapV2PairAddress, poolTokenType)));
  return borrowed;
}

export function useBorrowedUSD(poolTokenTypeArg?: PoolTokenType) : number {
  const account = useAccount();
  const { uniswapV2PairAddress, poolTokenType } = useToken(poolTokenTypeArg);
  const [borrowedUSD, setBorrowedUSD] = useState<number>(0);
  useRouterCallback(async router => setBorrowedUSD(await router.getBorrowedUSD(uniswapV2PairAddress, poolTokenType, account || router.account)));
  return borrowedUSD;
}

export function useAvailableETH(update: number) : number {
  const [availableETH, setAvailableETH] = useState<number>(0);
  useRouterCallback(async router => setAvailableETH(await router.getAvailableETH()), [update]);
  return availableETH;
}

export function useTokenBalance(tokenAddress: string, account?: Address) : BigAmount {
  const [tokenBalance, setTokenBalance] = useState<BigAmount>(ZERO_BIG_AMOUNT);
  useRouterCallback(async router => setTokenBalance(await router.getTokenBalance(tokenAddress, account)), [account]);
  return tokenBalance;
}

export function useHasBalances(tokenAddresses: string[], account?: Address) : Address[] {
  const [hasBalances, setHasBalances] = useState<Address[]>(null);
  useRouterCallback(async router => {
    if (!tokenAddresses || hasBalances !== null) {
      return;
    }
    const balances = [];
    const promises = [];
    for (const tokenAddress of tokenAddresses) {
      promises.push(router.getTokenBalance(tokenAddress, account));
    }
    const results = await Promise.all(promises);
    for (let i = 0; i < tokenAddresses.length; i++) {
      if (results[i] && results[i].amount.gt(BigNumber.from(0))) {
        balances.push(tokenAddresses[i]);
      }
    }
    setHasBalances(balances);
  }, [tokenAddresses, account]);
  return hasBalances;
}

export function useXStakingPositionsForAccount(account?: Address) : {[poolId: number]: XStakingPoolAccountInfo} {
  const [positions, setPositions] = useState<{[poolId: number]: XStakingPoolAccountInfo}>({});
  useRouterCallback(async router => {
    if (!account) {
      return;
    }
    const poolIds = Object.keys(X_STAKING_POOLS[router.chainId] || {});
    const promises = [];
    for (const poolId of poolIds) {
      promises.push(router.getXStakingPoolAccountInfo(poolId, account));
    }
    await Promise.all(promises);
    const p = {};
    for (const poolId of poolIds) {
      const accountInfo = await router.xStakingPoolAccountInfoCache[account][poolId];
      if (accountInfo && accountInfo.stakedBalance.amount.gt(BigNumber.from(0))) {
        p[poolId] = accountInfo;
      }
    }
    setPositions(p);
  }, [account]);
  return positions;
}

export function useAvailableBalance(poolTokenTypeArg?: PoolTokenType) : number {
  const { uniswapV2PairAddress, poolTokenType } = useToken(poolTokenTypeArg);
  const [availableBalance, setAvailableBalance] = useState<number>(0);
  useRouterCallback(async router => setAvailableBalance(await router.getAvailableBalance(uniswapV2PairAddress, poolTokenType)));
  return availableBalance;
}

export function useCurrentLeverage(changes?: Changes) : number {
  const account = useAccount();
  const uniswapV2PairAddress = usePairAddress();
  const [leverage, setLeverage] = useState<number>(0);
  useRouterCallback(async router => {
    setLeverage(changes ?
      await router.getNewLeverage(uniswapV2PairAddress, changes, account || router.account) :
      await router.getLeverage(uniswapV2PairAddress, account || router.account)
    );
  }, [changes]);
  return leverage;
}

export function useLiquidationPrices(changes?: Changes) : [number, number] {
  const account = useAccount();
  const uniswapV2PairAddress = usePairAddress();
  const [liquidationPrices, setLiquidationPrices] = useState<[number, number]>([0, 0]);
  useRouterCallback(async router => {
    setLiquidationPrices(changes ?
      await router.getNewLiquidationPrices(uniswapV2PairAddress, changes, account || router.account) :
      await router.getLiquidationPrices(uniswapV2PairAddress, account || router.account)
    );
  }, [changes]);
  return liquidationPrices;
}

export function useBalanceUSD() : number {
  const uniswapV2PairAddress = usePairAddress();
  const [balanceUSD, setBalanceUSD] = useState<number>(0);
  useRouterCallback(async router => setBalanceUSD(await router.getBalanceUSD(uniswapV2PairAddress)));
  return balanceUSD;
}

export function useSuppliedUSD() : number {
  const uniswapV2PairAddress = usePairAddress();
  const [suppliedUSD, setSuppliedUSD] = useState<number>(0);
  useRouterCallback(async router => setSuppliedUSD(await router.getSuppliedUSD(uniswapV2PairAddress)));
  return suppliedUSD;
}

export function useDebtUSD() : number {
  const uniswapV2PairAddress = usePairAddress();
  const [debtUSD, setDebtUSD] = useState<number>(0);
  useRouterCallback(async router => setDebtUSD(await router.getDebtUSD(uniswapV2PairAddress)));
  return debtUSD;
}

export function useEquityUSD() : number {
  const uniswapV2PairAddress = usePairAddress();
  const [equityUSD, setEquityUSD] = useState<number>(0);
  useRouterCallback(async router => setEquityUSD(await router.getEquityUSD(uniswapV2PairAddress)));
  return equityUSD;
}

export function useLPEquity() : number {
  const uniswapV2PairAddress = usePairAddress();
  const [LPEquity, setLPEquity] = useState<number>(0);
  useRouterCallback(async router => setLPEquity(await router.getLPEquity(uniswapV2PairAddress)));
  return LPEquity;
}

export function useLPEquityUSD() : number {
  const uniswapV2PairAddress = usePairAddress();
  const [LPEquityUSD, setLPEquityUSD] = useState<number>(0);
  useRouterCallback(async router => setLPEquityUSD(await router.getLPEquityUSD(uniswapV2PairAddress)));
  return LPEquityUSD;
}

export function useAccountAPY() : number {
  const account = useAccount();
  const uniswapV2PairAddress = usePairAddress();
  const [accountAPY, setAccountAPY] = useState<number>(0);
  useRouterCallback(async router => setAccountAPY(await router.getAccountAPY(uniswapV2PairAddress, account || router.account)));
  return accountAPY;
}

export function useClaimHistory() : ClaimEvent[] {
  const uniswapV2PairAddress = usePairAddress();
  const [claimHistory, setClaimHistory] = useState<ClaimEvent[]>([]);
  useRouterCallback(async router => setClaimHistory(await router.getClaimHistory(uniswapV2PairAddress)));
  return claimHistory;
}

export function useUserDistributionMap() : UserDistributionMap {
  const [userDistributionMap, setUserDistributionMap] = useState<UserDistributionMap>({});
  useRouterCallback(async router => setUserDistributionMap(await router.getUserDistributionMap()));
  return userDistributionMap;
}

export function useHasAnyAvailableClaimable(claimableAddresses: Address[]) : boolean | undefined {
  const [hasAnyAvailableClaimable, setHasAnyAvailableClaimable] = useState<boolean | undefined>(undefined);
  useRouterCallback(async router => {
    if (!claimableAddresses) {
      return hasAnyAvailableClaimable;
    }
    for (const claimableAddress of claimableAddresses) {
      const availableClaimable = await router.getClaimableSharePct(claimableAddress);
      if (availableClaimable > 0) {
        setHasAnyAvailableClaimable(true);
        return;
      }
    }
    setHasAnyAvailableClaimable(false);
  }, [claimableAddresses]);
  return hasAnyAvailableClaimable;
}

export function useAvailableClaimable(claimableAddress: Address) : number {
  const [availableClaimable, setAvailableClaimable] = useState<number>();
  useRouterCallback(async router => setAvailableClaimable(await router.getAvailableClaimable(claimableAddress)), [claimableAddress]);
  return availableClaimable;
}

export function useClaimed(claimableAddress: Address) : number {
  const [claimed, setClaimed] = useState<number>();
  useRouterCallback(async router => setClaimed(await router.getClaimed(claimableAddress)), [claimableAddress]);
  return claimed;
}

export function useClaimableSharePct(claimableAddress: Address) : number {
  const [claimableSharePct, setClaimableSharePct] = useState<number>();
  useRouterCallback(async router => setClaimableSharePct(await router.getClaimableSharePct(claimableAddress)), [claimableAddress]);
  return claimableSharePct;
}

export function useLGEPeriod() : {begin: number, end: number, bonusEnd: number} {
  const [times, setTimes] = useState<number>({ begin: 0, end: 0, bonusEnd: 0 });
  useRouterCallback(async router => {
    const begin = await router.getLGEPeriodBegin();
    const end = await router.getLGEPeriodEnd();
    const bonusEnd = await router.getLGEBonusEnd();
    setTimes({ begin, end, bonusEnd });
  });
  return times;
}

export function useLiquidityGenDistributorTotalShares(key: number) : BigNumber {
  const [shares, setShares] = useState<BigNumber>(BigNumber.from(0));
  useRouterCallback(async router => setShares(await router.getLiquidityGenDistributorTotalShares()), [key]);
  return shares;
}

export function useLiquidityGenBonusDistributorTotalShares(key: number) : BigNumber {
  const [shares, setShares] = useState<BigNumber>(BigNumber.from(0));
  useRouterCallback(async router => setShares(await router.getLiquidityGenBonusDistributorTotalShares()), [key]);
  return shares;
}

export function useLiquidityGenDistributorShares(key: number) : BigNumber {
  const [shares, setShares] = useState<BigNumber>(BigNumber.from(0));
  useRouterCallback(async router => setShares(await router.getLiquidityGenDistributorShares()), [key]);
  return shares;
}

export function useLiquidityGenBonusDistributorShares(key: number) : BigNumber {
  const [shares, setShares] = useState<BigNumber>(BigNumber.from(0));
  useRouterCallback(async router => setShares(await router.getLiquidityGenBonusDistributorShares()), [key]);
  return shares;
}

export function useMaxWithdrawable(poolTokenTypeArg?: PoolTokenType) : BigAmount {
  const { uniswapV2PairAddress, poolTokenType } = useToken(poolTokenTypeArg);
  const [maxWithdrawable, setMaxWithdrawable] = useState<BigAmount>(ZERO_BIG_AMOUNT);
  useRouterCallback(async router => setMaxWithdrawable(await router.getMaxWithdrawable(uniswapV2PairAddress, poolTokenType)));
  return maxWithdrawable;
}

export function useMaxBorrowable(poolTokenTypeArg?: PoolTokenType) : number {
  const { uniswapV2PairAddress, poolTokenType } = useToken(poolTokenTypeArg);
  const [maxBorrowable, setMaxBorrowable] = useState<number>(0);
  useRouterCallback(async router => setMaxBorrowable(await router.getMaxBorrowable(uniswapV2PairAddress, poolTokenType)));
  return maxBorrowable;
}

export function useMaxLeverage() : number {
  const uniswapV2PairAddress = usePairAddress();
  const [maxLeverage, setMaxLeverage] = useState<number>(0);
  useRouterCallback(async router => setMaxLeverage(await router.getMaxLeverage(uniswapV2PairAddress)));
  return maxLeverage;
}

export function useMaxDeleverage(slippage: number) : number {
  const uniswapV2PairAddress = usePairAddress();
  const [maxDeleverage, setMaxDeleverage] = useState<number>(0);
  useRouterCallback(async router => setMaxDeleverage(await router.getMaxDeleverage(uniswapV2PairAddress, 1 + slippage / 100)),
    [slippage]
  );
  return maxDeleverage;
}

export function useLeverageAmounts(leverage: number, slippage: number) : {bAmountA: number, bAmountB: number, cAmount: number, bAmountAMin: number, bAmountBMin: number, cAmountMin: number} {
  const uniswapV2PairAddress = usePairAddress();
  const [leverageAmounts, setLeverageAmounts] =
    useState<{bAmountA: number, bAmountB: number, cAmount: number, bAmountAMin: number, bAmountBMin: number, cAmountMin: number}>({ bAmountA: 0, bAmountB: 0, cAmount: 0, bAmountAMin: 0, bAmountBMin: 0, cAmountMin: 0 });
  useRouterCallback(
    async router => setLeverageAmounts(await router.getLeverageAmounts(uniswapV2PairAddress, leverage, 1 + slippage / 100)),
    [leverage, slippage]
  );
  return leverageAmounts;
}

export function useDeleverageAmounts(deleverage: number, slippage: number) : {bAmountA: number, bAmountB: number, cAmount: number, bAmountAMin: number, bAmountBMin: number} {
  const uniswapV2PairAddress = usePairAddress();
  const [deleverageAmounts, setDeleverageAmounts] =
    useState<{bAmountA: number, bAmountB: number, cAmount: number, bAmountAMin: number, bAmountBMin: number}>({ bAmountA: 0, bAmountB: 0, cAmount: 0, bAmountAMin: 0, bAmountBMin: 0 });
  useRouterCallback(
    async router => setDeleverageAmounts(await router.getDeleverageAmounts(uniswapV2PairAddress, deleverage, 1 + slippage / 100)),
    [deleverage, slippage]
  );
  return deleverageAmounts;
}

export function useDeadline() : BigNumber {
  const [deadline, setDeadline] = useState<BigNumber>();
  useRouterCallback(async router => setDeadline(await router.getDeadline()));
  return deadline;
}

export function useToBigNumber(val: number, poolTokenTypeArg?: PoolTokenType) : BigNumber {
  const decimals = useDecimals(poolTokenTypeArg);
  try {
    return decimalToBalance(val, decimals);
  } catch (error) {
    return decimalToBalance(0, decimals);
  }
}

export function useToNumber(amount: BigNumber, poolTokenTypeArg?: PoolTokenType) : number {
  const decimals = useDecimals(poolTokenTypeArg);
  return parseFloat(formatUnits(amount, decimals));
}

export function useToTokens(val: BigNumber, poolTokenTypeArg?: PoolTokenType) : BigNumber {
  const decimals = useDecimals(poolTokenTypeArg);
  const exchangeRate = useExchangeRate(poolTokenTypeArg);
  try {
    return val.mul(TEN_18).div(exchangeRate).add(val.gt(0) ? 1 : 0);
  } catch (error) {
    return decimalToBalance(0, decimals);
  }
}

export function usefromTokens(amount: BigNumber, poolTokenTypeArg?: PoolTokenType) : number {
  // TODO: <
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const decimals = useDecimals(poolTokenTypeArg);
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const exchangeRate = useExchangeRate(poolTokenTypeArg);
  // TODO: >
  return parseFloat(formatUnits(amount.mul(exchangeRate).div(TEN_18), decimals));
}

export function useSupplyVault(supplyVaultAddress: Address) : SupplyVault {
  const [supplyVault, setSupplyVault] = useState<SupplyVault>(EMPTY_SUPPLY_VAULT);
  useRouterCallback(async router => setSupplyVault(await router.getSupplyVault(supplyVaultAddress)));
  return supplyVault;
}

export function useSupplyVaultUnderlyingBalance(supplyVaultAddress: Address, account?: Address) : BigAmount {
  const [supplyVaultUnderlyingBalance, setSupplyVaultUnderlyingBalance] = useState<BigAmount>(ZERO_BIG_AMOUNT);
  useRouterCallback(async router => setSupplyVaultUnderlyingBalance(await router.getSupplyVaultUnderlyingBalance(supplyVaultAddress, account)));
  return supplyVaultUnderlyingBalance;
}

export function useXStakingPool(poolId: number) : XStakingPool {
  const [xStakingPool, setXStakingPool] = useState<XStakingPool>(EMPTY_X_STAKING_POOL);
  useRouterCallback(async router => setXStakingPool(await router.getXStakingPool(poolId)));
  return xStakingPool;
}

export function useXStakingPoolAccountInfo(poolId: number, account?: Address) : XStakingPoolAccountInfo {
  const [xStakingPoolAccountInfo, setXStakingPoolAccountInfo] = useState<XStakingPoolAccountInfo>(EMPTY_X_STAKING_POOL_ACCOUNT_INFO);
  useRouterCallback(async router => setXStakingPoolAccountInfo(await router.getXStakingPoolAccountInfo(poolId, account)));
  return xStakingPoolAccountInfo;
}

export function useBoostMaxxPools() : BoostMaxxPoolInfo[] {
  const [boostMaxxPools, setBoostMaxxPools] = useState<BoostMaxxPoolInfo[]>(null);
  useRouterCallback(async router => setBoostMaxxPools(await router.getBoostMaxxPools()));
  return boostMaxxPools;
}

export function useTokenPriceFromMap(token: string) : TokenPriceEntry {
  const [tokenPrice, setTokenPrice] = useState<TokenPriceEntry>(EMPTY_TOKEN_PRICE_ENTRY);
  useRouterCallback(async router => setTokenPrice((await router.getTokenPrices())[token]));
  return tokenPrice;
}
