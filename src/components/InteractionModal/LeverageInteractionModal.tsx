import { DEPOSIT_FEE_BPS_MAP, LENDING_POOL_DETAILS_MAP } from '../../config/web3/contracts/lending-pools';
import { FACTORY_DETAILS_MAP } from '../../config/web3/contracts/tarot-factories';
import { getVaultDetailsByType } from '../../config/web3/contracts/vault-details';
import { BigNumber } from 'ethers';
import { formatUnits } from 'ethers/lib/utils';
import usePairAddress from '../../hooks/usePairAddress';
import { useEffect, useState } from 'react';
import { Col, Row } from 'react-bootstrap';
import { AlertTriangle } from 'react-feather';
import tailwindConfig from '../../tailwind.config';
import { getTokenSymbol } from '../../utils';
import { InteractionModalContainer } from '.';
import { useApprove } from '../../hooks/useApprove';
import {
  useBorrowedUSD, useCurrentLeverage, useDeadline, useFullLendingPoolsData, useLeverageAmounts, useMaxLeverage, useNextBorrowAPY,
  useNextFarmingAPY, useToBigNumber
} from '../../hooks/useData';
import useLeverage from '../../hooks/useLeverage';
import { ApprovalType, PoolTokenType } from '../../types/interfaces';
import { formatFloat, formatPercentage } from '../../utils/format';
import InputAmount, { InputAmountMini } from '../InputAmount';
import InteractionButton from '../InteractionButton';
import RiskMetrics from '../RiskMetrics';
import BorrowFee from './TransactionRecap/BorrowFee';
import React from 'react';

export interface LeverageInteractionModalProps {
  show: boolean;
  toggleShow(s: boolean): void;
}

export default function LeverageInteractionModal({ show, toggleShow }: LeverageInteractionModalProps): JSX.Element {
  const lendingPoolId = usePairAddress();
  const fullLendingPoolsMap = useFullLendingPoolsData() || {};
  const pool = fullLendingPoolsMap[lendingPoolId.toLowerCase()] || {};
  const poolDetails = LENDING_POOL_DETAILS_MAP[lendingPoolId.toLowerCase()] || {};
  const vaultDetails = poolDetails.vaultType && getVaultDetailsByType(poolDetails.vaultType);
  const depositFeeBps = BigNumber.from(pool.depositFeeBps && pool.depositFeeBps.toString() !== '0' ? pool.depositFeeBps : DEPOSIT_FEE_BPS_MAP[lendingPoolId.toLowerCase()] || '0');
  const [val, setVal] = useState<number>(0);
  const [slippage, setSlippage] = useState<number>(2);

  const changeAmounts = useLeverageAmounts(val, slippage);
  const minLeverage = useCurrentLeverage();
  const maxLeverage = useMaxLeverage();
  const symbol = getTokenSymbol(lendingPoolId);
  const symbolA = getTokenSymbol(lendingPoolId, PoolTokenType.BorrowableA);
  const symbolB = getTokenSymbol(lendingPoolId, PoolTokenType.BorrowableB);
  const deadline = useDeadline();

  useEffect(() => {
    if (val === 0) setVal(Math.ceil(minLeverage * 1000) / 1000);
  }, [minLeverage]);

  const amountA = useToBigNumber(changeAmounts.bAmountA, PoolTokenType.BorrowableA);
  const amountB = useToBigNumber(changeAmounts.bAmountB, PoolTokenType.BorrowableB);
  const amountAMin = useToBigNumber(changeAmounts.bAmountAMin, PoolTokenType.BorrowableA);
  const amountBMin = useToBigNumber(changeAmounts.bAmountBMin, PoolTokenType.BorrowableB);
  const invalidInput = val < minLeverage || val > maxLeverage;
  const [approvalStateA, onApproveA, permitDataA] = useApprove(ApprovalType.BORROW, amountA, invalidInput, PoolTokenType.BorrowableA, deadline);
  const [approvalStateB, onApproveB, permitDataB] = useApprove(ApprovalType.BORROW, amountB, invalidInput, PoolTokenType.BorrowableB, deadline);
  const [leverageState, leverage] = useLeverage(approvalStateA, approvalStateB, invalidInput, amountA, amountB, amountAMin, amountBMin, permitDataA, permitDataB);
  const onLeverage = async () => {
    await leverage();
    setVal(0);
    toggleShow(false);
  };

  const borrowedUSDA = useBorrowedUSD(PoolTokenType.BorrowableA);
  const borrowedUSDB = useBorrowedUSD(PoolTokenType.BorrowableB);
  const totalBorrowedUSD = borrowedUSDA + borrowedUSDB;
  const pctA = totalBorrowedUSD > 0 ? borrowedUSDA / totalBorrowedUSD : 0;
  const pctB = totalBorrowedUSD > 0 ? borrowedUSDB / totalBorrowedUSD : 0;

  const borrowAPYA = useNextBorrowAPY(changeAmounts.bAmountA, PoolTokenType.BorrowableA);
  const borrowAPYB = useNextBorrowAPY(changeAmounts.bAmountB, PoolTokenType.BorrowableB);
  const farmingPoolAPYA = useNextFarmingAPY(changeAmounts.bAmountA, PoolTokenType.BorrowableA);
  const farmingPoolAPYB = useNextFarmingAPY(changeAmounts.bAmountB, PoolTokenType.BorrowableB);
  const dexAPY = (pool.dexAPR || 0) * val;
  const vaultAPY = (pool.vaultAPR || 0) * val;

  const borrowAPY = (((pctA * borrowAPYA) + (pctB * borrowAPYB)) * (minLeverage - 1)) +
                    ((borrowAPYA * pool.priceFactor + borrowAPYB) / (1 + pool.priceFactor) * (val - minLeverage));
  const farmingPoolAPY = (((pctA * farmingPoolAPYA) + (pctB * farmingPoolAPYB)) * (minLeverage - 1)) +
                    ((farmingPoolAPYA * pool.priceFactor + farmingPoolAPYB) / (1 + pool.priceFactor) * (val - minLeverage));
  const leveragedAPY = (dexAPY + vaultAPY) + farmingPoolAPY - borrowAPY;

  const borrowFeeBps = FACTORY_DETAILS_MAP[LENDING_POOL_DETAILS_MAP[lendingPoolId.toLowerCase()].tarotFactoryAddress].borrowFeeBps;

  return (
    <InteractionModalContainer
      title='Leverage'
      show={show}
      toggleShow={toggleShow}>
      <>
        <RiskMetrics
          changeBorrowedA={changeAmounts.bAmountA}
          changeBorrowedB={changeAmounts.bAmountB}
          changeCollateral={changeAmounts.cAmount} />
        <InputAmount
          val={val}
          setVal={setVal}
          suffix='x'
          maxSuffix='x'
          maxTitle='Max leverage'
          max={maxLeverage}
          min={minLeverage} />
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
            <Col xs={6}>Borrow at most:</Col>
            <Col
              xs={6}
              className='text-right'>{changeAmounts.bAmountA > 0 ? formatFloat(changeAmounts.bAmountA) : 0} {symbolA}
            </Col>
          </Row>
          <Row>
            <Col xs={6}></Col>
            <Col
              xs={6}
              className='text-right'>{changeAmounts.bAmountB > 0 ? formatFloat(changeAmounts.bAmountB) : 0} {symbolB}
            </Col>
          </Row>
          <BorrowFee
            borrowFeeBps={borrowFeeBps}
            amount={changeAmounts.bAmountA > 0 ? changeAmounts.bAmountA : 0}
            symbol={symbolA} />
          <BorrowFee
            borrowFeeBps={borrowFeeBps}
            amount={changeAmounts.bAmountB > 0 ? changeAmounts.bAmountB : 0}
            symbol={symbolB} />
          <Row>
            <Col xs={6}>Get at least:</Col>
            <Col
              xs={6}
              className='text-right'>{changeAmounts.cAmountMin > 0 ? formatFloat(changeAmounts.cAmountMin) : 0} {symbol}
            </Col>
          </Row>
          {(dexAPY > 0) && (
            <Row>
              <Col xs={6}>Trading Fees APR:</Col>
              <Col
                xs={6}
                className='text-right'>+{formatPercentage(dexAPY)}
              </Col>
            </Row>
          )}
          {(vaultAPY > 0) && (
            <Row>
              <Col xs={6}>{vaultDetails?.vaultName || pool.dex.dexName || 'Vault'} Reward APR:</Col>
              <Col
                xs={6}
                className='text-right'>+{formatPercentage(vaultAPY)}
              </Col>
            </Row>
          )}
          {(farmingPoolAPY > 0) && (
            <Row>
              <Col xs={6}>Farming APR:</Col>
              <Col
                xs={6}
                className='text-right'>+{formatPercentage(farmingPoolAPY)}
              </Col>
            </Row>
          )}
          <Row>
            <Col xs={6}>Borrow APR:</Col>
            <Col
              xs={6}
              className='text-right'>-{borrowAPY > 0 ? formatPercentage(borrowAPY) : '-'}
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
        {depositFeeBps.gt(0) && (

          <div className='flex flex-row bg-tarotJade-900 border items-center border-tarotJade-400 rounded-lg p-4 space-x-4 !my-3 -mx-1'>
            <div>
              <AlertTriangle
                color={tailwindConfig.theme.extend.colors.tarotJade['800']}
                fill={tailwindConfig.theme.extend.colors.tarotJade['200']} />
            </div>
            <div className='text-sm text-textSecondary'>{vaultDetails ? `${vaultDetails.vaultName} charges a ` : 'There is a '}{formatUnits(depositFeeBps, 2)}% deposit fee for this pool.</div>
          </div>
        )}
        <div className='mt-4 flex justify-around'>
          <InteractionButton
            name={'Approve ' + symbolA}
            onCall={onApproveA}
            state={approvalStateA} />
          <InteractionButton
            name={'Approve ' + symbolB}
            onCall={onApproveB}
            state={approvalStateB} />
        </div>
        <div className='mt-4 flex justify-center'>
          <InteractionButton
            name='Leverage'
            onCall={onLeverage}
            state={leverageState} />
        </div>
      </>
    </InteractionModalContainer>
  );
}