
import clsx from 'clsx';

import GridWrapper from '../GridWrapper';
import Card from '../../components/Card';
import TarotImage from '../../components/UI/TarotImage';
import { formatAmountShort, formatFloat, formatPercentage, formatUSD, formatUSDShort } from '../../utils/format';
import { DEX, DexInfo } from '../../config/web3/dexs';
import SupplyPositionAPRInfo from '../../components/PositionAPRInfo/SupplyPositionAPRInfo';
import { SupplyVaultInfo, SUPPLY_VAULTS } from '../../config/web3/contracts/supply-vault';
import { useWeb3React } from '@web3-react/core';
import { Web3Provider } from '@ethersproject/providers';
import { Address } from '../../types/interfaces';
import StakeInteractionModal from '../../components/InteractionModal/StakeInteractionModal';
import InteractionButton, { ButtonState } from '../../components/InteractionButton';
import { useState } from 'react';
import useTarotRouter, { useDefaultChainId } from '../../hooks/useTarotRouter';
import useAccount from '../../hooks/useAccount';
import { faBolt, faLongArrowAltRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useFullLendingPoolsData, useSupplyVault } from '../../hooks/useData';
import { parseNumber } from '../../utils/big-amount';
import VaultLabel from '../../components/VaultLabel';
import { getVaultDetails } from '../../config/web3/contracts/vault-details';
import usePairAddress from '../../hooks/usePairAddress';
import { getAB } from '../../utils';
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
  suppliedAmountA: number;
  suppliedAmountB: number;
  suppliedValueA: number;
  suppliedValueB: number;
  tokenA: Address,
  tokenB: Address
}

interface MigrationInfo {
  supplyVaultAddress: string;
  supplyVaultInfo: SupplyVaultInfo;
}

const SupplyPositionCard = ({
  dex,
  tokenIconA,
  tokenIconB,
  symbolA,
  symbolB,
  suppliedAmountA,
  suppliedAmountB,
  suppliedValueA,
  suppliedValueB,
  tokenA,
  tokenB
}: Props): JSX.Element => {
  const { chainId: web3ChainId } = useWeb3React<Web3Provider>();
  const defaultChainId = useDefaultChainId();
  const chainId = web3ChainId || defaultChainId;
  const tarotRouter = useTarotRouter();
  const account = useAccount();
  const lendingPoolId = usePairAddress();
  const fullLendingPoolsData = useFullLendingPoolsData() || {};
  const pool = fullLendingPoolsData[lendingPoolId.toLowerCase()] || {};
  const vaultDetails = getVaultDetails(lendingPoolId.toLowerCase());
  const {
    supplyAPR,
    poolDisabled,
    poolDeactivated
  } = pool;
  const [supplyAPYA, supplyAPYB] = getAB(supplyAPR);
  if (!tokenA || !tokenB) {
    return <></>;
  }
  const supplyVaults = Object.keys(SUPPLY_VAULTS[chainId]);
  let migrationInfoA: MigrationInfo | undefined;
  let migrationInfoB: MigrationInfo | undefined;
  if (tarotRouter.account && account && tarotRouter.account.toLowerCase() === account.toLowerCase()) {
    for (const supplyVaultAddress of supplyVaults) {
      const supplyVaultInfo = SUPPLY_VAULTS[chainId][supplyVaultAddress];
      if (supplyVaultInfo.paused) {
        continue;
      }
      const vaultBorrowables = supplyVaultInfo.borrowableAddresses.map(x => x.toLowerCase());
      if (suppliedAmountA > 0 && vaultBorrowables.includes(tokenA.toLowerCase())) {
        migrationInfoA = {
          supplyVaultAddress: supplyVaultAddress,
          supplyVaultInfo: supplyVaultInfo
        };
      }
      if (suppliedAmountB > 0 && vaultBorrowables.includes(tokenB.toLowerCase())) {
        migrationInfoB = {
          supplyVaultAddress: supplyVaultAddress,
          supplyVaultInfo: supplyVaultInfo
        };
      }
    }
  }
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
            stable={pool.stable}
            className='text-lg' />
        </div>
      </GridWrapper>
      <GridWrapper
        className={clsx(
          'mb-4'
        )}>
        <span
          className='text-xl col-span-4 text-textPrimary filter saturate-50 self-center justify-self-center items-center'>
          {pool.stable ? 'sAMM-' : [DEX.SOLIDLY, DEX.SPIRIT_V2, DEX.VELODROME, DEX.XCAL].includes(dex.id) ? 'vAMM-' : ''}{symbolA}/{symbolB}
        </span>
        {poolDisabled ? <span className='col-span-4 text-textPrimary filter saturate-50 self-center justify-self-center items-center'>(DECOMMISSIONED)</span> : ''}
        {poolDeactivated ? <span className='col-span-4 text-textPrimary filter saturate-50 self-center justify-self-center items-center'>(DEACTIVATED)</span> : ''}
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
          label='Amount'
          valueA={formatAmountShort(suppliedAmountA)}
          valueB={formatAmountShort(suppliedAmountB)}
          titleA={formatFloat(suppliedAmountA)}
          titleB={formatFloat(suppliedAmountB)} />
        <PropertyRow
          label='Value'
          valueA={formatUSDShort(suppliedValueA)}
          valueB={formatUSDShort(suppliedValueB)}
          titleA={formatUSD(suppliedValueA)}
          titleB={formatUSD(suppliedValueB)} />
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
          <PropertyLabel className='text-lg self-center justify-self-start'>
        Total Supplied Value
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
              title={formatUSD(suppliedValueA + suppliedValueB)}
              className='self-center'>
              {formatUSDShort(suppliedValueA + suppliedValueB)}
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
          <SupplyPositionAPRInfo />
        </div>
      </div>
      {migrationInfoA &&
        <MigrationDetails
          supplyAPY={supplyAPYA}
          migrationInfo={migrationInfoA}
          token={tokenA} />
      }
      {migrationInfoB &&
        <MigrationDetails
          supplyAPY={supplyAPYB}
          migrationInfo={migrationInfoB}
          token={tokenB} />
      }
    </Card>
  );
};

interface MigrationDetailsProps {
  supplyAPY: number;
  migrationInfo: MigrationInfo;
  token: Address,
}

const MigrationDetails = ({
  migrationInfo,
  supplyAPY,
  token
}: MigrationDetailsProps): JSX.Element => {
  const { chainId } = useWeb3React<Web3Provider>();
  if (!chainId) {
    throw new Error('Invalid chain ID!');
  }
  const [showStakeModal, toggleStakeModal] = useState(false);
  const supplyVaultDetails = useSupplyVault(migrationInfo.supplyVaultAddress);
  const stakingAPR = parseNumber(
    {
      amount: (supplyVaultDetails.feeDistributorRate ?
        supplyVaultDetails.supplyRate.amount.add(supplyVaultDetails.feeDistributorRate.amount) :
        supplyVaultDetails.supplyRate.amount).mul(365 * 24 * 60 * 60),
      decimals: supplyVaultDetails.supplyRate.decimals
    });
  return (
    <div className='p-0 mt-4 -mx-2'>
      <InteractionButton
        className='text-sm xs:text-base w-full'
        name={`bTAROT -> ${migrationInfo.supplyVaultInfo.symbol}`}
        nameElement={
          <>
            <FontAwesomeIcon icon={faBolt} /> bTAROT <FontAwesomeIcon icon={faLongArrowAltRight} /> {migrationInfo.supplyVaultInfo.symbol}
          </>
        }
        onCall={e => {
          e.preventDefault();
          return toggleStakeModal(true);
        }}
        state={ButtonState.Ready} />
      <StakeInteractionModal
        actionButtonLabel='Convert'
        message={
          <div className='p-1'>
            <div className='flex flex-row space-x-2'>
              <div className='flex flex-col items-end'>
                <div className='flex-grow'>bTAROT APR:</div>
                <div className='flex-grow'>{migrationInfo.supplyVaultInfo.symbol} APR:</div>
              </div>
              <div className='flex flex-col items-end'>
                <div className='flex-grow'>{formatPercentage(supplyAPY)}</div>
                <div className='flex-grow'>{formatPercentage(stakingAPR)}</div>
              </div>
            </div>
          </div>
        }
        show={showStakeModal}
        toStakeSymbol='bTAROT'
        toStakeAddress={token}
        supplyVaultAddress={migrationInfo.supplyVaultAddress}
        toggleShow={toggleStakeModal}
        title={`Convert to ${migrationInfo.supplyVaultInfo.symbol}`} />
    </div>
  );
};

export default SupplyPositionCard;