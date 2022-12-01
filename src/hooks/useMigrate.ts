// TODO: <
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
// TODO: >

import { BigNumber } from '@ethersproject/bignumber';
import { useCallback, useMemo, useState } from 'react';
import { useTransactionAdder } from '../store/transactions/hooks';
import useTarotRouter, { useDoUpdate } from './useTarotRouter';
import { ButtonState } from '../components/InteractionButton';
import { formatUnits } from '@ethersproject/units';
import { SUPPLY_VAULTS } from '../config/web3/contracts/supply-vault';

export default function useMigrate(approvalState: ButtonState, supplyVaultAddress: Address, amount: BigNumber, decimals: BigNumber, invalidInput: boolean): [ButtonState, () => Promise<void>] {
  const tarotRouter = useTarotRouter();
  const doUpdate = useDoUpdate();
  const addTransaction = useTransactionAdder();
  const [pending, setPending] = useState<boolean>(false);

  const summary = `Migrate ${formatUnits(amount, decimals)} ${SUPPLY_VAULTS[tarotRouter.chainId][supplyVaultAddress].symbol}`;

  const migrateState: ButtonState = useMemo(() => {
    if (invalidInput) return ButtonState.Disabled;
    if (approvalState !== ButtonState.Done) return ButtonState.Disabled;
    if (pending) return ButtonState.Pending;
    return ButtonState.Ready;
  }, [approvalState, pending, amount, supplyVaultAddress]);

  const migrate = useCallback(async (): Promise<void> => {
    if (migrateState !== ButtonState.Ready) return;
    setPending(true);
    try {
      await tarotRouter.migrate(supplyVaultAddress, (hash: string) => {
        addTransaction({ hash }, { summary });
      });
      doUpdate();
    } finally {
      setPending(false);
    }
  }, [approvalState, addTransaction, amount, supplyVaultAddress, decimals]);

  return [migrateState, migrate];
}
