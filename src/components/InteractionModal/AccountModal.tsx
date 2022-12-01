import { useCallback } from 'react';
import { InteractionModalContainer } from '.';
import { Spinner } from 'react-bootstrap';
import { TransactionDetails } from '../../store/transactions/reducer';
import { useTransactionUrl } from '../../hooks/useUrlGenerator';
import { useWeb3React } from '@web3-react/core';
import { Web3Provider } from '@ethersproject/providers';
import { clearAllTransactions } from '../../store/transactions/actions';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../store/index';
import React from 'react';

const MAX_TRANSACTION_HISTORY = 10;

function Transaction({ tx, pending }: TransactionProps) {
  const transactionUrl = useTransactionUrl(tx.hash);
  return (
    <div className='text-sm my-2'>
      <a
        className='text-textPrimary hover:text-textSecondary space-x-2'
        href={transactionUrl}
        target='_blank'
        rel='noopener noreferrer'>
        <span>{tx.summary}</span>
        {pending ? (
          <Spinner
            animation='border'
            size='sm' />
        ) : null}
      </a>
    </div>
  );
}

export interface TransactionProps {
  tx: TransactionDetails;
  pending?: boolean
}

export interface AccountModalProps {
  show: boolean;
  toggleShow(s: boolean): void;
  pending: Array<TransactionDetails>;
  confirmed: Array<TransactionDetails>;
}

export default function AccountModal({ show, toggleShow, pending, confirmed }: AccountModalProps): JSX.Element {
  const { chainId } = useWeb3React<Web3Provider>();
  const dispatch = useDispatch<AppDispatch>();
  const clearAllTransactionsCallback = useCallback(() => {
    if (chainId) dispatch(clearAllTransactions({ chainId }));
  }, [dispatch, chainId]);

  return (
    <InteractionModalContainer
      title='Transactions'
      show={show}
      toggleShow={toggleShow}>
      <>
        {pending.length === 0 && confirmed.length === 0 ? (
          <div>No recent transactions to display</div>
        ) : (
          <>
            <span
              onClick={clearAllTransactionsCallback}
              className='inline-block mb-2 cursor-pointer text-tarotJade-50 hover:underline'>Clear all
            </span>
            {pending.length > 0 && (
              <div>{
                pending.map((tx: TransactionDetails, key: any) => <Transaction
                  tx={tx}
                  key={key}
                  pending={true} />)
              }
              </div>
            )}
            {confirmed.length > 0 && (
              <div>{
                confirmed
                  .slice(0, MAX_TRANSACTION_HISTORY)
                  .map((tx: TransactionDetails, key: any) => <Transaction
                    tx={tx}
                    key={key} />)
              }
              </div>
            )}
          </>
        )}
      </>
    </InteractionModalContainer>
  );
}