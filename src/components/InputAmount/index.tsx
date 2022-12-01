import { useState, useEffect } from 'react';
import { InputGroup } from 'react-bootstrap';
import NumericalInput from './NumericalInput';
import { formatFloat } from '../../utils/format';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import './index.scss';
import tailwindConfig from '../../../src/tailwind.config';
import { useDebounce } from 'react-use';
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

interface InputAmountMiniProps {
  val: number;
  setVal(input: number): void;
  suffix: string;
}

export function InputAmountMini({ val, setVal, suffix }: InputAmountMiniProps): JSX.Element {
  const [stringVal, setStringVal] = useState<string>(val.toString());
  const onUserInput = (input: string) => setStringVal(input);
  // TODO: <
  // const onMax = () => setStringVal(formatFloat(max).toString());
  // const step = max ? Math.pow(10, Math.floor(Math.log10(max)) - 2) : 0;
  // min = min ? min : 0;
  // TODO: >
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
    <div className='flex justify-end'>
      <InputGroup className='flex w-20 h-8 text-sm py-0 flex-nowrap mb-3 bg-tarotBlackHaze-800 border rounded-sm border-tarotBlackHaze-100'>
        <div className='flex flex-grow items-center mt-0 mr-0'>
          <NumericalInput
            className='flex-grow w-0 -mr-2 text-right overflow-visible focus:outline-none border-none focus:ring-transparent focus:border-transparent bg-transparent'
            value={stringVal}
            onUserInput={input => {
              onUserInput(input);
            }} />
        </div>
        <InputGroup.Append className='flex items-center pr-2 pl-0'>
          <span>{suffix}</span>
        </InputGroup.Append>
      </InputGroup>
    </div>
  );
}

export default function InputAmount({ val, setVal, suffix, maxSuffix, maxTitle, max, min }: InputAmountProps): JSX.Element {
  const [stringVal, setStringVal] = useState<string>(val.toString());
  const onUserInput = (input: string) => setStringVal(input);
  const onMax = () => setStringVal(formatFloat(max).toString());
  // const step = max ? Math.pow(10, Math.floor(Math.log10(max)) - 2) : 0;
  const minVal = min ? min : 0;
  useEffect(() => {
    const newVal = stringVal ? parseFloat(stringVal) : 0;
    if (val === newVal) return; // avoid infinite loop
    setVal(newVal);
  }, [setVal, stringVal, val]);
  useDebounce(() => {
    const newStringVal = formatFloat(val);
    if (stringVal === newStringVal) return; // avoid infinite loop
    setStringVal(newStringVal);
  }, 30, [val]);

  return (
    <>
      <div className='flex flex-col space-y-2 -mx-1'>
        <InputGroup className='justify-end pr-1'>
          {maxTitle}: {formatFloat(max)}{maxSuffix}
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
          value={Math.round((val - minVal) / (max - minVal) * 100)}
          step={1}
          min={0}
          max={100}
          onChange={value => setVal((value / 100) * (max - minVal) + minVal)} />
      </div>
    </>
  );
}