
import clsx from 'clsx';

import Panel from '../../components/Panel';
import { formatUSD } from '../../utils/format';
import TarotImage from '../../components/UI/TarotImage';
import { TAROT_ADDRESSES } from '../../config/web3/contracts/tarot';
import { getAddress } from '@ethersproject/address';
import { CHAIN_IDS } from '../../config/web3/chains';
import { useWeb3React } from '@web3-react/core';
import { Web3Provider } from '@ethersproject/providers';
import { useDefaultChainId } from '../../hooks/useTarotRouter';
import React from 'react';

interface Props {
  totalValueLocked: number;
  totalValueSupplied: number;
  totalValueBorrowed: number;
  tarotDerivedUSD: number;
}

const OverallStatsInternal = ({
  totalValueLocked,
  totalValueSupplied,
  totalValueBorrowed,
  tarotDerivedUSD
} : Props): JSX.Element => {
  const { chainId: web3ChainId } = useWeb3React<Web3Provider>();
  const defaultChainId = useDefaultChainId();
  const chainId = web3ChainId || defaultChainId;
  const tarotAddress = TAROT_ADDRESSES[CHAIN_IDS.FANTOM];
  const stats = [
    {
      name: 'Total Value Locked',
      stat: formatUSD(totalValueLocked),
      previousStat: formatUSD(totalValueLocked),
      change: '0%',
      changeType: 'increase'
    },
    {
      name: 'Total Supplied',
      stat: formatUSD(totalValueSupplied),
      previousStat: formatUSD(totalValueSupplied),
      change: '0%',
      changeType: 'increase'
    },
    {
      name: 'Total Borrowed',
      stat: formatUSD(totalValueBorrowed),
      previousStat: formatUSD(totalValueBorrowed),
      change: '0%',
      changeType: 'decrease'
    }
  ];

  return (
    <>
      <Panel
        className={clsx(
          'm-0',
          'lg:m-4',
          'rounded-lg',
          'grid',
          'grid-cols-1',
          'divide-y',
          'divide-tarotBlackHaze',
          [CHAIN_IDS.FANTOM, CHAIN_IDS.OPTIMISM].includes(chainId) ? 'md:grid-cols-4' : 'md:grid-cols-3',
          'md:divide-y-0',
          'md:divide-x-4'
        )}>
        {stats.map(item => (
          <div
            key={item.name}
            className={clsx(
              'px-4',
              'py-5',
              'sm:p-6',
              'sm:px-2',
              'lg:px-6'
            )}>
            <dt
              className={clsx(
                'text-sm',
                'font-normal',
                'lg:text-lg',
                'text-textPrimary'
              )}>
              {item.name}
            </dt>
            <dd
              className={clsx(
                'mt-1',
                'flex',
                'justify-between',
                'items-baseline',
                'md:block',
                'lg:flex'
              )}>
              <div
                className={clsx(
                  'flex',
                  'items-baseline',
                  'text-xl',
                  'lg:text-2xl',
                  'font-semibold',
                  'text-tarotJade-100'
                )}>
                {item.stat}
              </div>
            </dd>
          </div>
        ))}
        {[CHAIN_IDS.FANTOM, CHAIN_IDS.OPTIMISM].includes(chainId) &&
        <div
          className={clsx(
            'px-4',
            'py-5',
            'sm:p-6')}>
          <dt
            className={clsx(
              'flex',
              'items-center',
              'text-base',
              'font-normal',
              'lg:text-lg',
              'space-x-2',
              'text-textPrimary'
            )}>
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
            <span>TAROT</span>
          </dt>
          <dd
            className={clsx(
              'mt-1',
              'flex',
              'justify-between',
              'items-baseline',
              'sm:block',
              'md:flex',
              'lg:flex'
            )}>
            <div
              className={clsx(
                'flex',
                'flex-grow',
                'space-x-2',
                'items-center',
                'text-xl',
                'md:text-lg',
                'lg:text-2xl',
                'font-semibold',
                'text-tarotJade-100'
              )}>
              <div className='flex space-x-2 items-center'>
                <span>{tarotDerivedUSD > 0 ? formatUSD(tarotDerivedUSD) : '-'}</span>
              </div>
              <div className='pl-1 -mt-1 flex items-center space-x-2'>
                {chainId === CHAIN_IDS.FANTOM ?
                  <>
                    <a
                      href='https://spooky.fi/#/swap?inputCurrency=FTM&outputCurrency=0xc5e2b037d30a390e62180970b3aa4e91868764cd'
                      target='_blank'
                      rel='noopener noreferrer'>
                      <TarotImage
                        className={clsx(
                          'inline-block',
                          'rounded-full',
                          'w-6',
                          'h-6',
                          'md:w-5',
                          'md:h-5',
                          'lg:w-6',
                          'lg:h-6'
                        )}
                        src='/assets/images/dex/spooky.png'
                        placeholder='/assets/images/default.png'
                        error='/assets/images/default.png'
                        alt='SpookySwap' />
                    </a>
                    <a
                      href='https://swap.spiritswap.finance/#/swap/0xC5e2B037D30a390e62180970B3aa4E91868764cD'
                      target='_blank'
                      rel='noopener noreferrer'>
                      <TarotImage
                        className={clsx(
                          'inline-block',
                          'rounded-full',
                          'w-6',
                          'h-6',
                          'md:w-5',
                          'md:h-5',
                          'lg:w-6',
                          'lg:h-6'
                        )}
                        src='/assets/images/dex/spirit.png'
                        placeholder='/assets/images/default.png'
                        error='/assets/images/default.png'
                        alt='SpiritSwap' />
                    </a>
                    <a
                      href='https://beets.fi/#/trade/0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee/0xc5e2b037d30a390e62180970b3aa4e91868764cd'
                      target='_blank'
                      rel='noopener noreferrer'>
                      <TarotImage
                        className={clsx(
                          'inline-block',
                          'rounded-full',
                          'w-6',
                          'h-6',
                          'md:w-5',
                          'md:h-5',
                          'lg:w-6',
                          'lg:h-6'
                        )}
                        src='/assets/images/dex/beethovenx.png'
                        placeholder='/assets/images/default.png'
                        error='/assets/images/default.png'
                        alt='Beethoven X' />
                    </a>
                  </> :
                  <>
                    <a
                      href='https://app.velodrome.finance/swap'
                      target='_blank'
                      rel='noopener noreferrer'>
                      <TarotImage
                        className={clsx(
                          'inline-block',
                          'rounded-full',
                          'w-6',
                          'h-6',
                          'md:w-5',
                          'md:h-5',
                          'lg:w-6',
                          'lg:h-6'
                        )}
                        src='/assets/images/dex/velodrome.png'
                        placeholder='/assets/images/default.png'
                        error='/assets/images/default.png'
                        alt='Velodrome' />
                    </a>
                  </>
                }
              </div>
            </div>
          </dd>
        </div>
        }
      </Panel>
    </>
  );
};

export default OverallStatsInternal;