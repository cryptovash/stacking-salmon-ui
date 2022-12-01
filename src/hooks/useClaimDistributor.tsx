// TODO: <
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
// TODO: >

import { useCallback, useMemo, useState } from 'react';
import { useTransactionAdder } from '../store/transactions/hooks';
import useTarotRouter, { useDoUpdate } from './useTarotRouter';
import { ButtonState } from '../components/InteractionButton';
import { DistributorDetails } from '../utils/constants';

export default function useClaimDistributor(distributor: DistributorDetails): [ButtonState, () => Promise<ActionResponse>] {
  const tarotRouter = useTarotRouter();
  const doUpdate = useDoUpdate();
  const addTransaction = useTransactionAdder();
  const [pending, setPending] = useState<boolean>(false);

  const summary = `Claim TAROT from ${distributor.name}`;

  const claimDistributorState: ButtonState = useMemo(() => {
    if (pending) return ButtonState.Pending;
    return ButtonState.Ready;
  }, [pending]);

  interface ActionResponse {
    success: boolean;
    gasPrice?: BigNumber;
    gasUsed?: BigNumber;
    logs?: any;
  }

  const claimDistributor = useCallback(async (): Promise<ActionResponse> => {
    if (claimDistributorState !== ButtonState.Ready) return;
    setPending(true);
    let ret = { success: false };
    try {
      await tarotRouter.claimDistributor(distributor, (hash: string, gasPrice: BigNumber, gasUsed: BigNumber, logs: any) => {
        ret = {
          ...ret,
          gasPrice: gasPrice,
          gasUsed: gasUsed,
          logs: logs
        };
        addTransaction({ hash }, { summary }); ret = {
          ...ret,
          success: true
        };
      });
      doUpdate();
    } finally {
      setPending(false);
    }
    return ret;
  }, [claimDistributorState, distributor, summary, addTransaction]);

  return [claimDistributorState, claimDistributor];
}
