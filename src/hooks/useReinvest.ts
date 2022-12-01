// TODO: <
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
// TODO: >

import { useCallback, useMemo, useState } from 'react';
import { useTransactionAdder } from '../store/transactions/hooks';
import { ButtonState } from '../components/InteractionButton';
import { PoolTokenType } from '../types/interfaces';
import { useSymbol } from './useData';
import usePairAddress from './usePairAddress';
import useTarotRouter, { useDoUpdate } from './useTarotRouter';

export default function useReinvest(): [ButtonState, () => Promise<void>] {
  const uniswapV2PairAddress = usePairAddress();
  const tarotRouter = useTarotRouter();
  const doUpdate = useDoUpdate();
  const addTransaction = useTransactionAdder();
  const [pending, setPending] = useState<boolean>(false);
  const symbolA = useSymbol(PoolTokenType.BorrowableA);
  const symbolB = useSymbol(PoolTokenType.BorrowableB);

  const summary = `Reinvest ${symbolA}-${symbolB}`;

  const state: ButtonState = useMemo(() => {
    if (pending) return ButtonState.Pending;
    return ButtonState.Ready;
  }, [pending]);

  const action = useCallback(async (): Promise<void> => {
    if (state !== ButtonState.Ready) return;
    setPending(true);
    try {
      await tarotRouter.reinvest(uniswapV2PairAddress, (hash: string) => {
        addTransaction({ hash }, { summary });
      });
      doUpdate();
    } finally {
      setPending(false);
    }
  }, [state, uniswapV2PairAddress, addTransaction, summary]);

  return [state, action];
}