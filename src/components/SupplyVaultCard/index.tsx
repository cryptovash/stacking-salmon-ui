
import clsx from 'clsx';
import { Address, EMPTY_SUPPLY_VAULT } from '../../types/interfaces';
import StakeInteractionModal from '../../components/InteractionModal/StakeInteractionModal';
import UnstakeInteractionModal from '../../components/InteractionModal/UnstakeInteractionModal';
import { useState } from 'react';
import InteractionButton, { ButtonState } from '../../components/InteractionButton';
import { formatAmount, formatFloat, formatPercentageShort, formatUSD, formatUSDShort } from '../../utils/format';
import { useFullSupplyVaultsData, useSupplyVaultUnderlyingBalance, useTokenBalance, useTokenPriceFromMap } from '../../hooks/useData';
import { formatUnits } from '@ethersproject/units';
import { useWeb3React } from '@web3-react/core';
import { Web3Provider } from '@ethersproject/providers';
import { parseNumber } from '../../utils/big-amount';
import { SUPPLY_VAULTS } from '../../config/web3/contracts/supply-vault';
import TarotImage from '../../components/UI/TarotImage';
import { getAddress } from '@ethersproject/address';
import { XTAROT_ADDRESSES } from '../../config/web3/contracts/tarot';
import { BigNumber } from '@ethersproject/bignumber';
import { Link } from 'react-router-dom';
import Card from '../../components/Card';
import { PAGES } from '../../utils/constants/links';
import { AlertTriangle } from 'react-feather';
import tailwindConfig from '../../tailwind.config';
import MigrateIntoSupplyVaultModal from '../../components/InteractionModal/MigrateIntoSupplyVaultModal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBolt } from '@fortawesome/free-solid-svg-icons';
import { XTINSPIRIT_ADDRESS } from '../../config/web3/contracts/wrapped-escrow-spirit';
import { useDefaultChainId } from '../../hooks/useTarotRouter';
import React from 'react';

interface Props {
  supplyVaultAddress: Address;
  isDashboard: boolean;
  searchTerm?: string;
  hideDust?: boolean;
  account?: Address;
}

const SupplyVaultCard = ({
  supplyVaultAddress,
  isDashboard = false,
  searchTerm,
  hideDust,
  account
}: Props): JSX.Element => {
  const { chainId: web3ChainId } = useWeb3React<Web3Provider>();
  const defaultChainId = useDefaultChainId();
  const chainId = web3ChainId || defaultChainId;
  const supplyVaultInfo = SUPPLY_VAULTS[chainId][supplyVaultAddress];
  const fullSupplyVaultsData = useFullSupplyVaultsData() || {};
  const supplyVault = fullSupplyVaultsData[supplyVaultAddress] || EMPTY_SUPPLY_VAULT;
  const { shareValuedAsUnderlying, supplyRate, totalUnderlying, feeDistributorRate } = supplyVault;
  const [showStakeModal, toggleStakeModal] = useState(false);
  const [showUnstakeModal, toggleUnstakeModal] = useState(false);
  const [showMigrateModal, toggleMigrateModal] = useState(false);
  const underlyingBalanceForAccount = useSupplyVaultUnderlyingBalance(supplyVaultAddress, account);

  const underlyingPrice = parseFloat(formatUnits(useTokenPriceFromMap(supplyVaultInfo.underlyingAddress.toLowerCase()).priceUSD.value));

  const totalUnderlyingUSD = parseNumber(totalUnderlying) * underlyingPrice;
  const underlyingBalanceForAccountUSD = parseNumber(underlyingBalanceForAccount) * underlyingPrice;
  const shareBalance = useTokenBalance(supplyVaultAddress, account);
  const migrateFromBalance = useTokenBalance(supplyVaultInfo.migrateFromAddress || supplyVaultAddress, account);
  const stakingAPR = parseNumber(
    {
      amount: (feeDistributorRate ? supplyRate.amount.add(feeDistributorRate.amount) : supplyRate.amount).mul(365 * 24 * 60 * 60),
      decimals: supplyRate.decimals
    });
  const isXtarot = supplyVaultAddress.toLowerCase() === XTAROT_ADDRESSES[chainId].toLowerCase();
  const isXtinspirit = supplyVaultAddress.toLowerCase() === XTINSPIRIT_ADDRESS.toLowerCase();

  if (isDashboard && shareBalance.amount.eq(BigNumber.from(0))) {
    return <></>;
  }

  if (isDashboard && hideDust && underlyingBalanceForAccountUSD < 1) {
    return <></>;
  }

  if (isDashboard && searchTerm) {
    const terms = searchTerm.toLowerCase().replace(/[-]/, ' ').trim().split(' ');
    if (!terms.every(term => supplyVaultInfo.symbol.toLowerCase().includes(term) ||
      supplyVaultInfo.underlyingSymbol.toLowerCase().includes(term)
    )) {
      return <></>;
    }
  }

  const content = (
    <>
      <div className={`flex flex-col w-full md:min-w-lg items-center justify-center rounded-xl text-base text-textSecondary ${isDashboard ? 'p-0' : 'p-4'}`}>
        <div className={`flex flex-col items-center justify-start mb-4 space-y-2 ${isDashboard ? 'mt-6' : 'mt-2'}`}>
          <TarotImage
            className={clsx(
              'w-12',
              'h-12',
              'mb-2'
            )}
            src={`/assets/images/token-icons/${getAddress(supplyVaultAddress)}.png`}
            placeholder='/assets/images/default.png'
            error='/assets/images/default.png'
            alt={supplyVaultInfo.symbol} />
          {(isDashboard || !isXtarot) &&
          <div className='text-base sm:text-lg text-textPrimary flex items-start'>{isXtarot ? 'xTAROT' : isXtinspirit ? 'xtinSPIRIT' : `${supplyVaultInfo.underlyingSymbol} Supply Vault`}</div>
          }
          {(!isDashboard && !isXtarot && !supplyVaultInfo.paused) &&
          <>
            <div className='text-sm sm:text-base text-textSecondary flex items-start'>{`Stake ${supplyVaultInfo.underlyingSymbol}, Earn ${supplyVaultInfo.underlyingSymbol}`}</div>
            {isXtinspirit &&
            <div className='pt-2 focus-within:text-xs sm:text-sm text-tarotJade-50 filter saturate-200 brightness-125 flex flex-col items-center items-start'>
              <div>15% of Boosted LP Rewards</div>
              <div>+</div>
              <div>100% of inSPIRIT Rewards</div>
            </div>
            }
          </>
          }
          {supplyVaultInfo.paused && <div className='text-sm sm:text-base text-textSecondary flex items-start'>(Paused)</div>}
        </div>
        {!isDashboard &&
        <>
          <div className='mt-2 flex flex-col items-center justify-end mb-4'>
            <div className='text-base sm:text-lg'>Staked TVL</div>
            <div className='text-lg sm:text-xl text-textPrimary flex items-start'><div className='text-lg -mt-0.5'>$</div>{formatAmount(totalUnderlyingUSD)}</div>
          </div>
          <div className='flex flex-col items-center justify-end mb-6'>
            <div className='text-base sm:text-lg'>APR Estimate</div>
            <div className='text-xl sm:text-2xl flex items-start text-green-600 font-bold'>{formatPercentageShort(stakingAPR, '')}<div className='text-lg -mt-0.5'>%</div></div>
          </div>
          {!supplyVaultInfo.paused &&
          <div className='!mb-4 flex flex-row justify-around space-x-4'>
            <div className='flex flex-col items-center justify-start'>
              <TarotImage
                className={clsx(
                  'w-8',
                  'h-8',
                  'mb-2'
                )}
                src={`/assets/images/token-icons/${getAddress(supplyVaultAddress)}.png`}
                placeholder='/assets/images/default.png'
                error='/assets/images/default.png'
                alt={supplyVaultInfo.symbol} />
              <div className='text-lg sm:text-xl text-textPrimary flex items-start'>1</div>
              <div className='text-base sm:text-lg'>{supplyVaultInfo.symbol}</div>
            </div>
            <div className='flex flex-col justify-center mt-3 text-lg sm:text-xl'>=</div>
            <div className='flex flex-col items-center justify-start'>
              <TarotImage
                className={clsx(
                  'w-8',
                  'h-8',
                  'mb-2'
                )}
                src={`/assets/images/token-icons/${getAddress(supplyVaultInfo.underlyingAddress)}.png`}
                placeholder='/assets/images/default.png'
                error='/assets/images/default.png'
                alt={supplyVaultInfo.symbol} />
              <div className='text-lg sm:text-xl text-textPrimary flex items-start'>{formatFloat(parseNumber(shareValuedAsUnderlying), 8)}</div>
              <div className='text-base sm:text-lg'>{supplyVaultInfo.underlyingSymbol}</div>
            </div>
          </div>
          }
        </>
        }
        {supplyVaultInfo.paused &&
        <div className='flex flex-row bg-tarotBlackHaze border items-center border-tarotBlackHaze-400 rounded-lg p-4 space-x-4 mt-2 mb-2 w-full'>
          <div>
            <AlertTriangle
              color={tailwindConfig.theme.extend.colors.tarotBlackHaze['800']}
              fill={tailwindConfig.theme.extend.colors.tarotBlackHaze['200']} />
          </div>
          <div className='text-sm text-textSecondary'>This Supply Vault is paused.</div>
        </div>
        }
        {web3ChainId && !isDashboard && supplyVaultInfo.migrateFromAddress && migrateFromBalance.amount.gt(0) &&
        <div
          className='w-full my-2'
          title={`Migrate your ${supplyVaultInfo.symbol} from the paused ${supplyVaultInfo.underlyingSymbol} Supply Vault`}>
          <InteractionButton
            className='w-full text-sm xs:text-base'
            name='Migrate'
            nameElement={
              <><FontAwesomeIcon icon={faBolt} /> Migrate {supplyVaultInfo.symbol}</>
            }
            onCall={e => {
              e.preventDefault();
              return toggleMigrateModal(true);
            }}
            state={ButtonState.Ready} />
        </div>
        }
        {(web3ChainId || isDashboard) &&
        <div className={`!mb-0 flex flex-col items-stretch justify-around space-y-4 w-full ${isDashboard ? 'mt-2' : 'mt-4 p-6 py-6 border border-tarotJade-400 rounded-lg bg-tarotJade-800'}`}>
          <div className='flex flex-col items-center'>
            <div className='text-base sm:text-lg text-center'>{supplyVaultInfo.symbol} Balance</div>
            <div
              className='text-base sm:text-lg text-textPrimary items-center flex flex-grow text-center'
              title={formatUnits(shareBalance.amount, shareBalance.decimals)}>{formatAmount(parseNumber(shareBalance))}{`\u00A0`}
              <TarotImage
                className={clsx(
                  'w-4',
                  'h-4'
                )}
                src={`/assets/images/token-icons/${getAddress(supplyVaultAddress)}.png`}
                placeholder='/assets/images/default.png'
                error='/assets/images/default.png'
                alt={supplyVaultInfo.symbol} />
            </div>
          </div>
          <div className='flex flex-col items-center'>
            <div className='text-base sm:text-lg text-center'>Claimable {supplyVaultInfo.underlyingSymbol}</div>
            <div
              className='text-base sm:text-lg text-textPrimary items-center flex flex-grow text-center'
              title={formatUnits(underlyingBalanceForAccount.amount, underlyingBalanceForAccount.decimals)}>
              {formatAmount(parseNumber(underlyingBalanceForAccount))}
              {`\u00A0`}
              <TarotImage
                className={clsx(
                  'w-4',
                  'h-4'
                )}
                src={`/assets/images/token-icons/${getAddress(supplyVaultInfo.underlyingAddress)}.png`}
                placeholder='/assets/images/default.png'
                error='/assets/images/default.png'
                alt={supplyVaultInfo.symbol} />
            </div>
            {!isDashboard &&
            <div
              className='text-base sm:text-lg text-textSecondary items-center flex flex-grow text-center'
              title={`$${underlyingBalanceForAccountUSD}`}>(<div className='text-base -mt-0.5'>$</div>{formatAmount(underlyingBalanceForAccountUSD)})
            </div>
            }
          </div>
          {!isDashboard && web3ChainId &&
          <div className='space-x-4 md:space-x-6 flex flex-row justify-around'>
            <div className='flex-grow'></div>
            {supplyVaultInfo.migrateToAddress && shareBalance.amount.gt(0) &&
            <InteractionButton
              className='text-sm xs:text-base sm:text-lg'
              name='Migrate'
              nameElement={
                <>Migrate <FontAwesomeIcon icon={faBolt} /></>
              }
              onCall={() => toggleMigrateModal(true)}
              state={ButtonState.Ready} />
            }
            {!supplyVaultInfo.paused &&
            <InteractionButton
              className='text-sm xs:text-base sm:text-lg'
              name='Stake'
              onCall={() => toggleStakeModal(true)}
              state={ButtonState.Ready} />
            }
            <InteractionButton
              className='text-sm xs:text-base sm:text-lg'
              name='Unstake'
              onCall={() => toggleUnstakeModal(true)}
              state={ButtonState.Ready} />
            <div className='flex-grow'></div>
          </div>
          }
          {isDashboard &&
          <>
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
              <div className='text-lg self-center justify-self-start'>
                Total Supplied Value
              </div>
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
                <div
                  title={formatUSD(underlyingBalanceForAccountUSD)}
                  className='self-center'>
                  {formatUSDShort(underlyingBalanceForAccountUSD)}
                </div>
              </div>
            </div>
            <div className='flex flex-col items-center justify-end'>
              <div className='text-base sm:text-lg'>APR Estimate</div>
              <div className='text-lg sm:text-xl flex items-start text-green-600 font-bold'>{formatPercentageShort(stakingAPR, '')}<div className='text-lg -mt-0.5'>%</div></div>
            </div>
          </>
          }
        </div>
        }
      </div>
      {!isDashboard && web3ChainId &&
      <>
        <StakeInteractionModal
          show={showStakeModal}
          toStakeSymbol={supplyVaultInfo.underlyingSymbol}
          toStakeAddress={supplyVaultInfo.underlyingAddress}
          supplyVaultAddress={supplyVaultAddress}
          toggleShow={toggleStakeModal}
          title={isXtarot ? `Stake in xTAROT` : isXtinspirit ? `Stake in xtinSPIRIT` : `Stake in ${supplyVaultInfo.underlyingSymbol} Supply Vault`} />
        <UnstakeInteractionModal
          show={showUnstakeModal}
          supplyVaultAddress={supplyVaultAddress}
          toggleShow={toggleUnstakeModal} />
        {(supplyVaultInfo.migrateFromAddress || supplyVaultInfo.migrateToAddress) &&
            <MigrateIntoSupplyVaultModal
              show={showMigrateModal}
              supplyVaultAddress={supplyVaultInfo.migrateToAddress ? supplyVaultInfo.migrateToAddress : supplyVaultAddress}
              toggleShow={toggleMigrateModal} />
        }
      </>
      }
    </>
  );

  if (isDashboard) {
    return (
      <Link
        key={supplyVaultAddress}
        to={isXtarot ? PAGES.STAKE : isXtinspirit ? PAGES.TINSPIRIT : PAGES.SUPPLY_VAULTS}
        style={{
          order: 0 - Math.round(underlyingBalanceForAccountUSD)
        }}>
        <Card
          isLendingPoolDetail={false}>
          {content}
        </Card>
      </Link>
    );
  } else {
    return content;
  }
};

export default SupplyVaultCard;
