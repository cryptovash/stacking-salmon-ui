// TODO: <
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
// TODO: >

import useAccount from './useAccount';
import { useState } from 'react';
import { Address, BigAmount, PoolTokenType, ZERO_BIG_AMOUNT } from '../types/interfaces';
import usePairAddress from './usePairAddress';
import { useRouterCallback } from './useTarotRouter';

export function useBorrowPositions() : Address[] {
  const account = useAccount();
  const [data, setData] = useState<Address[]>();
  useRouterCallback(async router => account && setData((await (await router.getUserPositions(account)).collateralPositions)));
  return data;
}

export function useSupplyPositions() : Address[] {
  const account = useAccount();
  const [data, setData] = useState<Address[]>();
  useRouterCallback(async router => account && setData((await (await router.getUserPositions(account)).supplyPositions)));
  return data;
}

export function useCollateralValue() : number {
  const account = useAccount();
  const uniswapV2PairAddress = usePairAddress();
  const [data, setData] = useState<number>();
  useRouterCallback(async router => account && setData(await router.getDepositedUSD(uniswapV2PairAddress, PoolTokenType.Collateral, account)));
  return data;
}

export function useBorrowedValue(poolTokenType: PoolTokenType) : number {
  const account = useAccount();
  const uniswapV2PairAddress = usePairAddress();
  const [data, setData] = useState<number>();
  useRouterCallback(async router => account && setData(await router.getBorrowedUSD(uniswapV2PairAddress, poolTokenType, account)));
  return data;
}

export function useBorrowerEquityValue() : number {
  const account = useAccount();
  const uniswapV2PairAddress = usePairAddress();
  const [data, setData] = useState<number>();
  useRouterCallback(async router => account && setData(await router.getLPEquityUSD(uniswapV2PairAddress, account)));
  return data;
}

export function useSuppliedAmount(poolTokenType: PoolTokenType) : BigAmount {
  const account = useAccount();
  const uniswapV2PairAddress = usePairAddress();
  const [data, setData] = useState<BigAmount>(ZERO_BIG_AMOUNT);
  useRouterCallback(async router => account && setData(await router.getDeposited(uniswapV2PairAddress, poolTokenType, account)));
  return data;
}

export function useSuppliedValue(poolTokenType: PoolTokenType) : number {
  const account = useAccount();
  const uniswapV2PairAddress = usePairAddress();
  const [data, setData] = useState<number>();
  useRouterCallback(async router => account && setData(await router.getDepositedUSD(uniswapV2PairAddress, poolTokenType, account)));
  return data;
}

export function useAccountTotalValueLocked() : number {
  const account = useAccount();
  const [data, setData] = useState<number>();
  useRouterCallback(async router => account && setData(await router.getAccountTotalValueLocked(account)));
  return data;
}

export function useAccountTotalValueSupplied() : number {
  const account = useAccount();
  const [data, setData] = useState<number>();
  useRouterCallback(async router => account && setData(await router.getAccountTotalValueSupplied(account)));
  return data;
}

export function useAccountTotalValueBorrowed() : number {
  const account = useAccount();
  const [data, setData] = useState<number>();
  useRouterCallback(async router => account && setData(await router.getAccountTotalValueBorrowed(account)));
  return data;
}