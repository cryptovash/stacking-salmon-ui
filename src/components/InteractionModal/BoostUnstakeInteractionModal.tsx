import { useState } from 'react';
import { InteractionModalContainer } from '.';
import InteractionButton from '../InteractionButton';
import { useWeb3React } from '@web3-react/core';
import { Web3Provider } from '@ethersproject/providers';
import InputBigAmount from '../../components/InputBigAmount';
import { parseUnits } from 'ethers/lib/utils';
import { BoostMaxxPoolInfo } from '../../types/interfaces';
import { BigNumber } from '@ethersproject/bignumber';
import useBoostUnstake from '../../hooks/useBoostUnstake';
import React from 'react';


/**
 * Props for the unstake interaction modal.
 * @property show Shows or hides the modal.
 * @property toggleShow A function to update the show variable to show or hide the Modal.
 */
export interface BoostUnstakeInteractionModalProps {
  show: boolean;
  toggleShow(s: boolean): void;
  poolInfo: BoostMaxxPoolInfo;
  hasPendingReward: boolean;
}

export default function BoostUnstakeInteractionModal({ show, toggleShow, poolInfo, hasPendingReward }: BoostUnstakeInteractionModalProps): JSX.Element {
  const [val, setVal] = useState<string>('0');

  const { chainId } = useWeb3React<Web3Provider>();

  if (!chainId) {
    throw new Error('Invalid chain ID!');
  }
  const decimals = BigNumber.from(18);
  const bigAmount = poolInfo.userDeposits;

  const amount = parseUnits(val, decimals);
  const invalidInput = amount.gt(bigAmount) || amount.eq(0);
  const [unstakeState, unstake] = useBoostUnstake(poolInfo, amount, decimals, invalidInput);

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
          suffix={`${poolInfo.symbol}`}
          availableSuffix={`${poolInfo.symbol}\u00A0`}
          availableTitle='Available'
          available={bigAmount}
          max={bigAmount}
          decimals={decimals} />
        {hasPendingReward && <div className='text-xs sm:text-sm text-textSecondary'>Pending SOLID will also be claimed.</div>}
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