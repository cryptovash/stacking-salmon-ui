import { Web3Provider } from '@ethersproject/providers';
import { useWeb3React } from '@web3-react/core';
import InputBigAmount from '../../components/InputBigAmount';
import { SPIRIT_ADDRESS } from '../../config/web3/contracts/wrapped-escrow-spirit';
import { parseUnits } from 'ethers/lib/utils';
import { useApproveMint } from '../../hooks/useApprove';
import useMint from '../../hooks/useMint';
import { useState } from 'react';
import { InteractionModalContainer } from '.';
import { useTokenBalance } from '../../hooks/useData';
import InteractionButton from '../InteractionButton';
import React from 'react';

/**
 * Props for the mint interaction modal.
 * @property show Shows or hides the modal.
 * @property toggleShow A function to update the show variable to show or hide the Modal.
 */
export interface MintInteractionModalProps {
  show: boolean;
  toggleShow(s: boolean): void;
}

export default function MintInteractionModal({ show, toggleShow }: MintInteractionModalProps): JSX.Element {
  const [val, setVal] = useState<string>('0');

  const { chainId } = useWeb3React<Web3Provider>();

  if (!chainId) {
    throw new Error('Invalid chain ID!');
  }
  const { amount: bigAmount, decimals } = useTokenBalance(SPIRIT_ADDRESS);

  const max = bigAmount;
  const amount = parseUnits(val, decimals);
  const invalidInput = amount.gt(bigAmount) || amount.eq(0);
  const [approvalState, onApprove] = useApproveMint(amount, invalidInput);
  const [mintState, mint] = useMint(approvalState, amount, invalidInput);

  const onMint = async () => {
    await mint();
    setVal('0');
    toggleShow(false);
  };

  return (
    <InteractionModalContainer
      title='Get tinSPIRIT'
      show={show}
      toggleShow={toggleShow}>
      <>
        <InputBigAmount
          val={val}
          setVal={setVal}
          suffix='SPIRIT'
          availableSuffix={`SPIRIT\u00A0`}
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
            name='Get tinSPIRIT'
            onCall={onMint}
            state={mintState} />
        </div>
      </>
    </InteractionModalContainer>
  );
}