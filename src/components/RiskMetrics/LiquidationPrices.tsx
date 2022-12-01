import { LENDING_POOL_DETAILS_MAP } from '../../config/web3/contracts/lending-pools';
import { BigNumber } from 'ethers';
import usePairAddress from '../../hooks/usePairAddress';
import { parse18 } from '../../utils/big-amount';
import { useLiquidationPrices, useTWAPPrice } from '../../hooks/useData';
import { Changes, TEN_18 } from '../../types/interfaces';
import { formatFloat } from '../../utils/format';
import React from 'react';

const LIQ_K = 1.7;

interface LiquidationPriceProps {
  liquidationPrice: number;
  TWAPPrice: number;
  safetyMargin: number;
}

function LiquidationPrice({ liquidationPrice, TWAPPrice, safetyMargin } : LiquidationPriceProps) {
  const safetyFactor = liquidationPrice > TWAPPrice ? liquidationPrice / TWAPPrice - 1 : TWAPPrice / liquidationPrice - 1;
  const riskFactor = safetyMargin - 1;
  const riskClass =
    safetyFactor > riskFactor * LIQ_K ** 2 ? 'risk-0' :
      safetyFactor > riskFactor * LIQ_K ** 1 ? 'risk-1' :
        safetyFactor > riskFactor * LIQ_K ** 0 ? 'risk-2' :
          safetyFactor > riskFactor * LIQ_K ** -1 ? 'risk-3' :
            safetyFactor > riskFactor * LIQ_K ** -2 ? 'risk-4' : 'risk-5';

  return (
    <span className={'liquidation-price ' + riskClass}>
      {formatFloat(liquidationPrice, 4)}
    </span>
  );
}

interface LiquidationPricesProps {
  changes?: Changes;
}

/**
 * Generates lending pool aggregate details.
 */

export default function LiquidationPrices({ changes } : LiquidationPricesProps): JSX.Element {
  const [price0, price1] = useLiquidationPrices(changes);
  const TWAPPrice = useTWAPPrice();
  const lendingPoolId = usePairAddress();
  const poolDetails = LENDING_POOL_DETAILS_MAP[lendingPoolId.toLowerCase()];
  const safetyMarginSqrt = BigNumber.from(poolDetails.safetyMarginSqrt);
  const safetyMargin = poolDetails.stable ? parse18(BigNumber.from(poolDetails.stableSafetyMargin)) : parse18(safetyMarginSqrt.pow(2).div(TEN_18));

  if (!price0 && !price1) return (<>-</>);
  if (price0 >= TWAPPrice || price1 <= TWAPPrice) {
    return (
      <span className='liquidation-price risk-5'>Liquidatable</span>
    );
  }

  return (
    <>
      <LiquidationPrice
        liquidationPrice={price0}
        TWAPPrice={TWAPPrice}
        safetyMargin={safetyMargin} /> - <LiquidationPrice
        liquidationPrice={price1}
        TWAPPrice={TWAPPrice}
        safetyMargin={safetyMargin} />
    </>
  );
}