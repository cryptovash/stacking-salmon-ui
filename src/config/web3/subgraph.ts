import { CHAIN_IDS } from '../../config/web3/chains';

const TAROT_SUBGRAPH_URL: {
  [chainId: number]: string[];
} = {
  [CHAIN_IDS.FANTOM]: process.env.REACT_APP_VERCEL_ENV === 'preview' ?
    ['https://api.thegraph.com/subgraphs/name/tarot-finance/tarot'] :
    ['https://dev.tarot.to/subgraphs/name/tarot-finance/tarot', 'https://api.thegraph.com/subgraphs/name/tarot-finance/tarot']
};

const TAROT_SUBGRAPH_URL_2: {
  [chainId: number]: string[];
} = {
  [CHAIN_IDS.FANTOM]: process.env.REACT_APP_VERCEL_ENV === 'preview' ?
    ['https://api.thegraph.com/subgraphs/name/tarot-finance/tarot-requiem'] :
    ['https://api.thegraph.com/subgraphs/name/tarot-finance/tarot-requiem']
};

const TAROT_SUBGRAPH_URL_3: {
  [chainId: number]: string[];
} = {
  [CHAIN_IDS.FANTOM]: process.env.REACT_APP_VERCEL_ENV === 'preview' ?
    ['https://api.thegraph.com/subgraphs/name/tarot-finance/tarot-carcosa'] :
    ['https://api.thegraph.com/subgraphs/name/tarot-finance/tarot-carcosa']
};

const BLOCKLYTICS_SUBGRAPH_URL: {
  [chainId: number]: string
} = {
  [CHAIN_IDS.FANTOM]: 'https://api.thegraph.com/subgraphs/name/matthewlilley/fantom-blocks',
  [CHAIN_IDS.OPTIMISM]: 'https://api.thegraph.com/subgraphs/name/beethovenxfi/optimism-blocks',
  [CHAIN_IDS.ARBITRUM]: 'https://api.thegraph.com/subgraphs/name/sushiswap/arbitrum-blocks',
  [CHAIN_IDS.ETHEREUM_MAIN_NET]: 'https://thegraph.com/hosted-service/subgraph/blocklytics/ethereum-blocks'
};

export {
  TAROT_SUBGRAPH_URL,
  TAROT_SUBGRAPH_URL_2,
  TAROT_SUBGRAPH_URL_3,
  BLOCKLYTICS_SUBGRAPH_URL
};