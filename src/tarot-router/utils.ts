// TODO: <
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// TODO: >

import TarotRouter from '.';
import { Address, PoolTokenType } from '../types/interfaces';
import { BigNumber } from '@ethersproject/bignumber';
import { LENDING_POOL_DETAILS_MAP } from '../config/web3/contracts/lending-pools';

export async function normalize(this: TarotRouter, uniswapV2PairAddress: Address, poolTokenType: PoolTokenType, amount: number) : Promise<number> {
  // eslint-disable-next-line no-invalid-this
  const poolDetails = LENDING_POOL_DETAILS_MAP[uniswapV2PairAddress.toLowerCase()];
  const decimals = poolTokenType === PoolTokenType.BorrowableA ? poolDetails.decimals0 : poolTokenType === PoolTokenType.BorrowableB ? poolDetails.decimals1 : 18;
  return amount / Math.pow(10, decimals);
}

export function getDeadline(this: TarotRouter) {
  return BigNumber.from(Math.floor(Date.now() / 1000) + 3600 * 4); // 4 hour deadline
}
