// TODO: <
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck1
// TODO: >

import { useState } from 'react';
import { InteractionModalContainer } from '.';
import { Row, Col } from 'react-bootstrap';
import { PoolTokenType, ApprovalType } from '../../types/interfaces';
import RiskMetrics from '../RiskMetrics';
import { formatFloat, formatPercentage } from '../../utils/format';
import { InputAmountMini } from '../InputAmount';
import InputBigAmount from '../../components/InputBigAmount';
import InteractionButton from '../InteractionButton';
import useDeleverage from '../../hooks/useDeleverage';
import { useApprove } from '../../hooks/useApprove';
import {
  useBorrowed,
  useDeleverageAmounts,
  useToBigNumber,
  useMaxDeleverage,
  useNextBorrowAPY,
  useCurrentLeverage,
  useNextFarmingAPY,
  useBorrowedUSD,
  useTokenPrice,
  useFullLendingPoolsData,
  useToTokens,
  useTokenBalance
} from '../../hooks/useData';
import { AlertTriangle } from 'react-feather';
import tailwindConfig from '../../tailwind.config';
import { getTokenSymbol } from '../../utils';
import usePairAddress from '../../hooks/usePairAddress';
import { parseNumber } from '../../utils/big-amount';
import { parseUnits } from 'ethers/lib/utils';
import { decimalToBalance } from '../../utils/ether-utils';
import { BigNumber } from 'ethers';
import { LENDING_POOL_DETAILS_MAP } from '../../config/web3/contracts/lending-pools';
import React from 'react';

export interface DeleverageInteractionModalProps {
  show: boolean;
  toggleShow(s: boolean): void;
}

export default function DeleverageInteractionModal({ show, toggleShow }: DeleverageInteractionModalProps): JSX.Element {
  const lendingPoolId = usePairAddress();
  const fullLendingPoolsMap = useFullLendingPoolsData() || {};
  const pool = fullLendingPoolsMap[lendingPoolId.toLowerCase()] || {};
  const poolDetails = LENDING_POOL_DETAILS_MAP[lendingPoolId.toLowerCase()];
  const { amount: actualCollateralBalance } = useTokenBalance(poolDetails.collateralAddress.toLowerCase());
  const [val, setVal] = useState<string>('0');
  const [slippage, setSlippage] = useState<number>(2);
  const valAsNumber = parseFloat(val);
  const changeAmounts = useDeleverageAmounts(valAsNumber, slippage);
  const maxDeleverage = useMaxDeleverage(slippage);
  const symbol = getTokenSymbol(lendingPoolId);
  const symbolA = getTokenSymbol(lendingPoolId, PoolTokenType.BorrowableA);
  const symbolB = getTokenSymbol(lendingPoolId, PoolTokenType.BorrowableB);
  const borrowedABigAmount = useBorrowed(PoolTokenType.BorrowableA);
  const borrowedBBigAmount = useBorrowed(PoolTokenType.BorrowableB);
  const borrowedA = parseNumber(borrowedABigAmount);
  const borrowedB = parseNumber(borrowedBBigAmount);

  const amount = parseUnits(val, 18);
  const tokensX = useToTokens(amount);
  const tokens = tokensX.gt(actualCollateralBalance) ? actualCollateralBalance : tokensX;
  const invalidInput = amount.gt(decimalToBalance(maxDeleverage, 18));
  const amountAMin = useToBigNumber(changeAmounts.bAmountAMin, PoolTokenType.BorrowableA);
  const amountBMin = useToBigNumber(changeAmounts.bAmountBMin, PoolTokenType.BorrowableB);
  const [approvalState, onApprove, permitData] = useApprove(ApprovalType.POOL_TOKEN, tokens, invalidInput);
  const [deleverageState, deleverage] = useDeleverage(approvalState, invalidInput, tokens, amountAMin, amountBMin, permitData);
  const onDeleverage = async () => {
    await deleverage();
    setVal('0');
    toggleShow(false);
  };

  const changes = -changeAmounts.bAmountA || -changeAmounts.bAmountB || -changeAmounts.cAmount ? {
    changeBorrowedA: -changeAmounts.bAmountA ? -changeAmounts.bAmountA : 0,
    changeBorrowedB: -changeAmounts.bAmountB ? -changeAmounts.bAmountB : 0,
    changeCollateral: -changeAmounts.cAmount ? -changeAmounts.cAmount : 0
  } : undefined;
  const newLeverage = useCurrentLeverage(changes);

  const borrowedUSDA = useBorrowedUSD(PoolTokenType.BorrowableA);
  const borrowedUSDB = useBorrowedUSD(PoolTokenType.BorrowableB);

  const priceA = useTokenPrice(PoolTokenType.BorrowableA);
  const priceB = useTokenPrice(PoolTokenType.BorrowableB);

  const nextBorrowedUSDA = changeAmounts.bAmountAMin ? Math.max(0, borrowedUSDA + (changeAmounts.bAmountAMin * priceA)) : borrowedUSDA;
  const nextBorrowedUSDB = changeAmounts.bAmountBMin ? Math.max(0, borrowedUSDB + (changeAmounts.bAmountBMin * priceB)) : borrowedUSDB;

  const nextTotalBorrowedUSD = nextBorrowedUSDA + nextBorrowedUSDB;
  const nextPctA = nextTotalBorrowedUSD > 0 ? nextBorrowedUSDA / nextTotalBorrowedUSD : 0;
  const nextPctB = nextTotalBorrowedUSD > 0 ? nextBorrowedUSDB / nextTotalBorrowedUSD : 0;

  const borrowAPYA = useNextBorrowAPY(-Math.min(borrowedA, changeAmounts.bAmountA), PoolTokenType.BorrowableA);
  const borrowAPYB = useNextBorrowAPY(-Math.min(borrowedB, changeAmounts.bAmountB), PoolTokenType.BorrowableB);
  const farmingPoolAPYA = useNextFarmingAPY(-Math.min(borrowedA, changeAmounts.bAmountA), PoolTokenType.BorrowableA);
  const farmingPoolAPYB = useNextFarmingAPY(-Math.min(borrowedB, changeAmounts.bAmountB), PoolTokenType.BorrowableB);
  const dexAPY = (pool.dexAPR || 0) * newLeverage;
  const vaultAPY = (pool.vaultAPR || 0) * newLeverage;

  const borrowAPY = (((nextPctA * borrowAPYA) + (nextPctB * borrowAPYB)) * (newLeverage - 1));
  const farmingPoolAPY = (((nextPctA * farmingPoolAPYA) + (nextPctB * farmingPoolAPYB)) * (newLeverage - 1));
  const leveragedAPY = (dexAPY + vaultAPY) + farmingPoolAPY - borrowAPY;

  return (
    <InteractionModalContainer
      title='Deleverage'
      show={show}
      toggleShow={toggleShow}>
      <>
        <RiskMetrics
          changeBorrowedA={-changeAmounts.bAmountA}
          changeBorrowedB={-changeAmounts.bAmountB}
          changeCollateral={-changeAmounts.cAmount} />
        <InputBigAmount
          val={val}
          setVal={setVal}
          suffix={symbol}
          availableSuffix={`${symbol}\u00A0`}
          availableTitle='Available'
          available={decimalToBalance(maxDeleverage, 18)}
          max={decimalToBalance(maxDeleverage, 18)}
          decimals={BigNumber.from(18)} />
        <div className='text-sm'>
          <Row>
            <Col
              xs={6}
              style={{ lineHeight: '30px' }}>Max slippage:
            </Col>
            <Col
              xs={6}
              className='text-right'><InputAmountMini
                val={slippage}
                setVal={setSlippage}
                suffix='%' />
            </Col>
          </Row>
          <Row>
            <Col xs={6}>Withdraw:</Col>
            <Col
              xs={6}
              className='text-right'>{formatFloat(changeAmounts.cAmount)} {symbol}
            </Col>
          </Row>
          <Row>
            <Col xs={6}>Repay at least:</Col>
            <Col
              xs={6}
              className='text-right'>{formatFloat(Math.min(changeAmounts.bAmountAMin, borrowedA))} {symbolA}
            </Col>
          </Row>
          <Row>
            <Col xs={6}></Col>
            <Col
              xs={6}
              className='text-right'>{formatFloat(Math.min(changeAmounts.bAmountBMin, borrowedB))} {symbolB}
            </Col>
          </Row>
          <Row>
            <Col xs={6}>Receive at least:</Col>
            <Col
              xs={6}
              className='text-right'>{formatFloat(changeAmounts.bAmountAMin > borrowedA ? changeAmounts.bAmountAMin - borrowedA : 0)} {symbolA}
            </Col>
          </Row>
          <Row>
            <Col xs={6}></Col>
            <Col
              xs={6}
              className='text-right'>{formatFloat(changeAmounts.bAmountBMin > borrowedB ? changeAmounts.bAmountBMin - borrowedB : 0)} {symbolB}
            </Col>
          </Row>
          <Row>
            <Col xs={6}>Estimated APR:</Col>
            <Col
              xs={6}
              className={`text-right ${leveragedAPY > 0 ? 'text-green-600' : 'text-red-700'} font-bold`}>{formatPercentage(leveragedAPY)}
            </Col>
          </Row>
        </div>
        {(newLeverage === 1 || changeAmounts.bAmountAMin > borrowedA || changeAmounts.bAmountBMin > borrowedB) &&
        <div className='flex flex-row bg-tarotJade-900 border items-center border-tarotJade-400 rounded-lg p-4 space-x-4 !my-3 -mx-1'>
          <div>
            <AlertTriangle
              color={tailwindConfig.theme.extend.colors.tarotJade['800']}
              fill={tailwindConfig.theme.extend.colors.tarotJade['200']} />
          </div>
          <div className='text-sm text-textSecondary'>Some or all LP collateral will be converted to the underlying tokens. Excess tokens after repaying borrows will be sent to your address.</div>
        </div>
        }
        <div className='mt-4 flex justify-between'>
          <InteractionButton
            name='Approve'
            onCall={onApprove}
            state={approvalState} />
          <InteractionButton
            name='Deleverage'
            onCall={onDeleverage}
            state={deleverageState} />
        </div>
      </>
    </InteractionModalContainer>
  );
}
