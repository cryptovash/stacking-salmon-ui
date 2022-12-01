import { useState } from 'react';
import { InteractionModalContainer } from '.';
import InteractionButton from '../InteractionButton';
import { useTokenBalance } from '../../hooks/useData';
import { useWeb3React } from '@web3-react/core';
import { Web3Provider } from '@ethersproject/providers';
import InputBigAmount from '../../components/InputBigAmount';
import { parseUnits } from 'ethers/lib/utils';
import { useApproveXStake } from '../../hooks/useApprove';
import useXStake from '../../hooks/useXStake';
import { XTAROT_ADDRESSES } from '../../config/web3/contracts/tarot';
import { X_STAKING_POOLS } from '../../config/web3/contracts/x-staking-pool';
import React from 'react';

/**
 * Props for the stake interaction modal.
 * @property show Shows or hides the modal.
 * @property toggleShow A function to update the show variable to show or hide the Modal.
 */
export interface XStakeInteractionModalProps {
  show: boolean;
  toggleShow(s: boolean): void;
  poolId: number;
  title?: string;
  message?: string | JSX.Element;
  hasPendingReward: boolean;
  actionButtonLabel?: string;
}

export default function XStakeInteractionModal({ show, toggleShow, poolId, title, message, hasPendingReward, actionButtonLabel = 'Stake' }: XStakeInteractionModalProps): JSX.Element {
  const [val, setVal] = useState<string>('0');

  const { chainId } = useWeb3React<Web3Provider>();

  if (!chainId) {
    throw new Error('Invalid chain ID!');
  }
  const { amount: bigAmount, decimals } = useTokenBalance(XTAROT_ADDRESSES[chainId]);

  const max = bigAmount;

  const amount = parseUnits(val, decimals);
  const invalidInput = amount.gt(bigAmount) || amount.eq(0);
  const [approvalState, onApprove] = useApproveXStake(amount, invalidInput);
  const [stakeState, stake] = useXStake(approvalState, poolId, amount, decimals, invalidInput);

  const onStake = async () => {
    await stake();
    setVal('0');
    toggleShow(false);
  };

  return (
    <InteractionModalContainer
      title={title || 'xStake'}
      show={show}
      toggleShow={toggleShow}>
      <>
        {message && <div className='text-xs sm:text-sm text-textSecondary'>{message}</div>}
        <InputBigAmount
          val={val}
          setVal={setVal}
          suffix='xTAROT'
          availableSuffix={`xTAROT\u00A0`}
          availableTitle='Available'
          available={bigAmount}
          max={max}
          decimals={decimals} />
        {hasPendingReward && <div className='text-xs sm:text-sm text-textSecondary'>Pending {X_STAKING_POOLS[chainId][poolId].rewardTokenSymbol} will also be claimed.</div>}
        <div className='mt-4 flex justify-between'>
          <InteractionButton
            name='Approve'
            onCall={onApprove}
            state={approvalState} />
          <InteractionButton
            name={actionButtonLabel}
            onCall={onStake}
            state={stakeState} />
        </div>
      </>
    </InteractionModalContainer>
  );
}
