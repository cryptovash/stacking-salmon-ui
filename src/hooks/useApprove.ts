// TODO: <
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
// TODO: >

import {
    Zero,
    MaxUint256
  } from '@ethersproject/constants';
  import { BigNumber } from '@ethersproject/bignumber';
  import { useCallback, useMemo, useState } from 'react';
  import { useTransactionAdder } from '../store/transactions/hooks';
  import { useAllowance, useBoostStakeAllowance, useMigrateAllowance, useMintAllowance, useStakeAllowance, useXStakeAllowance } from './useAllowance';
  import { Address, ApprovalType, PoolTokenType } from '../types/interfaces';
  import usePairAddress from './usePairAddress';
  import usePoolToken from './usePoolToken';
  import useTarotRouter from './useTarotRouter';
  import { ButtonState } from '../components/InteractionButton';
  import { useSymbol } from './useData';
  
  const ZERO = Zero;
  const APPROVE_AMOUNT = MaxUint256;
  
  export interface PermitData {
    permitData: string;
    amount: BigNumber;
    deadline: BigNumber;
  }
  
  // returns a variable indicating the state of the approval and a function which approves if necessary or early returns
  export function useApproveMigrate(amount: BigNumber, symbol: string, toApproveAddress: Address, invalidInput: boolean, deadline?: BigNumber): [ButtonState, () => Promise<void>] {
    const tarotRouter = useTarotRouter();
    const addTransaction = useTransactionAdder();
    const [pending, setPending] = useState<boolean>(false);
    const currentAllowance = useMigrateAllowance(toApproveAddress, pending);
    const summary = `Approve ${symbol}`;
  
    const approvalState: ButtonState = useMemo(() => {
      if (invalidInput) return ButtonState.Disabled;
      if (!currentAllowance) return ButtonState.Disabled;
      if (amount.eq(ZERO)) return ButtonState.Disabled;
      return currentAllowance.lt(amount) ?
        pending ?
          ButtonState.Pending :
          ButtonState.Ready :
        ButtonState.Done;
    }, [currentAllowance, pending, amount]);
  
    const approve = useCallback(async (): Promise<void> => {
      if (approvalState !== ButtonState.Ready) return;
      setPending(true);
  
      try {
        await tarotRouter.approveMigrate(toApproveAddress, (hash: string) => {
          addTransaction({ hash }, { summary });
        });
      } catch (err) {
        console.error(err);
      }
      setPending(false);
    }, [approvalState, addTransaction, amount, deadline]);
  
    return [approvalState, approve];
  }
  
  // returns a variable indicating the state of the approval and a function which approves if necessary or early returns
  export function useApproveMint(amount: BigNumber, invalidInput: boolean, deadline?: BigNumber): [ButtonState, () => Promise<void>] {
    const tarotRouter = useTarotRouter();
    const addTransaction = useTransactionAdder();
    const [pending, setPending] = useState<boolean>(false);
    const currentAllowance = useMintAllowance(pending);
    const summary = `Approve SPIRIT`;
  
    const approvalState: ButtonState = useMemo(() => {
      if (invalidInput) return ButtonState.Disabled;
      if (!currentAllowance) return ButtonState.Disabled;
      if (amount.eq(ZERO)) return ButtonState.Disabled;
      return currentAllowance.lt(amount) ?
        pending ?
          ButtonState.Pending :
          ButtonState.Ready :
        ButtonState.Done;
    }, [currentAllowance, pending, amount]);
  
    const approve = useCallback(async (): Promise<void> => {
      if (approvalState !== ButtonState.Ready) return;
      setPending(true);
  
      try {
        await tarotRouter.approveMint((hash: string) => {
          addTransaction({ hash }, { summary });
        });
      } catch (err) {
        console.error(err);
      }
      setPending(false);
    }, [approvalState, addTransaction, amount, deadline]);
  
    return [approvalState, approve];
  }
  
  // returns a variable indicating the state of the approval and a function which approves if necessary or early returns
  export function useApproveStake(amount: BigNumber, symbol: string, toApproveAddress: Address, invalidInput: boolean, deadline?: BigNumber): [ButtonState, () => Promise<void>] {
    const tarotRouter = useTarotRouter();
    const addTransaction = useTransactionAdder();
    const [pending, setPending] = useState<boolean>(false);
    const currentAllowance = useStakeAllowance(toApproveAddress, pending);
    const summary = `Approve ${symbol}`;
  
    const approvalState: ButtonState = useMemo(() => {
      if (invalidInput) return ButtonState.Disabled;
      if (!currentAllowance) return ButtonState.Disabled;
      if (amount.eq(ZERO)) return ButtonState.Disabled;
      return currentAllowance.lt(amount) ?
        pending ?
          ButtonState.Pending :
          ButtonState.Ready :
        ButtonState.Done;
    }, [currentAllowance, pending, amount]);
  
    const approve = useCallback(async (): Promise<void> => {
      if (approvalState !== ButtonState.Ready) return;
      setPending(true);
  
      try {
        await tarotRouter.approveStake(toApproveAddress, (hash: string) => {
          addTransaction({ hash }, { summary });
        });
      } catch (err) {
        console.error(err);
      }
      setPending(false);
    }, [approvalState, addTransaction, amount, deadline]);
  
    return [approvalState, approve];
  }
  
  // returns a variable indicating the state of the approval and a function which approves if necessary or early returns
  export function useApproveXStake(amount: BigNumber, invalidInput: boolean, deadline?: BigNumber): [ButtonState, () => Promise<void>] {
    const tarotRouter = useTarotRouter();
    const addTransaction = useTransactionAdder();
    const [pending, setPending] = useState<boolean>(false);
    const currentAllowance = useXStakeAllowance(pending);
    const summary = `Approve xTAROT`;
  
    const approvalState: ButtonState = useMemo(() => {
      if (invalidInput) return ButtonState.Disabled;
      if (!currentAllowance) return ButtonState.Disabled;
      if (amount.eq(ZERO)) return ButtonState.Disabled;
      return currentAllowance.lt(amount) ?
        pending ?
          ButtonState.Pending :
          ButtonState.Ready :
        ButtonState.Done;
    }, [currentAllowance, pending, amount]);
  
    const approve = useCallback(async (): Promise<void> => {
      if (approvalState !== ButtonState.Ready) return;
      setPending(true);
  
      try {
        await tarotRouter.approveXStake((hash: string) => {
          addTransaction({ hash }, { summary });
        });
      } catch (err) {
        console.error(err);
      }
      setPending(false);
    }, [approvalState, addTransaction, amount, deadline]);
  
    return [approvalState, approve];
  }
  
  // returns a variable indicating the state of the approval and a function which approves if necessary or early returns
  export function useApproveBoostStake(poolInfo: BoostMaxxPoolInfo, amount: BigNumber, invalidInput: boolean, deadline?: BigNumber): [ButtonState, () => Promise<void>] {
    const tarotRouter = useTarotRouter();
    const addTransaction = useTransactionAdder();
    const [pending, setPending] = useState<boolean>(false);
    const currentAllowance = useBoostStakeAllowance(poolInfo, pending);
    const summary = `Approve ${poolInfo.symbol}`;
  
    const approvalState: ButtonState = useMemo(() => {
      if (invalidInput) return ButtonState.Disabled;
      if (!currentAllowance) return ButtonState.Disabled;
      if (amount.eq(ZERO)) return ButtonState.Disabled;
      return currentAllowance.lt(amount) ?
        pending ?
          ButtonState.Pending :
          ButtonState.Ready :
        ButtonState.Done;
    }, [currentAllowance, pending, amount]);
  
    const approve = useCallback(async (): Promise<void> => {
      if (approvalState !== ButtonState.Ready) return;
      setPending(true);
  
      try {
        await tarotRouter.approveBoostStake(poolInfo, (hash: string) => {
          addTransaction({ hash }, { summary });
        });
      } catch (err) {
        console.error(err);
      }
      setPending(false);
    }, [poolInfo, summary, approvalState, addTransaction, amount, deadline]);
  
    return [approvalState, approve];
  }
  
  // returns a variable indicating the state of the approval and a function which approves if necessary or early returns
  export function useApprove(approvalType: ApprovalType, amount: BigNumber, invalidInput: boolean, poolTokenTypeArg?: PoolTokenType, deadline?: BigNumber): [ButtonState, () => Promise<void>, PermitData] {
    const uniswapV2PairAddress = usePairAddress();
    // TODO: <
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const poolTokenType = poolTokenTypeArg ? poolTokenTypeArg : usePoolToken();
    // TODO: >
    const tarotRouter = useTarotRouter();
    const addTransaction = useTransactionAdder();
    const [pending, setPending] = useState<boolean>(false);
    const [permitData, setPermitData] = useState<PermitData>(null);
    const currentAllowance = useAllowance(approvalType, pending, poolTokenType);
  
    const symbol = useSymbol();
    const action = approvalType === ApprovalType.BORROW ? 'borrow' : approvalType === ApprovalType.POOL_TOKEN ? 'withdrawal' : 'transfer';
    const summary = `Approve ${symbol} ${action}`;
  
    const approvalState: ButtonState = useMemo(() => {
      if (invalidInput) return ButtonState.Disabled;
      if (!currentAllowance) return ButtonState.Disabled;
      if (amount.eq(ZERO)) return ButtonState.Disabled;
      return currentAllowance.lt(amount) && (permitData === null || !permitData.amount.eq(amount)) ?
        pending ?
          ButtonState.Pending :
          ButtonState.Ready :
        ButtonState.Done;
    }, [currentAllowance, pending, amount]);
  
    const approve = useCallback(async (): Promise<void> => {
      if (approvalState !== ButtonState.Ready) return;
      setPending(true);
      tarotRouter.getPermitData(uniswapV2PairAddress, poolTokenType, approvalType, amount, deadline, async (permitData: PermitData) => {
        if (permitData) setPermitData(permitData);
        else {
          // Fallback to traditional approve if can't sign
          setPermitData(null);
          try {
            await tarotRouter.approve(uniswapV2PairAddress, poolTokenType, approvalType, APPROVE_AMOUNT, (hash: string) => {
              addTransaction({ hash }, { summary });
            });
          } catch (err) {
            console.error(err);
          }
        }
        setPending(false);
      });
    }, [approvalState, uniswapV2PairAddress, poolTokenType, addTransaction, amount, deadline]);
  
    return [approvalState, approve, permitData];
  }  