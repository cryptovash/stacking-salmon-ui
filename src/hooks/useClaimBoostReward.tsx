// TODO: <
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
// TODO: >

import { useCallback, useMemo, useState } from 'react';
import { useTransactionAdder } from '../store/transactions/hooks';
import useTarotRouter, { useDoUpdate } from './useTarotRouter';
import { ButtonState } from '../components/InteractionButton';
import { BoostMaxxPoolInfo } from '../types/interfaces';

export default function useClaimBoostReward(poolInfo: BoostMaxxPoolInfo): [ButtonState, () => Promise<void>] {
  const tarotRouter = useTarotRouter();
  const doUpdate = useDoUpdate();
  const addTransaction = useTransactionAdder();
  const [pending, setPending] = useState<boolean>(false);

  const summary = `Claim SOLID reward${poolInfo ? ` for ${poolInfo.symbol}` : ''}`;

  const claimsState: ButtonState = useMemo(() => {
    if (pending) return ButtonState.Pending;
    return ButtonState.Ready;
  }, [pending]);

  const claimBoostReward = useCallback(async (): Promise<void> => {
    if (claimsState !== ButtonState.Ready) return;
    setPending(true);
    try {
      await tarotRouter.claimBoostReward(poolInfo.id, (hash: string) => {
        addTransaction({ hash }, { summary });
      });
      doUpdate();
    } finally {
      setPending(false);
    }
  }, [poolInfo, summary, addTransaction]);

  return [claimsState, claimBoostReward];
}