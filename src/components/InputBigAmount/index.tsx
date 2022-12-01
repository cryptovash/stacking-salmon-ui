import { useState, useEffect } from 'react';
import { InputGroup } from 'react-bootstrap';
import NumericalInput from './NumericalInput';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import './index.scss';
import tailwindConfig from 'tailwind.config';
import { useDebounce } from 'react-use';
import { BigNumber } from '@ethersproject/bignumber';
import { formatUnits, parseUnits } from '@ethersproject/units';
import { formatFloat } from 'utils/format';

interface InputBigAmountProps {
  val: string;
  setVal(input: string): void;
  suffix: string;
  availableSuffix: string;
  availableTitle: string;
  available: BigNumber;
  max: BigNumber;
  min?: BigNumber;
  decimals: BigNumber;
}

export default function InputBigAmount({ val, setVal, suffix, availableSuffix, availableTitle, available, max, min, decimals }: InputBigAmountProps): JSX.Element {
  const xSetVal = (input: string) => {
    try {
      parseUnits(input, decimals);
      setVal(input);
    } catch (e) {
      setVal('0');
    }
  };
  const [stringVal, setStringVal] = useState<string>(val);
  const onUserInput = (input: string) => setStringVal(input);
  const onMax = () => setStringVal(max.eq(0) ? '0' : formatUnits(max, decimals));
  const minVal = min ? min : BigNumber.from(0);
  useEffect(() => {
    if (val === stringVal) return; // avoid infinite loop
    try {
      xSetVal(stringVal);
    } catch (e) {
      console.log(e);
    }
  }, [stringVal]);
  useDebounce(() => {
    if (stringVal === val) return; // avoid infinite loop
    setStringVal(val);
  }, 30, [val]);

  return (
    <>
      <div className='flex flex-col space-y-2 -mx-1'>
        <InputGroup className='justify-end pr-1'>
          {availableTitle}: {formatFloat(parseFloat(formatUnits(available, decimals)))}{`\u00A0`}{availableSuffix}
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
      <div className='my-4 px-1'>
        <Slider
          activeDotStyle={{
            border: 'solid 2px #fff',
            boxShadow: '0 0 5px white'
          }}
          handleStyle={{
            borderColor: tailwindConfig.theme.extend.colors.tarotBlackHaze[50],
            backgroundColor: tailwindConfig.theme.extend.colors.tarotBlackHaze[100]
          }}
          railStyle={{
            borderColor: tailwindConfig.theme.extend.colors.tarotBlackHaze[500],
            backgroundColor: tailwindConfig.theme.extend.colors.tarotBlackHaze[700]
          }}
          trackStyle={{
            borderColor: tailwindConfig.theme.extend.colors.tarotBlackHaze[50],
            backgroundColor: tailwindConfig.theme.extend.colors.tarotBlackHaze[100]
          }}
          value={(() => {
            try {
              return Math.round((parseUnits(val, decimals).sub(minVal)).mul(100).div(max.sub(minVal)).toNumber());
            } catch (e) {
              return minVal.toNumber();
            }
          })()}
          step={1}
          min={0}
          max={100}
          onChange={value => xSetVal(formatUnits(BigNumber.from(value).mul(max.sub(minVal)).div(100).add(minVal), decimals))} />
      </div>
    </>
  );
}