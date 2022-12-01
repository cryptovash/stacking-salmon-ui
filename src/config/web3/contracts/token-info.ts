import { CHAIN_IDS } from '../../../config/web3/chains';

const TOKEN_INFO: {
  [chainId: number]: {
    [tokenToBridge: string]: {symbol: string}
  }
} = {
  [CHAIN_IDS.FANTOM]: {
    '0xfb98b335551a418cd0737375a2ea0ded62ea213b': {
      // miMATIC -> MAI
      symbol: 'MAI'
    },
    '0xc165d941481e68696f43ee6e99bfb2b23e0e3114': {
      // OXD -> OXDv1
      symbol: 'OXDv1'
    }
  },
  [CHAIN_IDS.OPTIMISM]: {
    '0x4200000000000000000000000000000000000006': {
      // WETH -> ETH
      symbol: 'ETH'
    },
    '0x68f180fcce6836688e9084f035309e29bf0a2095': {
      // WBTC -> BTC
      symbol: 'BTC'
    }
  },
  [CHAIN_IDS.ARBITRUM]: {
    '0x82af49447d8a07e3bd95bd0d56f35241523fbab1': {
      // WETH -> ETH
      symbol: 'ETH'
    },
    '0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f': {
      // WBTC -> BTC
      symbol: 'BTC'
    }
  }
};

export {
  TOKEN_INFO
};
