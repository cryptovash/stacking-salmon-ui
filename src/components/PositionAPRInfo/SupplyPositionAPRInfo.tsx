// TODO: <
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
// TODO: >

import QuestionHelper from '../../components/QuestionHelper';
import { useAccountAPY, useFullLendingPoolsData } from '../../hooks/useData';
import usePairAddress from '../../hooks/usePairAddress';
import { getAB } from '../../utils';
import { formatPercentage } from '../../utils/format';

export default function SupplyPositionAPRInfo(): JSX.Element {
  const lendingPoolId = usePairAddress();
  const fullLendingPoolsData = useFullLendingPoolsData() || {};
  const pool = fullLendingPoolsData[lendingPoolId.toLowerCase()] || {};
  const {
    symbol,
    supplyAPR
  } = pool;
  const [supplyAPYA, supplyAPYB] = getAB(supplyAPR);
  const [symbolA, symbolB] = getAB(symbol);
  const accountAPY = useAccountAPY();

  if (!accountAPY) {
    return (<></>);
  }
  return (
    <div className='flex flex-row justify-center text-center mt-4'>
      <div className='flex flex-col justify-center text-center'>
        <div>Total Supply APR
          <QuestionHelper
            text={
              <div className='flex flex-col text-sm space-y-1'>
                <div className='flex justify-between'>
                  <div className='text-textSecondary'>{symbolA} APR:</div>
                  <div>{formatPercentage(supplyAPYA)}</div>
                </div>
                <div className='flex justify-between'>
                  <div className='text-textSecondary'>{symbolB} APR:</div>
                  <div>{formatPercentage(supplyAPYB)}</div>
                </div>
              </div>
            } />
        </div>
        <div
          className='text-green-600 font-bold'>{formatPercentage(accountAPY)}
        </div>
      </div>
    </div>
  );
}
