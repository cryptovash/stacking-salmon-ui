// TODO: <
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// TODO: >

import { BigNumber } from '@ethersproject/bignumber';
import { useCallback, useMemo, useState } from 'react';
import { useTransactionAdder } from '../store/transactions/hooks';
import useTarotRouter, { useDoUpdate } from './useTarotRouter';
import { ButtonState } from '../components/InteractionButton';
import { formatUnits } from '@ethersproject/units';

export default function useXStake(
  approvalState: ButtonState,
  poolId: number,
  amount: BigNumber,
  decimals: BigNumber,
  invalidInput: boolean): [ButtonState, () => Promise<void>] {
  const tarotRouter = useTarotRouter();
  const doUpdate = useDoUpdate();
  const addTransaction = useTransactionAdder();
  const [pending, setPending] = useState<boolean>(false);

  const summary = `Stake ${formatUnits(amount, decimals)} xTAROT`;

  const xStakeState: ButtonState = useMemo(() => {
    if (invalidInput) return ButtonState.Disabled;
    if (approvalState !== ButtonState.Done) return ButtonState.Disabled;
    if (pending) return ButtonState.Pending;
    return ButtonState.Ready;
  }, [approvalState, pending, amount, poolId]);

  const xStake = useCallback(async (): Promise<void> => {
    if (xStakeState !== ButtonState.Ready) return;
    setPending(true);
    try {
      await tarotRouter.xStake(amount, poolId, (hash: string) => {
        addTransaction({ hash }, { summary });
      });
      doUpdate();
    } finally {
      setPending(false);
    }
  }, [approvalState, addTransaction, amount, decimals, poolId]);

  return [xStakeState, xStake];
}
