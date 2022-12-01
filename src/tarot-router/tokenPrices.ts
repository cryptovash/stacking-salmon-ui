/* eslint-disable no-invalid-this */

import TarotRouter, { MulticallTask } from '.';
import * as R from 'ramda';
import { addressEquals, ZERO_ADDRESS } from 'utils/address';
import { Contract } from '@ethersproject/contracts';
import UniswapV2FactoryJSON from '../abis/contracts/IUniswapV2Factory.json';
import BaseV1FactoryJSON from '../abis/contracts/solidly/BaseV1Factory.json';
import UniswapV2PairJSON from '../abis/contracts/IUniswapV2Pair.json';
import { BigNumber, BigNumberish } from 'ethers';
import { chunkify } from '../utils/chunkify';
import { LENDING_POOLS_LIST } from '../config/web3/contracts/lending-pools';
import { BOOSTMAXX_POOLS_LIST } from '../config/web3/contracts/boostmaxx-pools';
import { getLocalStorageItem, setLocalStorageItem } from '../utils/local-storage';
import { SUPPLY_VAULTS } from '../config/web3/contracts/supply-vault';
import { CHAIN_IDS } from '../config/web3/chains';
import { WETH_ADDRESSES } from '../config/web3/contracts/weth';

function _f(x0: BigNumber, y: BigNumber) : BigNumber {
  return x0.mul(y.pow(2).div(TEN_18).mul(y).div(TEN_18)).div(TEN_18).add(
    x0.pow(2).div(TEN_18).mul(x0).div(TEN_18).mul(y).div(TEN_18)
  );
}

function _d(x0: BigNumber, y: BigNumber) : BigNumber {
  return BigNumber.from(3).mul(x0).mul(y.pow(2).div(TEN_18)).div(TEN_18).add(x0.pow(2).div(TEN_18).mul(x0).div(TEN_18));
}

function _getY(x0: BigNumber, xy: BigNumber, y: BigNumber) : BigNumber {
  for (let i = 0; i < 255; i++) {
    const yPrev = y;
    const k = _f(x0, y);
    if (k.lt(xy)) {
      const dy = (xy.sub(k)).mul(TEN_18).div(_d(x0, y));
      y = y.add(dy);
    } else {
      const dy = (k.sub(xy)).mul(TEN_18).div(_d(x0, y));
      y = y.sub(dy);
    }
    if (y.gt(yPrev)) {
      if (y.sub(yPrev).lte(1)) {
        return y;
      }
    } else {
      if (yPrev.sub(y).lte(1)) {
        return y;
      }
    }
  }

  return y;
}

function _k(x: BigNumber, y: BigNumber, decimals0: BigNumberish, decimals1: BigNumberish, stable = false) : BigNumber {
  if (stable) {
    const _x = x.mul(TEN_18).div(decimals0);
    const _y = y.mul(TEN_18).div(decimals1);
    const _a = (_x.mul(_y)).div(TEN_18);
    const _b = _x.pow(2).div(TEN_18).add(_y.pow(2).div(TEN_18));
    return _a.mul(_b).div(TEN_18); // x3y+y3x >= k
  } else {
    return x.mul(y); // xy >= k
  }
}

const increasePriceProgress = (router: TarotRouter, maxPriceProgress: number) => {
  setTimeout(() => {
    if (router.priceProgress >= maxPriceProgress) {
      return;
    }
    // Your logic here
    router.updatePriceProgress(Math.min(router.priceProgress + 4, maxPriceProgress));
    increasePriceProgress(router, maxPriceProgress);
  }, 1000);
};

const ZERO = BigNumber.from(0);

const TEN_18 = BigNumber.from(10).pow(18);

const stablecoinList = {
  [CHAIN_IDS.FANTOM]: [
    '0x04068da6c83afcfa0e13ba15a6696662335d5b75' // USDC
  ],
  [CHAIN_IDS.OPTIMISM]: [
    '0x7F5c764cBc14f9669B88837ca1490cCa17c31607' // USDC
  ],
  [CHAIN_IDS.ARBITRUM]: [
    '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8' // USDC
  ],
  [CHAIN_IDS.ETHEREUM_MAIN_NET]: [
    '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48' // USDC
  ]
};

const bridgeTokensByChain = {
  [CHAIN_IDS.FANTOM]: {
    // wMEMO => MIM
    '0xddc0385169797937066bbd8ef409b5b3c0dfeb52': '0x82f0b8b456c1a451378467398982d4834b6829c1',
    // sspell => spell
    '0xbb29d2a58d880af8aa5859e30470134deaf84f2b': '0x468003b688943977e6130f4f68f23aad939a1040',
    // busd => fusdt
    '0xc931f61b1534eb21d8c11b24f3f5ab2471d4ab50': '0x049d68029688eabf473097a2fc38ef61633a3c7a',
    // mimatic => usdc
    '0xfb98b335551a418cd0737375a2ea0ded62ea213b': '0x04068da6c83afcfa0e13ba15a6696662335d5b75',
    // oxd => usdc
    '0xc165d941481e68696f43ee6e99bfb2b23e0e3114': '0x04068da6c83afcfa0e13ba15a6696662335d5b75',
    // frax => usdc
    '0xdc301622e621166bd8e82f2ca0a26c13ad0be355': '0x04068da6c83afcfa0e13ba15a6696662335d5b75',
    // xtarot => tarot
    '0x74d1d2a851e339b8cb953716445be7e8abdf92f4': '0xc5e2b037d30a390e62180970b3aa4e91868764cd',
    // xboo => boo
    '0xa48d959ae2e88f1daa7d5f611e01908106de7598': '0x841fad6eae12c286d1fd18d1d525dffa75c7effe',
    // fbeets => beets
    '0xfcef8a994209d6916eb2c86cdd2afd60aa6f54b1': '0xf24bcf4d1e507740041c9cfd2dddb29585adce1e',
    // binspirit => spirit
    '0x44e314190d9e4ce6d4c0903459204f8e21ff940a': '0x5cc61a78f164885776aa610fb0fe1257df78e59b',
    // weve => usdc
    '0x911da02c1232a3c3e1418b834a311921143b04d7': '0x04068da6c83afcfa0e13ba15a6696662335d5b75',
    // renbtc => btc
    '0xdbf31df14b66535af65aac99c32e9ea844e14501': '0x321162cd933e2be498cd2267a90534a804051b11',
    // solidsex => solid
    '0x41adac6c1ff52c5e27568f27998d747f7b69795b': '0x888ef71766ca594ded1f0fa3ae64ed2941740a20',
    // linspirit => spirit
    '0xc5713b6a0f26bf0fdc1c52b90cd184d950be515c': '0x5cc61a78f164885776aa610fb0fe1257df78e59b',
    // syn => usdc
    '0xe55e19fb4f2d85af758950957714292dac1e25b2': '0x04068da6c83afcfa0e13ba15a6696662335d5b75',
    // rainspirit => spirit
    '0xf9c6e3c123f0494a4447100bd7dbd536f43cc33a': '0x5cc61a78f164885776aa610fb0fe1257df78e59b',
    // fxs => frax
    '0x7d016eec9c25232b01f23ef992d98ca97fc2af5a': '0xdc301622e621166bd8e82f2ca0a26c13ad0be355',
    // sinspirit => spirit
    '0x749f2b95f950c4f175e17aa80aa029cc69a30f09': '0x5cc61a78f164885776aa610fb0fe1257df78e59b',
    // based => tomb
    '0x8d7d3409881b51466b483b11ea1b8a03cded89ae': '0x6c021ae822bea943b2e66552bde1d2696a53fbb7',
    // dei => usdc
    '0xde12c7959e1a72bbe8a5f7a1dc8f8eef9ab011b3': '0x04068da6c83afcfa0e13ba15a6696662335d5b75',
    // xscream => scream
    '0xe3d17c7e840ec140a7a51aca351a482231760824': '0xe0654c8e6fd4d733349ac7e09f6f23da256bf475',
    // woofy => yfi
    '0xd0660cd418a64a1d44e9214ad8e459324d8157f1': '0x29b0da86e484e1c0029b56e817912d778ac0ec69',
    // wpc => weve
    '0x0589073b62217f8196fa668a3fdf81df45726236': '0x911da02c1232a3c3e1418b834a311921143b04d7',
    // tinspirit => spirit
    '0x6caa3e5feba1f83ec1d80ea2eaca37c3421c33a8': '0x5cc61a78f164885776aa610fb0fe1257df78e59b',
    // sd => usdc
    '0x412a13c109ac30f0db80ad3bd1defd5d0a6c0ac6': '0x04068da6c83afcfa0e13ba15a6696662335d5b75',
    // lshare => usdc
    '0xcbe0ca46399af916784cadf5bcc3aed2052d6c45': '0x04068da6c83afcfa0e13ba15a6696662335d5b75',
    // tbond => tomb
    '0x24248cd1747348bdc971a5395f4b3cd7fee94ea0': '0x6c021ae822bea943b2e66552bde1d2696a53fbb7'
  },
  [CHAIN_IDS.OPTIMISM]: {
    // VELO => USDC
    '0x3c8b650257cfb5f272f799f5e2b4e65093a11a05': '0x7f5c764cbc14f9669b88837ca1490cca17c31607',
    // FRAX => USDC
    '0x2e3d870790dc77a83dd1d18184acc7439a53f475': '0x7f5c764cbc14f9669b88837ca1490cca17c31607',
    // LYRA => USDC
    '0x50c5725949a6f0c72e6c4a641f24049a917db0cb': '0x7f5c764cbc14f9669b88837ca1490cca17c31607',
    // THALES => USDC
    '0x217d47011b23bb961eb6d93ca9945b7501a5bb11': '0x7f5c764cbc14f9669b88837ca1490cca17c31607',
    // PERP => USDC
    '0x9e1028f5f1d5ede59748ffcee5532509976840e0': '0x7f5c764cbc14f9669b88837ca1490cca17c31607',
    // DAI => USDC
    '0xda10009cbd5d07dd0cecc66161fc93d7c9000da1': '0x7f5c764cbc14f9669b88837ca1490cca17c31607',
    // FXS => FRAX
    '0x67ccea5bb16181e7b4109c9c2143c24a1c2205be': '0x2e3d870790dc77a83dd1d18184acc7439a53f475',
    // L2DAO => OP
    '0xd52f94df742a6f4b4c8b033369fe13a41782bf44': '0x4200000000000000000000000000000000000042',
    // agEUR => USDC
    '0x9485aca5bbbe1667ad97c7fe7c4531a624c8b1ed': '0x7f5c764cbc14f9669b88837ca1490cca17c31607',
    // HND => USDC
    '0x10010078a54396f62c96df8532dc2b4847d47ed3': '0x7f5c764cbc14f9669b88837ca1490cca17c31607',
    // sUSD => USDC
    '0x8c6f28f2f1a3c87f0f938b96d27520d9751ec8d9': '0x7f5c764cbc14f9669b88837ca1490cca17c31607',
    // BTC => USDC
    '0x68f180fcce6836688e9084f035309e29bf0a2095': '0x7f5c764cbc14f9669b88837ca1490cca17c31607',
    // TAROT => USDC
    '0x375488f097176507e39b9653b88fdc52cde736bf': '0x7f5c764cbc14f9669b88837ca1490cca17c31607',
    // BIFI => OP
    '0x4e720dd3ac5cfe1e1fbde4935f386bb1c66f4642': '0x4200000000000000000000000000000000000042',
    // SONNE => USDC
    '0x1db2466d9f5e10d7090e7152b68d62703a2245f0': '0x7f5c764cbc14f9669b88837ca1490cca17c31607',
    // OATH => USDC
    '0x39fde572a18448f8139b7788099f0a0740f51205': '0x7f5c764cbc14f9669b88837ca1490cca17c31607',
    // MAI => USDC
    '0xdfa46478f9e5ea86d57387849598dbfb2e964b02': '0x7f5c764cbc14f9669b88837ca1490cca17c31607'
  },
  [CHAIN_IDS.ARBITRUM]: {
    // XCAL => USDC
    '0xd2568accd10a4c98e87c44e9920360031ad89fcb': '0xff970a61a04b1ca14834a43f5de4533ebddb5cc8',
    // DAI => USDC
    '0xda10009cbd5d07dd0cecc66161fc93d7c9000da1': '0xff970a61a04b1ca14834a43f5de4533ebddb5cc8'
  }
};

interface UniswapV2Dex {
  name: string;
  factory: Contract;
}

const uniswapV2DexList: {[chainId: number]: UniswapV2Dex[]} = {
  [CHAIN_IDS.FANTOM]: [
    {
      name: 'SpookySwap',
      factory: new Contract('0x152eE697f2E276fA89E96742e9bB9aB1F2E61bE3', UniswapV2FactoryJSON)
    },
    {
      name: 'SpiritSwap',
      factory: new Contract('0xEF45d134b73241eDa7703fa787148D9C9F4950b0', UniswapV2FactoryJSON)
    },
    /*
    {
      name: 'SushiSwap',
      factory: new Contract('0xc35DADB65012eC5796536bD9864eD8773aBc74C4', UniswapV2FactoryJSON)
    },
    {
      name: 'ProtoFi',
      factory: new Contract('0x39720E5Fe53BEEeb9De4759cb91d8E7d42c17b76', UniswapV2FactoryJSON)
    },
    */
    {
      name: 'vAMM',
      factory: new Contract('0x3fAaB499b519fdC5819e3D7ed0C26111904cbc28', BaseV1FactoryJSON)
    },
    {
      name: 'sAMM',
      factory: new Contract('0x3fAaB499b519fdC5819e3D7ed0C26111904cbc28', BaseV1FactoryJSON)
    }
  ],
  [CHAIN_IDS.OPTIMISM]: [
    {
      name: 'ZipSwap',
      factory: new Contract('0x8BCeDD62DD46F1A76F8A1633d4f5B76e0CDa521E', UniswapV2FactoryJSON)
    },
    {
      name: 'vAMM',
      factory: new Contract('0x25CbdDb98b35ab1FF77413456B31EC81A6B6B746', BaseV1FactoryJSON)
    },
    {
      name: 'sAMM',
      factory: new Contract('0x25CbdDb98b35ab1FF77413456B31EC81A6B6B746', BaseV1FactoryJSON)
    }
  ],
  [CHAIN_IDS.ARBITRUM]: [
    {
      name: 'vAMM',
      factory: new Contract('0xD158bd9E8b6efd3ca76830B66715Aa2b7Bad2218', BaseV1FactoryJSON)
    },
    {
      name: 'sAMM',
      factory: new Contract('0xD158bd9E8b6efd3ca76830B66715Aa2b7Bad2218', BaseV1FactoryJSON)
    }
  ],
  [CHAIN_IDS.ETHEREUM_MAIN_NET]: [
    {
      name: 'UniswapV2',
      factory: new Contract('0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f', UniswapV2FactoryJSON)
    }
  ]
};

interface UniswapV2PairReserves {
  token0: string;
  token1: string;
  pairId: string;
  symbol: string;
  reserve0: BigNumber;
  reserve1: BigNumber;
}
export interface TokenPrice {
  value: BigNumber;
  path: UniswapV2PairReserves[];
}

export type TokenPair = [string, string];

export interface Token {
  address: string;
  decimals: number;
}

export interface TokenPriceEntry {
  address: string;
  decimals: number;
  priceUSD: TokenPrice;
  priceETH: TokenPrice;
}

export interface TokenPriceMap {
  [key: string]: TokenPriceEntry;
}

export const tokenPair = (token0: string, token1: string): TokenPair => {
  token0 = token0.toLowerCase();
  token1 = token1.toLowerCase();
  if (token0 < token1) {
    return [token0, token1];
  }
  return [token1, token0];
};

export async function initializeTokenList(this: TarotRouter) : Promise<Token[]> {
  const lendingPools = LENDING_POOLS_LIST.filter(x => this.chainId === (x.chainId || CHAIN_IDS.FANTOM));
  const tokens: Token[] = [];
  lendingPools.forEach(pool => {
    tokens.push(
      ...[0, 1].map(i => {
        type PoolKey = keyof typeof pool;
        return {
          address: (pool[`tokenAddress${i}` as PoolKey] as string).toLowerCase(),
          decimals: pool[`decimals${i}` as PoolKey] as number
        };
      })
    );
  });
  Object.values(SUPPLY_VAULTS[this.chainId] || {}).forEach(supplyVault => {
    tokens.push({
      address: supplyVault.underlyingAddress.toLowerCase(),
      decimals: supplyVault.underlyingDecimals.toNumber()
    });
  });
  BOOSTMAXX_POOLS_LIST.filter(x => this.chainId === (x.chainId || CHAIN_IDS.FANTOM)).forEach(pool => {
    tokens.push({
      address: pool.token0.toLowerCase(),
      decimals: pool.decimals0
    });
    tokens.push({
      address: pool.token1.toLowerCase(),
      decimals: pool.decimals1
    });
  });
  tokens.push({
    address: WETH_ADDRESSES[this.chainId].toLowerCase(),
    decimals: 18
  });
  tokens.push({
    address: stablecoinList[this.chainId][0].toLowerCase(),
    decimals: 6
  });
  // Custom tokens
  // SD
  tokens.push({
    address: '0x412a13c109ac30f0db80ad3bd1defd5d0a6c0ac6',
    decimals: 18
  });
  // TAROT (on Optimism)
  tokens.push({
    address: '0x375488f097176507e39b9653b88fdc52cde736bf',
    decimals: 18
  });
  return R.uniq(tokens);
}

export async function getTokenList(this: TarotRouter) : Promise<Token[]> {
  if (!this.tokenListCache) {
    this.tokenListCache = this.intiializeTokenList();
  }
  return this.tokenListCache;
}

export async function initializeTokenPairIds(this: TarotRouter) : Promise<{
  token0: string;
  token1: string;
  pairIds: string[];
}[]> {
  const allTokens = await this.getTokenList();
  const tokenPairs = allTokens
    .filter(token => !addressEquals(token, WETH_ADDRESSES[this.chainId]))
    .map(token => {
      const tokenId = token.address.toLowerCase();
      if (stablecoinList[this.chainId].some(stableToken => addressEquals(token, stableToken))) {
        // Stables are paired with WETH
        return tokenPair(tokenId, WETH_ADDRESSES[this.chainId]);
      }
      const bridgeTokens = this.chainId && bridgeTokensByChain[this.chainId] ? bridgeTokensByChain[this.chainId] : {};
      if (bridgeTokens && bridgeTokens[tokenId as keyof typeof bridgeTokens]) {
        return tokenPair(tokenId, bridgeTokens[tokenId as keyof typeof bridgeTokens]);
      }
      return tokenPair(tokenId, WETH_ADDRESSES[this.chainId]);
    });

  increasePriceProgress(this, 75);

  const pairIdsForTokenPairs = tokenPairs.map(tokenPair => ({
    token0: tokenPair[0],
    token1: tokenPair[1],
    pairIds: [] as string[]
  }));
  const pairIdsChunkedResults = await this.doMulticallParallel(tokenPairs.flatMap(pair => {
    return uniswapV2DexList[this.chainId].map(dex => ([
      dex.factory, 'getPair', dex.name === 'vAMM' ? [...pair, false] : dex.name === 'sAMM' ? [...pair, true] : pair
    ] as MulticallTask));
  }), 64);
  const pairIds = chunkify(pairIdsChunkedResults, uniswapV2DexList[this.chainId].length);
  pairIds.forEach((possiblePairs, i) => {
    possiblePairs.forEach(pairId => {
      if (!addressEquals(pairId, ZERO_ADDRESS)) {
        pairIdsForTokenPairs[i].pairIds.push(pairId.toLowerCase());
      }
    });
    this.updatePriceProgress(30 + Math.floor(45 * i / pairIds.length));
  });

  const toKey = (token0: string, token1: string) => JSON.stringify([token0.toLowerCase(), token1.toLowerCase()]);
  const pairIdsByTokens = R.fromPairs(pairIdsForTokenPairs.map(item =>
    R.pair(toKey(item.token0, item.token1), item)
  ));
  const filteredLendingPools = LENDING_POOLS_LIST.filter(x => this.chainId === (x.chainId || CHAIN_IDS.FANTOM));
  let i = 0;
  for (const lendingPool of filteredLendingPools) {
    const token0 = lendingPool.tokenAddress0.toLowerCase();
    const token1 = lendingPool.tokenAddress1.toLowerCase();
    const key = toKey(token0, token1);
    const item = pairIdsByTokens[key];
    if (!item) {
      pairIdsByTokens[key] = {
        token0,
        token1,
        pairIds: []
      };
      pairIdsForTokenPairs.push(pairIdsByTokens[key]);
    }
    const { pairIds } = pairIdsByTokens[key];
    const pairId = lendingPool.uniswapV2PairAddress.toLowerCase();
    if (!pairIds.includes(pairId)) {
      pairIds.push(pairId);
    }
    this.updatePriceProgress(75 + Math.floor(5 * i / filteredLendingPools.length));
    i++;
  }

  return pairIdsForTokenPairs;
}

export async function getTokenPairIds(this: TarotRouter) : Promise<{
  token0: string;
  token1: string;
  pairIds: string[];
}[]> {
  if (!this.tokenPairIdCache) {
    this.tokenPairIdCache = this.initializeTokenPairIds();
  }
  return this.tokenPairIdCache;
}

export async function initializeTokenPrices(this: TarotRouter) : Promise<TokenPriceMap> {
  if (this.tokenPriceMapTask) {
    return this.tokenPriceMapTask;
  }
  let tpmInStorage = false;
  const tpmFromStorage = getLocalStorageItem(`tpm-${this.chainId}`);
  if (tpmFromStorage) {
    for (const key of Object.keys(tpmFromStorage)) {
      tpmFromStorage[key].priceUSD.value = BigNumber.from(tpmFromStorage[key].priceUSD.value);
      tpmFromStorage[key].priceETH.value = BigNumber.from(tpmFromStorage[key].priceETH.value);
    }
    tpmInStorage = true;
  }
  if (tpmInStorage) {
    this.updatePriceProgress(100);
    this.tokenPriceMap = tpmFromStorage;
    return tpmFromStorage;
  }

  this.updatePriceProgress(0);

  const allTokens: Token[] = await this.getTokenList();
  this.updatePriceProgress(10);
  const tokensById = allTokens.reduce((prev, curr) => {
    prev[curr.address as keyof typeof prev] = curr; return prev;
  }, {} as {[key: string]: Token});
  const getToken = (tokenId: string) => {
    if (!tokenId) {
      throw new Error('tokenId is empty');
    }
    tokenId = tokenId.toLowerCase();
    const token = tokensById[tokenId as keyof typeof tokensById];
    if (!token) {
      throw new Error('Missing token: ' + tokenId);
    }
    return token;
  };
  this.updatePriceProgress(23);
  const pairIdsForTokenPairs = await this.getTokenPairIds();

  const allPairIds = pairIdsForTokenPairs.flatMap(item => item.pairIds);
  const allPairIdsAndTokens = pairIdsForTokenPairs.flatMap(item =>
    item.pairIds.map(pairId => ({
      pairId,
      token0: item.token0,
      token1: item.token1
    }))
  );

  this.updatePriceProgress(91);

  increasePriceProgress(this, 98);
  const results = await this.doMulticallParallel(allPairIds.flatMap(pairId => {
    const pair = new Contract(pairId, UniswapV2PairJSON, this.readLibrary);
    return [
      [pair, 'symbol', []],
      [pair, 'getReserves', []],
      [pair, 'totalSupply', []]
    ];
  }), 72);

  this.updatePriceProgress(99);

  const allPairReservesAndSymbols = chunkify(results, 3).map(([symbol, reserves, totalSupply]) => ({
    symbol,
    reserves,
    totalSupply
  }));
  const pairsById = R.fromPairs(allPairIds.map((pairId, i) => R.pair(pairId, {
    ...allPairIdsAndTokens[i],
    ...allPairReservesAndSymbols[i]
  })));

  let index = 0;
  const bestPairs: UniswapV2PairReserves[] = pairIdsForTokenPairs.map(item => {
    const reservesAndSymbols = item.pairIds.map(pairId => {
      const ret = {
        pairId,
        symbol: allPairReservesAndSymbols[index].symbol,
        reserve0: allPairReservesAndSymbols[index].reserves[0],
        reserve1: allPairReservesAndSymbols[index].reserves[1]
      };
      index++;
      return ret;
    });
    if (reservesAndSymbols.length === 0) {
      return {
        pairId: ZERO_ADDRESS,
        symbol: '',
        token0: item.token0,
        token1: item.token1,
        reserve0: ZERO,
        reserve1: ZERO,
        k: ZERO
      };
    }

    const sortedReservesAndSymbols = reservesAndSymbols.map(({ pairId, symbol, reserve0, reserve1 }) => ({
      pairId,
      symbol,
      reserve0,
      reserve1,
      sortK: reserve0.mul(reserve1)
    })).sort((a, b) => a.sortK.gt(b.sortK) ? -1 : 1);
    const { pairId, symbol, reserve0, reserve1 } = sortedReservesAndSymbols[0];

    return {
      pairId,
      symbol,
      token0: item.token0,
      token1: item.token1,
      reserve0,
      reserve1
    };
  });

  const toKey = (item: { token0: string, token1: string }) => {
    const token0 = item.token0.toLowerCase();
    const token1 = item.token1.toLowerCase();
    if (token0 < token1) {
      return JSON.stringify([token0, token1]);
    }
    return JSON.stringify([token1, token0]);
  };

  const bestPairsById = R.fromPairs(bestPairs.map(item => [toKey(item), item]));
  const getBestPair = (item: { token0: string, token1: string }) => bestPairsById[toKey(item)];

  const getTokenPriceAsRatio = (tokenIn: Token, tokenOut: Token): TokenPrice => {
    if (addressEquals(tokenIn, tokenOut)) {
      return {
        value: TEN_18,
        path: []
      };
    }
    const best = getBestPair({
      token0: tokenIn.address,
      token1: tokenOut.address
    });
    if (!best || !best.pairId || best.reserve0.isZero() || best.reserve1.isZero()) {
      return {
        value: ZERO,
        path: [{
          symbol: '',
          token0: tokenIn.address,
          token1: tokenOut.address,
          pairId: ZERO_ADDRESS,
          reserve0: ZERO,
          reserve1: ZERO
        }]
      };
    }
    const { symbol, reserve0, reserve1 } = best;

    let ratio: BigNumber;

    const scaleIn = BigNumber.from(10).pow(tokenIn.decimals);
    const scaleOut = BigNumber.from(10).pow(tokenOut.decimals);
    if (symbol.startsWith('sAMM')) {
      const reserveIn = tokenIn.address < tokenOut.address ? reserve0 : reserve1;
      const reserveOut = tokenIn.address < tokenOut.address ? reserve1 : reserve0;
      const xy = _k(reserveIn, reserveOut, scaleIn, scaleOut, true);

      const reserveA = reserveIn.mul(TEN_18).div(scaleIn);
      const reserveB = reserveOut.mul(TEN_18).div(scaleOut);

      let amountIn = reserveIn.div(100);
      amountIn = amountIn.mul(TEN_18).div(scaleIn);

      const y = reserveB.sub(_getY(reserveA.add(amountIn), xy, reserveB));
      ratio = y.mul(TEN_18).div(amountIn);
    } else {
      const reserveA = tokenIn.address < tokenOut.address ? reserve0 : reserve1;
      const reserveB = tokenIn.address < tokenOut.address ? reserve1 : reserve0;
      ratio = TEN_18.mul(reserveB).div(reserveA).mul(scaleIn).div(scaleOut);
    }
    return {
      value: ratio,
      path: [best]
    };
  };
  const wethToken = getToken(WETH_ADDRESSES[this.chainId]);
  const stablecoinToken = getToken(stablecoinList[this.chainId][0]);
  const usdPerWeth = getTokenPriceAsRatio(wethToken, stablecoinToken);

  // Get price of token in WETH where 10^18 = 1 WETH
  const getTokenPriceInWETH = (token: string | Token): TokenPrice => {
    if (typeof (token) === 'string') {
      token = getToken(token);
    }
    if (!token) {
      throw new Error('Invalid token');
    }
    if (addressEquals(token, WETH_ADDRESSES[this.chainId])) {
      return {
        value: TEN_18,
        path: []
      };
    }
    const bridgeTokens = this.chainId && bridgeTokensByChain[this.chainId] ? bridgeTokensByChain[this.chainId] : {};
    if (bridgeTokens && bridgeTokens[token.address.toLowerCase() as keyof typeof bridgeTokens]) {
      const bridgeId = bridgeTokens[token.address.toLowerCase() as keyof typeof bridgeTokens];
      const bridge = getToken(bridgeId);
      const bridgePriceWETH = getTokenPriceInWETH(bridgeId);
      const bridgeRatio = getTokenPriceAsRatio(token, bridge);
      return {
        value: bridgePriceWETH.value.mul(bridgeRatio.value).div(TEN_18),
        path: [...bridgeRatio.path, ...bridgePriceWETH.path]
      };
    }
    return getTokenPriceAsRatio(token, wethToken);
  };

  // Get price of token in USD where 10^18 = $1
  const getTokenPriceInUSD = (token: string | Token): TokenPrice => {
    if (typeof (token) === 'string') {
      token = getToken(token);
    }
    if (!token) {
      throw new Error('Invalid token');
    }
    if (addressEquals(token, stablecoinToken)) {
      return {
        value: TEN_18,
        path: []
      };
    }
    if (addressEquals(token, WETH_ADDRESSES[this.chainId])) {
      return getTokenPriceAsRatio(token, stablecoinToken);
    }
    const bridgeTokens = this.chainId && bridgeTokensByChain[this.chainId] ? bridgeTokensByChain[this.chainId] : {};
    if (bridgeTokens && bridgeTokens[token.address.toLowerCase() as keyof typeof bridgeTokens]) {
      const bridgeId = bridgeTokens[token.address.toLowerCase() as keyof typeof bridgeTokens];
      const bridge = getToken(bridgeId);
      const bridgePriceUSD = getTokenPriceInUSD(bridgeId);
      const bridgeRatio = getTokenPriceAsRatio(token, bridge);
      return {
        value: bridgePriceUSD.value.mul(bridgeRatio.value).div(TEN_18),
        path: [...bridgeRatio.path, ...bridgePriceUSD.path]
      };
    }
    const wethPerToken = getTokenPriceInWETH(token);
    return {
      value: usdPerWeth.value.mul(wethPerToken.value).div(TEN_18),
      path: [...wethPerToken.path, ...usdPerWeth.path]
    };
  };
  const ret : TokenPriceMap = {};
  allTokens.forEach(token => {
    ret[token.address] = {
      ...token,
      priceUSD: getTokenPriceInUSD(token),
      priceETH: getTokenPriceInWETH(token)
    };
  });

  const valueOf = (tokenId: string, amount: BigNumberish, type: 'USD' | 'ETH' = 'USD') => {
    amount = BigNumber.from(amount);
    if (amount.isZero()) {
      return ZERO;
    }
    const tokenPrice = ret[tokenId];
    if (!tokenPrice) {
      return ZERO;
    }
    const price = type === 'USD' ? tokenPrice.priceUSD : tokenPrice.priceETH;
    const scale = BigNumber.from(10).pow(tokenPrice.decimals);
    return amount.mul(price.value).div(scale);
  };

  const lpValueOf = (
    opts: {
      symbol: string;
      token0: string;
      token1: string;
      reserves: [BigNumberish, BigNumberish];
      totalSupply: BigNumberish;
    },
    amount: BigNumberish,
    type: 'USD' | 'ETH' = 'USD') => {
    const { token0, token1, reserves } = opts;
    let { totalSupply } = opts;
    amount = BigNumber.from(amount);
    totalSupply = BigNumber.from(totalSupply);
    if (totalSupply.isZero() || amount.isZero()) {
      return ZERO;
    }
    const valueOfReserve0 = valueOf(token0, reserves[0], type);
    const valueOfReserve1 = valueOf(token1, reserves[1], type);
    return amount.mul(valueOfReserve0.add(valueOfReserve1)).div(totalSupply);
  };

  for (const lpAddress of allPairIds) {
    const pair = pairsById[lpAddress.toLowerCase()];
    ret[lpAddress] = {
      address: lpAddress,
      decimals: 18,
      priceETH: {
        path: [],
        value: lpValueOf(pair, TEN_18, 'ETH')
      },
      priceUSD: {
        path: [],
        value: lpValueOf(pair, TEN_18, 'USD')
      }
    };
  }

  // Cache for future

  setTimeout(() => {
    this.updatePriceProgress(100);
  }, 1000);
  this.tokenPriceMap = ret;

  setLocalStorageItem(`tpm-${this.chainId}`, ret, 60 * 5);
  return ret;
}

export async function getTokenPrices(this: TarotRouter) : Promise<TokenPriceMap> {
  if (this.tokenPriceMap) {
    return Promise.resolve(this.tokenPriceMap);
  }
  if (!this.tokenPriceMapTask) {
    this.tokenPriceMapTask = this.initializeTokenPrices();
  }
  return this.tokenPriceMapTask;
}
