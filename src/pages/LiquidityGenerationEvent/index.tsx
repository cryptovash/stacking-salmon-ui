
import clsx from 'clsx';
import { useWeb3React } from '@web3-react/core';
import { Web3Provider } from '@ethersproject/providers';
import {
  useAvailableETH,
  useLGEPeriod,
  useLiquidityGenBonusDistributorShares,
  useLiquidityGenBonusDistributorTotalShares,
  useLiquidityGenDistributorShares,
  useLiquidityGenDistributorTotalShares,
  useWethPrice
} from '../../hooks/useData';
import { useState, useEffect } from 'react';
import { InputGroup } from 'react-bootstrap';
import NumericalInput from '../../components/InputAmount/NumericalInput';
import { formatAmount, formatAmountShort, formatFloat } from '../../utils/format';
import InteractionButton from '../../components/InteractionButton';
import useLiquidityGeneratorDeposit from '../../hooks/useLiquidityGeneratorDeposit';
import { formatUnits, parseUnits } from 'ethers/lib/utils';
import { ReactComponent as SpinIcon } from '../../assets/images/icons/spin.svg';
import { LAYOUT } from '../../utils/constants/styles';
import { AlertOctagon, AlertTriangle } from 'react-feather';
import tailwindConfig from '../../tailwind.config';
import QuestionHelper from '../../components/QuestionHelper';
import TarotImage from '../../components/UI/TarotImage';
import { ReactComponent as TarotLogoRays } from '../../assets/images/icons/tarotlogorays.inline.svg';
import { ReactComponent as TarotLogoFace } from '../../assets/images/icons/tarotlogoface.inline.svg';
import { LIQUIDITY_GENERATOR_ADDRESSES } from '../../config/web3/contracts/liquidity-generator';
import React from 'react';

interface InputAmountProps {
  val: number;
  setVal(input: number): void;
  suffix: string;
  maxSuffix: string;
  maxTitle: string;
  max: number;
  min?: number;
}
interface OutputAmountProps {
  val: number;
  setVal(input: number): void;
  suffix: string;
}

function InputAmount({ val, setVal, suffix, maxSuffix, maxTitle, max }: InputAmountProps): JSX.Element {
  const [stringVal, setStringVal] = useState<string>(val.toString());
  const onUserInput = (input: string) => setStringVal(input);
  const onMax = () => setStringVal(formatFloat(Math.max(0, max - .1)).toString());
  useEffect(() => {
    const newVal = stringVal ? parseFloat(stringVal) : 0;
    if (val === newVal) return; // avoid infinite loop
    setVal(newVal);
  }, [stringVal]);
  useEffect(() => {
    const newStringVal = formatFloat(val);
    if (stringVal === newStringVal) return; // avoid infinite loop
    setStringVal(newStringVal);
  }, [val]);

  return (
    <>
      <div className='flex flex-col space-y-2 -mx-1'>
        <InputGroup className='justify-end pr-1'>
          {maxTitle}: {formatAmountShort(max)} {maxSuffix}
        </InputGroup>
        <InputGroup className='py-2 flex-nowrap mb-3 bg-tarotBlackHaze-800 border rounded-lg border-tarotBlackHaze-100'>
          <InputGroup.Prepend className=''>
            <button
              className='bg-tarotJade-200 hover:bg-tarotJade-500 focus:outline-none border-none focus:ring-transparent focus:border-transparent self-center text-sm px-3 py-1.5 ml-3 mr-3 rounded'
              onClick={onMax}>MAX
            </button>
          </InputGroup.Prepend>
          <div className='flex flex-grow items-end'>
            <NumericalInput
              className='flex-grow w-0 text-right overflow-visible bg-tarotBlackHaze-800 focus:outline-none border-none focus:ring-transparent focus:border-transparent'
              value={stringVal}
              onUserInput={input => {
                onUserInput(input);
              }} />
          </div>
          <InputGroup.Append className='text-textSecondary self-center pr-3'>
            <span>{suffix}</span>
          </InputGroup.Append>
        </InputGroup>
      </div>
    </>
  );
}

function OutputAmount({ val, setVal, suffix }: OutputAmountProps): JSX.Element {
  const [stringVal, setStringVal] = useState<string>(val.toString());
  const onUserInput = () => {
    // Do nothing
  };
  useEffect(() => {
    const newVal = stringVal ? parseFloat(stringVal) : 0;
    if (val === newVal) return; // avoid infinite loop
    setVal(newVal);
  }, [stringVal]);
  useEffect(() => {
    const newStringVal = formatFloat(val);
    if (stringVal === newStringVal) return; // avoid infinite loop
    setStringVal(newStringVal);
  }, [val]);

  return (
    <>
      <div className='flex flex-col space-y-2 -mx-1'>
        <InputGroup className='py-2 flex-nowrap mb-3 bg-tarotBlackHaze-800 border rounded-lg border-tarotBlackHaze-100'>
          <div className='flex flex-grow items-end'>
            <NumericalInput
              disabled={true}
              className='flex-grow w-0 text-right overflow-visible bg-tarotBlackHaze-800 focus:outline-none border-none focus:ring-transparent focus:border-transparent'
              value={stringVal}
              onUserInput={() => {
                onUserInput();
              }} />
          </div>
          <InputGroup.Append className='text-textSecondary self-center pr-3'>
            <span>{suffix}</span>
          </InputGroup.Append>
        </InputGroup>
      </div>
    </>
  );
}

const LiquidityGenerationEventContent = (): JSX.Element | null => {
  const { chainId } = useWeb3React<Web3Provider>();
  const [val, setVal] = useState<number>(0);
  const [outputVal, setOutputVal] = useState<number>(0);

  const liqGenParticipantsAmount = 2950000;
  const liqGenBonusAmount = 250000;
  const liqGenLiquidityAmount = 2500000;
  const minDeposit = 10;

  function getEstimatedTarotQuantity(totalShares: number, totalBonusShares: number, accountShares: number, accountBonusShares: number) {
    return (liqGenParticipantsAmount * accountShares / totalShares) + (liqGenBonusAmount * accountBonusShares / totalBonusShares);
  }

  function getPriceEstimate(totalDeposits: number) {
    return totalDeposits / liqGenLiquidityAmount;
  }

  const { begin: periodBegin, end: periodEnd, bonusEnd } = useLGEPeriod();

  const calculateStarted = () => {
    return new Date().getTime() / 1000 >= periodBegin;
  };

  const calculateTimeLeft = () => {
    if (calculateStarted()) {
      return Math.max(0, periodEnd - Math.floor(new Date().getTime() / 1000));
    } else {
      return Math.max(0, periodBegin - Math.floor(new Date().getTime() / 1000));
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
    const seconds = n;
    return (
      <>
        <span>{padDHMS(days)}</span>
        <span className='text-2xl'>D:</span>
        <span>{padDHMS(hours)}</span>
        <span className='text-2xl'>H:</span>
        <span>{padDHMS(minutes)}</span>
        <span className='text-2xl'>M:</span>
        <span>{padDHMS(seconds)}</span>
        <span className='text-2xl'>S</span>
      </>);
  };

  function trimStringDecimals(x: string, decimals: number) {
    const xParts = x.split('.');
    if (xParts.length === 1) {
      return x;
    }
    return `${xParts[0]}.${xParts[1].slice(0, decimals)}`;
  }

  function parseDecimalUnits(x: number, decimals: number) {
    if (isNaN(x) || x <= 0) {
      return parseUnits(trimStringDecimals(`0`, decimals), decimals);
    }
    return parseUnits(trimStringDecimals(`${x}`, decimals), decimals);
  }
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());
  const [started, setStarted] = useState(calculateStarted());
  const contractAvailableBalance = useAvailableETH(timeLeft % 5 === 0 ? 0 : 1);
  const contractTotalShares = useLiquidityGenDistributorTotalShares(timeLeft % 5 === 0 ? 0 : 1);
  const contractTotalBonusShares = useLiquidityGenBonusDistributorTotalShares(timeLeft % 5 === 0 ? 0 : 1);
  const contractAccountShares = useLiquidityGenDistributorShares(timeLeft % 5 === 0 ? 0 : 1);
  const contractAccountBonusShares = useLiquidityGenBonusDistributorShares(timeLeft % 5 === 0 ? 0 : 1);
  const [contractAmounts, setContractAmounts] = useState<any>({
    availableBalance: contractAvailableBalance,
    totalShares: contractTotalShares,
    totalBonusShares: contractTotalBonusShares,
    accountShares: contractAccountShares,
    accountBonusShares: contractAccountBonusShares });

  useEffect(() => {
    if (contractAvailableBalance !== contractAmounts.availableBalance ||
      !contractTotalShares.eq(contractAmounts.totalShares) ||
      !contractTotalBonusShares.eq(contractAmounts.totalBonusShares) ||
      !contractAccountShares.eq(contractAmounts.accountShares) ||
      !contractAccountBonusShares.eq(contractAmounts.accountBonusShares)) {
      setContractAmounts({
        availableBalance: contractAvailableBalance,
        totalShares: contractTotalShares,
        totalBonusShares: contractTotalBonusShares,
        accountShares: contractAccountShares,
        accountBonusShares: contractAccountBonusShares
      });
    }
  }, [timeLeft, contractAvailableBalance, contractTotalShares, contractTotalBonusShares, contractAccountShares, contractAccountBonusShares]);

  const [amounts, setAmounts] = useState<any>(contractAmounts);
  const wethPrice = useWethPrice();

  useEffect(() => {
    setAmounts({
      availableBalance: contractAmounts.availableBalance,
      totalShares: contractAmounts.totalShares,
      totalBonusShares: contractAmounts.totalBonusShares,
      accountShares: contractAmounts.accountShares,
      accountBonusShares: contractAmounts.accountBonusShares
    });
  }, [contractAmounts]);

  useEffect(() => {
    if (val === 0 || !val) {
      setOutputVal(0);
    }
    const isBonus = Math.floor(Date.now() / 1000) < bonusEnd;
    setOutputVal(getEstimatedTarotQuantity(
      parseFloat(formatUnits(amounts.totalShares, 18)) + val,
      parseFloat(formatUnits(amounts.totalBonusShares, 18)) + (isBonus ? val : 0),
      val,
      (isBonus ? val : 0)));
  }, [val]);

  const amount = parseDecimalUnits(val, 18);
  const invalidInput = !started || val > (amounts.availableBalance - .1) || timeLeft <= 0 || val <= 0;

  const [depositState, deposit] = useLiquidityGeneratorDeposit(amount, invalidInput);
  const onDeposit = async () => {
    const isBonus = Math.floor(Date.now() / 1000) < bonusEnd;
    const response = await deposit();
    if (response.success) {
      setAmounts((curr: any) => {
        return {
          availableBalance: curr.availableBalance - val - (parseFloat(formatUnits(response.gasUsed.mul(response.gasPrice), 18))),
          totalShares: curr.totalShares.add(parseDecimalUnits(val, 18)),
          totalBonusShares: curr.totalBonusShares.add(parseDecimalUnits(isBonus ? val : 0, 18)),
          accountShares: curr.accountShares.add(parseDecimalUnits(val, 18)),
          accountBonusShares: curr.accountBonusShares.add(parseDecimalUnits(isBonus ? val : 0, 18))
        };
      });
    }
    setVal(0);
  };
  useEffect(() => {
    const timer = setTimeout(() => {
      setStarted(calculateStarted());
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    return () => clearTimeout(timer);
  });

  if (!chainId) {
    throw new Error('Invalid chain ID!');
  }
  if ((periodBegin === 0 || periodEnd === 0) || (timeLeft === 0 && periodEnd > Math.floor((Date.now() / 1000)))) {
    return (
      <div
        className='z-tarotAppBar bg-tarotBlackHaze fixed left-0 min-w-full flex justify-center items-center'
        style={{ top: `${LAYOUT.appBarHeight}px`, height: `calc(100% - ${LAYOUT.appBarHeight}px)` }}>
        <SpinIcon
          className={clsx(
            'animate-spin',
            'w-8',
            'h-8',
            'text-tarotJade-200',
            'filter',
            'brightness-150'
          )} />
      </div>);
  }
  return (
    <div className='mt-6 space-y-3 md:mx-4 mb-12'>
      <h2 className='text-3xl font-semibold text-center'>Tarot Liquidity Generation</h2>
      <div className='!mb-8 text-center'>
        {!started && <div className='text-base font-semibold text-textSecondary uppercase'>Starts in</div>}
        {started && timeLeft > 0 && <div className='text-base font-semibold text-textSecondary uppercase'>Time remaining</div>}
        {timeLeft > 0 && <span className='font-semibold text-3xl text-textSecondary'>{formatSecondsAsDHMS(timeLeft)}</span>}
        {started && Math.floor(Date.now() / 1000) < bonusEnd &&
          <div>
            <span className='absolute text-tarotJade-50'>Bonus Active</span>
            <span className='text-textSecondary animate-pulse'>Bonus Active</span>
            <QuestionHelper text={`Deposits during the first 24 hours will receive an additional claim of the ${formatAmount(liqGenBonusAmount)}\u00A0TAROT bonus distribution.`} />
          </div>
        }
      </div>
      <div
        className={clsx(
          'flex',
          'flex-col',
          'md:flex-row',
          'space-y-8',
          'space-x-0',
          'md:space-x-8',
          'md:space-y-0',
          'justify-around')}>
        <div className='flex flex-col p-2 space-y-4 mb-0 xs:mb-0 xs:max-w-xs lg:max-w-xl'>
          <div className='text-center flex flex-row justify-around space-x-4'>
            <div className='flex-grow'></div>
            <a
              href='https://docs.tarot.to/tokenomics/tokenomics#liquidity-generation-event'
              className={clsx(
                'text-tarotJade-50',
                'hover:text-textSecondary',
                'hover:underline'
              )}
              target='_blank'
              rel='noopener noreferrer'>
              <span>Details
              </span>
            </a>
            <span className='text-textSecondary'>&bull;</span>
            <a
              href={`https://ftmscan.com/address/${LIQUIDITY_GENERATOR_ADDRESSES[chainId]}`}
              className={clsx(
                'text-tarotJade-50',
                'hover:text-textSecondary',
                'hover:underline'
              )}
              target='_blank'
              rel='noopener noreferrer'>
              <span>Contract
              </span>
            </a>
            <div className='flex-grow'></div>
          </div>
          {timeLeft > 0 && <div className='text-center'>Deposit FTM to receive a claim of the initial {formatAmount(liqGenParticipantsAmount)}{`\u00A0`}TAROT{`\u00A0`}distribution.</div>}
          {(started && timeLeft === 0) && <div className='text-center'>The event has ended.</div>}
          <div className='!mb-8 text-center'>The entire balance of deposited FTM, along with {formatAmount(liqGenLiquidityAmount)}{`\u00A0`}TAROT, will be added to Spooky and Spirit as locked liquidity for the FTM&#8209;TAROT pair.</div>
          <div className='flex flex-col justify-around !mt-0 !mb-4'>
            <div className='flex flex-col items-center'>
              <div
                title={`${formatAmount(parseFloat(formatUnits(amounts.totalShares, 18)))}`}
                className='text-2xl sm:text-3xl text-textPrimary'>{started ? formatAmountShort(parseFloat(formatUnits(amounts.totalShares, 18))) : '???'}<span className='text-lg'>{`\u00A0`}FTM</span>
              </div>
              <div className='text-base text-textSecondary'>Total Deposits</div>
            </div>
          </div>
          <div className='flex justify-around'>
            <div className='flex flex-col items-center'>
              <TarotImage
                className='mb-2'
                width={36}
                src='/assets/images/dex/spooky.png' />
              <div className='text-base text-textPrimary'>Spooky</div>
              <div
                title={started ? `${formatAmount(.69 * parseFloat(formatUnits(amounts.totalShares, 18)))}` : '???'}
                className='text-xl text-textPrimary'>{started ? formatAmountShort(.69 * parseFloat(formatUnits(amounts.totalShares, 18))) : '???'}<span className='text-sm'>{`\u00A0`}FTM</span>
              </div>
              <div className='-my-2.5'>+</div>
              <div
                title={`${formatAmount(liqGenLiquidityAmount * .69)}`}
                className='text-xl text-textPrimary'>{formatAmountShort(liqGenLiquidityAmount * .69)}<span className='text-sm'>{`\u00A0`}TAROT</span>
              </div>
            </div>
            <div className='-ml-24 -mr-24 max-w-full w-24 flex items-start'>
              <div className='nav-logo w-12 h-12 absolute ml-6 mt-6'>
                <div className='combined z-10'>
                  <div>
                    <TarotLogoRays
                      className='absolute' />
                    <TarotLogoRays
                      className='opacity-30 animate-ping-slow' />
                  </div>
                  <TarotLogoFace />
                </div>
              </div>
              <div className='flex-grow opacity-25'>
                <svg
                  viewBox='0 0 256 256'
                  fill='none'
                  xmlns='http://www.w3.org/2000/svg'>
                  <circle
                    cx='128'
                    cy='128'
                    r='128'
                    fill='#8C8CE3' />
                  <path
                    d='M256 128C256 107.12 250.892 86.5577 241.122 68.105C231.352 49.6523 217.216 33.8698 199.947 22.1337C182.678 10.3976 162.8 3.06421 142.046 0.772998C121.292 -1.51822 100.293 1.3023 80.8801 8.98861L128 128H256Z'
                    fill='#6DD784' />
                  <circle
                    cx='128'
                    cy='128'
                    r='64'
                    fill='#002626' />
                </svg>

              </div>
            </div>
            <div className='flex flex-col items-center'>
              <TarotImage
                className='mb-2'
                width={36}
                src='/assets/images/dex/spirit.png' />
              <div className='text-base text-textPrimary'>Spirit</div>
              <div
                title={started ? `${formatAmount(.31 * parseFloat(formatUnits(amounts.totalShares, 18)))}` : '???'}
                className='text-xl text-textPrimary'>{started ? formatAmountShort(.31 * parseFloat(formatUnits(amounts.totalShares, 18))) : '???'}<span className='text-sm'>{`\u00A0`}FTM</span>
              </div>
              <div className='-my-2.5'>+</div>
              <div
                title={`${formatAmount(liqGenLiquidityAmount * .31)}`}
                className='text-xl text-textPrimary'>{formatAmountShort(liqGenLiquidityAmount * .31)}<span className='text-sm'>{`\u00A0`}TAROT</span>
              </div>
            </div>
          </div>
          {started && timeLeft > 0 &&
                <div className='flex flex-col justify-around !mt-8 !mb-0'>
                  <div className='flex flex-col items-center'>
                    <div
                      title={`${formatAmount(wethPrice * getPriceEstimate(parseFloat(formatUnits(amounts.totalShares, 18))))}`}
                      className='text-2xl sm:text-3xl text-textPrimary flex items-start'><div className='text-xl -mt-0.5'>$</div>{formatAmount(wethPrice * getPriceEstimate(parseFloat(formatUnits(amounts.totalShares, 18))))}<span className='self-center text-xs'>{`\u00A0`}/{`\u00A0`}</span><span className='self-end text-lg'>TAROT</span>
                    </div>
                    <div className='text-base text-textSecondary'>Estimated Price<QuestionHelper text='Estimated initial price of TAROT after liquidity generation' /></div>
                  </div>
                </div>
          }
        </div>
        {started && timeLeft > 0 &&
              <div className=''>
                <div className='bg-tarotBlackHaze-800 border border-tarotBlackHaze-300 rounded-lg p-4 flex flex-col space-y-2'>
                  <div className='flex flex-row justify-between items-center'>
                    <h3 className='text-xl font-semibold mb-0'>Deposit FTM<span className='text-sm font-thin'> (min{`\u00A0`}{minDeposit}{`\u00A0`}FTM)</span></h3>
                  </div>
                  <InputAmount
                    val={val}
                    setVal={setVal}
                    suffix='FTM&nbsp;&nbsp;'
                    maxSuffix={` FTM`}
                    maxTitle='Available'
                    max={amounts.availableBalance} />
                  <div className='text-textSecondary text-sm !mt-3'>Estimated TAROT Claim<QuestionHelper text='Estimated claim including bonus, if applicable' /></div>
                  <OutputAmount
                    val={outputVal}
                    setVal={setOutputVal}
                    suffix='TAROT' />
                  <div className='flex flex-row bg-tarotJade-900 border items-center border-tarotJade-400 rounded-lg p-4 space-x-4 !my-3 -mx-1'>
                    <div>
                      <AlertTriangle
                        color={tailwindConfig.theme.extend.colors.tarotJade['800']}
                        fill={tailwindConfig.theme.extend.colors.tarotJade['200']} />
                    </div>
                    <div className='text-sm text-textSecondary'>The final TAROT amount will be determined at the end of the liquidity generation event.</div>
                  </div>
                  <div className='flex flex-col justify-around !my-4 lg:!my-6 lg:flex-row'>
                    <div className='flex flex-col items-center lg:items-start mb-6 lg:mb-0'>
                      <div
                        title={`${formatAmount(parseFloat(formatUnits(amounts.accountShares, 18)))}`}
                        className='text-2xl xl:text-3xl text-textPrimary'>{formatAmountShort(parseFloat(formatUnits(amounts.accountShares, 18)))}<span className='text-lg'>{`\u00A0`}FTM</span>
                      </div>
                      <div className='text-base text-textSecondary'>Your Deposit</div>
                    </div>
                    <div className='flex flex-col items-center lg:items-end'>
                      <div
                        title={`${formatAmount(getEstimatedTarotQuantity(
                          parseFloat(formatUnits(amounts.totalShares, 18)),
                          parseFloat(formatUnits(amounts.totalBonusShares, 18)),
                          parseFloat(formatUnits(amounts.accountShares, 18)),
                          parseFloat(formatUnits(amounts.accountBonusShares, 18))))}`}
                        className='text-2xl xl:text-3xl text-textPrimary'>{formatAmountShort(getEstimatedTarotQuantity(
                          parseFloat(formatUnits(amounts.totalShares, 18)),
                          parseFloat(formatUnits(amounts.totalBonusShares, 18)),
                          parseFloat(formatUnits(amounts.accountShares, 18)),
                          parseFloat(formatUnits(amounts.accountBonusShares, 18)))
                        )}<span className='text-lg'>{`\u00A0`}TAROT</span>
                      </div>
                      <div className='text-base text-textSecondary'>Claim Estimate<QuestionHelper text='Estimated claim including bonus, if applicable' /></div>
                    </div>
                  </div>
                  <div className='flex flex-row bg-tarotBlackHaze border items-center border-tarotBlackHaze-400 rounded-lg p-4 space-x-4 !my-3 -mx-1'>
                    <div>
                      <AlertOctagon
                        color={tailwindConfig.theme.extend.colors.tarotBlackHaze['800']}
                        fill={tailwindConfig.theme.extend.colors.tarotBlackHaze['200']} />
                    </div>
                    <div className='text-sm text-textSecondary'>By depositing, you confirm that you are not a resident of the US or any OFAC sanctioned country or territory.</div>
                  </div>
                  <InteractionButton
                    className='text-xl'
                    name='Deposit'
                    onCall={onDeposit}
                    state={depositState} />
                </div>
              </div>
        }
      </div>
    </div>
  );
};

const LiquidityGenerationEvent = (): JSX.Element | null => {
  return <LiquidityGenerationEventContent />;
};

export default LiquidityGenerationEvent;
