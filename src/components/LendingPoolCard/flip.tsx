import clsx from 'clsx';
import { faArrowLeft, faCopy, faCheck, faSun } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import ReactCardFlip from '../../components/CardFlip';
import GridWrapper from '../../components/GridWrapper';
import { MouseEventHandler, useState } from 'react';
import { Badge } from 'react-bootstrap';
import { LENDING_POOL_DETAILS_MAP } from '../../config/web3/contracts/lending-pools';
import { PoolDisplayDetails, TEN_18 } from '../../types/interfaces';
import LendingPool from '../../pages/Home/LendingPools/LendingPool';
import { getVaultDetails, VaultDetails } from '../../config/web3/contracts/vault-details';
import { DEX, DexDetails, getDexById } from '../../config/web3/dexs';
import shortenAddress from '../../utils/helpers/web3/shorten-address';
import { BigNumber } from 'ethers';
import { parse18 } from '../../utils/big-amount';
import TarotImage from '../../components/UI/TarotImage';
import { TAROT_ADDRESSES } from '../../config/web3/contracts/tarot';
import { getAddress } from 'ethers/lib/utils';
import { FACTORY_DETAILS_MAP } from '../../config/web3/contracts/tarot-factories';
import { CHAIN_IDS } from '../../config/web3/chains';
import React from 'react';

interface Props {
  lendingPool: PoolDisplayDetails;
  greaterThanMd: boolean;
  flipped: boolean;
  setFlipped(id: string, flipped: boolean): void;
}

interface CopyableProps {
  val: string;
  rawVal: string;
}

const Copyable = ({
  val,
  rawVal
}: CopyableProps): JSX.Element => {
  const [copied, setCopied] = useState(false);

  const handleClick: MouseEventHandler = e => {
    e.preventDefault();

    navigator.clipboard.writeText(rawVal);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 1000);
  };

  return (
    <div
      title={copied ? 'Copied' : 'Copy to clipboard'}
      className='hover:text-textSecondary cursor-default flex space-x-2 items-center'
      onClick={handleClick}><div>{`${val}`}</div><FontAwesomeIcon
        className='max-w-1 w-1 opacity-70'
        fixedWidth
        icon={copied ? faCheck : faCopy} />
    </div>
  );
};

const FlipCard = ({
  lendingPool,
  greaterThanMd,
  flipped,
  setFlipped
}: Props): JSX.Element => {
  const pool = LENDING_POOL_DETAILS_MAP[lendingPool.id];
  const tarotFactory = FACTORY_DETAILS_MAP[pool.tarotFactoryAddress];
  const vaultDetails = getVaultDetails(lendingPool.id);
  const maxBorrowAPR = BigNumber.from(tarotFactory.kinkBorrowRateMax).mul(tarotFactory.kinkMultiplier);
  const maxSupplyAPR = maxBorrowAPR.mul(90).div(100);
  const totalShares = 2000;
  const dexDetails = {
    ...getDexById(pool.chainId || CHAIN_IDS.FANTOM, pool.dex),
    ...vaultDetails
  } as DexDetails & VaultDetails;
  const isDexTypeSolidly = [DEX.SOLIDLY, DEX.SPIRIT_V2, DEX.VELODROME, DEX.XCAL].includes(pool.dex);
  const minHeight = 761;

  const handleFlipClick: MouseEventHandler = e => {
    e.preventDefault();
    setFlipped(pool.lendingPoolAddress, !flipped);
  };
  const sizedLendingPool =

    <div>
      <div className={`${flipped ? 'opacity-0 w-full' : ''} duration-1000 transition-opacity absolute l-0 t-0 z-10 p-4 pt-6 -mt-0.5`}>
        <GridWrapper>
          <div className='col-span-4 flex justify-start'>
            <Badge
              onClick={handleFlipClick}
              className=' text-textSecondary hover:text-textPrimary opacity-70 p-0 rounded-2xl border border-tarotBlackHaze-200 bg-tarotBlackHaze-800 shadow-lg'>
              <div className='flex flex-row flex-nowrap items-center'>
                <FontAwesomeIcon
                  icon={faSun}
                  className='inline-block m-2'
                  style={{
                    width: 14,
                    height: 14
                  }} />
              </div>
            </Badge>
          </div>
        </GridWrapper>
      </div>
      <LendingPool
        lendingPool={lendingPool}
        greaterThanMd={greaterThanMd} />
    </div>;
  return (
    <>
      <ReactCardFlip
        isFlipped={flipped}
        containerStyle={{
          minHeight: minHeight
        }}>
        {sizedLendingPool}
        <div
          className={clsx(
            'p-4',
            'overflow-hidden',
            'bg-tarotBlackHaze-400',
            'rounded-xl',
            'border',
            'border-tarotBlackHaze-700',
            'transition-all',
            'duration-350',
            'h-full',
            'absolute',
            'inset-0',
            'z-tarotAppBar')}
          style={{
            minHeight: minHeight,
            backgroundColor: dexDetails.cardColor || undefined
          }}>
          <div className='overflow-hidden'>
            <GridWrapper>
              <div className='col-span-4 flex items-start justify-center xl:justify-start xl:items-center flex-col xl:flex-row'>
                <Badge
                  onClick={handleFlipClick}
                  className='mt-1.5 text-textSecondary hover:text-textPrimary p-0 rounded-2xl border border-tarotBlackHaze-200 bg-tarotBlackHaze-800 shadow-lg'>
                  <div className='opacity-80 flex flex-row flex-nowrap items-center'>
                    <FontAwesomeIcon
                      icon={faArrowLeft}
                      className='inline-block m-2'
                      style={{
                        width: 14,
                        height: 14
                      }} />
                  </div>
                </Badge>
                <div className='flex flex-grow justify-end self-center mt-4 xl:mt-0 xl:self-end font-semibold'>
                  <div className='flex flex-col items-center xl:items-end xl:mt-2 xl:-mb-2'>
                    <div className='text-sm'>Tarot {tarotFactory.label || 'Classic'}</div>
                    <div>{dexDetails.vaultName || dexDetails.dexName} {pool.symbol0}/{pool.symbol1}</div>
                  </div>
                </div>
              </div>
            </GridWrapper>
            <div className='flex mt-2'></div>
            <div className='flex flex-col p-0 pt-4 text-xs space-y-1.5'>
              <div className='mt-4 text-base'>Parameters</div>
              <div
                className='flex justify-items-center space-x-2'>
                <div>Max Borrow APR</div>
                <div className='border-b border-dotted opacity-20 flex-grow'></div>
                <div>{`${maxBorrowAPR}`}%</div>
              </div>
              <div
                className='flex justify-items-center space-x-2'>
                <div>Max Supply APR</div>
                <div className='border-b border-dotted opacity-20 flex-grow'></div>
                <div>{`${maxSupplyAPR}`}%</div>
              </div>
              <div
                className='flex justify-items-center space-x-2'>
                <div>Adjust Speed</div>
                <div className='border-b border-dotted opacity-20 flex-grow'></div>
                <div>{`${Math.round(parse18(BigNumber.from(100).mul(pool.adjustSpeed0).mul(24 * 60 * 60).mul(100))) / 100}`}%</div>
              </div>
              {pool.stable ?
                <>
                  <div
                    className='flex justify-items-center space-x-2'>
                    <div>Safety Margin</div>
                    <div className='border-b border-dotted opacity-20 flex-grow'></div>
                    <div>{`${Math.round(parse18(BigNumber.from(pool.stableSafetyMargin).mul(100)))}`}%</div>
                  </div>
                  <div
                    className='flex justify-items-center space-x-2'>
                    <div>Kink Utilization Rates</div>
                    <div className='border-b border-dotted opacity-20 flex-grow'></div>
                    <div>{`${parse18(BigNumber.from(100).mul(pool.kinkUtilizationRateLower0 || '0'))}`}%/{`${parse18(BigNumber.from(100).mul(pool.kinkUtilizationRateUpper0 || '0'))}`}%</div>
                  </div>
                </> :
                <>
                  <div
                    className='flex justify-items-center space-x-2'>
                    <div>Safety Margin</div>
                    <div className='border-b border-dotted opacity-20 flex-grow'></div>
                    <div>{`${Math.round(parse18(BigNumber.from(pool.safetyMarginSqrt).pow(2).div(TEN_18).mul(100)))}`}%</div>
                  </div>
                  <div
                    className='flex justify-items-center space-x-2'>
                    <div>Kink Utilization Rate</div>
                    <div className='border-b border-dotted opacity-20 flex-grow'></div>
                    <div>{`${parse18(BigNumber.from(100).mul(pool.kinkUtilizationRate0))}`}%</div>
                  </div>
                </>
              }
              <div
                className='flex justify-items-center space-x-2'>
                <div>Liquidation Penalty</div>
                <div className='border-b border-dotted opacity-20 flex-grow'></div>
                <div>{`${parse18(BigNumber.from(pool.liquidationIncentive).sub(TEN_18).add(pool.liquidationFee ? pool.liquidationFee : 0).mul(100))}`}%</div>
              </div>
              {lendingPool.reinvestFee && lendingPool.reinvestFee > 0 &&
              <div
                className='flex justify-items-center space-x-2'>
                <div>Reinvest Fee</div>
                <div className='border-b border-dotted opacity-20 flex-grow'></div>
                <div>{`${lendingPool.reinvestFee * 100}`}%</div>
              </div>
              }
              {BigNumber.from(pool.shares0).gt(0) &&
              <div
                className='flex justify-items-center space-x-2'>
                <div>Farming Shares</div>
                <div className='border-b border-dotted opacity-20 flex-grow'></div>
                <div>{pool.shares0}/{totalShares}</div>
              </div>
              }
            </div>
            <div className='flex flex-col p-0 pt-4 text-xs space-y-1.5'>
              <div className='mt-4 text-base'>Addresses</div>
              {Object.keys(pool || {}).filter(x => (pool[x as keyof typeof pool] !== '0x0000000000000000000000000000000000000000') && (x.endsWith('Address') || x.slice(0, x.length - 1).endsWith('Address'))).map(x => {
                let label = x.slice(0, x.lastIndexOf('Address')).concat(' ' + x.slice(x.lastIndexOf('Address') + 'Address'.length, x.length)).trim();
                label = label.charAt(0).toUpperCase() + label.slice(1);
                if (label.endsWith('0') || label.endsWith('1')) {
                  label = pool[`symbol${label[label.length - 1]}` as keyof typeof pool] + ' ' + label.slice(0, -1).trim();
                }
                if (label === 'UniswapV2Pair' && isDexTypeSolidly) {
                  label = pool.stable ? 'sAMM Pair' : 'vAMM Pair';
                }
                const rawVal = `${pool[x as keyof typeof pool]}`;
                const val = shortenAddress(rawVal);
                return (
                  <div
                    key={x}
                    className='flex justify-items-center space-x-2'>
                    <div>{`${label}`}</div>
                    <div className='border-b border-dotted opacity-20 flex-grow'></div>
                    <Copyable
                      val={val}
                      rawVal={rawVal} />
                  </div>
                );
              })}
            </div>
            <div className='pointer-events-none absolute inset-0 inset-y-16 flex flex-col justify-end items-center transform-gpu opacity-20 filter contrast-50 mix-blend-soft-light'>
              <div className='combined z-10 mb-2'>
                <TarotImage
                  width={64}
                  height={64}
                  // TODO: could componentize
                  className={clsx(
                    'absolute',
                    'opacity-50',
                    flipped ? 'animate-ping-slow-once' : '',
                    'inline-block',
                    'rounded-full'
                  )}
                  src={`/assets/images/token-icons/${getAddress(TAROT_ADDRESSES[250])}.png`}
                  placeholder='/assets/images/default.png'
                  error='/assets/images/default.png'
                  alt='TAROT' />
                <TarotImage
                  width={64}
                  height={64}
                  // TODO: could componentize
                  className={clsx(
                    'inline-block',
                    'rounded-full'
                  )}
                  src={`/assets/images/token-icons/${getAddress(TAROT_ADDRESSES[250])}.png`}
                  placeholder='/assets/images/default.png'
                  error='/assets/images/default.png'
                  alt='TAROT' />
              </div>
            </div>
          </div>
        </div>
      </ReactCardFlip>
    </>
  );
};

export default FlipCard;