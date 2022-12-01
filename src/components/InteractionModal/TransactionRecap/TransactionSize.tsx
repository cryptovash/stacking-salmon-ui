import usePairAddress from 'hooks/usePairAddress';
import { getTokenSymbol } from 'utils';
import { useFullLendingPoolsData, useMarketPriceDenomLP } from '../../../hooks/useData';
import usePoolToken from '../../../hooks/usePoolToken';
import { PoolTokenType } from '../../../types/interfaces';
import { formatAmount } from '../../../utils/format';

export interface TransactionSizeProps {
  amount: number;
}

export default function TransactionSize({ amount }: TransactionSizeProps): JSX.Element | null {
  const lendingPoolId = usePairAddress();
  const poolTokenType = usePoolToken();
  const fullLendingPoolsMap = useFullLendingPoolsData() || {};
  const pool = fullLendingPoolsMap[lendingPoolId.toLowerCase()] || {};

  const [tokenPriceA, tokenPriceB] = useMarketPriceDenomLP();
  if (poolTokenType !== PoolTokenType.Collateral) return null;

  const symbolA = getTokenSymbol(lendingPoolId, PoolTokenType.BorrowableA);
  const symbolB = getTokenSymbol(lendingPoolId, PoolTokenType.BorrowableB);
  return (
    <div className='mt-4 flex justify-between'>
      <div>Transaction size:</div>
      <div className='flex flex-col text-right'>
        <span>{formatAmount(amount * pool.priceFactor / (1 + pool.priceFactor) / tokenPriceA)} {symbolA}</span>
        <span>+ {formatAmount(amount / (1 + pool.priceFactor) / tokenPriceB)} {symbolB}</span>
      </div>
    </div>
  );
}
