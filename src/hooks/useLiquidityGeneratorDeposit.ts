// TODO: <
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
// TODO: >

import { BigNumber } from '@ethersproject/bignumber';
import { useCallback, useMemo, useState } from 'react';
import { useTransactionAdder } from '../store/transactions/hooks';
import useTarotRouter, { useDoUpdate } from './useTarotRouter';
import { ButtonState } from '../components/InteractionButton';
import { formatFloat } from '../utils/format';
import { formatUnits } from 'ethers/lib/utils';

export default function useLiquidityGeneratorDeposit(amount: BigNumber, invalidInput: boolean): [ButtonState, () => Promise<ActionResponse>] {
  const tarotRouter = useTarotRouter();
  const doUpdate = useDoUpdate();
  const addTransaction = useTransactionAdder();
  const [pending, setPending] = useState<boolean>(false);

  const val = parseFloat(formatUnits(amount));
  const summary = `LGE Deposit ${formatFloat(val)} FTM`;

  const state: ButtonState = useMemo(() => {
    if (invalidInput) return ButtonState.Disabled;
    if (pending) return ButtonState.Pending;
    return ButtonState.Ready;
  }, [pending, amount]);

  interface ActionResponse {
    success: boolean;
    gasPrice?: BigNumber;
    gasUsed?: BigNumber;
    logs?: any;
  }

  const action = useCallback(async (): Promise<ActionResponse> => {
    if (state !== ButtonState.Ready) return { success: false };
    setPending(true);
    let ret = { success: false };
    try {
      await tarotRouter.liquidityGeneratorDeposit(amount, (hash: string, gasPrice: BigNumber, gasUsed: BigNumber, logs: any) => {
        ret = {
          ...ret,
          gasPrice: gasPrice,
          gasUsed: gasUsed,
          logs: logs
        };
        addTransaction({ hash }, { summary });
        ret = {
          ...ret,
          success: true
        };
      });
      doUpdate();
    } finally {
      setPending(false);
    }
    return ret;
  }, [state, amount, addTransaction, summary]);

  return [state, action];
}
