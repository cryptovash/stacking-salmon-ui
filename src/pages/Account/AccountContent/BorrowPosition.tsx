
import BorrowPositionCard from '../../../components/PositionCard/BorrowPositionCard';
import { UNKNOWN_DEX } from '../../../config/web3/dexs';
import useLendingPoolURL from '../../../hooks/use-lending-pool-url';
import { useBorrowedValue, useBorrowerEquityValue, useCollateralValue } from '../../../hooks/useAccountData';
import { useFullLendingPoolsData } from '../../../hooks/useData';
import usePairAddress from '../../../hooks/usePairAddress';
import { useTokenIcon } from '../../../hooks/useUrlGenerator';
import { Link } from 'react-router-dom';
import { PoolTokenType } from '../../../types/interfaces';
import { getTokenSymbol } from '../../../utils';
import React from 'react';

interface Props {
  searchTerm?: string;
  hideDust?: boolean;
}

const BorrowPosition = ({ searchTerm, hideDust }: Props): JSX.Element | null => {
  const lendingPoolId = usePairAddress();
  const fullLendingPoolsMap = useFullLendingPoolsData() || {};
  const pool = fullLendingPoolsMap[lendingPoolId.toLowerCase()] || {};
  const dex = pool.dex || UNKNOWN_DEX;
  const symbolA = getTokenSymbol(lendingPoolId, PoolTokenType.BorrowableA);
  const symbolB = getTokenSymbol(lendingPoolId, PoolTokenType.BorrowableB);
  const collateralValue = useCollateralValue();
  const borrowedValueA = useBorrowedValue(PoolTokenType.BorrowableA);
  const borrowedValueB = useBorrowedValue(PoolTokenType.BorrowableB);
  const equityValue = useBorrowerEquityValue();
  const tokenIconA = useTokenIcon(PoolTokenType.BorrowableA);
  const tokenIconB = useTokenIcon(PoolTokenType.BorrowableB);
  const lendingPoolUrl = useLendingPoolURL();

  if (!collateralValue || collateralValue === 0 || (hideDust && collateralValue < 1)) {
    return null;
  }

  if (searchTerm) {
    const terms = searchTerm.toLowerCase().replace(/[-]/, ' ').trim().split(' ');
    if (!terms.every(term => dex.dexName.toLowerCase().includes(term) ||
      symbolA.toLowerCase().includes(term) ||
      symbolB.toLowerCase().includes(term)
    )) {
      return null;
    }
  }

  return (
    <Link
      to={lendingPoolUrl}
      style={{
        order: 0 - Math.round((equityValue))
      }}>
      <BorrowPositionCard
        dex={dex}
        symbolA={symbolA}
        symbolB={symbolB}
        collateralValue={collateralValue}
        borrowedValueA={borrowedValueA}
        borrowedValueB={borrowedValueB}
        equityValue={equityValue}
        tokenIconA={tokenIconA}
        tokenIconB={tokenIconB} />
    </Link>
  );
};

export default BorrowPosition;
