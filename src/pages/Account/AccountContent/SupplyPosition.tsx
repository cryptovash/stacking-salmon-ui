
import SupplyPositionCard from '../../../components/PositionCard/SupplyPositionCard';
import { UNKNOWN_DEX } from '../../../config/web3/dexs';
import useLendingPoolURL from '../../../hooks/use-lending-pool-url';
import { useSuppliedAmount, useSuppliedValue } from '../../../hooks/useAccountData';
import { useBorrowableAddresses, useFullLendingPoolsData } from '../../../hooks/useData';
import usePairAddress from '../../../hooks/usePairAddress';
import { useTokenIcon } from '../../../hooks/useUrlGenerator';
import { Link } from 'react-router-dom';
import { PoolTokenType } from '../../../types/interfaces';
import { getTokenSymbol } from '../../../utils';
import { parseNumber } from '../../../utils/big-amount';
import React from 'react';

interface Props {
  searchTerm?: string;
  hideDust?: boolean;
}
const SupplyPosition = ({ searchTerm, hideDust }: Props): JSX.Element | null => {
  const lendingPoolId = usePairAddress();
  const fullLendingPoolsMap = useFullLendingPoolsData() || {};
  const pool = fullLendingPoolsMap[lendingPoolId.toLowerCase()] || {};
  const dex = pool.dex || UNKNOWN_DEX;
  const symbolA = getTokenSymbol(lendingPoolId, PoolTokenType.BorrowableA);
  const symbolB = getTokenSymbol(lendingPoolId, PoolTokenType.BorrowableB);
  const suppliedAmountABigAmount = useSuppliedAmount(PoolTokenType.BorrowableA);
  const suppliedAmountBBigAmount = useSuppliedAmount(PoolTokenType.BorrowableB);
  const suppliedAmountA = parseNumber(suppliedAmountABigAmount);
  const suppliedAmountB = parseNumber(suppliedAmountBBigAmount);
  const suppliedValueA = useSuppliedValue(PoolTokenType.BorrowableA);
  const suppliedValueB = useSuppliedValue(PoolTokenType.BorrowableB);
  const tokenIconA = useTokenIcon(PoolTokenType.BorrowableA);
  const tokenIconB = useTokenIcon(PoolTokenType.BorrowableB);
  const lendingPoolUrl = useLendingPoolURL();
  const [tokenA, tokenB] = useBorrowableAddresses();

  const svA = typeof suppliedValueA === 'undefined' ? 0 : suppliedValueA;
  const svB = typeof suppliedValueB === 'undefined' ? 0 : suppliedValueB;

  if ((svA + svB === 0) || (hideDust && (svA + svB) < 1)) {
    return null;
  }

  if (searchTerm) {
    const terms = searchTerm.toLowerCase().replace(/[-\/]/, ' ').trim().split(' ');
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
        order: 0 - Math.round((svA + svB))
      }}>
      <SupplyPositionCard
        dex={dex}
        symbolA={symbolA}
        symbolB={symbolB}
        suppliedAmountA={suppliedAmountA}
        suppliedAmountB={suppliedAmountB}
        suppliedValueA={suppliedValueA}
        suppliedValueB={suppliedValueB}
        tokenIconA={tokenIconA}
        tokenIconB={tokenIconB}
        tokenA={tokenA}
        tokenB={tokenB} />
    </Link>
  );
};

export default SupplyPosition;
