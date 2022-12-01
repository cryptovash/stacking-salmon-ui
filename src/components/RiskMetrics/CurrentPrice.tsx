// TODO: <
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// TODO: >

import { faExchangeAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { UNKNOWN_DEX } from '../../config/web3/dexs';
import usePairAddress from '../../hooks/usePairAddress';
import { getTokenSymbol } from '../../utils';
import { useFullLendingPoolsData, useMarketPrice, useTWAPPrice } from '../../hooks/useData';
import { usePriceInverted, useTogglePriceInverted } from '../../hooks/useTarotRouter';
import { PoolTokenType } from '../../types/interfaces';
import { formatFloat } from '../../utils/format';
import { DetailsRowCustom } from '../DetailsRow';
import QuestionHelper from '../QuestionHelper';
import React from 'react';

/**
 * Generates lending pool aggregate details.
 */
interface CurrentPriceProps {
  dashboard?: boolean;
}

export default function CurrentPrice({ dashboard }: CurrentPriceProps): JSX.Element {
  const lendingPoolId = usePairAddress();
  const fullLendingPoolsMap = useFullLendingPoolsData() || {};
  const pool = fullLendingPoolsMap[lendingPoolId.toLowerCase()] || {};

  const TWAPPrice = useTWAPPrice();
  const marketPrice = useMarketPrice();

  const priceInverted = usePriceInverted();
  const togglePriceInverted = useTogglePriceInverted();
  const symbolA = getTokenSymbol(lendingPoolId, PoolTokenType.BorrowableA);
  const symbolB = getTokenSymbol(lendingPoolId, PoolTokenType.BorrowableB);
  const dex = pool.dex || UNKNOWN_DEX;
  // eslint-disable-next-line no-negated-condition
  const pair = !priceInverted ? symbolA + '/' + symbolB : symbolB + '/' + symbolA;

  if (dashboard) {
    return (
      <DetailsRowCustom>
        <div className='name'>
          TWAP ({pair})
        </div>
        <div
          className='value flex flex-row items-center justify-center cursor-pointer'
          onClick={e => {
            e.preventDefault();
            togglePriceInverted();
          }}>
          <div>{formatFloat(TWAPPrice, 4)} </div>
          <div
            className='px-2'>
            <FontAwesomeIcon
              icon={faExchangeAlt}
              className='invert-price text-textSecondary transform-gpu scale-125' />
          </div>
        </div>
      </DetailsRowCustom>
    );
  }

  return (
    <DetailsRowCustom>
      <div className='name'>
        TWAP Price ({pair})<QuestionHelper text={`The TWAP (Time Weighted Average Price) and the current market price on ${dex.dexName}`} />
      </div>
      <div
        className='value flex flex-row items-center cursor-pointer'
        onClick={() => togglePriceInverted()}>
        <div>{TWAPPrice === 0 ? '-' : formatFloat(TWAPPrice, 4)} (current: {formatFloat(marketPrice, 4)}) </div>
        <div
          className='px-2'>
          <FontAwesomeIcon
            icon={faExchangeAlt}
            className='invert-price text-textSecondary transform-gpu scale-125' />
        </div>
      </div>
    </DetailsRowCustom>
  );
}