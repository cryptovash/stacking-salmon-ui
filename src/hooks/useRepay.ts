// TODO: <
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
// TODO: >

import { BigNumber } from '@ethersproject/bignumber';
import { useCallback, useMemo, useState } from 'react';
import { useTransactionAdder } from '../store/transactions/hooks';
import usePairAddress from './usePairAddress';
import usePoolToken from './usePoolToken';
import useTarotRouter, { useDoUpdate } from './useTarotRouter';
import { ButtonState } from '../components/InteractionButton';
import { useSymbol, useDecimals } from './useData';
import { formatFloat } from '../utils/format';
import { formatUnits } from 'ethers/lib/utils';

export default function useRepay(approvalState: ButtonState, amount: BigNumber, invalidInput: boolean): [ButtonState, () => Promise<void>] {
  const uniswapV2PairAddress = usePairAddress();
  const poolTokenType = usePoolToken();
  const tarotRouter = useTarotRouter();
  const doUpdate = useDoUpdate();
  const addTransaction = useTransactionAdder();
  const [pending, setPending] = useState<boolean>(false);

  const decimals = useDecimals(poolTokenType);
  const symbol = useSymbol();
  const summary = `Repay ${formatFloat(parseFloat(formatUnits(amount, decimals)))} ${symbol}`;

  const repayState: ButtonState = useMemo(() => {
    if (invalidInput) return ButtonState.Disabled;
    if (approvalState !== ButtonState.Done) return ButtonState.Disabled;
    if (pending) return ButtonState.Pending;
    return ButtonState.Ready;
  }, [approvalState, pending, amount]);

  const repay = useCallback(async (): Promise<void> => {
    if (repayState !== ButtonState.Ready) return;
    setPending(true);
    try {
      await tarotRouter.repay(uniswapV2PairAddress, poolTokenType, amount, (hash: string) => {
        addTransaction({ hash }, { summary });
      });
      doUpdate();
    } finally {
      setPending(false);
    }
  }, [approvalState, uniswapV2PairAddress, poolTokenType, addTransaction, amount]);

  return [repayState, repay];
}
