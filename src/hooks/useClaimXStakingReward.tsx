// TODO: <
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
// TODO: >

import { useCallback, useMemo, useState } from 'react';
import { useTransactionAdder } from '../store/transactions/hooks';
import useTarotRouter, { useDoUpdate } from './useTarotRouter';
import { ButtonState } from '../components/InteractionButton';
import { XStakingPoolInfo } from '../config/web3/contracts/x-staking-pool';

export default function useClaimXStakingReward(poolId: number, xStakingPoolInfo: XStakingPoolInfo): [ButtonState, () => Promise<void>] {
  const tarotRouter = useTarotRouter();
  const doUpdate = useDoUpdate();
  const addTransaction = useTransactionAdder();
  const [pending, setPending] = useState<boolean>(false);

  const summary = `Claim ${xStakingPoolInfo.rewardTokenSymbol} xStaking reward`;

  const claimsState: ButtonState = useMemo(() => {
    if (pending) return ButtonState.Pending;
    return ButtonState.Ready;
  }, [pending]);

  const claimXStakingReward = useCallback(async (): Promise<void> => {
    if (claimsState !== ButtonState.Ready) return;
    setPending(true);
    try {
      await tarotRouter.claimXStakingReward(poolId, (hash: string) => {
        addTransaction({ hash }, { summary });
      });
      doUpdate();
    } finally {
      setPending(false);
    }
  }, [poolId, summary, addTransaction]);

  return [claimsState, claimXStakingReward];
}
