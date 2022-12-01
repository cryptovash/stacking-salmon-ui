
import { Web3Provider } from '@ethersproject/providers';
import { useWeb3React } from '@web3-react/core';
import { ReactComponent as SpinIcon } from '../../assets/images/icons/spin.svg';
import clsx from 'clsx';
import { CHAIN_IDS } from '../../config/web3/chains';
import { DISTRIBUTOR_ADDRESSES } from '../../config/web3/contracts/distributors';
import { BigNumber } from 'ethers';
import { useUserDistributionMap } from '../../hooks/useData';
import ClaimDistributor from '../../pages/Claim/ClaimDistributor';
import React from 'react';

const Claim = (): JSX.Element | null => {
  const { chainId } = useWeb3React<Web3Provider>();
  const userDistributionMap = useUserDistributionMap();

  if (!chainId || chainId !== CHAIN_IDS.FANTOM) {
    return (
      <div
        className={clsx(
          'p-7',
          'flex',
          'justify-center'
        )}>
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
            'max-w-xs',
            'text-center'
          )}>
          <div>{chainId ? 'Please connect to Fantom' : 'Connect to view claims'}</div>
        </div>
      </div>
    );
  }

  const distributors = DISTRIBUTOR_ADDRESSES[chainId] || [];

  if (!userDistributionMap) {
    return (
      <div
        className={clsx(
          'p-7',
          'flex',
          'justify-center'
        )}>
        <SpinIcon
          className={clsx(
            'animate-spin',
            'w-8',
            'h-8',
            'text-tarotJade-200',
            'filter',
            'brightness-150'
          )} />
      </div>
    );
  }
  const userDistributions = Object.values(userDistributionMap).filter(d => BigNumber.from(d.claimableSharePct).gt(0)).sort((a, b) => a.config.name.localeCompare(b.config.name));
  const hasAnyAvailableClaimable = userDistributions.length > 0;

  if (distributors && distributors.length === 0) {
    return (
      <div
        className={clsx(
          'p-7',
          'flex',
          'justify-center'
        )}><div className='info'>There are no claims available yet.</div>
      </div>);
  }

  if (distributors && !hasAnyAvailableClaimable) {
    return (
      <div
        className={clsx(
          'p-7',
          'flex',
          'justify-center'
        )}><div className='info'>You do not have any pending TAROT distribution claims.</div>
      </div>);
  }

  if (distributors && userDistributions.length > 0) {
    return (
      <div className='mt-6 space-y-3 lg:mx-4'>
        <div className='mb-12'>
          <span className='text-xl text-textSecondary'>Pending TAROT claims are shown below.</span>
        </div>
        <h2 className='text-2xl font-semibold'>Distribution Claims</h2>
        <div
          className={clsx(
            'grid',
            'grid-cols-1',
            'lg:grid-cols-3',
            'gap-x-8',
            'gap-y-8',
            'auto-rows-fr')}>
          {userDistributions.map(d => {
            return (
              <ClaimDistributor
                chainId={chainId}
                distribution={d}
                key={d.config.name} />
            );
          })}
        </div>
      </div>
    );
  }

  return null;
};

export default Claim;