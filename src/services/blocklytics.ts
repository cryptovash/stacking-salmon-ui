// Rename to deal with apollo codegen
import { default as gqlBlocklytics } from 'graphql-tag';

import apolloFetcher from './apollo-fetcher';
import {
  BLOCKLYTICS_SUBGRAPH_URL
} from '../config/web3/subgraph';

export async function getBlockByTimestamp(chainId: number, timestamp: number): Promise<number> {
  const query = gqlBlocklytics`query GetBlockByTimestamp ($timestamp_min: BigInt!, $timestamp_max: BigInt!) {
      blocks (
        first: 1,
        orderBy: timestamp,
        orderDirection: desc,
        where: {
          timestamp_gt: $timestamp_min,
          timestamp_lt: $timestamp_max
        }
      ) {
        number
      }
    }`;
  const result = await apolloFetcher(BLOCKLYTICS_SUBGRAPH_URL[chainId], query, {
    timestamp_min: timestamp,
    timestamp_max: timestamp + 600
  });

  return Number(result.data.blocks[0].number);
}

export async function getTwoBlockByTimestamps(chainId: number, timestampOne: number, timestampTwo: number): Promise<[number, number]> {
  const query = gqlBlocklytics`query GetBlockByTimestamp (
          $timestamp_minOne: BigInt!,
          $timestamp_maxOne: BigInt!,
          $timestamp_minTwo: BigInt!,
          $timestamp_maxTwo: BigInt!
      ) {
      blockOne: blocks (
        first: 1,
        orderBy: timestamp,
        orderDirection: desc,
        where: {
          timestamp_gt: $timestamp_minOne,
          timestamp_lt: $timestamp_maxOne
        }
      ) {
        number
      }

      blockTwo: blocks (
        first: 1,
        orderBy: timestamp,
        orderDirection: desc,
        where: {
          timestamp_gt: $timestamp_minTwo,
          timestamp_lt: $timestamp_maxTwo
        }
      ) {
        number
      }
    }`;
  const result = await apolloFetcher(BLOCKLYTICS_SUBGRAPH_URL[chainId], query, {
    timestamp_minOne: timestampOne,
    timestamp_maxOne: timestampOne + 600,
    timestamp_minTwo: timestampTwo,
    timestamp_maxTwo: timestampTwo + 600
  });

  const blockOne = Number(result.data.blockOne[0].number);
  const blockTwo = Number(result.data.blockTwo[0].number);

  return [blockOne, blockTwo];
}