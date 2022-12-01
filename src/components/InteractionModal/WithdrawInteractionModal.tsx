import { parseUnits } from 'ethers/lib/utils';
import usePairAddress from '../../hooks/usePairAddress';
import { useState } from 'react';
import { getTokenSymbol } from '../../utils';
import { InteractionModalContainer } from '.';
import { useApprove } from '../../hooks/useApprove';
import { useDecimals, useMaxWithdrawable, useTokenBalance, useToTokens } from '../../hooks/useData';
import usePoolToken from '../../hooks/usePoolToken';
import useWithdraw from '../../hooks/useWithdraw';
import { ApprovalType, PoolTokenType } from '../../types/interfaces';
import InputBigAmount from '../../components/InputBigAmount';
import InteractionButton from '../InteractionButton';
import RiskMetrics from '../RiskMetrics';
import TransactionSize from './TransactionRecap/TransactionSize';
import { BigNumber } from 'ethers';
import { LENDING_POOL_DETAILS_MAP } from '../../config/web3/contracts/lending-pools';
import React from 'react';

/**
 * Props for the withdraw interaction modal.
 * @property show Shows or hides the modal.
 * @property toggleShow A function to update the show variable to show or hide the Modal.
 */
export interface WithdrawInteractionModalProps {
  show: boolean;
  toggleShow(s: boolean): void;
}

/**
 * Styled component for the withdraw modal.
 * @param param0 any Props for component
 * @see WithdrawInteractionModalProps
 */

export default function WithdrawInteractionModal({ show, toggleShow }: WithdrawInteractionModalProps): JSX.Element {
  const lendingPoolId = usePairAddress();
  const poolTokenType = usePoolToken();
  const poolDetails = LENDING_POOL_DETAILS_MAP[lendingPoolId.toLowerCase()];
  const poolTokenAddress = poolTokenType === PoolTokenType.BorrowableA ? poolDetails.borrowableAddress0 : poolTokenType === PoolTokenType.BorrowableB ? poolDetails.borrowableAddress1 : poolDetails.collateralAddress;
  const { amount: actualPoolTokenBalance } = useTokenBalance(poolTokenAddress);
  const decimals = useDecimals(poolTokenType);
  const [val, setVal] = useState<string>('0');

  const symbol = getTokenSymbol(lendingPoolId, poolTokenType);
  const maxWithdrawable = useMaxWithdrawable();

  const amount = parseUnits(val, decimals);
  const valAsNumber = parseFloat(val);
  const amountTokens = useToTokens(amount);
  const tokens = actualPoolTokenBalance.lt(amountTokens) ? actualPoolTokenBalance : amountTokens;
  const invalidInput = amount.gt(maxWithdrawable.amount);
  const [approvalState, onApprove, permitData] = useApprove(ApprovalType.POOL_TOKEN, tokens, invalidInput);
  const [withdrawState, withdraw] = useWithdraw(approvalState, tokens, invalidInput, permitData);
  const onWithdraw = async () => {
    await withdraw();
    setVal('0');
    toggleShow(false);
  };

  return (
    <InteractionModalContainer
      title='Withdraw'
      show={show}
      toggleShow={toggleShow}>
      <>
        {poolTokenType === PoolTokenType.Collateral && (<RiskMetrics changeCollateral={-valAsNumber} />)}
        <InputBigAmount
          val={val}
          setVal={setVal}
          suffix={symbol}
          availableSuffix={`${symbol}\u00A0`}
          availableTitle='Available'
          available={maxWithdrawable.amount}
          max={maxWithdrawable.amount}
          decimals={BigNumber.from(decimals)} />
        <div className='text-sm'>
          <TransactionSize amount={valAsNumber} />
        </div>
        <div className='mt-4 flex justify-between'>
          <InteractionButton
            name='Approve'
            onCall={onApprove}
            state={approvalState} />
          <InteractionButton
            name='Withdraw'
            onCall={onWithdraw}
            state={withdrawState} />
        </div>
      </>
    </InteractionModalContainer>
  );
}