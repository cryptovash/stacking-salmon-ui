
import clsx from 'clsx';
import { ReactComponent as TAROT } from '../../assets/images/icons/tarot-logo.svg';
import { ReactComponent as XTAROT } from '../../assets/images/icons/xtarot-logo.svg';
import { ReactComponent as XTAROTRays } from '../../assets/images/icons/xtarot-rays.svg';
import { ReactComponent as XTAROTFace } from '../../assets/images/icons/xtarot-face.svg';
import { ReactComponent as XTAROTX1 } from '../../assets/images/icons/xtarot-x1.svg';
import { ReactComponent as XTAROTX2 } from '../../assets/images/icons/xtarot-x2.svg';
import { ReactComponent as XTAROTX3 } from '../../assets/images/icons/xtarot-x3.svg';
import { XTAROT_ADDRESSES } from '../../config/web3/contracts/tarot';
import { useWeb3React } from '@web3-react/core';
import { Web3Provider } from '@ethersproject/providers';
import SupplyVaultCard from '../../components/SupplyVaultCard';
import { X_STAKING_POOLS } from '../../config/web3/contracts/x-staking-pool';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import XStakingPoolCard from '../../components/XStakingPoolCard';
import { faSun } from '@fortawesome/free-solid-svg-icons';
import { CHAIN_IDS } from '../../config/web3/chains';
import { useDefaultChainId } from '../../hooks/useTarotRouter';
import { useState } from 'react';
import { CheckSquare, Square } from 'react-feather';
import React from 'react';

const StakeContent = (): JSX.Element | null => {
  const { chainId: web3ChainId } = useWeb3React<Web3Provider>();
  const defaultChainId = useDefaultChainId();
  const chainId = web3ChainId || defaultChainId;
  const supplyVaultAddress = XTAROT_ADDRESSES[CHAIN_IDS.FANTOM].toLowerCase();
  const xStakingPoolIds = Object.keys(X_STAKING_POOLS[chainId] || {});
  const [hideInactivePools, setHideInactivePools] = useState(true);

  const toggleHideInactivePools = () => {
    setHideInactivePools(!hideInactivePools);
  };
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
                <XTAROT
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
                    <XTAROTX1
                      className={clsx(
                        'absolute',
                        'w-24',
                        'h-24'
                      )} />
                    <XTAROTX2
                      className={clsx(
                        'absolute',
                        'w-24',
                        'h-24'
                      )} />
                    <XTAROTX3
                      className={clsx(
                        'absolute',
                        'w-24',
                        'h-24'
                      )} />
                    <XTAROTRays
                      className={clsx(
                        'w-24',
                        'h-24'
                      )} />
                  </div>
                  <XTAROTFace
                    className={clsx(
                      'absolute',
                      'w-24',
                      'h-24'
                    )} />
                </div>
                <TAROT
                  className={clsx(
                    'animate-fade-out',
                    'w-24',
                    'h-24'
                  )} />
              </div>
              <div className='text-xl sm:text-2xl text-textPrimary font-semibold'>xTAROT</div>
              <div className='!mb-8 text-lg text-textSecondary'>Staking &amp; Governance</div>
              <div className='!mb-8 text-sm sm:text-base text-center font-semibold'>The gateway for on-chain governance and fee distribution of the Tarot Protocol</div>
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
      {xStakingPoolIds.length > 0 &&
      <>
        <div className='mt-12 text-xl sm:text-2xl text-textSecondary text-center'>
          <FontAwesomeIcon icon={faSun} />
        </div>
        <div className='mt-12 text-xl sm:text-2xl text-textPrimary font-semibold text-center'>xStaking</div>
        <div className='text-sm sm:text-base text-textSecondary text-center'>Stake xTAROT for additional rewards</div>
        <div
          className='!mt-2 !mb-4 flex text-center justify-center items-center text-sm'>
          <div
            onClick={() => {
              toggleHideInactivePools();
            }}
            className='flex flex-grow-0 cursor-pointer items-center'>
            <span className='mr-2'>Hide inactive pools?</span>
            <div className='mt-0'>{hideInactivePools ? <CheckSquare className='h-4' /> : <Square className='h-4' />}</div>
          </div>
        </div>
        <div className='w-full xl:px-24'>
          <div
            className='flex flex-wrap justify-center'>
            {xStakingPoolIds.map((poolId: any) =>
              <XStakingPoolCard
                key={poolId}
                hideInactive={hideInactivePools}
                isDashboard={false}
                poolId={poolId} />
            )
            }
          </div>
        </div>
      </>
      }
    </div>
  );
};

const Stake = (): JSX.Element | null => {
  return <StakeContent />;
};

export default Stake;
