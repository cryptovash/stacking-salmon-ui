
import clsx from 'clsx';
import GridWrapper from '../GridWrapper';
import Card from '../../components/Card';
import TarotImage from '../../components/UI/TarotImage';
import { formatAmountShort, formatFloat } from '../../utils/format';
import { DEX, DexInfo } from '../../config/web3/dexs';
import InteractionButton from '../../components/InteractionButton';
import useReinvest from '../../hooks/useReinvest';
import { VaultDetails } from '../../config/web3/contracts/vault-details';
import VaultLabel from '../../components/VaultLabel';
import { getAddress } from 'ethers/lib/utils';
import { useWeb3React } from '@web3-react/core';
import { Web3Provider } from '@ethersproject/providers';
import React from 'react';

interface PairCellCustomProps {
  tokenIconA: string;
  tokenIconB: string;
  symbolA?: string;
  symbolB?: string;
}

const TokenPairLabel = ({
  tokenIconA,
  tokenIconB,
  symbolA,
  symbolB,
  className
}: PairCellCustomProps & React.ComponentPropsWithRef<'div'>): JSX.Element => (
  <div
    className={clsx(
      'flex',
      'flex-shrink-0',
      'items-center',
      className
    )}>
    <TarotImage
      width={40}
      height={40}
      // TODO: could componentize
      className={clsx(
        'inline-block'
      )}
      src={tokenIconA}
      placeholder='/assets/images/default.png'
      error='/assets/images/default.png'
      alt='Token A' />
    <TarotImage
      width={40}
      height={40}
      className={clsx(
        'inline-block',
        '-ml-1.5'
      )}
      src={tokenIconB}
      placeholder='/assets/images/default.png'
      error='/assets/images/default.png'
      alt='Token B' />
    <span
      className={clsx(
        'font-medium',
        'text-textSecondary'
      )}>
      {symbolA}{symbolA && symbolB ? '/' : null}{symbolB}
    </span>
  </div>
);

const PropertyLabel = ({
  className,
  children,
  ...rest
}: React.ComponentPropsWithRef<'h5'>) => (
  <h5
    className={clsx(
      'text-textSecondary',
      'font-medium',
      'text-md',
      className
    )}
    {...rest}>
    {children}
  </h5>
);

const Value = (props: React.ComponentPropsWithRef<'span'>): JSX.Element => (
  <span {...props} />
);

interface Props {
  dex: DexInfo;
  vaultDetails?: VaultDetails;
  tokenIconA: string;
  tokenIconB: string;
  symbolA: string;
  symbolB: string;
  pendingRewards: number[];
  reinvestBounties: number[];
  rewardsTokensSymbols: string[];
  rewardsTokensAddresses: string[];
  stable: boolean;
}

const BountyPairCard = ({
  dex,
  vaultDetails,
  tokenIconA,
  tokenIconB,
  symbolA,
  symbolB,
  pendingRewards,
  reinvestBounties,
  rewardsTokensSymbols,
  rewardsTokensAddresses,
  stable
}: Props): JSX.Element => {
  const { account } = useWeb3React<Web3Provider>();
  const [reinvestState, onReinvest] = useReinvest();
  return (
    <Card isLendingPoolDetail={false}>
      <GridWrapper
        className={clsx(
          'mt-12',
          'mb-2'
        )}>
        <div className='col-span-4 self-center justify-self-center flex flex-col items-center'>
          <VaultLabel
            vaultDetails={vaultDetails}
            dex={dex}
            stable={stable}
            className='text-lg' />
        </div>
      </GridWrapper>
      <GridWrapper
        className={clsx(
          'mb-6'
        )}>
        <span
          className='text-xl lg:text-base xl:text-xl col-span-4 text-textPrimary filter saturate-50 self-center justify-self-center items-center'>
          {stable ? 'sAMM-' : [DEX.SOLIDLY, DEX.SPIRIT_V2, DEX.VELODROME, DEX.XCAL].includes(dex.id) ? 'vAMM-' : ''}{symbolA}/{symbolB}
        </span>
      </GridWrapper>
      <GridWrapper
        className={clsx(
          'gap-y-2.5',
          'mt-2.5'
        )}>
        <div
          className={clsx(
            'col-span-4',
            'flex',
            'self-center',
            'justify-items-center',
            'space-x-4'
          )}>
          <div
            className='flex-grow'>
          </div>
          <div
            className={clsx(
              'flex-grow',
              'self-center',
              'border-dotted',
              'border-t',
              'border-l',
              'h-2.5',
              'border-tarotBlackHaze-50'
            )}>
          </div>
          <TokenPairLabel
            tokenIconA={tokenIconA}
            tokenIconB={tokenIconB}
            className='justify-self-center' />
          <div
            className={clsx(
              'flex-grow',
              'self-center',
              'border-dotted',
              'border-t',
              'border-r',
              'h-2.5',
              'border-tarotBlackHaze-50'
            )}>
          </div>
          <div
            className='flex-grow'>
          </div>
        </div>
      </GridWrapper>
      <GridWrapper
        className={clsx(
          'mt-6'
        )}>
        <PropertyLabel className='col-span-4 text-lg self-center justify-self-center'>
        Pending Reward
        </PropertyLabel>
      </GridWrapper>
      {pendingRewards.map((pendingReward, i) => (
        <GridWrapper
          key={i}
          className={clsx(
            'mb-4'
          )}>
          <Value
            title={`${formatFloat(pendingReward)} ${rewardsTokensSymbols[i]}`}
            className='text-lg col-span-4 self-center justify-self-center flex space-x-2 items-center'>
            <div>{formatAmountShort(pendingReward)}</div>
            <TarotImage
              className={clsx(
                'w-4',
                'h-4'
              )}
              src={`/assets/images/token-icons/${getAddress(rewardsTokensAddresses[i])}.png`}
              placeholder='/assets/images/default.png'
              error='/assets/images/default.png'
              alt={rewardsTokensSymbols[i]} />
          </Value>
        </GridWrapper>
      ))}
      <GridWrapper>
        <PropertyLabel className='col-span-4 text-lg self-center justify-self-center'>
        Bounty
        </PropertyLabel>
      </GridWrapper>
      {reinvestBounties.map((reinvestBounty, i) => (
        <GridWrapper
          key={i}
          className={clsx(
            'mb-4'
          )}>
          <Value
            title={`${formatFloat(reinvestBounty)} ${rewardsTokensSymbols[i]}`}
            className='text-lg col-span-4 self-center justify-self-center flex space-x-2 items-center'>
            <div>{formatAmountShort(reinvestBounty)}</div>
            <TarotImage
              className={clsx(
                'w-4',
                'h-4'
              )}
              src={`/assets/images/token-icons/${getAddress(rewardsTokensAddresses[i])}.png`}
              placeholder='/assets/images/default.png'
              error='/assets/images/default.png'
              alt={rewardsTokensSymbols[i]} />
          </Value>
        </GridWrapper>
      ))}
      {account &&
      <GridWrapper
        className={clsx(
          'gap-y-6',
          'mt-8',
          'text-lg'
        )}>
        <div className='col-span-4'>
          <InteractionButton
            className='w-full'
            name='Reinvest'
            onCall={onReinvest}
            state={reinvestState} />
        </div>
      </GridWrapper>
      }
    </Card>
  );
};

export default BountyPairCard;