import * as React from 'react';
import * as R from 'ramda';
import { useWeb3React } from '@web3-react/core';
import { Web3Provider } from '@ethersproject/providers';
import clsx from 'clsx';
import { useDebounce, useMedia } from 'react-use';
import {
  withErrorBoundary
} from 'react-error-boundary';

import ErrorFallback from '../../../components/ErrorFallback';
import { BREAKPOINTS } from '../../../utils/constants/styles';
import { ReactComponent as SpinIcon } from '../../../assets/images/icons/spin.svg';
import { Search, X } from 'react-feather';
import { InputGroup } from 'react-bootstrap';
import { useFullLendingPools } from '../../../hooks/useData';
import { FilterType, PairFilterType, PoolDisplayDetails, SortType } from '../../../types/interfaces';
import { Menu } from '@headlessui/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilter, faSortAmountDown, faToggleOff } from '@fortawesome/free-solid-svg-icons';
import { DEX } from '../../../config/web3/dexs';
import { VaultType } from '../../../config/web3/contracts/vault-details';
import { TOKEN_INFO } from '../../../config/web3/contracts/token-info';
import InteractionButton, { ButtonState } from '../../../components/InteractionButton';
import FlipCard from '../../../components/LendingPoolCard/flip';
import { LENDING_POOL_DETAILS_MAP } from '../../../config/web3/contracts/lending-pools';
import { useDefaultChainId } from '../../../hooks/useTarotRouter';
import { CHAIN_DETAILS, CHAIN_IDS } from '../../../config/web3/chains';

interface SortOption {
  type: SortType;
  label: string;
  fn: (a: PoolDisplayDetails, b: PoolDisplayDetails) => number;
}

const getSortOptions = (nativeSymbol: string): SortOption[] => [
  {
    type: SortType.DEFAULT,
    label: 'Default Sort',
    fn: () => 0
  },
  {
    type: SortType.DEPOSITED_LP,
    label: 'Deposited LP',
    fn: (a, b) => b.totalCollateralUSD - a.totalCollateralUSD
  },
  {
    type: SortType.UNLEVERAGED_APR,
    label: '1x APR',
    fn: (a, b) => b.unleveragedAPR - a.unleveragedAPR
  },
  {
    type: SortType.LEVERAGED_APR,
    label: 'Leveraged APR',
    fn: (a, b) => b.leveragedAPR - a.leveragedAPR
  },
  {
    type: SortType.FARMING_APR,
    label: 'Farming APR',
    fn: (a, b) => Math.max(b.farmingPoolAPR[0], b.farmingPoolAPR[1]) - Math.max(a.farmingPoolAPR[0], a.farmingPoolAPR[1])
  },
  {
    type: SortType.UTILIZATION,
    label: 'Utilization',
    fn: (a, b) => Math.max(b.utilization[0], b.utilization[1]) - Math.max(a.utilization[0], a.utilization[1])
  },
  {
    type: SortType.WETH_UTILIZATION,
    label: `${nativeSymbol} Utilization`,
    fn: (a, b) => (b.symbol[0] === nativeSymbol ? b.utilization[0] : b.symbol[1] === nativeSymbol ? b.utilization[1] : 0) - (a.symbol[0] === nativeSymbol ? a.utilization[0] : a.symbol[1] === nativeSymbol ? a.utilization[1] : 0)
  },
  {
    type: SortType.SUPPLY_APR,
    label: 'Supply APR',
    fn: (a, b) => Math.max(b.supplyAPR[0], b.supplyAPR[1]) - Math.max(a.supplyAPR[0], a.supplyAPR[1])
  },
  {
    type: SortType.WETH_SUPPLY_APR,
    label: `${nativeSymbol} Supply APR`,
    fn: (a, b) => (b.symbol[0] === nativeSymbol ? b.supplyAPR[0] : b.symbol[1] === nativeSymbol ? b.supplyAPR[1] : 0) - (a.symbol[0] === nativeSymbol ? a.supplyAPR[0] : a.symbol[1] === nativeSymbol ? a.supplyAPR[1] : 0)
  },
  {
    type: SortType.BORROW_APR,
    label: 'Borrow APR',
    fn: (a, b) => Math.max(a.borrowAPR[0], a.borrowAPR[1]) - Math.max(b.borrowAPR[0], b.borrowAPR[1])
  },
  {
    type: SortType.WETH_BORROW_APR,
    label: `${nativeSymbol} Borrow APR`,
    fn: (a, b) => (a.symbol[0] === nativeSymbol ? a.borrowAPR[0] : a.symbol[1] === nativeSymbol ? a.borrowAPR[1] : 9999) - (b.symbol[0] === nativeSymbol ? b.borrowAPR[0] : b.symbol[1] === nativeSymbol ? b.borrowAPR[1] : 9999)
  }
];

interface FilterOption {
  type: FilterType | PairFilterType;
  label: string;
  fn: (a: PoolDisplayDetails) => boolean;
}

const FILTER_OPTIONS_BY_CHAIN: {[chainId: number]: FilterOption[]} = {
  [CHAIN_IDS.FANTOM]: [
    {
      type: FilterType.DEFAULT,
      label: 'All Types',
      fn: () => true
    },
    {
      type: FilterType.SPIRIT,
      label: 'Spirit',
      fn: a => a.vaultDetails ? false : a.dex.id === DEX.SPIRIT
    },
    {
      type: FilterType.SPIRIT_BOOSTED,
      label: 'Spirit Boosted',
      fn: a => a.vaultDetails ? a.vaultDetails.type === VaultType.SPIRIT_BOOSTED : false
    },
    {
      type: FilterType.SPIRIT_V2,
      label: 'Spirit V2',
      fn: a => a.vaultDetails ? a.vaultDetails.type === VaultType.SPIRIT_V2 : false
    },
    {
      type: FilterType.SPOOKY,
      label: 'Spooky',
      fn: a => a.vaultDetails ? false : a.dex.id === DEX.SPOOKY
    },
    {
      type: FilterType.SPOOKY_V2,
      label: 'Spooky V2',
      fn: a => a.vaultDetails ? a.vaultDetails.type === VaultType.SPOOKY_V2 : false
    },
    {
      type: FilterType.SUSHI,
      label: 'Sushi',
      fn: a => a.vaultDetails ? false : a.dex.id === DEX.SUSHI
    },
    {
      type: FilterType.TOMB,
      label: 'Tomb',
      fn: a => a.vaultDetails ? a.vaultDetails.type === VaultType.TOMB : false
    },
    {
      type: FilterType.LIF3,
      label: 'Tomb V2',
      fn: a => a.vaultDetails ? a.vaultDetails.type === VaultType.LIF3 : false
    },
    {
      type: FilterType.BASED,
      label: 'Based',
      fn: a => a.vaultDetails ? a.vaultDetails.type === VaultType.BASED : false
    },
    {
      type: FilterType.T2OMB,
      label: '2omb',
      fn: a => a.vaultDetails ? a.vaultDetails.type === VaultType.T2OMB : false
    },
    {
      type: FilterType.T3OMB,
      label: '3omb',
      fn: a => a.vaultDetails ? a.vaultDetails.type === VaultType.T3OMB : false
    },
    {
      type: FilterType.OXD,
      label: '0xDAO',
      fn: a => a.vaultDetails ? a.vaultDetails.type === VaultType.OXD : false
    },
    {
      type: FilterType.OXD_V1,
      label: '0xDAO (Legacy)',
      fn: a => a.vaultDetails ? a.vaultDetails.type === VaultType.OXD_V1 : false
    },
    {
      type: FilterType.VEDAO,
      label: 'veDAO',
      fn: a => a.vaultDetails ? a.vaultDetails.type === VaultType.VEDAO : false
    },
    {
      type: FilterType.SOLIDEX,
      label: 'Solidex',
      fn: a => a.vaultDetails ? a.vaultDetails.type === VaultType.SOLIDEX : false
    }
  ],
  [CHAIN_IDS.OPTIMISM]: [
    {
      type: FilterType.DEFAULT,
      label: 'All Types',
      fn: () => true
    },
    {
      type: FilterType.VELODROME,
      label: 'Velodrome',
      fn: a => a.vaultDetails ? a.vaultDetails.type === VaultType.VELODROME : false
    },
    {
      type: FilterType.ZIP,
      label: 'ZipSwap',
      fn: a => a.vaultDetails ? a.vaultDetails.type === VaultType.ZIP : false
    }
  ],
  [CHAIN_IDS.ARBITRUM]: [
    {
      type: FilterType.DEFAULT,
      label: 'All Types',
      fn: () => true
    },
    {
      type: FilterType.XCAL,
      label: '3xcalibur',
      fn: a => a.vaultDetails ? a.vaultDetails.type === VaultType.XCAL : false
    }
  ],
  [CHAIN_IDS.ETHEREUM_MAIN_NET]: [
    {
      type: FilterType.DEFAULT,
      label: 'All Types',
      fn: () => true
    }
  ]
};

const PAIR_FILTER_OPTIONS_BY_CHAIN: {[chainId: number]: FilterOption[]} = {
  [CHAIN_IDS.FANTOM]: [
    {
      type: PairFilterType.ALL,
      label: 'All Pairs',
      fn: () => true
    }
  ],
  [CHAIN_IDS.OPTIMISM]: [
    {
      type: PairFilterType.ALL,
      label: 'All Pairs',
      fn: () => true
    },
    {
      type: PairFilterType.STABLE,
      label: 'Stable',
      fn: a => a.stable
    },
    {
      type: PairFilterType.VOLATILE,
      label: 'Volatile',
      fn: a => !a.stable
    }
  ],
  [CHAIN_IDS.ARBITRUM]: [
    {
      type: PairFilterType.ALL,
      label: 'All Pairs',
      fn: () => true
    },
    {
      type: PairFilterType.STABLE,
      label: 'Stable',
      fn: a => a.stable
    },
    {
      type: PairFilterType.VOLATILE,
      label: 'Volatile',
      fn: a => !a.stable
    }
  ],
  [CHAIN_IDS.ETHEREUM_MAIN_NET]: [
    {
      type: PairFilterType.ALL,
      label: 'All Pairs',
      fn: () => true
    }
  ]
};

const LendingPools = (): JSX.Element | null => {
  const PAGE_SIZE = 30;
  const { chainId: web3ChainId } = useWeb3React<Web3Provider>();
  const defaultChainId = useDefaultChainId();
  const chainId = web3ChainId || defaultChainId;
  const lendingPools = useFullLendingPools();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [searchResults, setSearchResults] = React.useState([] as PoolDisplayDetails[]);
  const greaterThanMd = useMedia(`(min-width: ${BREAKPOINTS.md})`);
  const [selectedSort, setSelectedSort] = React.useState<SortOption>(getSortOptions(CHAIN_DETAILS[chainId].nativeCurrency.symbol)[0]);
  const FILTER_OPTIONS = FILTER_OPTIONS_BY_CHAIN[chainId];
  const [selectedFilter, setSelectedFilter] = React.useState<FilterOption>(FILTER_OPTIONS[0]);
  const PAIR_FILTER_OPTIONS = PAIR_FILTER_OPTIONS_BY_CHAIN[chainId];
  const [selectedPairFilter, setSelectedPairFilter] = React.useState<FilterOption>(PAIR_FILTER_OPTIONS[0]);
  const [filteredAndSortedSearchResults, setFilteredAndSortedSearchResults] = React.useState([] as PoolDisplayDetails[]);
  const [totalToShow, setTotalToShow] = React.useState<number>(PAGE_SIZE);
  const [loadingMore, setLoadingMore] = React.useState<boolean>(false);
  const [flippedMap, setFlippedMap] = React.useState<Record<string, boolean>>({});

  const setFlipped = (id: string, flipped: boolean) => {
    setFlippedMap({
      ...flippedMap,
      [id]: flipped
    });
  };

  const handleChange = (event: any) => {
    setSearchTerm(event.target.value);
  };

  React.useEffect(() => {
    if (loadingMore) {
      setTotalToShow(totalToShow + PAGE_SIZE);
    }
  }, [loadingMore]);

  useDebounce(() => {
    if (!searchTerm) {
      setSearchResults(lendingPools || []);
      return;
    }
    const terms = searchTerm.toLowerCase().replace(/[-\/]/, ' ').trim().split(' ');
    const results = (lendingPools || []).filter(x => {
      if (chainId === undefined) {
        return true;
      }
      const poolDetails = LENDING_POOL_DETAILS_MAP[x.id.toLowerCase()];
      const tokenInfoA = TOKEN_INFO[chainId][poolDetails.tokenAddress0];
      const tokenInfoB = TOKEN_INFO[chainId][poolDetails.tokenAddress1];
      const symbolA = tokenInfoA ? tokenInfoA.symbol : poolDetails.symbol0;
      const symbolB = tokenInfoB ? tokenInfoB.symbol : poolDetails.symbol1;
      return terms.every(term =>
        symbolA.toLowerCase().includes(term) ||
        symbolB.toLowerCase().includes(term) ||
        poolDetails.symbol0.toLowerCase().includes(term) ||
        poolDetails.symbol1.toLowerCase().includes(term) ||
        (x.vaultAPR > 0 && 'vault'.includes(term)) ||
        ((x.hasFarming[0] || x.hasFarming[1]) && 'farm'.includes(term))
      );
    }
    );
    setSearchResults(results);
  }, 50, [searchTerm, lendingPools]);

  React.useEffect(() => {
    setFilteredAndSortedSearchResults(R.concat(...R.partition((a: PoolDisplayDetails) => !a.poolDisabled, R.sort(selectedSort.fn, searchResults.filter(selectedPairFilter.fn).filter(selectedFilter.fn)))));
  }, [searchResults, selectedPairFilter.fn, selectedFilter.fn, selectedSort.fn]);

  React.useEffect(() => {
    setLoadingMore(false);
  }, [filteredAndSortedSearchResults, totalToShow]);

  const cardsToDisplay = React.useMemo(() => {
    return filteredAndSortedSearchResults.map((lendingPool, i) => {
      if (i >= totalToShow) {
        return null;
      }
      return (
        <FlipCard
          key={i}
          flipped={flippedMap[lendingPool.id]}
          setFlipped={setFlipped}
          lendingPool={lendingPool}
          greaterThanMd={greaterThanMd} />
      );
    });
  }, [filteredAndSortedSearchResults, totalToShow, flippedMap, greaterThanMd, setFlipped]);

  if (!lendingPools) {
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
  if (lendingPools.length === 0) {
    return (
      <div
        className={clsx(
          'p-7',
          'flex',
          'justify-center'
        )}>
          No pools to display
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

            {getSortOptions(CHAIN_DETAILS[chainId].nativeCurrency.symbol).map((sortOption, i) => (
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

  const pairFilterMenu = () => {
    return (
      <div className='!ml-0 py-3 lg:py-0 lg:pr-4 relative'>
        <Menu>
          <Menu.Button className='focus:outline-none flex flex-row items-center space-x-2'>
            <FontAwesomeIcon
              className='focus:outline-none text-textSecondary'
              icon={faToggleOff} />
            <div className='whitespace-nowrap'>{selectedPairFilter.label}</div>
          </Menu.Button>
          <Menu.Items className='absolute z-tarotModal flex flex-col border border-tarotBlackHaze-750 bg-tarotBlackHaze-850 py-0 shadow-lg'>

            {PAIR_FILTER_OPTIONS.map((filterOption, i) => (
              <Menu.Item
                key={i}>
                {() => (
                  <div
                    onClick={() => {
                      setSelectedPairFilter(filterOption);
                    }}
                    className={clsx(
                      selectedPairFilter.type === filterOption.type ?
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

  return (
    <div className='space-y-3 lg:mx-4'>
      <div className='flex space-x-4 items-center flex-wrap lg:flex-nowrap'>
        <h2 className='text-2xl font-semibold flex-grow min-w-full lg:min-w-0 lg:whitespace-nowrap'>Lending Pools</h2>
        <div className='flex flex-grow space-x-2 flex-col lg:flex-row lg:justify-end'>
          {PAIR_FILTER_OPTIONS.length > 1 && pairFilterMenu()}
          {filterMenu()}
          {sortMenu()}
        </div>
        {filterInput()}
      </div>
      {searchTerm.toLowerCase().replace(/[-\/]/, ' ').trim().length > 0 && searchResults.length === 0 ? <div className='flex justify-center items-center pt-12'><span className='text-lg text-textSecondary'>No lending pools to display</span></div> :
        <div>
          <div
            className={clsx(
              'grid',
              'grid-cols-1',
              'md:grid-cols-2',
              'lg:grid-cols-3',
              'gap-x-8',
              'gap-y-8',
              'auto-rows-fr')}>
            {cardsToDisplay}
          </div>
          {totalToShow < filteredAndSortedSearchResults.length ?
            <div className='flex w-full justify-center'>
              <InteractionButton
                key={`${loadingMore}`}
                className='w-30 h-10 m-20 p-10 bg-tarotJade-700'
                name='Load More'
                state={loadingMore ? ButtonState.Pending : ButtonState.Ready}
                onCall={() => {
                  setLoadingMore(true);
                }} />
            </div> : <></>
          }
        </div>
      }
    </div>
  );
};

export default withErrorBoundary(LendingPools, {
  FallbackComponent: ErrorFallback,
  onReset: () => {
    window.location.reload();
  }
});