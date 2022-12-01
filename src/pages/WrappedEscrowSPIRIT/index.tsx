
import { Web3Provider } from '@ethersproject/providers';
import { faChevronDown, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useWeb3React } from '@web3-react/core';
import { ReactComponent as SvgTinSpirit } from '../../assets/images/icons/tinSPIRIT.svg';
import { ReactComponent as SvgXTinSpirit } from '../../assets/images/icons/xtinSPIRIT.svg';
import clsx from 'clsx';
import InteractionButton, { ButtonState } from '../../components/InteractionButton';
import MintInteractionModal from '../../components/InteractionModal/MintInteractionModal';
import SupplyVaultCard from '../../components/SupplyVaultCard';
import TarotImage from '../../components/UI/TarotImage';
import { CHAIN_IDS } from '../../config/web3/chains';
import { TINSPIRIT_ADDRESS, XTINSPIRIT_ADDRESS } from '../../config/web3/contracts/wrapped-escrow-spirit';
import { getAddress } from 'ethers/lib/utils';
import { useDefaultChainId } from '../../hooks/useTarotRouter';
import { useState } from 'react';
import React from 'react';

const WrappedEscrowSPIRITContent = (): JSX.Element | null => {
  const { chainId: web3ChainId } = useWeb3React<Web3Provider>();
  const defaultChainId = useDefaultChainId();
  const chainId = web3ChainId || defaultChainId;
  const [showMintModal, toggleMintModal] = useState(false);
  const supplyVaultAddress = XTINSPIRIT_ADDRESS.toLowerCase();
  return (
    <div className='mt-6 space-y-3 md:mx-4 mb-12'>
      <div
        className={clsx(
          'flex',
          'flex-col',
          'md:flex-row',
          'space-y-8',
          'space-x-0',
          'md:space-x-8',
          'md:space-y-0',
          'justify-around')}>
        <div className='self-center flex flex-col p-2 space-y-4 mb-0 w-full xs:mb-0 xs:max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg'>
          <div className='flex flex-col justify-around !mt-0 !mb-4'>
            <div className='flex flex-col items-center'>
              <div className='combined z-10 mb-4'>
                <SvgXTinSpirit
                  className={clsx(
                    'absolute',
                    'opacity-50',
                    'animate-ping-slow-once',
                    'w-24',
                    'h-24'
                  )} />
                <div
                  className={clsx(
                    'absolute',
                    'animate-fade-in',
                    'w-24',
                    'h-24'
                  )}>
                  <div
                    className={clsx(
                      'absolute')}>
                    <SvgXTinSpirit
                      className={clsx(
                        'absolute',
                        'w-24',
                        'h-24'
                      )} />
                  </div>
                </div>
                <SvgTinSpirit
                  className={clsx(
                    'animate-fade-out',
                    'w-24',
                    'h-24'
                  )} />
              </div>
              <div className='text-xl sm:text-2xl text-textPrimary font-semibold'>tinSPIRIT</div>
              <div className='!mb-8 text-lg text-tarotJade-50 italic'>The Gateway to Gold</div>
              {chainId === CHAIN_IDS.FANTOM &&
              <>
                <div
                  className={clsx(
                    'p-0',
                    'sm:p-6',
                    'overflow-hidden',
                    'bg-tarotBlackHaze-800',
                    'shadow',
                    'rounded-xl',
                    'border',
                    'border-tarotBlackHaze-300',
                    'hover:shadow-xl',
                    'hover:bg-tarotBlackHaze-850',
                    'md:filter',
                    'md:saturate-75',
                    'hover:saturate-100',
                    'transition-all',
                    'duration-500',
                    'h-full',
                    'mb-8'
                  )}>
                  <div className='flex flex-col items-center justify-start space-y-6 my-6 sm:my-2'>
                    <div className='flex space-x-4 items-center'>
                      <TarotImage
                        className={clsx(
                          'w-10',
                          'h-10'
                        )}
                        src='/assets/images/token-icons/0x5Cc61A78F164885776AA610fb0FE1257df78E59B.png'
                        placeholder='/assets/images/default.png'
                        error='/assets/images/default.png'
                        alt='SPIRIT' />
                      <FontAwesomeIcon
                        className='text-tarotJade-200'
                        icon={faChevronRight} />
                      <TarotImage
                        className={clsx(
                          'w-10',
                          'h-10'
                        )}
                        src={`/assets/images/token-icons/${getAddress(TINSPIRIT_ADDRESS)}.png`}
                        placeholder='/assets/images/default.png'
                        error='/assets/images/default.png'
                        alt='tinSPIRIT' />
                    </div>
                    <div className='flex flex-row sm:bg-tarotBlackHaze sm:border items-center border-tarotBlackHaze-400 rounded-lg p-4 sm:p-8 space-x-4 mt-2 mb-2 sm:w-full'>
                      <div className='text-center text-sm text-textSecondary'>The journey begins as you receive <b>tinSPIRIT</b> in exchange for locking SPIRIT, used for boost across all Spirit Boosted pools.</div>
                    </div>
                    {web3ChainId &&
                    <InteractionButton
                      className='text-sm xs:text-base sm:text-lg'
                      name='Get tinSPIRIT'
                      onCall={() => toggleMintModal(true)}
                      state={ButtonState.Ready} />

                    }
                  </div>
                </div>
                <div className='mb-8 text-xl sm:text-2xl text-tarotJade-200 text-center'>
                  <FontAwesomeIcon icon={faChevronDown} />
                </div>
              </>}
              <div
                className={clsx(
                  'p-0',
                  'sm:p-6',
                  'overflow-hidden',
                  'bg-tarotBlackHaze-800',
                  'shadow',
                  'rounded-xl',
                  'border',
                  'border-tarotBlackHaze-300',
                  'hover:shadow-xl',
                  'hover:bg-tarotBlackHaze-850',
                  'md:filter',
                  'md:saturate-75',
                  'hover:saturate-100',
                  'transition-all',
                  'duration-500',
                  'h-full'
                )}>
                {chainId === CHAIN_IDS.FANTOM ?
                  <SupplyVaultCard
                    isDashboard={false}
                    supplyVaultAddress={supplyVaultAddress} /> :
                  <div>Please connect to Fantom</div>
                }
              </div>
            </div>
          </div>
        </div>
      </div>
      {web3ChainId && chainId === CHAIN_IDS.FANTOM &&
      <MintInteractionModal
        show={showMintModal}
        toggleShow={toggleMintModal} />
      }
    </div>
  );
};

const WrappedEscrowSPIRIT = (): JSX.Element | null => {
  return <WrappedEscrowSPIRITContent />;
};

export default WrappedEscrowSPIRIT;