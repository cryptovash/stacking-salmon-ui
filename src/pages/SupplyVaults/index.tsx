
import clsx from 'clsx';
import { XTAROT_ADDRESSES } from '../../config/web3/contracts/tarot';
import { useWeb3React } from '@web3-react/core';
import { Web3Provider } from '@ethersproject/providers';
import SupplyVaultCard from '../../components/SupplyVaultCard';
import { SUPPLY_VAULTS } from '../../config/web3/contracts/supply-vault';
import { useFullSupplyVaultsData } from '../../hooks/useData';
import { LAYOUT } from '../../utils/constants/styles';
import { ReactComponent as SpinIcon } from '../../assets/images/icons/spin.svg';
import { XTINSPIRIT_ADDRESS } from '../../config/web3/contracts/wrapped-escrow-spirit';
import { useDefaultChainId } from '../../hooks/useTarotRouter';
import React from 'react';

const SupplyVaultsContent = (): JSX.Element | null => {
  const { chainId: web3ChainId } = useWeb3React<Web3Provider>();
  const defaultChainId = useDefaultChainId();
  const chainId = web3ChainId || defaultChainId;
  const fullSupplyVaultsData = useFullSupplyVaultsData();
  if (!fullSupplyVaultsData) {
    return (
      <div
        className='z-tarotAppBar bg-tarotBlackHaze fixed left-0 min-w-full flex justify-center items-center'
        style={{ top: `${LAYOUT.appBarHeight}px`, height: `calc(100% - ${LAYOUT.appBarHeight}px)` }}>
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
  const supplyVaults = SUPPLY_VAULTS[chainId] || {};
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
        <div className='self-center flex flex-col p-2 space-y-4 mb-0 w-full'>
          <div className='flex flex-col justify-around !mt-0 !mb-4'>
            <div className='flex flex-col items-center'>
              <div className='!mb-8 text-3xl text-textPrimary font-semibold'>Supply Vaults</div>
              <div className='!mb-4 text-xl text-tarotJade-200'>Deposit &amp; Earn</div>
              <div className='!mb-8 text-sm sm:text-base text-center font-thin'>Automated strategies earn yield across multiple lending pools</div>
            </div>
          </div>
        </div>
      </div>
      <div className='w-full xl:px-24'>
        <div
          className={clsx(
            'grid',
            'grid-cols-1',
            'lg:grid-cols-2',
            'gap-x-8',
            'gap-y-8',
            'auto-rows-fr')}>
          {Object.keys(supplyVaults).filter(x => x.toLowerCase() !== XTAROT_ADDRESSES[chainId].toLowerCase() && x.toLowerCase() !== XTINSPIRIT_ADDRESS.toLowerCase() && !SUPPLY_VAULTS[chainId][x].paused).map(supplyVaultAddress =>

            <div
              key={supplyVaultAddress}
              className={clsx(
                'p-6',
                'overflow-hidden',
                'bg-tarotBlackHaze-750',
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
                'duration-350',
                'h-full'
              )}><SupplyVaultCard
                isDashboard={false}
                supplyVaultAddress={supplyVaultAddress} />
            </div>)}

        </div>
      </div>
    </div>
  );
};

const SupplyVaults = (): JSX.Element | null => {
  return <SupplyVaultsContent />;
};

export default SupplyVaults;