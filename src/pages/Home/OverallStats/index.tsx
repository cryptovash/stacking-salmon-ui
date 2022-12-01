
import ErrorFallback from '../../../components/ErrorFallback';
import OverallStatsInternal from '../../../components/OverallStatsInternal';
import { useFullLendingPools, useTarotPrice } from '../../../hooks/useData';
import * as React from 'react';
import {
  withErrorBoundary
} from 'react-error-boundary';

interface StatsForPool {
  totalValueLocked: number;
  totalValueSupplied: number;
  totalValueBorrowed: number;
}

const OverallStats = (): JSX.Element => {
  const pools = useFullLendingPools() || [];
  const stats = pools.filter(pool => !pool.poolDisabled).map(pool => {
    const {
      totalCollateralUSD,
      totalBorrowedUSD,
      totalSupplyUSD
    } = pool;
    const ret: StatsForPool = {
      totalValueLocked: totalCollateralUSD + totalSupplyUSD[0] - totalBorrowedUSD[0] + totalSupplyUSD[1] - totalBorrowedUSD[1],
      totalValueSupplied: totalSupplyUSD[0] + totalSupplyUSD[1],
      totalValueBorrowed: totalBorrowedUSD[0] + totalBorrowedUSD[1]
    };
    return ret;
  }).reduce((prev, curr) => ({
    totalValueLocked: prev.totalValueLocked + curr.totalValueLocked,
    totalValueSupplied: prev.totalValueSupplied + curr.totalValueSupplied,
    totalValueBorrowed: prev.totalValueBorrowed + curr.totalValueBorrowed
  }), {
    totalValueLocked: 0, totalValueSupplied: 0, totalValueBorrowed: 0 } as StatsForPool);
  const tarotPrice = useTarotPrice();

  const tarotDerivedUSD = tarotPrice;

  return (
    <OverallStatsInternal
      totalValueLocked={stats.totalValueLocked}
      totalValueSupplied={stats.totalValueSupplied}
      totalValueBorrowed={stats.totalValueBorrowed}
      tarotDerivedUSD={tarotDerivedUSD} />
  );
};

export default withErrorBoundary(OverallStats, {
  FallbackComponent: ErrorFallback,
  onReset: () => {
    window.location.reload();
  }
});