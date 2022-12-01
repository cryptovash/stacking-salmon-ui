
import clsx from 'clsx';

import GridWrapper from '../GridWrapper';
import Card from '../../components/Card';
import { Badge } from 'react-bootstrap';
import TarotImage from '../../components/UI/TarotImage';
import { formatAmount, formatPercentage, formatPercentageShort, formatToDecimals, formatUSD, formatUSDShort } from 'utils/format';
import { ReactComponent as TarotLogoIcon } from '../../assets/images/icons/tarot-logo.svg';
import { ReactComponent as TinSpiritLogoIcon } from '../../assets/images/icons/tinSPIRIT.svg';
import { DEX, DexInfo } from '../../config/web3/dexs';
import Tooltip from '../../components/Tooltip';
import QuestionHelper from '../../components/QuestionHelper';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLongArrowAltRight } from '@fortawesome/free-solid-svg-icons';
import VaultLabel from '../../components/VaultLabel';
import { VaultDetails, VaultType } from '../../config/web3/contracts/vault-details';
import { LendingPoolDetails } from '../../config/web3/contracts/lending-pools';
import { useState } from 'react';
import { AlertTriangle } from 'react-feather';
import tailwindConfig from '../../tailwind.config';
import { BigNumber, BigNumberish } from 'ethers';
import { formatUnits } from 'ethers/lib/utils';
import { TEN_18 } from '../../types/interfaces';
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

const PropertyRow = ({ label, shortLabel, valueA, valueB, titleA, titleB, hidden = false }: {hidden?: boolean, label: string, shortLabel?: string, valueA: string, valueB: string, titleA: string, titleB: string}): JSX.Element => (
  <GridWrapper className={`col-span-4 ${hidden ? 'invisible' : ''}`}>
    <Value
      title={titleA}
      className='self-center justify-self-end'>{valueA}
    </Value>
    <PropertyLabel className='col-span-2 text-center self-center justify-self-center inline-block lg:hidden xl:inline-block'>
      {label}
    </PropertyLabel>
    <PropertyLabel className='col-span-2 text-center self-center justify-self-center hidden lg:inline-block xl:hidden'>
      {shortLabel || label}
    </PropertyLabel>
    <Value
      title={titleB}
      className='self-center justify-self-start'>{valueB}
    </Value>
  </GridWrapper>
);

interface Props {
  vaultDetails?: VaultDetails;
  dex: DexInfo;
  tokenIconA: string;
  tokenIconB: string;
  symbolA: string;
  symbolB: string;
  totalLp: number;
  totalCollateralUSD: number;
  supplyUSDA: number;
  supplyUSDB: number;
  totalBorrowsUSDA: number;
  totalBorrowsUSDB: number;
  utilizationRateA: number;
  utilizationRateB: number;
  borrowAPYA: number;
  borrowAPYB: number;
  supplyAPYA: number;
  supplyAPYB: number;
  dexAPY: number;
  vaultAPY: number;
  farmingPoolAPYA: number;
  farmingPoolAPYB: number;
  leverage: number;
  unleveragedAPY: number;
  leveragedAPY: number;
  isDetail?: boolean;
  oracleIsInitialized: boolean;
  isVaultToken: boolean;
  hasFarming: boolean;
  lendingPool?: LendingPoolDetails;
  poolDisabled: boolean;
  poolDeactivated: boolean;
  boostMultiplier: BigNumberish;
  stable: boolean;
}

const LendingPoolCard = ({
  vaultDetails,
  dex,
  tokenIconA,
  tokenIconB,
  symbolA,
  symbolB,
  totalLp,
  totalCollateralUSD,
  supplyUSDA,
  supplyUSDB,
  totalBorrowsUSDA,
  totalBorrowsUSDB,
  utilizationRateA,
  utilizationRateB,
  borrowAPYA,
  borrowAPYB,
  supplyAPYA,
  supplyAPYB,
  farmingPoolAPYA,
  farmingPoolAPYB,
  leverage,
  unleveragedAPY,
  leveragedAPY,
  isDetail = false,
  oracleIsInitialized,
  isVaultToken,
  hasFarming,
  poolDisabled,
  poolDeactivated,
  dexAPY,
  vaultAPY,
  boostMultiplier,
  stable
}: Props): JSX.Element => {
  const [showVaultTooltip, setShowVaultTooltip] = useState(false);
  const [showBoostTooltip, setShowBoostTooltip] = useState(false);
  const isDexTypeSolidly = [DEX.SOLIDLY, DEX.SPIRIT_V2, DEX.VELODROME, DEX.XCAL].includes(dex.id);
  let leveragedLpAprHelperText = `Estimated current ${leverage}x leverage APR${hasFarming ? ' (including TAROT farming rewards)' : ''}`;
  if (dexAPY > 0 || (isVaultToken && vaultAPY > 0)) {
    leveragedLpAprHelperText += ' based on ';
    if (dexAPY > 0) {
      leveragedLpAprHelperText += `${dex.dexName} trading fees over the last day (${formatPercentageShort(dexAPY)} APR)`;
    }
    if (dexAPY > 0 && isVaultToken && vaultAPY > 0) {
      leveragedLpAprHelperText += ' and ';
    }
    if (isVaultToken && vaultAPY > 0) {
      leveragedLpAprHelperText += `current vault rewards (${formatPercentageShort(vaultAPY)} APR)`;
    }
  }
  return (
    <Card
      style={{ minHeight: isDetail ? undefined : 761 }}
      isLendingPoolDetail={isDetail}>
      {(isVaultToken || hasFarming) && !isDetail &&
      <GridWrapper
        className={clsx('-mt-0.5', '-mb-7', '-mr-2')}>
        <div className='col-span-4 flex justify-end'>
          {(vaultDetails && [VaultType.SPIRIT_V2, VaultType.SPIRIT_BOOSTED].includes(vaultDetails.type)) && !isDetail &&
        <div className='flex-grow ml-8 justify-start'>
          <Tooltip
            show={showBoostTooltip && BigNumber.from(boostMultiplier).gt(TEN_18)}
            text='Boosted rewards, powered by tinSPIRIT'>
            <Badge
              onMouseEnter={() => {
                setShowBoostTooltip(true);
              }}
              onMouseLeave={() => {
                setShowBoostTooltip(false);
              }}
              className='p-0 rounded-2xl border border-tarotBlackHaze-200 bg-tarotBlackHaze-800 text-textPrimary shadow-lg'>
              <div className='opacity-80 flex flex-row flex-nowrap items-center'>
                <TinSpiritLogoIcon
                  className='inline-block'
                  opacity={80}
                  width={28}
                  height={28} />
                <span className='ml-1.5 mr-2.5'>
                  <span>{Math.round(parseFloat(formatUnits(boostMultiplier, 18)) * 100) / 100}x</span>
                </span>
              </div>
            </Badge>
          </Tooltip>
        </div>
          }
          <Tooltip
            show={showVaultTooltip}
            text={isVaultToken && !hasFarming ?
              `Deposited collateral for this pool is farmed ${vaultDetails ? vaultDetails.vaultFarmLabel : `on ${dex.dexName}`}.` :
              isVaultToken ?
                `Deposited collateral for this pool is farmed ${vaultDetails ? vaultDetails.vaultFarmLabel : `on ${dex.dexName}`}. Leveraging or borrowing in this pool earns TAROT rewards.` :
                `Leveraging or borrowing in this pool earns TAROT rewards.`
            }>
            <Badge
              onMouseEnter={() => {
                setShowVaultTooltip(true);
              }}
              onMouseLeave={() => {
                setShowVaultTooltip(false);
              }}
              className='p-0 rounded-2xl border border-tarotBlackHaze-200 bg-tarotBlackHaze-800 text-textPrimary shadow-lg'>
              <div className='opacity-80 flex flex-row flex-nowrap items-center'>
                <TarotLogoIcon
                  className='inline-block'
                  width={28}
                  height={28} />
                <span className='ml-1.5 mr-2.5'>
                  <span>{isVaultToken && 'VAULT'}</span>
                  {isVaultToken && hasFarming && <span className='ml-0.5 mr-0.5'>+</span>}
                  <span>{hasFarming && 'FARM'}</span>
                </span>
              </div>
            </Badge>
          </Tooltip>
        </div>
      </GridWrapper>
      }
      <GridWrapper
        className={clsx(
          isDetail ? 'mt-0' : 'mt-8',
          isDetail ? 'mb-0' : 'mb-0'
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
          'mb-2'
        )}>
        <span
          className='text-xl col-span-4 text-textPrimary filter saturate-50 self-center justify-self-center items-center'>
          {stable ? 'sAMM-' : isDexTypeSolidly ? 'vAMM-' : ''}{symbolA}/{symbolB}
        </span>
      </GridWrapper>
      <GridWrapper
        className={clsx(
          'gap-y-2.5',
          'mt-2.5'
        )}>
        <div className='mb-2 col-span-4 flex flex-col items-center text-lg'>
          <div className='flex items-center justify-center space-x-2'>
            <div className='text-textSecondary'>Deposited</div>
            <TarotImage
              // TODO: could componentize
              className={clsx(
                'w-4',
                'h-4',
                '-mt-0.5',
                'inline-block'
              )}
              src={dex.iconPath}
              placeholder='/assets/images/default.png'
              error='/assets/images/default.png'
              alt={dex.dexName} />
            <div className='text-textSecondary'>LP</div>
          </div>
          <div
            title={`${totalLp < 10 ? formatToDecimals(totalLp, 18) : formatAmount(totalLp)} ${stable ? 'sAMM-' : isDexTypeSolidly ? 'vAMM-' : ''}${symbolA}/${symbolB}${isDexTypeSolidly ? '' : ' LP'}`}>{formatUSD(totalCollateralUSD)}
          </div>
        </div>
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
      {oracleIsInitialized ?
        <>
          <GridWrapper
            className={clsx(
              isDetail ? 'gap-y-3' : 'gap-y-6',
              'mt-5'
            )}>
            <PropertyRow
              label='Total Supply'
              shortLabel='Supply'
              valueA={formatUSDShort(supplyUSDA)}
              valueB={formatUSDShort(supplyUSDB)}
              titleA={formatUSD(supplyUSDA)}
              titleB={formatUSD(supplyUSDB)} />
            <PropertyRow
              label='Total Borrowed'
              shortLabel='Borrowed'
              valueA={formatUSDShort(totalBorrowsUSDA)}
              valueB={formatUSDShort(totalBorrowsUSDB)}
              titleA={formatUSD(totalBorrowsUSDA)}
              titleB={formatUSD(totalBorrowsUSDB)} />
            <PropertyRow
              label='Utilization'
              valueA={formatPercentageShort(utilizationRateA)}
              valueB={formatPercentageShort(utilizationRateB)}
              titleA={formatPercentage(utilizationRateA)}
              titleB={formatPercentage(utilizationRateB)} />
            <PropertyRow
              label='Supply APR'
              valueA={formatPercentageShort(supplyAPYA)}
              valueB={formatPercentageShort(supplyAPYB)}
              titleA={formatPercentage(supplyAPYA)}
              titleB={formatPercentage(supplyAPYB)} />
            <PropertyRow
              label='Borrow APR'
              valueA={formatPercentageShort(borrowAPYA)}
              valueB={formatPercentageShort(borrowAPYB)}
              titleA={formatPercentage(borrowAPYA)}
              titleB={formatPercentage(borrowAPYB)} />
            {hasFarming ?
              <PropertyRow
                label='Farming APR'
                valueA={formatPercentageShort(farmingPoolAPYA)}
                valueB={formatPercentageShort(farmingPoolAPYB)}
                titleA={formatPercentage(farmingPoolAPYA)}
                titleB={formatPercentage(farmingPoolAPYB)} /> : isDetail ? <></> :
                <PropertyRow
                  hidden={true}
                  label='Farming APR'
                  valueA={formatPercentageShort(farmingPoolAPYA)}
                  valueB={formatPercentageShort(farmingPoolAPYB)}
                  titleA={formatPercentage(farmingPoolAPYA)}
                  titleB={formatPercentage(farmingPoolAPYB)} />
            }
            {poolDisabled &&
            <div
              className={clsx(
                'mt-3',
                isDetail ? 'col-span-4 lg:col-start-2 lg:col-span-2 p-6 lg:p-8' : 'col-span-4 p-2',
                'flex',
                'flex-col',
                'justify-between',
                '-mx-2',
                'p-2',
                'py-3',
                'pb-4',
                'border',
                'rounded-lg',
                'text-center',
                'bg-tarotJade-900 border items-center border-tarotMistyRose-800',
                'space-y-2')}>
              <div>
                <AlertTriangle
                  color={tailwindConfig.theme.extend.colors.tarotJade['800']}
                  fill={tailwindConfig.theme.extend.colors.tarotMistyRose['600']} />
              </div>
              <div className={`${isDetail ? 'text-sm' : 'text-xs'} text-tarotMistyRose-600 font-bold`}>DECOMMISSIONED</div>
              <div className={`${isDetail ? 'text-base' : 'text-sm'} text-textPrimary px-1`}>Before you proceed, please visit the&nbsp;
                <a
                  className='inline-block border-b'
                  target='_blank'
                  title='Tarot Discord'
                  href='https://discord.gg/6ByFHBjqE8'
                  rel='noopener noreferrer'>Tarot Discord
                </a> for more information.
              </div>
            </div>}
            {poolDeactivated &&
            <div
              className={clsx(
                'mt-3',
                isDetail ? 'col-span-4 lg:col-start-2 lg:col-span-2 p-6 lg:p-8' : 'col-span-4 p-2',
                'flex',
                'flex-col',
                'justify-between',
                '-mx-2',
                'p-2',
                'py-3',
                'pb-4',
                'border',
                'rounded-lg',
                'text-center',
                'bg-tarotJade-900 border items-center border-tarotMistyRose-800',
                'space-y-2')}>
              <div>
                <AlertTriangle
                  color={tailwindConfig.theme.extend.colors.tarotJade['800']}
                  fill={tailwindConfig.theme.extend.colors.tarotMistyRose['600']} />
              </div>
              <div className={`${isDetail ? 'text-sm' : 'text-xs'} text-tarotMistyRose-600 font-bold`}>DEACTIVATED</div>
              <div className={`${isDetail ? 'text-base' : 'text-sm'} text-textPrimary px-1`}>Please visit the&nbsp;
                <a
                  className='inline-block border-b'
                  target='_blank'
                  title='Tarot Discord'
                  href='https://discord.gg/6ByFHBjqE8'
                  rel='noopener noreferrer'>Tarot Discord
                </a> for more information.
              </div>
            </div>}
            {(isDetail || poolDisabled || poolDeactivated) ? <></> :
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
                  'space-y-3'
                )}>
                <PropertyLabel className='text-md self-center justify-self-start items-center flex space-x-1'>
                  <span>Leveraged LP APR</span>
                  <QuestionHelper
                    text={leveragedLpAprHelperText} />
                </PropertyLabel>
                <div className='flex flex-row justify-around items-center space-x-6'>
                  <div className='flex-grow'></div>
                  <div
                    className={clsx(
                      'self-center',
                      'justify-self-end',
                      'text-lg',
                      'font-semibold',
                      'text-textPrimary',
                      'items-center',
                      'flex',
                      'flex-col',
                      'mt-2',
                      'space-y-2'
                    )}>
                    <Badge
                      pill
                      className='p-2 font-medium text-textPrimary bg-gray-600'>1x
                    </Badge>
                    <Value className='self-center text-gray-400'>
                      {formatPercentageShort(unleveragedAPY)}
                    </Value>
                  </div>
                  <div className='text-tarotBlackHaze-100'><FontAwesomeIcon icon={faLongArrowAltRight} /></div>
                  <div
                    className={clsx(
                      'self-center',
                      'justify-self-end',
                      'text-lg',
                      'font-semibold',
                      'text-textPrimary',
                      'items-center',
                      'flex',
                      'flex-col',
                      'mt-2',
                      'space-y-2'
                    )}>
                    <Badge
                      pill
                      className='p-2 font-medium bg-tarotJade-300 filter saturate-150'>{leverage}x
                    </Badge>
                    <Value className='self-center'>
                      {formatPercentageShort(leveragedAPY)}
                    </Value>
                  </div>
                  <div className='flex-grow'></div>
                </div>
              </div>
            }
          </GridWrapper>
        </> :
        <>
          <GridWrapper
            className={clsx(
              isDetail ? 'gap-y-3' : 'gap-y-6',
              'mt-5'
            )}>
            <div
              className={clsx(
                'mt-3',
                isDetail ? 'col-span-4 md:col-start-2 md:col-span-2' : 'col-span-4',
                'flex',
                'flex-col',
                '-mx-2',
                'p-2',
                'py-3',
                'border',
                'border-tarotBlackHaze-200',
                'rounded-lg',
                'bg-tarotBlackHaze-600',
                'space-y-3'
              )}>
              <PropertyLabel className='text-md self-center justify-self-start text-center'>
            Initializing Pool
              </PropertyLabel>
              <div className='grid grid-cols-6 md:grid-cols-8'>
                <div
                  className={clsx(
                    'md:col-start-2',
                    'col-span-6',
                    'self-center',
                    'justify-self-end',
                    'text-sm',
                    'text-textPrimary',
                    'items-center',
                    'flex',
                    'flex-col',
                    'mt-2',
                    'space-y-2'
                  )}>
                  <Value className='self-center text-center'>
              Waiting 20 minutes in order to gather enough price history from TWAP oracle.
                  </Value>
                </div>
              </div>
            </div>
          </GridWrapper>
        </>}
    </Card>
  );
};

export default LendingPoolCard;
