import { InteractionModalContainer } from '.';
import clsx from 'clsx';
import MetaMask from '../../containers/MetaMask';
import WalletConnect from '../../containers/WalletConnect';
import { useEffect, useState } from 'react';
import { useWeb3React } from '@web3-react/core';
import { Web3Provider } from '@ethersproject/providers';
import getChainErrorMessage from '../../utils/helpers/web3/get-chain-error-message';
import React from 'react';

export interface WalletModalProps {
  show: boolean;
  toggleShow(s: boolean): void;
}

export default function WalletModal({ show, toggleShow }: WalletModalProps): JSX.Element {
  const { error } = useWeb3React<Web3Provider>();
  const [ignoreError, setIgnoreError] = useState(false);

  useEffect(() => {
    if (error?.name === 'UserRejectedRequestError') {
      setIgnoreError(true);
      return;
    }
    setIgnoreError(false);
  }, [error]);

  return (
    <InteractionModalContainer
      title='Connect Wallet'
      show={show}
      toggleShow={toggleShow}>
      <>
        <div className='p-4'>
          <div className={clsx('mt-2 mb-2 flex portrait:flex-col space-x-4 portrait:space-x-0 portrait:space-y-4 items-center justify-center')}>
            <MetaMask />
            <WalletConnect />
            {!!error && !ignoreError &&
          <p>{getChainErrorMessage(error)}</p>}
          </div>
        </div>
      </>
    </InteractionModalContainer>
  );
}