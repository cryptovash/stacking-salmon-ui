import { useState } from 'react';
import { InteractionModalContainer } from '.';
import InteractionButton from '../InteractionButton';
import { useXStakingPoolAccountInfo } from '../../hooks/useData';
import { useWeb3React } from '@web3-react/core';
import { Web3Provider } from '@ethersproject/providers';
import InputBigAmount from '../../components/InputBigAmount';
import { parseUnits } from 'ethers/lib/utils';
import useXUnstake from '../../hooks/useXUnstake';
import { X_STAKING_POOLS } from '../../config/web3/contracts/x-staking-pool';
import React from 'react';

/**
 * Props for the unstake interaction modal.
 * @property show Shows or hides the modal.
 * @property toggleShow A function to update the show variable to show or hide the Modal.
 */
export interface XUnstakeInteractionModalProps {
  show: boolean;
  toggleShow(s: boolean): void;
  poolId: number;
  hasPendingReward: boolean;
}

export default function XUnstakeInteractionModal({ show, toggleShow, poolId, hasPendingReward }: XUnstakeInteractionModalProps): JSX.Element {
  const [val, setVal] = useState<string>('0');

  const { chainId } = useWeb3React<Web3Provider>();

  if (!chainId) {
    throw new Error('Invalid chain ID!');
  }
  const xStakingPoolAccountInfo = useXStakingPoolAccountInfo(poolId);
  const { amount: bigAmount, decimals } = xStakingPoolAccountInfo.stakedBalance;

  const amount = parseUnits(val, decimals);
  const invalidInput = amount.gt(bigAmount) || amount.eq(0);
  const [unstakeState, unstake] = useXUnstake(poolId, amount, decimals, invalidInput);

  const onUnstake = async () => {
    await unstake();
    setVal('0');
    toggleShow(false);
  };

  return (
    <InteractionModalContainer
      title='Unstake'
      show={show}
      toggleShow={toggleShow}>
      <>
        <InputBigAmount
          val={val}
          setVal={setVal}
          suffix='xTAROT'
          availableSuffix={`xTAROT\u00A0`}
          availableTitle='Available'
          available={bigAmount}
          max={bigAmount}
          decimals={decimals} />
        {hasPendingReward && <div className='text-xs sm:text-sm text-textSecondary'>Pending {X_STAKING_POOLS[chainId][poolId].rewardTokenSymbol} will also be claimed.</div>}
        <div className='mt-4 flex justify-end'>
          <InteractionButton
            name='Unstake'
            onCall={onUnstake}
            state={unstakeState} />
        </div>
      </>
    </InteractionModalContainer>
  );
}
