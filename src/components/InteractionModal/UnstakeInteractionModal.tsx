import { useState } from 'react';
import { InteractionModalContainer } from '.';
import InteractionButton from '../InteractionButton';
import { useTokenBalance } from '../../hooks/useData';
import { useWeb3React } from '@web3-react/core';
import { Web3Provider } from '@ethersproject/providers';
import InputBigAmount from '../../components/InputBigAmount';
import { parseUnits } from 'ethers/lib/utils';
import useUnstake from '../../hooks/useUnstake';
import { Address } from '../../types/interfaces';
import { SUPPLY_VAULTS } from '../../config/web3/contracts/supply-vault';
import { useApproveStake } from '../../hooks/useApprove';
import React from 'react';

/**
 * Props for the unstake interaction modal.
 * @property show Shows or hides the modal.
 * @property toggleShow A function to update the show variable to show or hide the Modal.
 */
export interface UnstakeInteractionModalProps {
  show: boolean;
  toggleShow(s: boolean): void;
  supplyVaultAddress: Address;
}

export default function UnstakeInteractionModal({ show, toggleShow, supplyVaultAddress }: UnstakeInteractionModalProps): JSX.Element {
  const [val, setVal] = useState<string>('0');

  const { chainId } = useWeb3React<Web3Provider>();

  if (!chainId) {
    throw new Error('Invalid chain ID!');
  }
  const { amount: bigAmount, decimals } = useTokenBalance(supplyVaultAddress);
  const supplyVaultInfo = SUPPLY_VAULTS[chainId][supplyVaultAddress];

  const amount = parseUnits(val, decimals);
  const invalidInput = amount.gt(bigAmount) || amount.eq(0);
  const [approvalState, onApprove] = useApproveStake(amount, supplyVaultInfo.symbol, supplyVaultAddress, invalidInput);
  const [unstakeState, unstake] = useUnstake(approvalState, supplyVaultAddress, amount, decimals, invalidInput);

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
          suffix={supplyVaultInfo.symbol}
          availableSuffix={`${supplyVaultInfo.symbol}\u00A0`}
          availableTitle='Available'
          available={bigAmount}
          max={bigAmount}
          decimals={decimals} />
        <div className='mt-4 flex justify-between'>
          <InteractionButton
            name='Approve'
            onCall={onApprove}
            state={approvalState} />
          <InteractionButton
            name='Unstake'
            onCall={onUnstake}
            state={unstakeState} />
        </div>
      </>
    </InteractionModalContainer>
  );
}