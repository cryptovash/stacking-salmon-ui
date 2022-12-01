import { Web3Provider } from '@ethersproject/providers';
import { useWeb3React } from '@web3-react/core';
import clsx from 'clsx';
import TarotImage from '../../components/UI/TarotImage';
import { ACTIVE_CHAINS, CHAIN_DETAILS, CHAIN_ICON_PATHS, CHAIN_LABELS } from '../../config/web3/chains';
import { useDefaultChainId, useUpdateDefaultChainId } from '../../hooks/useTarotRouter';
import { useCallback } from 'react';
import { InteractionModalContainer } from '.';
import React from 'react';

export interface ChainModalProps {
  show: boolean;
  toggleShow(s: boolean): void;
}

export default function ChainModal({ show, toggleShow }: ChainModalProps): JSX.Element {
  const { chainId, library } = useWeb3React<Web3Provider>();
  const defaultChainId = useDefaultChainId();
  const updateDefaultChainId = useUpdateDefaultChainId();

  const switchChain = useCallback(
    async (desiredChainId: number) => {
      toggleShow(false);
      const chainDetails = CHAIN_DETAILS[desiredChainId];
      if (!library || !chainId) {
        updateDefaultChainId(desiredChainId);
        return;
      }
      // if we're already connected to the desired chain, return
      if (desiredChainId === chainId) return;
      // if they want to connect to the default chain and we're already connected, return
      if (desiredChainId === -1 && chainId !== undefined) return;
      if (!library.provider.request) {
        return;
      }
      try {
        await library.provider.request({
          method: 'wallet_switchEthereumChain',
          params: [
            {
              chainId: chainDetails.chainId
            }
          ]
        });
      } catch (e) {
        if ((e as any).code === 4001) {
          return;
        }
        await library.provider.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: chainDetails.chainId,
              rpcUrls: chainDetails.rpcUrls,
              chainName: chainDetails.chainName,
              nativeCurrency: chainDetails.nativeCurrency,
              blockExplorerUrls: chainDetails.blockExplorerUrls
            }
          ]
        });
      }
    },
    [library, chainId, updateDefaultChainId]
  );

  return (
    <InteractionModalContainer
      title='Select Network'
      show={show}
      toggleShow={toggleShow}>
      <>
        <div className='p-4'>
          <div className={clsx('mt-2 mb-2 flex portrait:flex-col space-x-4 portrait:space-x-0 portrait:space-y-4 items-center justify-center')}>
            {ACTIVE_CHAINS.map(c => (
              <div
                key={c}
                onClick={() => switchChain(c)}
                className={clsx(
                  'flex',
                  'cursor-pointer',
                  'hover:bg-tarotBlackHaze-700',
                  'rounded-lg',
                  'flex-col',
                  'space-y-2',
                  'items-center',
                  'w-full',
                  'p-4',
                  c === (chainId || defaultChainId) ? 'border border-tarotBlackHaze-200' : ''
                )}>

                <TarotImage
                  width={32}
                  height={32}
                  className={clsx(
                    'inline-block'
                  )}
                  src={CHAIN_ICON_PATHS[c || -1]}
                  placeholder='/assets/images/default.png'
                  error='/assets/images/default.png'
                  alt={CHAIN_LABELS[c || -1]} />
                <div>{CHAIN_LABELS[c]}</div>
              </div>
            ))}
          </div>
        </div>
      </>
    </InteractionModalContainer>
  );
}
