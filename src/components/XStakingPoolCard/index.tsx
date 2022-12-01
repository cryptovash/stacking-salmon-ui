
import clsx from 'clsx';
import { ReactComponent as XTAROT } from '../../assets/images/icons/xtarot-logo.svg';
import { Address } from '../../types/interfaces';
import InteractionButton, { ButtonState } from '../../components/InteractionButton';
import { formatAmount, formatPercentage, formatPercentageShort, formatUSD, formatUSDShort } from '../../utils/format';
import { useSupplyVault, useTarotPrice, useXStakingPool, useXStakingPoolAccountInfo } from '../../hooks/useData';
import { formatUnits } from '@ethersproject/units';
import { useWeb3React } from '@web3-react/core';
import { Web3Provider } from '@ethersproject/providers';
import { parseNumber } from '../../utils/big-amount';
import TarotImage from '../../components/UI/TarotImage';
import { getAddress } from '@ethersproject/address';
import { XTAROT_ADDRESSES } from '../../config/web3/contracts/tarot';
import { BigNumber } from '@ethersproject/bignumber';
import { Link } from 'react-router-dom';
import Card from '../../components/Card';
import { PAGES } from '../../utils/constants/links';
import { X_STAKING_POOLS } from '../../config/web3/contracts/x-staking-pool';
import QuestionHelper from '../../components/QuestionHelper';
import { useEffect, useState } from 'react';
import useClaimXStakingReward from '../../hooks/useClaimXStakingReward';
import XStakeInteractionModal from '../../components/InteractionModal/XStakeInteractionModal';
import XUnstakeInteractionModal from '../../components/InteractionModal/XUnstakeInteractionModal';
import { ReactComponent as SpinIcon } from '../../assets/images/icons/spin.svg';
import { useDefaultChainId } from '../../hooks/useTarotRouter';
import React from 'react';

interface Props {
  poolId: number;
  isDashboard: boolean;
  searchTerm?: string;
  hideDust?: boolean;
  account?: Address;
  hideInactive?: boolean;
}

const XStakingPoolCard = ({
  poolId,
  isDashboard = false,
  searchTerm,
  hideDust,
  account,
  hideInactive
}: Props): JSX.Element => {
  const { chainId: web3ChainId } = useWeb3React<Web3Provider>();
  const defaultChainId = useDefaultChainId();
  const chainId = web3ChainId || defaultChainId;
  const xStakingPoolInfo = X_STAKING_POOLS[chainId][poolId];
  const [showStakeModal, toggleStakeModal] = useState(false);
  const [showUnstakeModal, toggleUnstakeModal] = useState(false);
  const [claimRewardState, onClaimReward] = useClaimXStakingReward(poolId, xStakingPoolInfo);
  const xStakingPool = useXStakingPool(poolId);
  const xStakingPoolAccountInfo = useXStakingPoolAccountInfo(poolId, account);

  const xTAROTAddress = XTAROT_ADDRESSES[chainId];
  const xTAROTSupplyVault = useSupplyVault(xTAROTAddress);
  const tarotPrice = useTarotPrice();
  const rewardTokenPrice = xStakingPool.rewardTokenPrice;
  const xTAROTPrice = parseNumber(xTAROTSupplyVault.shareValuedAsUnderlying) * tarotPrice;
  const totalStakedUSD = parseNumber(xStakingPool.stakedBalance) * xTAROTPrice;
  const stakedBalanceForAccountUSD = parseNumber(xStakingPoolAccountInfo.stakedBalance) * xTAROTPrice;
  const pendingRewardForAccountUSD = parseNumber(xStakingPoolAccountInfo.pendingReward) * rewardTokenPrice;
  const xTAROTAPR = parseNumber(
    {
      amount: (
        xTAROTSupplyVault.feeDistributorRate ?
          xTAROTSupplyVault.supplyRate.amount.add(xTAROTSupplyVault.feeDistributorRate.amount) :
          xTAROTSupplyVault.supplyRate.amount
      ).mul(365 * 24 * 60 * 60),
      decimals: xTAROTSupplyVault.supplyRate.decimals
    });
  const rewardAPR = totalStakedUSD === 0 ? 0 : parseNumber(
    {
      amount: xStakingPool.rewardTokensPerSecond.amount.mul(365 * 24 * 60 * 60),
      decimals: xStakingPool.rewardTokensPerSecond.decimals
    }
  ) * rewardTokenPrice / totalStakedUSD;
  const stakingAPR = xTAROTAPR + rewardAPR;

  const calculateStarted = () => {
    return new Date().getTime() / 1000 >= xStakingPool.start;
  };
  const calculateTimeLeft = () => {
    if (calculateStarted()) {
      return Math.max(0, xStakingPool.end - Math.floor(new Date().getTime() / 1000));
    } else {
      return Math.max(0, xStakingPool.start - Math.floor(new Date().getTime() / 1000));
    }
  };

  const padDHMS = (t: number) => {
    return `${t < 10 ? '0' : ''}${t}`;
  };

  const formatSecondsAsDHMS = (t: number) => {
    let n = t;
    const days = Math.floor(n / (24 * 3600));
    n %= (24 * 3600);
    const hours = Math.floor(n / 3600);
    n %= 3600;
    const minutes = Math.floor(n / 60);
    n %= 60;
    // const seconds = n;
    return (
      <>
        <span className='text-base'>{padDHMS(days)}</span>
        <span className='text-sm'>D{`\u00A0`}</span>
        <span className='text-base'>{padDHMS(hours)}</span>
        <span className='text-sm'>H{`\u00A0`}</span>
        <span className='text-base'>{padDHMS(minutes)}</span>
        <span className='text-sm'>M{`\u00A0`}</span>
        {/*
        <span className='text-base'>{padDHMS(seconds)}</span>
        <span className='text-sm'>S</span>
        */}
      </>);
  };
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());
  const [started, setStarted] = useState(calculateStarted());
  useEffect(() => {
    const timer = setTimeout(() => {
      setStarted(calculateStarted());
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    return () => clearTimeout(timer);
  });

  if (isDashboard && xStakingPoolAccountInfo.stakedBalance.amount.eq(BigNumber.from(0))) {
    return <></>;
  }

  if (isDashboard && hideDust && stakedBalanceForAccountUSD < 1) {
    return <></>;
  }

  if (isDashboard && searchTerm) {
    const terms = searchTerm.toLowerCase().replace(/[-]/, ' ').trim().split(' ');
    if (!terms.every(term => xStakingPoolInfo.rewardTokenSymbol.toLowerCase().includes(term))) {
      return <></>;
    }
  }

  if (!hideInactive && (!xStakingPool || !xStakingPool.start || !xStakingPool.end)) {
    return (
      <div
        className={clsx(
          'p-7',
          'flex',
          'justify-center'
        )}>
        <SpinIcon
          className={clsx(
            'animate-spin',
            'w-8',
            'h-8',
            'text-tarotJade-200',
            'filter',
            'brightness-150'
          )} />
      </div>
    );
  }

  const content = (
    <>
      <div className='flex flex-col w-full md:min-w-lg items-center justify-center rounded-xl text-base text-textSecondary p-0'>
        <div className={`flex flex-col items-center justify-start mb-4 space-y-2 ${isDashboard ? 'mt-6' : 'mt-2'}`}>
          <div className='combined z-10 mb-2'>
            <div className='w-12 h-12 justify-center items-center flex transform-gpu'>
              <TarotImage
                width={48}
                height={48}
                className={clsx(
                  'inline-block',
                  'rounded-full'
                )}
                src={`/assets/images/token-icons/${getAddress(xStakingPoolInfo.rewardTokenAddress)}.png`}
                placeholder='/assets/images/default.png'
                error='/assets/images/default.png'
                alt={xStakingPoolInfo.rewardTokenSymbol} />
            </div>
          </div>
          <div className='text-center text-lg text-textPrimary'>Stake xTAROT, Earn {xStakingPoolInfo.rewardTokenSymbol}</div>
          <div className='flex flex-col items-center'>
            {!started && <div className='text-base text-textSecondary'>Rewards Start In<QuestionHelper text={`Along with the xTAROT APR, Staked xTAROT in this pool will earn additional rewards when ${xStakingPoolInfo.rewardTokenSymbol} emissions begin.`} /></div>}
            {started && timeLeft > 0 && <div className='text-base text-textSecondary'>Time Remaining<QuestionHelper text={`Staked xTAROT in this pool earns ${xStakingPoolInfo.rewardTokenSymbol} rewards in addition to the xTAROT APR.`} /></div>}
            {started && timeLeft <= 0 && <div className='text-base text-textSecondary'>Rewards Ended<QuestionHelper text={`${xStakingPoolInfo.rewardTokenSymbol} rewards for this pool are not currently being emitted. Staked xTAROT will continue to earn the xTAROT APR.`} /></div>}
            {timeLeft > 0 ? <span className='text-textSecondary'>{formatSecondsAsDHMS(timeLeft)}</span> : <span className='text-textSecondary'>&nbsp;</span>}
          </div>
        </div>
        {!isDashboard &&
        <>
          <div className='mt-2 flex flex-col items-center justify-end mb-4'>
            <div className='text-base sm:text-lg'>Staked TVL</div>
            <div className='text-lg sm:text-xl text-textPrimary flex items-start'><div className='text-lg -mt-0.5'>$</div>{formatAmount(totalStakedUSD)}</div>
          </div>

          <div className='flex flex-col items-center justify-end mb-6'>
            <div className='text-base sm:text-lg'>APR Estimate
              <QuestionHelper
                text={
                  <div className='flex flex-col text-sm space-y-1'>
                    <div className='flex justify-between'>
                      <div className='text-textSecondary'>xTAROT APR:</div>
                      <div>{formatPercentage(xTAROTAPR)}</div>
                    </div>
                    <div className='flex justify-between'>
                      <div className='text-textSecondary'>Reward APR:</div>
                      <div>{(xStakingPool.stakedBalance.amount.gt(0) && (!started || (started && timeLeft > 0))) ? formatPercentage(rewardAPR) : '-'}</div>
                    </div>
                  </div>
                } />
            </div>
            <div className='text-xl sm:text-2xl flex items-start text-green-600 font-bold'>{(!started || (started && timeLeft > 0)) ? formatPercentageShort(stakingAPR, '') : formatPercentageShort(xTAROTAPR, '')}<div className='text-lg -mt-0.5'>%</div></div>
          </div>

        </>
        }
        {(isDashboard || web3ChainId) &&
        <>
          <div className={`!mb-0 flex flex-col items-stretch justify-around space-y-4 w-full ${isDashboard ? 'mt-2' : 'mt-4 p-6 py-6 border border-tarotJade-400 rounded-lg bg-tarotJade-800'}`}>
            <div className='flex flex-col items-center'>
              <div className='text-base sm:text-lg text-center'>Staked xTAROT</div>
              <div
                className='text-base sm:text-lg text-textPrimary items-center flex flex-grow text-center'
                title={formatUnits(xStakingPoolAccountInfo.stakedBalance.amount, xStakingPoolAccountInfo.stakedBalance.decimals)}>{formatAmount(parseNumber(xStakingPoolAccountInfo.stakedBalance))}{`\u00A0`}
                <XTAROT
                  className={clsx(
                    'w-4',
                    'h-4',
                    '-mb-0.5'
                  )} />
              </div>
              {!isDashboard &&
            <div
              className='text-base sm:text-lg text-textSecondary items-center flex flex-grow text-center'
              title={`$${stakedBalanceForAccountUSD}`}>(<div className='text-base -mt-0.5'>$</div>{formatAmount(stakedBalanceForAccountUSD)})
            </div>
              }
            </div>
            <div className='flex flex-col items-center'>
              <div className='text-base sm:text-lg text-center'>Claimable {xStakingPoolInfo.rewardTokenSymbol}</div>
              <div
                className='text-base sm:text-lg text-textPrimary items-center flex flex-grow text-center'
                title={formatUnits(xStakingPoolAccountInfo.pendingReward.amount, xStakingPoolAccountInfo.pendingReward.decimals)}>
                {formatAmount(parseNumber(xStakingPoolAccountInfo.pendingReward))}
                {`\u00A0`}
                <TarotImage
                  width={16}
                  height={16}
                  className={clsx(
                    'inline-block',
                    'rounded-full'
                  )}
                  src={`/assets/images/token-icons/${getAddress(xStakingPoolInfo.rewardTokenAddress)}.png`}
                  placeholder='/assets/images/default.png'
                  error='/assets/images/default.png'
                  alt={xStakingPoolInfo.rewardTokenSymbol} />
              </div>
              {!isDashboard &&
            <div
              className='text-base sm:text-lg text-textSecondary items-center flex flex-grow text-center'
              title={`$${pendingRewardForAccountUSD}`}>(<div className='text-base -mt-0.5'>$</div>{formatAmount(pendingRewardForAccountUSD)})
            </div>
              }
            </div>
            {!isDashboard && web3ChainId &&
          <>
            <div className='mt-4 space-x-4 md:space-x-6 flex flex-row justify-around'>
              <div className='flex-grow'></div>
              <InteractionButton
                className='text-sm xs:text-base'
                name={`Claim ${xStakingPoolInfo.rewardTokenSymbol}`}
                onCall={onClaimReward}
                state={claimRewardState} />
              <div className='flex-grow'></div>
            </div>
            <div className='mt-4 space-x-4 md:space-x-6 flex flex-row justify-around'>
              <div className='flex-grow'></div>
              {started && timeLeft <= 0 ? <></> : <InteractionButton
                className='text-sm xs:text-base'
                name='Stake'
                onCall={() => toggleStakeModal(true)}
                state={ButtonState.Ready} />}
              <InteractionButton
                className='text-sm xs:text-base'
                name='Unstake'
                onCall={() => toggleUnstakeModal(true)}
                state={ButtonState.Ready} />
              <div className='flex-grow'></div>
            </div>
          </>
            }
            {isDashboard &&
          <>
            <div
              className={clsx(
                'mt-3',
                'col-span-4 flex',
                'flex-col',
                'justify-between',
                '-mx-2',
                'p-2',
                'py-3',
                'border',
                'border-tarotBlackHaze-200',
                'rounded-lg',
                'bg-tarotBlackHaze-600',
                'space-y-3'
              )}>
              <div className='text-lg self-center justify-self-start'>
                Total Staked Value
              </div>
              <div
                className={clsx(
                  'self-center',
                  'justify-self-end',
                  'text-2xl',
                  'font-semibold',
                  'text-textPrimary',
                  'items-center',
                  'flex',
                  'flex-col',
                  'mt-2',
                  'space-y-2'
                )}>
                <div
                  title={formatUSD(stakedBalanceForAccountUSD)}
                  className='self-center'>
                  {formatUSDShort(stakedBalanceForAccountUSD)}
                </div>
              </div>
            </div>
            {(!started || (started && timeLeft > 0)) &&
            <div className='flex flex-col items-center justify-end'>
              <div className='text-base sm:text-lg'>
                APR Estimate
                <QuestionHelper
                  text={
                    <div className='flex flex-col text-sm space-y-1'>
                      <div className='flex justify-between'>
                        <div className='text-textSecondary'>xTAROT APR:</div>
                        <div>{formatPercentage(xTAROTAPR)}</div>
                      </div>
                      <div className='flex justify-between'>
                        <div className='text-textSecondary'>Reward APR:</div>
                        <div>{formatPercentage(rewardAPR)}</div>
                      </div>
                    </div>
                  } />
              </div>
              <div className='text-lg sm:text-xl flex items-start text-green-600 font-bold'>{formatPercentageShort(stakingAPR, '')}<div className='text-lg -mt-0.5'>%</div></div>
            </div>
            }
          </>
            }
          </div>
        </>
        }
      </div>
      {!isDashboard && web3ChainId &&
      <>
        <XStakeInteractionModal
          show={showStakeModal}
          poolId={poolId}
          toggleShow={toggleStakeModal}
          hasPendingReward={xStakingPoolAccountInfo.pendingReward.amount.gt(0)}
          title={`${xStakingPoolInfo.rewardTokenSymbol} xStaking`} />
        <XUnstakeInteractionModal
          show={showUnstakeModal}
          poolId={poolId}
          hasPendingReward={xStakingPoolAccountInfo.pendingReward.amount.gt(0)}
          toggleShow={toggleUnstakeModal} />
      </>
      }
    </>
  );

  if (isDashboard) {
    return (
      <Link
        key={poolId}
        to={PAGES.STAKE}
        style={{
          order: 0 - Math.round(stakedBalanceForAccountUSD)
        }}>
        <Card
          isLendingPoolDetail={false}>
          {content}
        </Card>
      </Link>
    );
  } else {
    return (
      hideInactive && started && timeLeft <= 0 ? <></> :
        <div
          className={clsx(
            'h-full',
            'w-full',
            'flex-grow',
            'md:max-w-half'
          )}
          style={{
            order: 0 - Math.round(totalStakedUSD)
          }}>
          <div
            className={clsx(
              'm-4',
              'p-6',
              'overflow-hidden',
              'bg-tarotBlackHaze-800',
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
              'duration-500'
            )}>{content}
          </div>
        </div>
    );
  }
};

export default XStakingPoolCard;