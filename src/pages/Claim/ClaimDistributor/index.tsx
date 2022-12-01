import { getAddress } from '@ethersproject/address';
import clsx from 'clsx';
import GridWrapper from '../../../components/GridWrapper';
import QuestionHelper from '../../../components/QuestionHelper';
import TarotImage from '../../../components/UI/TarotImage';
import { TAROT_ADDRESSES } from '../../../config/web3/contracts/tarot';
import { UserDistribution } from '../../../types/interfaces';
import { parse18 } from '../../../utils/big-amount';
import InteractionButton from '../../../components/InteractionButton';
import useClaimDistributor from '../../../hooks/useClaimDistributor';
import { formatAmount } from '../../../utils/format';
import React from 'react';

export default function ClaimDistributor({ distribution: d, chainId }: { distribution: UserDistribution, chainId: number }): JSX.Element | null {
  const tarotAddress = TAROT_ADDRESSES[chainId];
  const availableClaimable = parse18(d.availableClaimable);
  const claimed = parse18(d.claimed);
  const totalClaim = parse18(d.totalClaim);
  const [claimDistributorState, onClaimDistributor] = useClaimDistributor(d.config);

  const onClaim = async () => {
    await onClaimDistributor();
  };

  return (
    <div
      className={clsx(
        'p-6',
        'overflow-hidden',
        'bg-tarotBlackHaze-750',
        'shadow',
        'rounded-xl',
        'border',
        'border-tarotBlackHaze-300',
        'hover:shadow-xl',
        'hover:bg-tarotBlackHaze-850',
        'md:filter',
        'md:saturate-75',
        'hover:saturate-100',
        'transition-all',
        'duration-350',
        'h-full'
      )}>
      <GridWrapper
        className={clsx(
          'mt-8',
          'mb-12'
        )}>
        <div className='col-span-4 self-center justify-self-center flex flex-col items-center'>
          <div
            className={clsx(
              'flex',
              'flex-col',
              'flex-shrink-0',
              'items-center',
              'text-center',
              'space-y-4',
              'text-lg'
            )}>
            <TarotImage
              width={48}
              height={48}
              // TODO: could componentize
              className={clsx(
                'inline-block'
              )}
              src={`/assets/images/token-icons/${getAddress(tarotAddress)}.png`}
              placeholder='/assets/images/default.png'
              error='/assets/images/default.png'
              alt='Exchange' />
            <span
              className={clsx(
                'text-textPrimary',
                'font-semibold',
                'text-xl'
              )}>
              {d.config.name}
            </span>
            <div className='text-sm text-textSecondary !-mb-4'>
              Total Claim<QuestionHelper text={`Total amount after ${d.config.distributionPeriod}`} />
            </div>
            <span>
              {formatAmount(totalClaim)} TAROT
            </span>
            {d.config.name === 'Global Incentives' ? <></> :
              <>
                <div className='text-sm text-textSecondary !-mb-4'>
              Claimed<QuestionHelper text='Total amount claimed to date' />
                </div>
                <>
                  <span key={`${d.config.claimableAddress}-${claimed}`}>
                    {formatAmount(claimed)} TAROT
                  </span>
                </>
              </>
            }
            <div className='text-sm text-textSecondary !-mb-4'>
              Est. Available<QuestionHelper text='Estimated amount available to claim' />
            </div>
            <>
              <span key={`${d.config.claimableAddress}-${availableClaimable}`}>
                {formatAmount(availableClaimable)} TAROT
              </span>
            </>
          </div>
        </div>
      </GridWrapper>
      <GridWrapper
        className={clsx(
          'gap-y-6',
          'mt-8',
          'text-lg'
        )}>
        <div className='col-span-4'>
          <InteractionButton
            className='w-full'
            name='Claim TAROT'
            onCall={onClaim}
            state={claimDistributorState} />
        </div>
      </GridWrapper>
    </div>
  );
}