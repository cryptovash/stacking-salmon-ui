// TODO: <
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// TODO: >

import { BigNumber } from '@ethersproject/bignumber';
import { useCallback, useMemo, useState } from 'react';
import { useTransactionAdder } from '../store/transactions/hooks';
import useTarotRouter, { useDoUpdate } from './useTarotRouter';
import { ButtonState } from '../components/InteractionButton';
import { formatUnits } from '@ethersproject/units';

export default function useMint(
  approvalState: ButtonState,
  amount: BigNumber,
  invalidInput: boolean): [ButtonState, () => Promise<void>] {
  const tarotRouter = useTarotRouter();
  const doUpdate = useDoUpdate();
  const addTransaction = useTransactionAdder();
  const [pending, setPending] = useState<boolean>(false);

  const summary = `${formatUnits(amount, 18)} SPIRIT -> tinSPIRIT`;

  const mintState: ButtonState = useMemo(() => {
    if (invalidInput) return ButtonState.Disabled;
    if (approvalState !== ButtonState.Done) return ButtonState.Disabled;
    if (pending) return ButtonState.Pending;
    return ButtonState.Ready;
  }, [approvalState, pending, amount]);

  const mint = useCallback(async (): Promise<void> => {
    if (mintState !== ButtonState.Ready) return;
    setPending(true);
    try {
      await tarotRouter.gaugeVaultProxyManagerDeposit(amount, (hash: string) => {
        addTransaction({ hash }, { summary });
      });
      doUpdate();
    } finally {
      setPending(false);
    }
  }, [approvalState, addTransaction, amount]);

  return [mintState, mint];
}
