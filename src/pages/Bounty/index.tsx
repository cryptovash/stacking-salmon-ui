
import clsx from 'clsx';

import { useWeb3React } from '@web3-react/core';
import { Web3Provider } from '@ethersproject/providers';
import PairAddressContext from '../../contexts/PairAddress';
import { ReactComponent as SpinIcon } from '../../assets/images/icons/spin.svg';
import BountyPair from './BountyPair';
import { LENDING_POOLS_LIST } from '../../config/web3/contracts/lending-pools';
import { useFullLendingPools } from '../../hooks/useData';
import { CHAIN_IDS } from '../../config/web3/chains';
import { useDefaultChainId } from '../../hooks/useTarotRouter';
import React from 'react';

const Bounty = (): JSX.Element | null => {
  const fullLendingPools = useFullLendingPools();
  const { chainId: web3ChainId } = useWeb3React<Web3Provider>();
  const defaultChainId = useDefaultChainId();
  const chainId = web3ChainId || defaultChainId;
  const pairList = LENDING_POOLS_LIST.filter(pool => chainId === (pool.chainId || CHAIN_IDS.FANTOM) && pool.isTarotVault && !pool.poolDisabled).map(pool => pool.lendingPoolAddress);

  if (!pairList || !fullLendingPools) {
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

  if (pairList && pairList.length === 0) {
    return (<div className='info'>There are no bounties available yet.</div>);
  }

  if (pairList && pairList.length > 0) {
    return (
      <div className='mt-6 space-y-3 lg:mx-4'>
        <div className='mb-12'>
          <span className='text-xl text-textSecondary'>Reinvest pending rewards for Tarot Vaults and receive a bounty.</span>
        </div>
        <h2 className='text-2xl font-semibold'>Vault Bounties</h2>
        <div
          className={clsx(
            'grid',
            'grid-cols-1',
            'lg:grid-cols-4',
            'gap-x-8',
            'gap-y-8',
            'auto-rows-fr')}>
          {pairList.map(pair => {
            return (
              <PairAddressContext.Provider
                value={pair}
                key={pair}>
                <BountyPair />
              </PairAddressContext.Provider>
            );
          })}
        </div>
      </div>
    );
  }

  return null;
};

export default Bounty;