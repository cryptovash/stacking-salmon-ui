import * as React from 'react';
import clsx from 'clsx';
import { useWeb3React } from '@web3-react/core';
import { Web3Provider } from '@ethersproject/providers';
import { useBoostMaxxPools } from '../../hooks/useData';
import BoostMaxxPoolCard from '../../components/BoostMaxxPoolCard';
import { BoostMaxxPoolInfo } from '../../types/interfaces';
import { ReactComponent as SpinIcon } from '../../assets/images/icons/spin.svg';
import { Menu } from '@headlessui/react';
import { Search, X } from 'react-feather';
import { InputGroup } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilter, faSortAmountDown } from '@fortawesome/free-solid-svg-icons';
import { formatUnits } from 'ethers/lib/utils';
import { useDefaultChainId } from '../../hooks/useTarotRouter';

enum SortType {
  DEFAULT,
  APR,
  TOTAL_STAKED,
  DEPOSITED_LP,
  PENDING_REWARDS
}

interface SortOption {
  type: SortType;
  label: string;
  fn: (a: BoostMaxxPoolInfo, b: BoostMaxxPoolInfo) => number;
}

const SORT_OPTIONS: SortOption[] = [
  {
    type: SortType.DEFAULT,
    label: 'Default Sort',
    fn: () => 0
  },
  {
    type: SortType.APR,
    label: 'APR Estimate',
    fn: (a, b) => parseFloat(formatUnits(b.apr)) - parseFloat(formatUnits(a.apr))
  },
  {
    type: SortType.TOTAL_STAKED,
    label: 'Staked TVL',
    fn: (a, b) => parseFloat(formatUnits(b.totalDepositsUSD)) - parseFloat(formatUnits(a.totalDepositsUSD))
  },
  {
    type: SortType.DEPOSITED_LP,
    label: 'Deposited LP',
    fn: (a, b) => parseFloat(formatUnits(b.userDepositsUSD)) - parseFloat(formatUnits(a.userDepositsUSD))
  },
  {
    type: SortType.PENDING_REWARDS,
    label: 'Claimable SOLID',
    fn: (a, b) => parseFloat(formatUnits(b.pendingReward)) - parseFloat(formatUnits(a.pendingReward))
  }
];

enum FilterType {
  DEFAULT,
  MY_DEPOSITS,
  HAS_REWARDS,
  MY_LP
}

interface FilterOption {
  type: FilterType;
  label: string;
  fn: (a: BoostMaxxPoolInfo) => boolean;
}
const FILTER_OPTIONS: FilterOption[] = [
  {
    type: FilterType.DEFAULT,
    label: 'All Pools',
    fn: () => true
  },
  {
    type: FilterType.MY_DEPOSITS,
    label: 'My Deposits',
    fn: a => a.userDeposits.gt(0)
  },
  {
    type: FilterType.MY_LP,
    label: 'LP in Wallet',
    fn: a => a.userLpBalance.gt(0)
  },
  {
    type: FilterType.HAS_REWARDS,
    label: 'Earns Rewards',
    fn: a => a.apr.gt(0)
  }
];

const BoostContent = (): JSX.Element | null => {
  const { chainId: web3ChainId } = useWeb3React<Web3Provider>();
  const defaultChainId = useDefaultChainId();
  const chainId = web3ChainId || defaultChainId;

  const boostMaxxPools = useBoostMaxxPools();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [searchResults, setSearchResults] = React.useState([] as BoostMaxxPoolInfo[]);
  const [selectedSort, setSelectedSort] = React.useState<SortOption>(SORT_OPTIONS[0]);
  const [selectedFilter, setSelectedFilter] = React.useState<FilterOption>(FILTER_OPTIONS[0]);

  const handleChange = (event: any) => {
    setSearchTerm(event.target.value);
  };

  React.useEffect(() => {
    if (!searchTerm) {
      setSearchResults(boostMaxxPools || []);
      return;
    }
    const terms = searchTerm.toLowerCase().replace(/[-\/]/, ' ').trim().split(' ');
    const results = (boostMaxxPools || []).filter(x => {
      if (chainId === undefined) {
        return true;
      }
      const symbol = x.symbol;
      return terms.every(term =>
        symbol.toLowerCase().includes(term)
      );
    });
    setSearchResults(results);
  }, [searchTerm, boostMaxxPools]);

  if (!boostMaxxPools || chainId === undefined) {
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

  if (boostMaxxPools.length === 0) {
    return (
      <div
        className={clsx(
          'p-7',
          'flex',
          'justify-center'
        )}>
        <div>No pools to display</div>
      </div>
    );
  }

  const sortMenu = () => {
    return (
      <div className='!ml-0 py-3 lg:py-0 lg:pr-4 relative'>
        <Menu>
          <Menu.Button className='focus:outline-none flex flex-row items-center space-x-2'>
            <FontAwesomeIcon
              className='focus:outline-none text-textSecondary'
              icon={faSortAmountDown} />
            <div className='whitespace-nowrap'>{selectedSort.label}</div>
          </Menu.Button>
          <Menu.Items className='absolute z-tarotModal flex flex-col border border-tarotBlackHaze-750 bg-tarotBlackHaze-850 py-0 shadow-lg'>

            {SORT_OPTIONS.map((sortOption, i) => (
              <Menu.Item
                key={i}>
                {() => (
                  <div
                    onClick={() => {
                      setSelectedSort(sortOption);
                    }}
                    className={clsx(
                      selectedSort.type === sortOption.type ?
                        'bg-tarotJade-400 border-gray-200 text-textPrimary' :
                        'border-transparent text-textSecondary hover:bg-tarotJade-700',
                      'block',
                      'whitespace-nowrap',
                      'pl-4',
                      'pr-4',
                      'py-2',
                      'border-l-4',
                      'text-sm',
                      'font-medium',
                      'cursor-pointer'
                    )}>
                    {sortOption.label}
                  </div>
                )}
              </Menu.Item>

            ))}
          </Menu.Items>
        </Menu>
      </div>
    );
  };

  const filterMenu = () => {
    return (
      <div className='!ml-0 py-3 lg:py-0 lg:pr-4 relative'>
        <Menu>
          <Menu.Button className='focus:outline-none flex flex-row items-center space-x-2'>
            <FontAwesomeIcon
              className='focus:outline-none text-textSecondary'
              icon={faFilter} />
            <div className='whitespace-nowrap'>{selectedFilter.label}</div>
          </Menu.Button>
          <Menu.Items className='absolute z-tarotModal flex flex-col border border-tarotBlackHaze-750 bg-tarotBlackHaze-850 py-0 shadow-lg'>

            {FILTER_OPTIONS.map((filterOption, i) => (
              <Menu.Item
                key={i}>
                {() => (
                  <div
                    onClick={() => {
                      setSelectedFilter(filterOption);
                    }}
                    className={clsx(
                      selectedFilter.type === filterOption.type ?
                        'bg-tarotJade-400 border-gray-200 text-textPrimary' :
                        'border-transparent text-textSecondary hover:bg-tarotJade-700',
                      'block',
                      'whitespace-nowrap',
                      'pl-4',
                      'pr-4',
                      'py-2',
                      'border-l-4',
                      'text-sm',
                      'font-medium',
                      'cursor-pointer'
                    )}>
                    {filterOption.label}
                  </div>
                )}
              </Menu.Item>

            ))}
          </Menu.Items>
        </Menu>
      </div>
    );
  };

  const filterInput = () => {
    return (
      <InputGroup className='!ml-0 w-full lg:w-1/4 py-2 flex-nowrap mb-2 lg:mb-3 bg-tarotBlackHaze-800 border rounded-lg border-tarotBlackHaze-100'>
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
            placeholder='Filter pools'
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
    );
  };

  const filteredSearchResults = [...searchResults].filter(selectedFilter.fn);

  return (
    <>
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
                <div className='!mb-8 text-3xl text-textPrimary font-semibold'>BoostMaxx</div>
                <div className='!mb-4 text-xl text-tarotJade-200'>Boosted SOLID Rewards</div>
                <div className='!mb-8 text-sm sm:text-base text-center font-thin'>Deposit Solidly LP to earn boosted SOLID rewards</div>
              </div>
            </div>
          </div>
        </div>

        <div className='space-y-3 lg:mx-4'>
          <div className='flex space-x-4 items-center flex-wrap lg:flex-nowrap'>
            <h2 className='text-2xl font-semibold flex-grow min-w-full lg:min-w-0 lg:whitespace-nowrap'>Solidly Pools</h2>
            <div className='flex flex-grow space-x-2 flex-col lg:flex-row lg:justify-end'>
              {filterMenu()}
              {sortMenu()}
            </div>
            {filterInput()}
          </div>
          {((searchTerm.toLowerCase().replace(/[-\/]/, ' ').trim().length > 0 || selectedFilter.type !== FILTER_OPTIONS[0].type) && filteredSearchResults.length === 0) ? <div className='flex justify-center items-center pt-12'><span className='text-lg text-textSecondary'>No pools to display</span></div> :
            <div
              className={clsx(
                'grid',
                'grid-cols-1',
                'lg:grid-cols-2',
                'gap-x-8',
                'gap-y-8',
                'auto-rows-fr')}>
              {filteredSearchResults.sort(selectedSort.fn).map(poolInfo => {
                return (
                  <div
                    key={poolInfo.id}
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
                    )}><BoostMaxxPoolCard
                      poolInfo={poolInfo} />
                  </div>
                );
              })}
            </div>
          }
        </div>
      </div>
    </>
  );
};

const Boost = (): JSX.Element | null => {
  return <BoostContent />;
};

export default Boost;