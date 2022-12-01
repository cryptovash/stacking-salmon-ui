// TODO: <
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
// TODO: >

import { useContext } from 'react';
import { LanguageContext } from 'contexts/LanguageProvider';
import phrases from './translations';
import { formatLeverage } from '../../utils/format';
import DetailsRow from '../DetailsRow';
import { useCurrentLeverage } from '../../hooks/useData';
import LiquidationPrices from './LiquidationPrices';
import CurrentPrice from './CurrentPrice';
import './index.scss';

interface RiskMetricsProps {
  changeBorrowedA?: number;
  changeBorrowedB?: number;
  changeCollateral?: number;
  hideIfNull?: boolean;
  dashboard?: boolean;
}

/**
 * Generates lending pool aggregate details.
 */

export default function RiskMetrics({ changeBorrowedA, changeBorrowedB, changeCollateral, hideIfNull, dashboard } : RiskMetricsProps): JSX.Element {
  const languages = useContext(LanguageContext);
  const language = languages.state.selected;
  const t = (s: string) => (phrases[s][language]);

  const changes = changeBorrowedA || changeBorrowedB || changeCollateral ? {
    changeBorrowedA: changeBorrowedA ? changeBorrowedA : 0,
    changeBorrowedB: changeBorrowedB ? changeBorrowedB : 0,
    changeCollateral: changeCollateral ? changeCollateral : 0
  } : null;

  const currentLeverage = useCurrentLeverage();
  const newLeverage = useCurrentLeverage(changes);

  const leverageExplanation = 'Calculated as: Total Collateral / LP Equity';
  const liquidationExplanation = 'If the price crosses these boundaries, your position will become liquidatable';

  if (hideIfNull && currentLeverage === 1) return null;

  if (dashboard) {
    return (
      <div className='flex-row text-center'>
        <div className='flex justify-around text-center'>
          <DetailsRow
            name='Leverage'>
            {formatLeverage(currentLeverage)}
          </DetailsRow>
          <CurrentPrice dashboard={true} />
        </div>
        <DetailsRow
          name={t('Liquidation Prices')}>
          <LiquidationPrices />
        </DetailsRow>
      </div>
    );
  }

  return (
    <div>
      {changes ? (
        <DetailsRow
          name={t('New Leverage')}
          explanation={leverageExplanation}>
          {formatLeverage(currentLeverage)}
          <span className='px-2'>➜</span>
          {formatLeverage(newLeverage)}
        </DetailsRow>
      ) : (
        <DetailsRow
          name={t('Current Leverage')}
          explanation={leverageExplanation}>
          {formatLeverage(currentLeverage)}
        </DetailsRow>
      )}
      {changes ? (
        <DetailsRow
          name={t('New Liquidation Prices')}
          explanation={liquidationExplanation}>
          <LiquidationPrices />
          <span className='px-2'>➜</span>
          <LiquidationPrices changes={changes} />
        </DetailsRow>
      ) : (
        <DetailsRow
          name={t('Liquidation Prices')}
          explanation={liquidationExplanation}>
          <LiquidationPrices />
        </DetailsRow>
      )}
      <CurrentPrice />
    </div>
  );
}