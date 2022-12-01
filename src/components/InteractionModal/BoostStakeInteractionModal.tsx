import { useState } from 'react';
import { InteractionModalContainer } from '.';
import InteractionButton from '../InteractionButton';
import { useTokenBalance } from '../../hooks/useData';
import { useWeb3React } from '@web3-react/core';
import { Web3Provider } from '@ethersproject/providers';
import InputBigAmount from '../../components/InputBigAmount';
import { parseUnits } from 'ethers/lib/utils';
import { useApproveBoostStake } from '../../hooks/useApprove';
import { BoostMaxxPoolInfo } from '../../types/interfaces';
import useBoostStake from '../../hooks/useBoostStake';
import React from 'react';

/**
 * Props for the stake interaction modal.
 * @property show Shows or hides the modal.
 * @property toggleShow A function to update the show variable to show or hide the Modal.
 */
export interface BoostStakeInteractionModalProps {
  show: boolean;
  toggleShow(s: boolean): void;
  poolInfo: BoostMaxxPoolInfo;
  title?: string;
  message?: string | JSX.Element;
  hasPendingReward: boolean;
  actionButtonLabel?: string;
}

export default function BoostStakeInteractionModal({ show, toggleShow, poolInfo, title, message, hasPendingReward, actionButtonLabel = 'Stake' }: BoostStakeInteractionModalProps): JSX.Element {
  const [val, setVal] = useState<string>('0');

  const { chainId } = useWeb3React<Web3Provider>();

  if (!chainId) {
    throw new Error('Invalid chain ID!');
  }
  const { amount: bigAmount, decimals } = useTokenBalance(poolInfo.id);

  const max = bigAmount;

  const amount = parseUnits(val, decimals);
  const invalidInput = amount.gt(bigAmount) || amount.eq(0);
  const [approvalState, onApprove] = useApproveBoostStake(poolInfo, amount, invalidInput);
  const [stakeState, stake] = useBoostStake(approvalState, poolInfo, amount, decimals, invalidInput);

  const onStake = async () => {
    await stake();
    setVal('0');
    toggleShow(false);
  };

  return (
    <InteractionModalContainer
      title={title || 'Stake'}
      show={show}
      toggleShow={toggleShow}>
      <>
        {message && <div className='text-xs sm:text-sm text-textSecondary'>{message}</div>}
        <InputBigAmount
          val={val}
          setVal={setVal}
          suffix={`${poolInfo.symbol}`}
          availableSuffix={`${poolInfo.symbol}\u00A0`}
          availableTitle='Available'
          available={bigAmount}
          max={max}
          decimals={decimals} />
        {hasPendingReward && <div className='text-xs sm:text-sm text-textSecondary'>Pending SOLID will also be claimed.</div>}
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