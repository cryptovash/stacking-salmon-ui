import { Fragment, FunctionFragment, JsonFragment } from '@ethersproject/abi';
import { utils } from 'ethers';

function toFragment(abi: JsonFragment[] | string[] | Fragment[]): Fragment[] {
  return abi.map((item: JsonFragment | string | Fragment) => utils.Fragment.from(item));
}

function makeCallFunction(contract: MulticallContract, name: string) {
  return (...params: any[]) => {
    const { address } = contract;
    const func = contract.functions.find(f => f.name === name);
    if (!func) {
      throw new Error('Could not find function: ' + name);
    }
    const { inputs, outputs } = func;
    return {
      contract: {
        address
      },
      name,
      inputs,
      outputs,
      params
    };
  };
}

function defineReadOnly(object: any, name: string, value: unknown) {
  Object.defineProperty(object, name, {
    enumerable: true,
    value,
    writable: false
  });
}

export class MulticallContract {
  private _address: string;
  private _abi: Fragment[];
  private _functions: FunctionFragment[];

  get address() {
    return this._address;
  }

  get abi() {
    return this._abi;
  }

  get functions() {
    return this._functions;
  }

  constructor(address: string, abi: JsonFragment[] | string[] | Fragment[]) {
    this._address = address;

    this._abi = toFragment(abi);

    this._functions = this._abi.filter(x => x.type === 'function').map(x => FunctionFragment.from(x));
    // const callFunctions = this._functions.filter(x => x.stateMutability === 'pure' || x.stateMutability === 'view');

    for (const callFunction of this._functions) {
      const { name } = callFunction;
      // const { name, stateMutability } = callFunction;
      // if (stateMutability === 'pure' || stateMutability === 'view') {
      const getCall = makeCallFunction(this, name);
      if (!this[name]) {
        defineReadOnly(this, name, getCall);
      }
    }
  }

  [method: string]: any;
}