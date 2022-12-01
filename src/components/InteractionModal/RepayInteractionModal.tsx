import { useWeb3React } from '@web3-react/core';
import { LENDING_POOL_DETAILS_MAP } from '../../config/web3/contracts/lending-pools';
import { WETH_ADDRESSES } from '../../config/web3/contracts/weth';
import { BigNumber } from 'ethers';
import { Web3Provider } from '@ethersproject/providers';
import { parseUnits } from 'ethers/lib/utils';
import usePairAddress from '../../hooks/usePairAddress';
import { useState } from 'react';
import { getMinimumTxAmount, getTokenSymbol } from '../../utils';
import { InteractionModalContainer } from '.';
import { useApprove } from '../../hooks/useApprove';
import { useBorrowed, useTokenBalance } from '../../hooks/useData';
import usePoolToken from '../../hooks/usePoolToken';
import useRepay from '../../hooks/useRepay';
import { ApprovalType, PoolTokenType } from '../../types/interfaces';
import InputBigAmount from '../../components/InputBigAmount';
import InteractionButton from '../InteractionButton';
import RiskMetrics from '../RiskMetrics';
import React from 'react';

/**
 * Props for the deposit interaction modal.
 * @property show Shows or hides the modal.
 * @property toggleShow A function to update the show variable to show or hide the Modal.
 */
export interface RepayInteractionModalProps {
  show: boolean;
  toggleShow(s: boolean): void;
}

/**
 * Styled component for the norrow modal.
 * @param param0 any Props for component
 * @see RepayInteractionModalProps
 */

export default function RepayInteractionModal({ show, toggleShow }: RepayInteractionModalProps): JSX.Element {
  const [val, setVal] = useState<string>('0');
  const { chainId } = useWeb3React<Web3Provider>();

  if (!chainId) {
    throw new Error('Invalid chain ID!');
  }
  const lendingPoolId = usePairAddress();
  const poolTokenType = usePoolToken();

  const symbol = getTokenSymbol(lendingPoolId, poolTokenType);
  const poolDetails = LENDING_POOL_DETAILS_MAP[lendingPoolId.toLowerCase()];

  const underlying = poolDetails[poolTokenType === PoolTokenType.BorrowableA ? 'tokenAddress0' : 'tokenAddress1'].toLowerCase();
  const { amount: availableAmount, decimals } = useTokenBalance(underlying);
  const borrowed = useBorrowed();

  let maxAvailableAmount = availableAmount;
  if (underlying.toLowerCase() === WETH_ADDRESSES[chainId].toLowerCase()) {
    if (maxAvailableAmount.lte(getMinimumTxAmount(chainId))) {
      maxAvailableAmount = BigNumber.from(0);
    } else {
      maxAvailableAmount = maxAvailableAmount.sub(getMinimumTxAmount(chainId || 250));
    }
  }
  const max = maxAvailableAmount.lt(borrowed.amount) ? maxAvailableAmount : borrowed.amount;
  const bigAmount = availableAmount.lt(borrowed.amount) ? availableAmount : borrowed.amount;

  const amount = parseUnits(val, decimals);
  const invalidInput = amount.gt(bigAmount) || amount.eq(0);
  const [approvalState, onApprove] = useApprove(ApprovalType.UNDERLYING, amount, invalidInput);
  const [repayState, repay] = useRepay(approvalState, amount, invalidInput);
  const onRepay = async () => {
    await repay();
    setVal('0');
    toggleShow(false);
  };

  return (
    <InteractionModalContainer
      title='Repay'
      show={show}
      toggleShow={toggleShow}>
      <>
        <RiskMetrics
          changeBorrowedA={poolTokenType === PoolTokenType.BorrowableA ? -val : 0}
          changeBorrowedB={poolTokenType === PoolTokenType.BorrowableB ? -val : 0} />
        <InputBigAmount
          val={val}
          setVal={setVal}
          suffix={symbol}
          availableSuffix={`${symbol}\u00A0`}
          availableTitle='Available'
          available={bigAmount}
          max={max}
          decimals={decimals} />
        <div className='mt-4 flex justify-between'>
          <InteractionButton
            name='Approve'
            onCall={onApprove}
            state={approvalState} />
          <InteractionButton
            name='Repay'
            onCall={onRepay}
            state={repayState} />
        </div>
      </>
    </InteractionModalContainer>
  );
}