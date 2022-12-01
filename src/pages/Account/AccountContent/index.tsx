// TODO: <
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// TODO: >

import * as React from 'react';
import clsx from 'clsx';

import BorrowPosition from './BorrowPosition';
import SupplyPosition from './SupplyPosition';
import AccountOverallStats from './AccountOverallStats';
import PairAddressContext from '../../../contexts/PairAddress';

import { ReactComponent as SpinIcon } from '../../../assets/images/icons/spin.svg';
import './account-content.scss';
import { useAccountTotalValueLocked, useBorrowPositions, useSupplyPositions } from '../../../hooks/useAccountData';
import { InputGroup } from 'react-bootstrap';
import { CheckSquare, Search, Square, X } from 'react-feather';
import { useWeb3React } from '@web3-react/core';
import { Web3Provider } from '@ethersproject/providers';
import { SUPPLY_VAULTS } from '../../../config/web3/contracts/supply-vault';
import SupplyVaultCard from '../../../components/SupplyVaultCard';
import { useHasBalances, useTotalAvailableReward, useXStakingPositionsForAccount } from '../../../hooks/useData';
import useAccount from '../../../hooks/useAccount';
import XStakingPoolCard from '../../../components/XStakingPoolCard';
import TarotImage from '../../../components/UI/TarotImage';
import { TAROT_ADDRESSES } from '../../../config/web3/contracts/tarot';
import { getAddress } from '@ethersproject/address';
import { formatAmount, formatFloat } from '../../../utils/format';
import useClaimAllFarmingRewards from '../../../hooks/useClaimAllFarmingRewards';
import useTarotRouter, { useDefaultChainId } from '../../../hooks/useTarotRouter';
import InteractionButton from '../../../components/InteractionButton';

const AccountContent = (): JSX.Element => {
  const { chainId: web3ChainId } = useWeb3React<Web3Provider>();
  const defaultChainId = useDefaultChainId();
  const chainId = web3ChainId || defaultChainId;
  const router = useTarotRouter();
  const tarotAddress = TAROT_ADDRESSES[chainId];
  const accountTVL = useAccountTotalValueLocked();
  const borrowPositions = useBorrowPositions();
  const supplyPositions = useSupplyPositions();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [hideDust, setHideDust] = React.useState(true);
  const account = useAccount();
  const supplyVaultsWithBalance = useHasBalances(Object.keys(SUPPLY_VAULTS[chainId] || {}), account);
  const xStakingPositions = useXStakingPositionsForAccount(account);
  const totalAvailableReward = useTotalAvailableReward(account);
  const [claimAllFarmingRewardsState, onClaimAllFarmingRewards] = useClaimAllFarmingRewards();

  const handleChange = (event: any) => {
    setSearchTerm(event.target.value);
  };

  const toggleHideDust = () => {
    setHideDust(!hideDust);
  };

  const xStakingCards = React.useMemo(() => {
    const poolIds = Object.keys(xStakingPositions);
    if (!poolIds || poolIds.length === 0) {
      return (<></>);
    }
    const positions = poolIds.map(poolId => {
      return (
        <XStakingPoolCard
          key={poolId}
          poolId={Number(poolId)}
          isDashboard={true}
          searchTerm={searchTerm}
          hideDust={hideDust}
          account={account} />
      );
    });
    return (
      <div className='mt-12 space-y-3 lg:mx-4'>
        <h2 className='mt-6 text-2xl font-semibold'>xStaking Positions</h2>
        <div
          className={clsx(
            'position-card-list',
            'grid',
            'grid-cols-1',
            'md:grid-cols-2',
            'lg:grid-cols-3',
            'gap-x-8',
            'gap-y-8',
            'auto-rows-fr')}>
          {positions}
        </div>
      </div>);
  }, [searchTerm, xStakingPositions, hideDust]);

  const supplyVaultCards = React.useMemo(() => {
    if (!supplyVaultsWithBalance || supplyVaultsWithBalance.length === 0) {
      return (<></>);
    }
    const positions = supplyVaultsWithBalance.map(supplyVaultAddress => {
      return (
        <SupplyVaultCard
          key={supplyVaultAddress}
          supplyVaultAddress={supplyVaultAddress}
          isDashboard={true}
          searchTerm={searchTerm}
          hideDust={hideDust}
          account={account} />
      );
    });
    return (
      <div className='mt-12 space-y-3 lg:mx-4'>
        <h2 className='mt-6 text-2xl font-semibold'>Supply Vault Positions</h2>
        <div
          className={clsx(
            'position-card-list',
            'grid',
            'grid-cols-1',
            'md:grid-cols-2',
            'lg:grid-cols-3',
            'gap-x-8',
            'gap-y-8',
            'auto-rows-fr')}>
          {positions}
        </div>
      </div>);
  }, [searchTerm, supplyVaultsWithBalance, hideDust]);

  const borrowCards = React.useMemo(() => {
    if (!borrowPositions || borrowPositions.length === 0) {
      return (<></>);
    }
    const positions = borrowPositions.map(pair => {
      return (
        <PairAddressContext.Provider
          value={pair}
          key={pair}>
          <BorrowPosition
            searchTerm={searchTerm}
            hideDust={hideDust} />
        </PairAddressContext.Provider>
      );
    });
    return (
      <div className='mt-12 space-y-3 lg:mx-4'>
        <h2 className='mt-6 text-2xl font-semibold'>Borrow Positions</h2>
        <div
          className={clsx(
            'position-card-list',
            'grid',
            'grid-cols-1',
            'md:grid-cols-2',
            'lg:grid-cols-3',
            'gap-x-8',
            'gap-y-8',
            'auto-rows-fr')}>
          {positions}
        </div>
      </div>);
  }, [searchTerm, borrowPositions, hideDust]);

  const supplyCards = React.useMemo(() => {
    if (!supplyPositions || supplyPositions.length === 0) {
      return (<></>);
    }
    const positions = supplyPositions.map(pair => {
      return (
        <PairAddressContext.Provider
          value={pair}
          key={pair}>
          <SupplyPosition
            searchTerm={searchTerm}
            hideDust={hideDust} />
        </PairAddressContext.Provider>
      );
    });
    return (
      <div className='mt-12 space-y-3 lg:mx-4'>
        <h2 className='mt-6 text-2xl font-semibold'>Supply Positions</h2>
        <div
          className={clsx(
            'position-card-list',
            'grid',
            'grid-cols-1',
            'md:grid-cols-2',
            'lg:grid-cols-3',
            'gap-x-8',
            'gap-y-8',
            'auto-rows-fr')}>
          {positions}
        </div>
      </div>);
  }, [searchTerm, supplyPositions, hideDust]);

  if (typeof accountTVL === 'undefined' || !borrowPositions || !supplyPositions || supplyVaultsWithBalance === null) {
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

  if (xStakingPositions && Object.keys(xStakingPositions).length === 0 && supplyVaultsWithBalance && supplyVaultsWithBalance.length === 0 && borrowPositions && borrowPositions.length === 0 && supplyPositions && supplyPositions.length === 0) {
    return (
      <div
        className={clsx(
          'p-7',
          'flex',
          'justify-center'
        )}>
        <span className='text-lg text-textSecondary'>No borrow or supply positions to display.</span>
      </div>
    );
  }

  return (
    <>
      <AccountOverallStats />
      {totalAvailableReward > 0 &&
      <div className='flex flex-row p-4 justify-center'>
        <div className='flex flex-col flex-grow lg:flex-grow max-w-2xl space-y-3 items-center p-6 rounded-lg border border-tarotBlackHaze-500 bg-tarotBlackHaze-800'>
          <h2 className='text-xl'>Farming Rewards</h2>
          <div className='flex flex-row space-x-2 items-center'>
            <TarotImage
              width={20}
              height={20}
              // TODO: could componentize
              className={clsx(
                'inline-block',
                'rounded-full'
              )}
              src={`/assets/images/token-icons/${getAddress(tarotAddress)}.png`}
              placeholder='/assets/images/default.png'
              error='/assets/images/default.png'
              alt='TAROT' />
            <div
              className='text-lg'
              title={`${formatFloat(totalAvailableReward)} TAROT`}>{formatAmount(totalAvailableReward)}
            </div>
          </div>
          {router.account && router.account.toLowerCase() === account.toLowerCase() &&
          <div>
            <InteractionButton
              name='Harvest All'
              onCall={onClaimAllFarmingRewards}
              state={claimAllFarmingRewardsState} />
          </div>
          }
        </div>
      </div>
      }
      <div className='flex space-x-4 p-7 -mb-7 pb-0 pr-0 items-end flex-col-reverse lg:pr-7 lg:flex-row lg:items-center'>
        <div className='flex justify-end text-xl text-textSecondary mb-3 flex-grow lg:whitespace-nowrap'>
          <div
            className='flex items-center cursor-pointer mr-2'
            onClick={() => {
              toggleHideDust();
            }}><span className='mr-2'>Hide dust?</span>{hideDust ? <CheckSquare /> : <Square />}
          </div>
        </div>
        <InputGroup className='w-4/5 lg:w-1/4 py-2 flex-nowrap mb-3 bg-tarotBlackHaze-800 border rounded-lg border-tarotBlackHaze-100'>
          <InputGroup.Prepend className='self-center ml-2 text-textSecondary'>
            <Search />
          </InputGroup.Prepend>
          <div className='flex flex-grow items-end'>
            <input
              className='flex-grow w-0 overflow-visible bg-tarotBlackHaze-800 focus:outline-none border-none focus:ring-transparent focus:border-transparent'
              value={searchTerm}
              onChange={handleChange}
              // universal input options
              title='Filter'
              autoComplete='off'
              autoCorrect='off'
              // text-specific options
              type='text'
              placeholder='Filter'
              minLength={1}
              maxLength={79}
              spellCheck='false' />
          </div>
          {searchTerm && searchTerm.trim().length > 0 &&
              <InputGroup.Append className='text-textSecondary self-center pr-3'>
                <X
                  className='cursor-pointer'
                  onClick={() => {
                    setSearchTerm('');
                  }} />
              </InputGroup.Append>
          }
        </InputGroup>
      </div>
      {borrowPositions && borrowPositions.length > 0 && (
        borrowCards
      )}
      {xStakingPositions && Object.keys(xStakingPositions).length > 0 && (
        xStakingCards
      )}
      {supplyVaultsWithBalance && supplyVaultsWithBalance.length > 0 && (
        supplyVaultCards
      )}
      {supplyPositions && supplyPositions.length > 0 && (
        supplyCards
      )}
    </>
  );
};

export default AccountContent;