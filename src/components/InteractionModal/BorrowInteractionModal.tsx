import { LENDING_POOL_DETAILS_MAP } from '../../config/web3/contracts/lending-pools';
import { FACTORY_DETAILS_MAP } from '../../config/web3/contracts/tarot-factories';
import usePairAddress from '../../hooks/usePairAddress';
import { useState } from 'react';
import { getTokenSymbol } from '../../utils';
import { ZERO_ADDRESS } from '../../utils/address';
import { InteractionModalContainer } from '.';
import { useApprove } from '../../hooks/useApprove';
import useBorrow from '../../hooks/useBorrow';
import { useMaxBorrowable } from '../../hooks/useData';
import usePoolToken from '../../hooks/usePoolToken';
import { ApprovalType, PoolTokenType } from '../../types/interfaces';
import InputBigAmount from '../../components/InputBigAmount';
import InteractionButton from '../InteractionButton';
import RiskMetrics from '../RiskMetrics';
import BorrowAPY from './TransactionRecap/BorrowAPY';
import BorrowFee from './TransactionRecap/BorrowFee';
import FarmingAPY from './TransactionRecap/FarmingAPY';
import { parseUnits } from 'ethers/lib/utils';
import { BigNumber } from 'ethers';
import React from 'react';

/**
 * Props for the deposit interaction modal.
 * @property show Shows or hides the modal.
 * @property toggleShow A function to update the show variable to show or hide the Modal.
 */
export interface BorrowInteractionModalProps {
  show: boolean;
  toggleShow(s: boolean): void;
}

/**
 * Styled component for the norrow modal.
 * @param param0 any Props for component
 * @see BorrowInteractionModalProps
 */

export default function BorrowInteractionModal({ show, toggleShow }: BorrowInteractionModalProps): JSX.Element {
  const poolTokenType = usePoolToken();
  const lendingPoolId = usePairAddress();
  const poolDetails = LENDING_POOL_DETAILS_MAP[lendingPoolId.toLowerCase()];

  const decimals = poolDetails[poolTokenType === PoolTokenType.BorrowableA ? 'decimals0' : 'decimals1'];

  const [val, setVal] = useState<string>('0');
  const borrowFeeBps = FACTORY_DETAILS_MAP[poolDetails.tarotFactoryAddress].borrowFeeBps;

  const symbol = getTokenSymbol(lendingPoolId, poolTokenType);
  const maxBorrowableAsNumber = useMaxBorrowable();
  const fixed = !maxBorrowableAsNumber || isNaN(maxBorrowableAsNumber) ? '0' : maxBorrowableAsNumber.toFixed(decimals);
  const maxBorrowable = parseUnits(fixed, decimals);
  const hasFarming = poolDetails.farmingPoolAddress0 !== ZERO_ADDRESS || poolDetails.farmingPoolAddress1 !== ZERO_ADDRESS;

  const amount = parseUnits(val, decimals);
  const valAsNumber = parseFloat(val);
  const invalidInput = amount.gt(maxBorrowable);
  const [approvalState, onApprove, permitData] = useApprove(ApprovalType.BORROW, amount, invalidInput);
  const [borrowState, borrow] = useBorrow(approvalState, amount, invalidInput, permitData);

  const onBorrow = async () => {
    await borrow();
    setVal('0');
    toggleShow(false);
  };

  return (
    <InteractionModalContainer
      title='Borrow'
      show={show}
      toggleShow={toggleShow}>
      <>
        <RiskMetrics
          changeBorrowedA={poolTokenType === PoolTokenType.BorrowableA ? valAsNumber : 0}
          changeBorrowedB={poolTokenType === PoolTokenType.BorrowableB ? valAsNumber : 0} />
        <InputBigAmount
          val={val}
          setVal={setVal}
          suffix={symbol}
          availableSuffix={`${symbol}\u00A0`}
          availableTitle='Available'
          available={maxBorrowable}
          max={maxBorrowable}
          decimals={BigNumber.from(decimals)} />
        <div className='text-sm'>
          <BorrowFee
            borrowFeeBps={borrowFeeBps}
            amount={valAsNumber}
            symbol={symbol} />
          <BorrowAPY amount={valAsNumber} />
          {hasFarming && <FarmingAPY amount={valAsNumber} />}
        </div>
        <div className='mt-4 flex justify-between'>
          <InteractionButton
            name='Approve'
            onCall={onApprove}
            state={approvalState} />
          <InteractionButton
            name='Borrow'
            onCall={onBorrow}
            state={borrowState} />
        </div>
      </>
    </InteractionModalContainer>
  );
}