// TODO: <
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// TODO: >

import { BigNumber } from '@ethersproject/bignumber';
import { useCallback, useMemo, useState } from 'react';
import { useTransactionAdder } from '../store/transactions/hooks';
import useTarotRouter, { useDoUpdate } from './useTarotRouter';
import { ButtonState } from '../components/InteractionButton';
import { formatUnits } from '@ethersproject/units';
import { BoostMaxxPoolInfo } from '../types/interfaces';

export default function useBoostStake(
  approvalState: ButtonState,
  poolInfo: BoostMaxxPoolInfo,
  amount: BigNumber,
  decimals: BigNumber,
  invalidInput: boolean): [ButtonState, () => Promise<void>] {
  const tarotRouter = useTarotRouter();
  const doUpdate = useDoUpdate();
  const addTransaction = useTransactionAdder();
  const [pending, setPending] = useState<boolean>(false);

  const summary = `Stake ${formatUnits(amount, decimals)} ${poolInfo.symbol}`;

  const boostStakeState: ButtonState = useMemo(() => {
    if (invalidInput) return ButtonState.Disabled;
    if (approvalState !== ButtonState.Done) return ButtonState.Disabled;
    if (pending) return ButtonState.Pending;
    return ButtonState.Ready;
  }, [approvalState, pending, amount, poolInfo]);

  const boostStake = useCallback(async (): Promise<void> => {
    if (boostStakeState !== ButtonState.Ready) return;
    setPending(true);
    try {
      await tarotRouter.boostStake(amount, poolInfo, (hash: string) => {
        addTransaction({ hash }, { summary });
      });
      doUpdate();
    } finally {
      setPending(false);
    }
  }, [approvalState, addTransaction, amount, decimals, poolInfo]);

  return [boostStakeState, boostStake];
}
