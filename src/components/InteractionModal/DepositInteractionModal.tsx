import { Web3Provider } from '@ethersproject/providers';
import { useWeb3React } from '@web3-react/core';
import { DEPOSIT_FEE_BPS_MAP, LENDING_POOL_DETAILS_MAP } from '../../config/web3/contracts/lending-pools';
import { WETH_ADDRESSES } from '../../config/web3/contracts/weth';
import { getDexById } from '../../config/web3/dexs';
import { BigNumber } from 'ethers';
import { formatUnits, parseUnits } from 'ethers/lib/utils';
import usePairAddress from '../../hooks/usePairAddress';
import { useState } from 'react';
import { AlertTriangle, ExternalLink } from 'react-feather';
import { getMinimumTxAmount, getTokenSymbol } from '../../utils';
import { InteractionModalContainer } from '.';
import { useApprove } from '../../hooks/useApprove';
import { useFullLendingPoolsData, useTokenBalance } from '../../hooks/useData';
import useDeposit from '../../hooks/useDeposit';
import usePoolToken from '../../hooks/usePoolToken';
import { useAddLiquidityUrl } from '../../hooks/useUrlGenerator';
import { ApprovalType, PoolTokenType } from '../../types/interfaces';
import InputBigAmount from '../../components/InputBigAmount';
import InteractionButton from '../InteractionButton';
import RiskMetrics from '../RiskMetrics';
import SupplyAPY from './TransactionRecap/SupplyAPY';
import TransactionSize from './TransactionRecap/TransactionSize';
import tailwindConfig from '../../tailwind.config';
import { getVaultDetailsByType } from '../../config/web3/contracts/vault-details';
import React from 'react';

/**
 * Props for the deposit interaction modal.
 * @property show Shows or hides the modal.
 * @property toggleShow A function to update the show variable to show or hide the Modal.
 */
export interface DepositInteractionModalProps {
  show: boolean;
  toggleShow(s: boolean): void;
}

export default function DepositInteractionModal({ show, toggleShow }: DepositInteractionModalProps): JSX.Element {
  const { chainId } = useWeb3React<Web3Provider>();
  const lendingPoolId = usePairAddress();
  const poolTokenType = usePoolToken();
  const fullLendingPoolsMap = useFullLendingPoolsData() || {};
  const pool = fullLendingPoolsMap[lendingPoolId.toLowerCase()] || {};
  const poolDetails = LENDING_POOL_DETAILS_MAP[lendingPoolId.toLowerCase()] || {};
  const vaultDetails = poolDetails.vaultType && getVaultDetailsByType(poolDetails.vaultType);
  const depositFeeBps = BigNumber.from(pool.depositFeeBps && pool.depositFeeBps.toString() !== '0' ? pool.depositFeeBps : DEPOSIT_FEE_BPS_MAP[lendingPoolId.toLowerCase()] || '0');
  const underlying = poolDetails[poolTokenType === PoolTokenType.BorrowableA ? 'tokenAddress0' : poolTokenType === PoolTokenType.BorrowableB ? 'tokenAddress1' : 'uniswapV2PairAddress'].toLowerCase();
  const [val, setVal] = useState<string>('0');

  const { amount: bigAmount, decimals } = useTokenBalance(underlying);

  let max = bigAmount;
  if (underlying.toLowerCase() === WETH_ADDRESSES[chainId || 250].toLowerCase()) {
    if (bigAmount.lte(getMinimumTxAmount(chainId || 250))) {
      max = BigNumber.from(0);
    } else {
      max = bigAmount.sub(getMinimumTxAmount(chainId || 250));
    }
  }

  const symbol = getTokenSymbol(lendingPoolId, poolTokenType);
  const addLiquidityUrl = useAddLiquidityUrl();
  const dex = getDexById(chainId || 250, poolDetails.dex);

  const amount = parseUnits(val, decimals);
  const valAsNumber = parseFloat(val);
  const invalidInput = amount.gt(bigAmount) || amount.eq(0);
  const [approvalState, onApprove, permitData] = useApprove(ApprovalType.UNDERLYING, amount, invalidInput);
  const [depositState, deposit] = useDeposit(approvalState, amount, invalidInput, permitData);
  const onDeposit = async () => {
    await deposit();
    setVal('0');
    toggleShow(false);
  };

  if (bigAmount.isZero()) {
    return (
      <InteractionModalContainer
        title={poolTokenType === PoolTokenType.Collateral ? 'Deposit' : 'Supply'}
        show={show}
        toggleShow={toggleShow}>
        <>
          You need to hold {symbol}{poolTokenType === PoolTokenType.Collateral ? ` from ${dex.dexName}` : ''} in your wallet in order to deposit it.
          {poolTokenType === PoolTokenType.Collateral && dex.addLiquidityUrl ? (
            <>
              <br />
              <br />
              You can obtain it by&nbsp;
              <a
                className='underline'
                target='_blank'
                href={addLiquidityUrl}
                rel='noopener noreferrer'>
                providing liquidity on {dex.dexName} <ExternalLink
                  className='inline-block w-5 -mt-1 -ml-0.5' />
              </a>
            </>
          ) : null}
        </>
      </InteractionModalContainer>
    );
  }

  return (
    <InteractionModalContainer
      title={poolTokenType === PoolTokenType.Collateral ? 'Deposit' : 'Supply'}
      show={show}
      toggleShow={toggleShow}>
      <>
        {poolTokenType === PoolTokenType.Collateral && (<RiskMetrics
          changeCollateral={valAsNumber}
          hideIfNull={true} />)}
        <InputBigAmount
          val={val}
          setVal={setVal}
          suffix={symbol}
          availableSuffix={`${symbol}\u00A0`}
          availableTitle='Available'
          available={bigAmount}
          max={max}
          decimals={decimals} />
        <div className='text-sm'>
          <TransactionSize amount={valAsNumber} />
          <SupplyAPY amount={valAsNumber} />
        </div>
        {poolTokenType === PoolTokenType.Collateral && depositFeeBps.gt(0) && (

          <div className='flex flex-row bg-tarotJade-900 border items-center border-tarotJade-400 rounded-lg p-4 space-x-4 !my-3 -mx-1'>
            <div>
              <AlertTriangle
                color={tailwindConfig.theme.extend.colors.tarotJade['800']}
                fill={tailwindConfig.theme.extend.colors.tarotJade['200']} />
            </div>
            <div className='text-sm text-textSecondary'>{vaultDetails ? `${vaultDetails.vaultName} charges a ` : 'There is a '}{formatUnits(depositFeeBps, 2)}% deposit fee for this pool.</div>
          </div>
        )}
        {poolDetails.poolDisabled &&
          <div className='flex flex-row bg-tarotJade-900 border items-center border-tarotMistyRose-800 rounded-lg p-4 space-x-4 !my-3 -mx-1'>
            <div>
              <AlertTriangle
                color={tailwindConfig.theme.extend.colors.tarotJade['800']}
                fill={tailwindConfig.theme.extend.colors.tarotMistyRose['600']} />
            </div>
            <div className='flex flex-col'>
              <div className='text-sm font-bold text-tarotMistyRose-600'>DECOMMISSIONED</div>
              <div className='text-sm text-textPrimary'>Before you proceed, please visit the&nbsp;
                <a
                  className='inline-block border-b'
                  target='_blank'
                  title='Tarot Discord'
                  href='https://discord.gg/6ByFHBjqE8'
                  rel='noopener noreferrer'>Tarot Discord
                </a> for more information.
              </div>
            </div>
          </div>
        }
        {poolTokenType !== PoolTokenType.Collateral && poolDetails.poolDeactivated &&
          <div className='flex flex-row bg-tarotJade-900 border items-center border-tarotMistyRose-800 rounded-lg p-4 space-x-4 !my-3 -mx-1'>
            <div>
              <AlertTriangle
                color={tailwindConfig.theme.extend.colors.tarotJade['800']}
                fill={tailwindConfig.theme.extend.colors.tarotMistyRose['600']} />
            </div>
            <div className='flex flex-col'>
              <div className='text-sm font-bold text-tarotMistyRose-600'>DEACTIVATED</div>
              <div className='text-sm text-textPrimary'>Before you proceed, please visit the&nbsp;
                <a
                  className='inline-block border-b'
                  target='_blank'
                  title='Tarot Discord'
                  href='https://discord.gg/6ByFHBjqE8'
                  rel='noopener noreferrer'>Tarot Discord
                </a> for more information.
              </div>
            </div>
          </div>
        }
        <div className='mt-4 flex justify-between'>
          <InteractionButton
            name='Approve'
            onCall={onApprove}
            state={approvalState} />
          <InteractionButton
            name={poolTokenType === PoolTokenType.Collateral ? 'Deposit' : 'Supply'}
            onCall={onDeposit}
            state={depositState} />
        </div>
      </>
    </InteractionModalContainer>
  );
}