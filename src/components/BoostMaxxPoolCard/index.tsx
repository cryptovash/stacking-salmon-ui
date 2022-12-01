import clsx from 'clsx';
import { BoostMaxxPoolInfo } from '../../types/interfaces';
import { useWeb3React } from '@web3-react/core';
import { Web3Provider } from '@ethersproject/providers';
import TarotImage from '../../components/UI/TarotImage';
import { formatUnits } from 'ethers/lib/utils';
import { formatAmount, formatPercentageShort, formatUSD } from '../../utils/format';
import InteractionButton, { ButtonState } from '../../components/InteractionButton';
import { useState } from 'react';
import useClaimBoostReward from '../../hooks/useClaimBoostReward';
import BoostStakeInteractionModal from '../../components/InteractionModal/BoostStakeInteractionModal';
import BoostUnstakeInteractionModal from '../../components/InteractionModal/BoostUnstakeInteractionModal';
import { parse18 } from '../../utils/big-amount';
import { getAddress } from '@ethersproject/address';
import { SOLID_ADDRESSES } from '../../config/web3/contracts/boostmaxxer';
import { useDefaultChainId } from '../../hooks/useTarotRouter';
import React from 'react';

interface PairCellCustomProps {
  tokenIconA: string;
  tokenIconB: string;
  symbolA?: string;
  symbolB?: string;
}

const TokenPairLabel = ({
  tokenIconA,
  tokenIconB,
  symbolA,
  symbolB,
  className
}: PairCellCustomProps & React.ComponentPropsWithRef<'div'>): JSX.Element => (
  <div
    className={clsx(
      'flex',
      'flex-shrink-0',
      'items-center',
      className
    )}>
    <TarotImage
      width={40}
      height={40}
      // TODO: could componentize
      className={clsx(
        'inline-block'
      )}
      src={tokenIconA}
      placeholder='/assets/images/default.png'
      error='/assets/images/default.png'
      alt='Token A' />
    <TarotImage
      width={40}
      height={40}
      className={clsx(
        'inline-block',
        '-ml-1.5'
      )}
      src={tokenIconB}
      placeholder='/assets/images/default.png'
      error='/assets/images/default.png'
      alt='Token B' />
    <span
      className={clsx(
        'font-medium',
        'text-textSecondary'
      )}>
      {symbolA}{symbolA && symbolB ? '/' : null}{symbolB}
    </span>
  </div>
);

interface Props {
  poolInfo: BoostMaxxPoolInfo;
}

const BoostMaxxPoolCard = ({
  poolInfo
}: Props): JSX.Element => {
  const { chainId: web3ChainId } = useWeb3React<Web3Provider>();
  const defaultChainId = useDefaultChainId();
  const chainId = web3ChainId || defaultChainId;

  const { totalDepositsUSD, userDepositsUSD, pendingReward, pendingRewardUSD, apr } = poolInfo;

  const [showStakeModal, toggleStakeModal] = useState(false);
  const [showUnstakeModal, toggleUnstakeModal] = useState(false);
  const [claimRewardState, onClaimReward] = useClaimBoostReward(poolInfo);

  const isDashboard = false;

  return (
    <>
      <div
        className={`flex flex-col w-full md:min-w-lg items-center justify-center rounded-xl text-base text-textSecondary ${isDashboard ? 'p-0' : 'p-4'}`}>
        <div className={`flex flex-col items-center justify-start mb-4 space-y-2 ${isDashboard ? 'mt-6' : 'mt-2'}`}>
          <TokenPairLabel
            tokenIconA={poolInfo.tokenIconA}
            tokenIconB={poolInfo.tokenIconB}
            className='justify-self-center' />
          <div className='text-base sm:text-lg text-textPrimary flex items-start'>{poolInfo.symbol}</div>
        </div>
        <div className='mt-2 flex flex-col items-center justify-end mb-4'>
          <div className='text-base sm:text-lg'>Staked TVL</div>
          <div className='text-lg sm:text-xl text-textPrimary flex items-start'>{formatUSD(parse18(totalDepositsUSD))}</div>
        </div>
        <div className='mt-2 flex flex-col items-center justify-end mb-2'>
          <div className='text-base sm:text-lg'>APR Estimate</div>
          <div className='text-xl sm:text-2xl flex items-start text-green-600 font-bold'>{formatPercentageShort(parse18(apr), '')}<div className='text-lg -mt-0.5'>%</div></div>
        </div>
        {web3ChainId &&
        <>
          <div className='flex w-full flex-row items-center justify-around mb-4'>
            <div className='mt-2 flex w-full flex-col items-center justify-center self-start mb-4'>
              <div className='text-base sm:text-lg'>Deposited LP</div>
              <div className='text-lg sm:text-xl text-textPrimary flex items-start'>{formatUSD(parse18(userDepositsUSD))}</div>
              <div className='mt-4 space-x-4 md:space-x-4 flex flex-row justify-around'>
                <div className='flex-grow'></div>
                <InteractionButton
                  className='text-sm xs:text-base'
                  name='Stake'
                  onCall={() => toggleStakeModal(true)}
                  state={ButtonState.Ready} />
                <InteractionButton
                  className='text-sm xs:text-base'
                  name='Unstake'
                  onCall={() => toggleUnstakeModal(true)}
                  state={ButtonState.Ready} />
                <div className='flex-grow'></div>
              </div>
            </div>
          </div>
          <div className={`!mb-0 flex flex-col items-stretch justify-around space-y-4 w-full ${isDashboard ? 'mt-2' : 'mt-4 p-6 py-6 border border-tarotJade-400 rounded-lg bg-tarotJade-800'}`}>
            <div className='flex flex-col items-center'>
              <div className='text-base sm:text-lg text-center'>Claimable SOLID</div>
              <div
                className='text-base sm:text-lg text-textPrimary items-center flex flex-grow text-center'
                title={formatUnits(pendingReward)}>
                {formatAmount(parse18(pendingReward))}
                {`\u00A0`}
                <TarotImage
                  width={16}
                  height={16}
                  className={clsx(
                    'inline-block',
                    'rounded-full'
                  )}
                  src={`/assets/images/token-icons/${getAddress(SOLID_ADDRESSES[chainId])}.png`}
                  placeholder='/assets/images/default.png'
                  error='/assets/images/default.png'
                  alt='SOLID' />
              </div>
              {!isDashboard &&
            <div
              className='text-base sm:text-lg text-textSecondary items-center flex flex-grow text-center'
              title={`$${formatAmount(parse18(pendingRewardUSD))}`}>(<div className='text-base -mt-0.5'>$</div>{formatAmount(parse18(pendingRewardUSD))})
            </div>
              }
              <div className='mt-4 space-x-4 md:space-x-4 flex flex-row justify-around'>
                <div className='flex-grow'></div>
                <InteractionButton
                  className='text-sm xs:text-base'
                  name='Claim SOLID'
                  onCall={onClaimReward}
                  state={claimRewardState} />
                <div className='flex-grow'></div>
              </div>
            </div>
          </div>
        </>}
      </div>
      {web3ChainId &&
      <>
        <BoostStakeInteractionModal
          show={showStakeModal}
          poolInfo={poolInfo}
          toggleShow={toggleStakeModal}
          hasPendingReward={poolInfo.pendingReward.gt(0)}
          title={`${poolInfo.symbol} BoostMaxx`} />
        <BoostUnstakeInteractionModal
          show={showUnstakeModal}
          poolInfo={poolInfo}
          hasPendingReward={poolInfo.pendingReward.gt(0)}
          toggleShow={toggleUnstakeModal} />
      </>
      }
    </>);
};

export default BoostMaxxPoolCard;