
import React from 'react';
import OverallStatsInternal from '../../../../components/OverallStatsInternal';
import {
  useAccountTotalValueLocked,
  useAccountTotalValueSupplied,
  useAccountTotalValueBorrowed
} from '../../../../hooks/useAccountData';
import { useTarotPrice } from '../../../../hooks/useData';

const AccountOverallStats = (): JSX.Element => {
  const totalValueLocked = useAccountTotalValueLocked();
  const totalValueSupplied = useAccountTotalValueSupplied();
  const totalValueBorrowed = useAccountTotalValueBorrowed();
  const tarotDerivedUSD = useTarotPrice();

  return (
    <OverallStatsInternal
      totalValueLocked={totalValueLocked}
      totalValueSupplied={totalValueSupplied}
      totalValueBorrowed={totalValueBorrowed}
      tarotDerivedUSD={tarotDerivedUSD} />
  );
};

export default AccountOverallStats;
