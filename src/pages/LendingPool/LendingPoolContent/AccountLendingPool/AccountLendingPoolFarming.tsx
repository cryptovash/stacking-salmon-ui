import { formatAmount, formatFloat } from '../../../../utils/format';
import { useSymbol, useBorrowedUSD, useFarmingShares, useAvailableReward, useClaimHistory } from '../../../../hooks/useData';
import { PoolTokenType, ClaimEvent } from '../../../../types/interfaces';
import useTrackBorrows from '../../../../hooks/useTrackBorrows';
import InteractionButton from '../../../../components/InteractionButton';
import useClaims from '../../../../hooks/useClaims';
import { useTransactionUrlGenerator } from '../../../../hooks/useUrlGenerator';
import clsx from 'clsx';

export default function AccountLendingPoolFarming(): JSX.Element {
  const symbol = useSymbol(PoolTokenType.Collateral);
  const borrowedA = useBorrowedUSD(PoolTokenType.BorrowableA);
  const borrowedB = useBorrowedUSD(PoolTokenType.BorrowableB);
  const farmingSharesA = useFarmingShares(PoolTokenType.BorrowableA);
  const farmingSharesB = useFarmingShares(PoolTokenType.BorrowableB);
  const availableReward = useAvailableReward();
  const claimHistory = useClaimHistory();
  const urlGenerator = useTransactionUrlGenerator();

  const [trackBorrowsState, onTrackBorrows] = useTrackBorrows();
  const [claimsState, onClaims] = useClaims();

  // if is farming, show reward accumulated and show a button to claim it
  if (
    (claimHistory && claimHistory.length > 0) ||
    (availableReward > 0 || ((borrowedA > 0 && farmingSharesA > 0) || (borrowedB > 0 && farmingSharesB > 0)))) {
    return (
      <div className='grid grid-cols-6'>
        <div
          className={clsx(
            'lg:col-start-2',
            'col-span-6',
            'lg:col-span-4',
            'text-lg',
            'flex',
            'flex-col',
            'justify-center',
            'space-y-6',
            'items-center',
            'text-center',
            'py-4'
          )}>
          {(availableReward > 0 || ((borrowedA > 0 && farmingSharesA > 0) || (borrowedB > 0 && farmingSharesB > 0))) &&
        <div
          className={clsx(
            'pt-6',
            'px-4',
            'text-lg',
            'flex',
            'justify-center',
            'text-center'
          )}>
          <InteractionButton
            name={'Claim ' + formatFloat(availableReward) + ' TAROT'}
            onCall={onClaims}
            state={claimsState} />
        </div>
          }
          {claimHistory && claimHistory.length > 0 &&
          <div className='claim-history'>
            <b>History</b>
            {claimHistory.map((claimEvent: ClaimEvent, key: any) => {
              return (
                <div key={key}>
                  <a
                    href={urlGenerator(claimEvent.transactionHash)}
                    target='_blank'
                    rel='noopener noreferrer'>
                  Claimed {formatAmount(claimEvent.amount)} TAROT
                  </a>
                </div>
              );
            })}
          </div>
          }
        </div>
      </div>
    );
  }

  if (farmingSharesA <= 0 && farmingSharesB <= 0) {
    return (
      <div className='account-lending-pool-farming'>
        <div
          className={clsx(
            'py-4',
            'px-4',
            'text-lg',
            'flex',
            'justify-center',
            'text-center',
            'rounded-lg',
            'border',
            'border-tarotJade-300',
            'bg-tarotJade-700'
          )}>This pool does not currently receive TAROT rewards.
        </div>
      </div>
    );
  }

  if (borrowedA + borrowedB <= 0) {
    return (
      <div className='account-lending-pool-farming'>
        <div
          className={clsx(
            'py-4',
            'px-4',
            'text-lg',
            'flex',
            'justify-center',
            'text-center',
            'rounded-lg',
            'border',
            'border-tarotJade-300',
            'bg-tarotJade-700'
          )}>Leverage {symbol} or borrow to start farming TAROT.
        </div>
      </div>
    );
  }

  return (
    <div className='account-lending-pool-farming'>
      <div className='grid grid-cols-6'>
        <div
          className={clsx(
            'lg:col-start-2',
            'col-span-6',
            'lg:col-span-4',
            'text-lg',
            'flex',
            'flex-col',
            'justify-center',
            'space-y-6',
            'items-center',
            'text-center'
          )}>
          <div
            className={clsx(
              'py-4',
              'px-4',
              'rounded-lg',
              'border',
              'border-tarotJade-300',
              'bg-tarotJade-700')}>Activate farming for {symbol} to receive TAROT rewards.
          </div>
          <InteractionButton
            name='Activate Farming'
            onCall={onTrackBorrows}
            state={trackBorrowsState} />
        </div>
      </div>
    </div>
  );
}