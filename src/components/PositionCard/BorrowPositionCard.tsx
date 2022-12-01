
import clsx from 'clsx';

import GridWrapper from '../GridWrapper';
import Card from '../../components/Card';
import TarotImage from '../../components/UI/TarotImage';
import { formatUSD, formatUSDShort } from '../../utils/format';
import { DEX, DexInfo } from '../../config/web3/dexs';
import RiskMetrics from '../../components/RiskMetrics';
import BorrowPositionAPRInfo from '../PositionAPRInfo/BorrowPositionAPRInfo';
import VaultLabel from '../../components/VaultLabel';
import usePairAddress from '../../hooks/usePairAddress';
import { getVaultDetails } from '../../config/web3/contracts/vault-details';
import { LENDING_POOL_DETAILS_MAP } from '../../config/web3/contracts/lending-pools';
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

const PropertyRow = ({ label, valueA, valueB, titleA, titleB }: {label: string, valueA: string, valueB: string, titleA: string, titleB: string}): JSX.Element => (
  <GridWrapper className='col-span-4'>
    <Value
      title={titleA}
      className='self-center justify-self-end'>{valueA}
    </Value>
    <PropertyLabel className='col-span-2 text-center self-center justify-self-center'>
      {label}
    </PropertyLabel>
    <Value
      title={titleB}
      className='self-center justify-self-start'>{valueB}
    </Value>
  </GridWrapper>
);

interface Props {
  dex: DexInfo;
  tokenIconA: string;
  tokenIconB: string;
  symbolA: string;
  symbolB: string;
  collateralValue: number;
  borrowedValueA: number;
  borrowedValueB: number;
  equityValue: number;
}

const BorrowPositionCard = ({
  dex,
  tokenIconA,
  tokenIconB,
  symbolA,
  symbolB,
  collateralValue,
  borrowedValueA,
  borrowedValueB,
  equityValue
}: Props): JSX.Element => {
  const vaultTokenAddress = usePairAddress();
  const poolDetails = LENDING_POOL_DETAILS_MAP[vaultTokenAddress.toLowerCase()] || {};
  const poolDisabled = poolDetails.poolDisabled;
  const poolDeactivated = poolDetails.poolDeactivated;
  const vaultDetails = getVaultDetails(vaultTokenAddress);
  return (
    <Card isLendingPoolDetail={false}>
      <GridWrapper
        className={clsx(
          'mt-8',
          'mb-2'
        )}>
        <div className='col-span-4 self-center justify-self-center flex flex-col items-center'>
          <VaultLabel
            vaultDetails={vaultDetails}
            dex={dex}
            stable={poolDetails.stable || false}
            className='text-lg' />
        </div>
      </GridWrapper>
      <GridWrapper
        className={clsx(
          'mb-3'
        )}>
        <span
          className='text-xl col-span-4 text-textPrimary filter saturate-50 self-center justify-self-center items-center'>
          {poolDetails.stable ? 'sAMM-' : [DEX.SOLIDLY, DEX.SPIRIT_V2, DEX.VELODROME, DEX.XCAL].includes(dex.id) ? 'vAMM-' : ''}{symbolA}/{symbolB}
        </span>
        {poolDisabled ? <span className='col-span-4 text-textPrimary filter saturate-50 self-center justify-self-center items-center'>(DECOMMISSIONED)</span> : ''}
        {poolDeactivated ? <span className='col-span-4 text-textPrimary filter saturate-50 self-center justify-self-center items-center'>(DEACTIVATED)</span> : ''}
      </GridWrapper>
      <GridWrapper>
        <PropertyLabel className='col-span-4 text-lg self-center justify-self-center'>
        LP Balance
        </PropertyLabel>
      </GridWrapper>
      <GridWrapper
        className={clsx(
          'mb-4'
        )}>
        <Value
          title={formatUSD(collateralValue)}
          className='text-xl col-span-4 self-center justify-self-center'>{formatUSDShort(collateralValue)}
        </Value>
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
          'gap-y-6',
          'mt-5',
          'text-lg'
        )}>
        <PropertyRow
          label='Borrowed'
          valueA={formatUSDShort(borrowedValueA)}
          valueB={formatUSDShort(borrowedValueB)}
          titleA={formatUSD(borrowedValueA)}
          titleB={formatUSD(borrowedValueB)} />
      </GridWrapper>
      <GridWrapper>
        <div
          className={clsx(
            'mt-3',
            'col-span-4 flex',
            'flex-col',
            'justify-between',
            '-mx-2',
            'p-2',
            'py-3',
            'border',
            'border-tarotBlackHaze-200',
            'rounded-lg',
            'bg-tarotBlackHaze-600',
            'space-y-1'
          )}>
          <PropertyLabel className='text-lg self-center justify-self-start'>
        Net Balance
          </PropertyLabel>
          <div
            className={clsx(
              'self-center',
              'justify-self-end',
              'text-2xl',
              'font-semibold',
              'text-textPrimary',
              'items-center',
              'flex',
              'flex-col',
              'mt-2',
              'space-y-2'
            )}>
            <Value
              title={formatUSD(equityValue)}
              className='self-center'>
              {formatUSDShort(equityValue)}
            </Value>
          </div>
        </div>
      </GridWrapper>
      <div
        className={clsx(
          'gap-y-6',
          'mt-5',
          'text-center'
        )}>
        <div>
          <RiskMetrics dashboard={true} />
          <BorrowPositionAPRInfo />
        </div>
      </div>
    </Card>
  );
};

export default BorrowPositionCard;