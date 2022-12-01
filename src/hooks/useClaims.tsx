// TODO: <
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
// TODO: >

import { useCallback, useMemo, useState } from 'react';
import { useTransactionAdder } from '../store/transactions/hooks';
import useTarotRouter, { useDoUpdate } from './useTarotRouter';
import { ButtonState } from '../components/InteractionButton';
import { useSymbol } from './useData';
import usePairAddress from './usePairAddress';
import { PoolTokenType } from '../types/interfaces';

export default function useClaims(): [ButtonState, () => Promise<void>] {
  const uniswapV2PairAddress = usePairAddress();
  const symbol = useSymbol(PoolTokenType.Collateral);
  const tarotRouter = useTarotRouter();
  const doUpdate = useDoUpdate();
  const addTransaction = useTransactionAdder();
  const [pending, setPending] = useState<boolean>(false);

  const summary = `Claim TAROT reward for ${symbol}`;

  const claimsState: ButtonState = useMemo(() => {
    if (pending) return ButtonState.Pending;
    return ButtonState.Ready;
  }, [pending]);

  const claims = useCallback(async (): Promise<void> => {
    if (claimsState !== ButtonState.Ready) return;
    setPending(true);
    try {
      await tarotRouter.claims(uniswapV2PairAddress, (hash: string) => {
        addTransaction({ hash }, { summary });
      });
      doUpdate();
    } finally {
      setPending(false);
    }
  }, [uniswapV2PairAddress, summary, addTransaction]);

  return [claimsState, claims];
}
