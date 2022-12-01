import { CHAIN_IDS } from '../../config/web3/chains';

enum DEX {
  SPOOKY='SPOOKY',
  SPIRIT='SPIRIT',
  SPIRIT_V2='SPIRIT_V2',
  SUSHI='SUSHI',
  SOLIDLY='SOLIDLY',
  TOMB='TOMB',
  ZIP='ZIP',
  VELODROME='VELODROME',
  XCAL='XCAL',
  UNKNOWN='UNKNOWN',
}

const UNKNOWN_DEX: DexInfo = {
  id: DEX.UNKNOWN,
  dexName: 'Unknown Exchange',
  iconPath: '/assets/images/dex/default.jpg'
};

const DEX_DETAILS: {
  [chainId: number]: DexDetails[]
} = {
  [CHAIN_IDS.FANTOM]: [
    {
      id: DEX.SPOOKY,
      dexName: 'Spooky',
      factoryAddress: '0x152eE697f2E276fA89E96742e9bB9aB1F2E61bE3',
      masterChefAddress: '0x2b2929E785374c651a81A63878Ab22742656DcDd',
      rewardsTokenAddress: '0x841fad6eae12c286d1fd18d1d525dffa75c7effe',
      rewardsTokenDecimals: 18,
      rewardsTokenSymbol: 'BOO',
      pendingRewardFunctionName: 'pendingBOO',
      rewardRateFunctionName: 'booPerSecond',
      initCodePairHash: '0xcdf2deca40a0bd56de8e3ce5c7df6727e5b1bf2ac96f283fa9c4b3e6b42ea9d2',
      subgraphUrl: 'https://api.thegraph.com/subgraphs/name/eerieeight/spookyswap',
      iconPath: '/assets/images/dex/spooky.png',
      lpFee: 0.0015,
      swapFee: 0.002,
      tokenInfoUrl: 'https://info.spooky.fi/token/',
      pairInfoUrl: 'https://info.spooky.fi/pair/',
      addLiquidityUrl: 'https://spooky.fi/#/add/',
      addLiquidityWETHSymbol: 'FTM',
      covalentName: 'spookyswap',
      cardColor: '#2d2b51'
    },
    {
      id: DEX.SPIRIT,
      dexName: 'Spirit',
      factoryAddress: '0xEF45d134b73241eDa7703fa787148D9C9F4950b0',
      masterChefAddress: '0x9083EA3756BDE6Ee6f27a6e996806FBD37F6F093',
      rewardsTokenAddress: '0x5cc61a78f164885776aa610fb0fe1257df78e59b',
      rewardsTokenDecimals: 18,
      rewardsTokenSymbol: 'SPIRIT',
      pendingRewardFunctionName: 'pendingSpirit',
      rewardRateFunctionName: 'spiritPerBlock',
      initCodePairHash: '0xe242e798f6cee26a9cb0bbf24653bf066e5356ffeac160907fe2cc108e238617',
      subgraphUrl: 'https://api.thegraph.com/subgraphs/name/layer3org/spiritswap-analytics',
      iconPath: '/assets/images/dex/spirit.png',
      lpFee: 0.0025,
      swapFee: 0.003,
      tokenInfoUrl: 'https://info.spiritswap.finance/token/',
      pairInfoUrl: 'https://info.spiritswap.finance/pair/',
      addLiquidityUrl: 'https://swap.spiritswap.finance/#/add/',
      addLiquidityWETHSymbol: 'FTM',
      covalentName: 'spiritswap',
      cardColor: '#1f3c3e'
    },
    {
      id: DEX.SPIRIT_V2,
      dexName: 'Spirit V2',
      iconPath: '/assets/images/dex/spirit-v2.png',
      addLiquidityUrl: 'https://beta.spiritswap.finance/liquidity',
      cardColor: '#185951'
    },
    {
      id: DEX.SUSHI,
      dexName: 'Sushi',
      factoryAddress: '0xc35dadb65012ec5796536bd9864ed8773abc74c4',
      initCodePairHash: '0xe18a34eb0e04b04f7a0ac29a6e80748dca96319b42c54d679cb821dca90c6303',
      subgraphUrl: 'https://api.thegraph.com/subgraphs/name/sushiswap/fantom-exchange',
      iconPath: '/assets/images/dex/sushi.png',
      lpFee: 0.0025,
      swapFee: 0.003,
      tokenInfoUrl: 'https://analytics-ftm.sushi.com/tokens/',
      pairInfoUrl: 'https://analytics-ftm.sushi.com/pairs/',
      addLiquidityUrl: 'https://app.sushi.com/add/',
      addLiquidityWETHSymbol: 'ETH',
      covalentName: 'sushiswap',
      cardColor: '#3c183c'
    },
    {
      id: DEX.SOLIDLY,
      dexName: 'Solidly',
      iconPath: '/assets/images/dex/solidly.png',
      addLiquidityUrl: 'https://solidly.exchange/liquidity/',
      cardColor: '#212b48'
    },
    {
      id: DEX.TOMB,
      dexName: 'TombSwap',
      iconPath: '/assets/images/dex/tomb.png',
      subgraphUrl: 'https://api.thegraph.com/subgraphs/name/jamjomjim/tomb-finance',
      lpFee: 0.0025,
      swapFee: 0.005,
      tokenInfoUrl: 'https://info.swap.tomb.com/token/',
      pairInfoUrl: 'https://info.swap.tomb.com/pair/',
      addLiquidityUrl: 'https://swap.tomb.com/#/add/',
      cardColor: '#3f1d5f'
    }
  ],
  [CHAIN_IDS.OPTIMISM]: [
    {
      id: DEX.ZIP,
      dexName: 'ZipSwap',
      iconPath: '/assets/images/dex/zip.png',
      subgraphUrl: 'https://api.thegraph.com/subgraphs/name/nonamefits/zipswap',
      lpFee: 0.003,
      swapFee: 0.003,
      tokenInfoUrl: 'https://info.zipswap.fi/token/',
      pairInfoUrl: 'https://info.zipswap.fi/pair/',
      addLiquidityUrl: 'https://zipswap.fi/#/add/',
      addLiquidityWETHSymbol: 'ETH',
      cardColor: '#325078'
    },
    {
      id: DEX.VELODROME,
      dexName: 'Velodrome',
      iconPath: '/assets/images/dex/velodrome.png',
      addLiquidityUrl: 'https://app.velodrome.finance/liquidity/create',
      cardColor: '#48212c'
    }
  ],
  [CHAIN_IDS.ARBITRUM]: [
    {
      id: DEX.XCAL,
      dexName: '3xcalibur',
      iconPath: '/assets/images/dex/3xcalibur.png',
      addLiquidityUrl: 'https://app.3xcalibur.com/liquidity/create',
      cardColor: '#294460'
    }
  ]
};

const getDexById = (chainId: number, id: DEX) : DexInfo => {
  return DEX_DETAILS[chainId].find(dex => dex.id === id) as DexInfo || UNKNOWN_DEX;
};
const getDexByCovalentName = (chainId: number, covalentName: string) : DexDetails | null => {
  return DEX_DETAILS[chainId].find(dex => dex.covalentName === covalentName) || null;
};
export interface DexInfo {
  id: DEX;
  dexName: string;
  iconPath: string;
  tokenInfoUrl?: string;
  pairInfoUrl?: string;
  addLiquidityUrl?: string;
  addLiquidityWETHSymbol?: string;
}

export interface DexDetails extends Partial<DexInfo> {
  factoryAddress?: string;
  masterChefAddress?: string;
  rewardsTokenAddress?: string;
  rewardsTokenDecimals?: number;
  rewardsTokenSymbol?: string;
  pendingRewardFunctionName?: string;
  rewardRateFunctionName?: string;
  rewardEndFunctionName?: string;
  initCodePairHash?: string;
  subgraphUrl?: string;
  lpFee?: number;
  swapFee?: number;
  covalentName?: string;
  cardColor?: string;
}

export { DEX, DEX_DETAILS, getDexById, getDexByCovalentName, UNKNOWN_DEX };
