import { useState } from 'react';
import { InteractionModalContainer } from '.';
import InteractionButton from '../InteractionButton';
import { useTokenBalance } from '../../hooks/useData';
import { useWeb3React } from '@web3-react/core';
import { Web3Provider } from '@ethersproject/providers';
import InputBigAmount from '../../components/InputBigAmount';
import { parseUnits } from 'ethers/lib/utils';
import { useApproveStake } from '../../hooks/useApprove';
import useStake from '../../hooks/useStake';
import { Address } from '../../types/interfaces';
import { WETH_ADDRESSES } from '../../config/web3/contracts/weth';
import { BigNumber } from '@ethersproject/bignumber';
import { getMinimumTxAmount } from '../../utils';
import React from 'react';

/**
 * Props for the stake interaction modal.
 * @property show Shows or hides the modal.
 * @property toggleShow A function to update the show variable to show or hide the Modal.
 */
export interface StakeInteractionModalProps {
  show: boolean;
  toggleShow(s: boolean): void;
  toStakeSymbol: string;
  toStakeAddress: Address;
  supplyVaultAddress: Address;
  title?: string;
  message?: string | JSX.Element;
  actionButtonLabel?: string;
}

export default function StakeInteractionModal({ show, toggleShow, toStakeSymbol, toStakeAddress, supplyVaultAddress, title, message, actionButtonLabel = 'Stake' }: StakeInteractionModalProps): JSX.Element {
  const [val, setVal] = useState<string>('0');

  const { chainId } = useWeb3React<Web3Provider>();

  if (!chainId) {
    throw new Error('Invalid chain ID!');
  }
  const { amount: bigAmount, decimals } = useTokenBalance(toStakeAddress);

  let max = bigAmount;
  if (toStakeAddress.toLowerCase() === WETH_ADDRESSES[chainId].toLowerCase()) {
    if (bigAmount.lte(getMinimumTxAmount(chainId))) {
      max = BigNumber.from(0);
    } else {
      max = bigAmount.sub(getMinimumTxAmount(chainId));
    }
  }

  const amount = parseUnits(val, decimals);
  const invalidInput = amount.gt(bigAmount) || amount.eq(0);
  const [approvalState, onApprove] = useApproveStake(amount, toStakeSymbol, toStakeAddress, invalidInput);
  const [stakeState, stake] = useStake(approvalState, supplyVaultAddress, toStakeAddress, toStakeSymbol, amount, decimals, invalidInput);

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
          suffix={toStakeSymbol}
          availableSuffix={`${toStakeSymbol}\u00A0`}
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
            name={actionButtonLabel}
            onCall={onStake}
            state={stakeState} />
        </div>
      </>
    </InteractionModalContainer>
  );
}