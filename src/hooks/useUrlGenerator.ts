// TODO: <
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
// TODO: >

import { getAddress } from '@ethersproject/address';
import { Web3Provider } from '@ethersproject/providers';
import { useWeb3React } from '@web3-react/core';
import { CHAIN_DETAILS } from '../config/web3/chains';
import { LENDING_POOL_DETAILS_MAP } from '../config/web3/contracts/lending-pools';
import { WETH_ADDRESSES } from '../config/web3/contracts/weth';
import { DEX, getDexById, UNKNOWN_DEX } from '../config/web3/dexs';
import { PoolTokenType } from '../types/interfaces';
import { useFullLendingPoolsData } from './useData';
import usePairAddress from './usePairAddress';
import usePoolToken from './usePoolToken';

export function useTokenIcon(poolTokenTypeArg?: PoolTokenType) : string {
  const poolTokenType = usePoolToken();
  poolTokenTypeArg = poolTokenTypeArg || poolTokenType;
  const lendingPoolId = usePairAddress();
  const poolDetails = LENDING_POOL_DETAILS_MAP[lendingPoolId.toLowerCase()];
  const tokenAddress = poolTokenTypeArg === PoolTokenType.BorrowableA ? poolDetails.tokenAddress0 : poolTokenTypeArg === PoolTokenType.BorrowableB ? poolDetails.tokenAddress1 : '';

  if (!tokenAddress) return '';
  const convertedAddress = getAddress(tokenAddress);
  try {
    return `/assets/images/token-icons/${convertedAddress}.png`;
  } catch {
    // TODO: <
    // TODO: not working
    return '/assets/images/token-icons/default.png';
    // TODO: >
  }
}
export function useTokenIconFromAddress(tokenAddress?: string) : string {
  if (!tokenAddress) {
    return '/assets/images/token-icons/default.png';
  }
  const convertedAddress = getAddress(tokenAddress);
  try {
    return `/assets/images/token-icons/${convertedAddress}.png`;
  } catch {
    // TODO: <
    // TODO: not working
    return '/assets/images/token-icons/default.png';
    // TODO: >
  }
}

export function usePairInfoUrl() : string {
  const { chainId } = useWeb3React<Web3Provider>();
  const lendingPoolId = usePairAddress();
  const poolDetails = LENDING_POOL_DETAILS_MAP[lendingPoolId.toLowerCase()];
  const pairAddress = poolDetails.uniswapV2PairAddress;
  const dex = getDexById(chainId, poolDetails.dex);
  if (!dex.pairInfoUrl) {
    return '#';
  }
  return dex.pairInfoUrl + pairAddress;
}

export function useTokenInfoUrl() : string {
  const { chainId } = useWeb3React<Web3Provider>();
  const poolTokenType = usePoolToken();
  const lendingPoolId = usePairAddress();
  const poolDetails = LENDING_POOL_DETAILS_MAP[lendingPoolId.toLowerCase()];
  const tokenAddress = poolTokenType === PoolTokenType.BorrowableA ? poolDetails.tokenAddress0 : poolTokenType === PoolTokenType.BorrowableB ? poolDetails.tokenAddress1 : '';

  const dex = getDexById(chainId, poolDetails.dex);
  if (!dex.pairInfoUrl) {
    return '#';
  }
  return dex.tokenInfoUrl + tokenAddress;
}

export function useTokenExplorerUrl() : string {
  const poolTokenType = usePoolToken();
  const { chainId } = useWeb3React<Web3Provider>();
  const lendingPoolId = usePairAddress();
  const poolDetails = LENDING_POOL_DETAILS_MAP[lendingPoolId.toLowerCase()];
  const tokenAddress = poolTokenType === PoolTokenType.Collateral ? poolDetails.lendingPoolAddress : poolTokenType === PoolTokenType.BorrowableA ? poolDetails.tokenAddress0 : poolTokenType === PoolTokenType.BorrowableB ? poolDetails.tokenAddress1 : '';
  const blockExplorerUrl = CHAIN_DETAILS[chainId].blockExplorerUrls[0];
  return `${blockExplorerUrl}/address/${tokenAddress}`;
}

export function useAddLiquidityUrl() : string {
  const { chainId } = useWeb3React<Web3Provider>();
  const lendingPoolId = usePairAddress();
  const fullLendingPoolsMap = useFullLendingPoolsData() || {};
  const pool = fullLendingPoolsMap[lendingPoolId.toLowerCase()] || {};
  const poolDetails = LENDING_POOL_DETAILS_MAP[lendingPoolId.toLowerCase()];
  const lpAddress = poolDetails.uniswapV2PairAddress;
  const tokenAAddress = poolDetails.tokenAddress0;
  const tokenBAddress = poolDetails.tokenAddress1;
  const dex = pool.dex || UNKNOWN_DEX;
  if (!dex.addLiquidityUrl) {
    return '#';
  }
  if (dex.id === DEX.SOLIDLY) {
    return dex.addLiquidityUrl + lpAddress.toLowerCase();
  }
  if (dex.id === DEX.VELODROME) {
    return dex.addLiquidityUrl;
  }
  const wethAddress = (WETH_ADDRESSES[chainId]).toLowerCase();
  const addressA = tokenAAddress.toLowerCase() === wethAddress ? dex.addLiquidityWETHSymbol || CHAIN_DETAILS[chainId].nativeCurrency.symbol : getAddress(tokenAAddress);
  const addressB = tokenBAddress.toLowerCase() === wethAddress ? dex.addLiquidityWETHSymbol || CHAIN_DETAILS[chainId].nativeCurrency.symbol : getAddress(tokenBAddress);
  return dex.addLiquidityUrl + addressA + '/' + addressB;
}

export function useTransactionUrlGenerator() : (hash: string) => string {
  const { chainId } = useWeb3React<Web3Provider>();
  const blockExplorerUrl = CHAIN_DETAILS[chainId].blockExplorerUrls[0];
  return (hash: string) => `${blockExplorerUrl}/tx/${hash}`;
}

export function useTransactionUrl(hash: string) : string {
  const generator = useTransactionUrlGenerator();
  return generator(hash);
}