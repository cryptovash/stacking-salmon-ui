import { formatUnits } from '@ethersproject/units';
import { BigNumber, BigNumberish } from 'ethers';
import { BigAmount } from '../types/interfaces';

export function parseNumber(bigAmount: BigAmount | undefined): number {
  if (!bigAmount) {
    return 0;
  }
  return parseFloat(formatUnits(bigAmount.amount, bigAmount.decimals));
}

export function parse18(amount: BigNumberish): number {
  amount = BigNumber.from(amount);
  if (amount.eq(0)) {
    return 0;
  }
  return parseFloat(formatUnits(amount, 18));
}