/* eslint-disable no-invalid-this */
// TODO: <
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
// TODO: >

import { Address } from '../types/interfaces';
import Subgraph from '.';

export async function getBorrowPositions(this: Subgraph, account: Address) : Promise<Address[]> {
  const userData = await this.getUserData(account);
  if (!userData) return [];
  return Object.keys(userData.collateralPositions);
}

export async function getSupplyPositions(this: Subgraph, account: Address) : Promise<Address[]> {
  const userData = await this.getUserData(account);
  if (!userData) return [];
  return Object.keys(userData.supplyPositions);
}