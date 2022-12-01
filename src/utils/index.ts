import { CHAIN_DETAILS, CHAIN_IDS } from '../config/web3/chains';
import { LENDING_POOL_DETAILS_MAP } from '../config/web3/contracts/lending-pools';
import { TOKEN_INFO } from '../config/web3/contracts/token-info';
import { WETH_ADDRESSES } from '../config/web3/contracts/weth';
import { DEX } from '../config/web3/dexs';
import { BigNumber } from 'ethers';
import { getAddress } from 'ethers/lib/utils';
import { PoolTokenType } from '../types/interfaces';

export function impermanentLoss(priceSwing: number) {
  return Math.sqrt(priceSwing) / (priceSwing + 1) * 2;
}

export const getAB = (maybeArray: [any, any] | undefined) : [any, any] => {
  return maybeArray || [undefined, undefined];
};

export const getTokenSymbol = (lendingPoolId: string, poolTokenType = PoolTokenType.Collateral) : string => {
  const poolDetails = LENDING_POOL_DETAILS_MAP[lendingPoolId.toLowerCase()];
  if (poolTokenType === PoolTokenType.Collateral) {
    const symbolA = getTokenSymbol(lendingPoolId, PoolTokenType.BorrowableA);
    const symbolB = getTokenSymbol(lendingPoolId, PoolTokenType.BorrowableB);
    const isDexTypeSolidly = [DEX.SOLIDLY, DEX.SPIRIT_V2, DEX.VELODROME, DEX.XCAL].includes(poolDetails.dex);
    return (poolDetails.stable ? 'sAMM-' : isDexTypeSolidly ? 'vAMM-' : '') + symbolA + '/' + symbolB + (isDexTypeSolidly ? '' : ' LP');
  }
  const chainId = poolDetails.chainId || CHAIN_IDS.FANTOM;

  const underlying = poolDetails[poolTokenType === PoolTokenType.BorrowableA ? 'tokenAddress0' : 'tokenAddress1'].toLowerCase();
  const wethAddress = WETH_ADDRESSES[chainId];
  if (underlying === wethAddress.toLowerCase()) return CHAIN_DETAILS[chainId].nativeCurrency.symbol;
  const tokenInfo = TOKEN_INFO[chainId][underlying];
  if (tokenInfo) {
    return tokenInfo.symbol;
  }
  return poolDetails[poolTokenType === PoolTokenType.BorrowableA ? 'symbol0' : 'symbol1'];
};

export const getTokenIcon = (
  tokenAddress: string
): string => {
  const convertedAddress = getAddress(tokenAddress);

  return `/assets/images/token-icons/${convertedAddress}.png`;
};

export const getMinimumTxAmount = (chainId: number): BigNumber => {
  return CHAIN_DETAILS[chainId].minimumTxAmount || BigNumber.from(10).pow(18);
};