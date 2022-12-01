import { BigNumber } from '@ethersproject/bignumber';
import { CHAIN_IDS } from '../../../config/web3/chains';
import { Address } from '../../../types/interfaces';

const SUPPLY_VAULT_MIGRATORS: {
  [chainId: number]: string;
} = {
  [CHAIN_IDS.FANTOM]: '0x0ce0e35fea385f1948e063d13444da3fe7e44cde'
};

const SUPPLY_VAULT_ROUTERS: {
  [chainId: number]: string;
} = {
  [CHAIN_IDS.FANTOM]: '0x3e9f34309b2f046f4f43c0376efe2fdc27a10251'
};

const SUPPLY_VAULTS: {
  [chainId: number]: {
    [pool: string]: SupplyVaultInfo
  }
} = {
  [CHAIN_IDS.OPTIMISM]: {
  },
  [CHAIN_IDS.ARBITRUM]: {
  },
  [CHAIN_IDS.FANTOM]: {
    '0x74d1d2a851e339b8cb953716445be7e8abdf92f4':
    {
      symbol: 'xTAROT',
      decimals: BigNumber.from(18),
      underlyingAddress: '0xc5e2b037d30a390e62180970b3aa4e91868764cd',
      underlyingSymbol: 'TAROT',
      underlyingDecimals: BigNumber.from(18),
      borrowableAddresses: [
        '0x1F8b52Ed3cd22F5E4275Aaf68301566Bb6739F22', // TAROT_SPOOKY_V2_WFTM_TAROT
        '0x61e8ee0bde02Cad88010E3a2D4e7821d60D39bc7', // TAROT_SPOOKY_V2_USDC_TAROT
        '0x0fab73D5889006da502C836f6A1499128aA3cD1D' // TAROT_SPIRIT_V2_WFTM_TAROT
      ]
      // no pricePairAddress
    },
    '0x80fe671e580cd1d95b2dcd8ea09233df06c81c7b':
    {
      symbol: 'xtinSPIRIT',
      decimals: BigNumber.from(18),
      underlyingAddress: '0x6caa3e5feba1f83ec1d80ea2eaca37c3421c33a8',
      underlyingSymbol: 'tinSPIRIT',
      underlyingDecimals: BigNumber.from(18),
      borrowableAddresses: [
      ]
      // no pricePairAddress
    },
    '0x0defef0c977809db8c1a3f13fd8dacbd565d968e':
    {
      symbol: 'tFTM',
      decimals: BigNumber.from(18),
      underlyingAddress: '0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83',
      underlyingSymbol: 'FTM',
      underlyingDecimals: BigNumber.from(18),
      borrowableAddresses: [
        '0x3D216d1086dEADd6Bf361f270584711859A64102', // FTM_SPOOKY_V2_WFTM_BOO
        '0x3221c43a4E354cece2fC8E0fdda2a663E052022D', // FTM_SPOOKY_V2_WFTM_DAI
        '0x5Eae455DD945A743F6C17FaEf55126EEBf4b0308', // FTM_SPOOKY_V2_WFTM_BTC
        '0xF5B6992019Cdb92B8cdcb5A17022e852e4cDEC02', // FTM_SPOOKY_V2_WFTM_ETH
        '0x555ed3c399D0ca6E05028e601e37456cDCe9A29B', // FTM_SPOOKY_V2_WFTM_LINK
        '0x416B8D5a3dD8bB1426DbE6f86317E22951A6d124', // FTM_SPOOKY_V2_WFTM_MIM
        '0xFfb9260808e327432350fc9C06D639F7Ee9C90f6', // FTM_SPOOKY_V2_WFTM_TAROT
        '0x06E37d44D85f72FcAb3fE743A129c704D21BAd6f', // FTM_SPOOKY_V2_fUSDT_WFTM
        '0xED0e1B57EEBdf538434b521e47fb3dF0A94f2343', // FTM_SPOOKY_V2_USDC_WFTM
        '0x3516bb5687AeEa067a05F9f15e22A935D04333B5', // FTM_SPIRIT_V2_WFTM_SPIRIT
        '0xfa3A9F4a11e95CC6D397D3173146A1284ae1085A', // FTM_SPIRIT_V2_USDC_WFTM
        '0xAc0777d9AC2c59917529fc9214AF7DF8F8fbc02e', // FTM_SPIRIT_V2_WFTM_BTC
        '0x3bA902ECBB6DCe179392057ECFE5E18bb52A5995', // FTM_SPIRIT_V2_WFTM_ETH
        '0x6BE8B2425433Db4389ED02C671773e0d254ebe7f' // FTM_SPIRIT_V2_WFTM_TAROT
      ]
      // no pricePairAddress
    },
    '0x68d211bc1e66814575d89bbe4f352b4cdbdacdfb':
    {
      symbol: 'tUSDC',
      decimals: BigNumber.from(6),
      underlyingAddress: '0x04068da6c83afcfa0e13ba15a6696662335d5b75',
      underlyingSymbol: 'USDC',
      underlyingDecimals: BigNumber.from(6),
      borrowableAddresses: [
        '0x7623ABCB2A3Da6bB14Bbb713B58c9B11Fc9713B1', // Spooky USDC-fUSDT
        '0xEe234Eb2919A1dc4b597de618240ec0C14Ef11Ce', // USDC_SPOOKYV2_USDC_WFTM
        '0xc2B71db3e843Dbe0615BC8Fcefc8B28d34F265C6', // USDC_SPOOKYV2_USDC_MAI
        '0xADF5C4115fBa294d208DC708C1dd20025d07eA9E', // USDC_SPOOKYV2_USDC_TUSD
        '0x9F2F80Ea74f44C923910781D858eCcBCC3A14e5d', // USDC_SPOOKYV2_USDC_BOO
        '0x6ed9d143a5A2D87796441915410a6617B02d7935', // USDC_SPOOKYV2_USDC_TAROT
        '0x2C68B48ee1514281c7902F2D55A5783aeB26f68D' // USDC_SPIRIT_V2_USDC_WFTM
      ],
      migrateFromAddress: '0x87d05774362ff39af4944f949a34399baeb64a35'
      // no pricePairAddress
    },
    '0xa45776cd3bd348c330bce66bf9dba149d8c3d452':
    {
      symbol: 'tBTC',
      decimals: BigNumber.from(8),
      underlyingAddress: '0x321162Cd933E2Be498Cd2267a90534A804051b11',
      underlyingSymbol: 'BTC',
      underlyingDecimals: BigNumber.from(8),
      borrowableAddresses: [
        '0x7C934Bb5363A4A160ac4bD8FDb260f6070527C96', // BTC_SPOOKY_V2_WFTM_BTC
        '0xe9D7575f900592ceF8a6583196763953D9Bed9F2' // BTC_SPOOKY_V2_BTC_ETH
      ],
      pricePairAddress: '0xcf9f94adcf137e7398e65a0c8a3b6caf127f760e'
    },
    '0x4f56f5e76c91e3676e806eb1b2e00e1d18f8f897':
    {
      symbol: 'tETH',
      decimals: BigNumber.from(18),
      underlyingAddress: '0x74b23882a30290451a17c44f4f05243b6b58c76d',
      underlyingSymbol: 'ETH',
      underlyingDecimals: BigNumber.from(18),
      borrowableAddresses: [
        '0x0fB2fF53721418f668f93FCAaDb3b73d699e41dF', // ETH_SPOOKY_V2_WFTM_ETH
        '0x5b09669C26301033be4d418aEfE753D085A4C8B1', // ETH_SPOOKY_V2_BTC_ETH
        '0xe8685152922Edea8F6dBFCc7886F13b09E0B9dd8' // ETH_SPOOKY_V2_YFI_ETH

      ],
      pricePairAddress: '0x3e0c11024e364026046d0072f95ff898fbd7da3e'
    },
    '0xc2218e377caff2cc005093124c31120aa5c902d1':
    {
      symbol: 'tTOMB',
      decimals: BigNumber.from(18),
      underlyingAddress: '0x6c021ae822bea943b2e66552bde1d2696a53fbb7',
      underlyingSymbol: 'TOMB',
      underlyingDecimals: BigNumber.from(18),
      borrowableAddresses: [
        '0xba36f108D499804d0d434a2f302AeC4b0Ab6f40b', // TOMB_TOMB_TOMB_miMATIC
        '0x62FaD47eD7cF0d88806c4985863B706584350e05', // TOMB_BASED_TOMB_BASED
        '0x4E49d9d2B967445AF1C131B90668c7d83995c90d', // TOMB_SOLIDEX_TOMB_miMATIC
        '0x474e8204Fb41dBFa18a7c96EDec725a358FFC438', // TOMB_SOLIDEX_WFTM_TOMB
        '0xbDEA9419f069001907c13808B4F68282e013e118', // TOMB_TOMB_WFTM_TOMB
        '0x445F69a4A1E6A5F15980a560Bf9dEB444ee51AC1' // TOMB_TOMB_BASED_TOMB_BASED
      ]
      // no pricePairAddress
    },
    '0x80d7413331afb37b30bc0ef6ae9d11a40bcf014b':
    {
      symbol: 'tMAI',
      decimals: BigNumber.from(18),
      underlyingAddress: '0xfb98b335551a418cd0737375a2ea0ded62ea213b',
      underlyingSymbol: 'MAI',
      underlyingDecimals: BigNumber.from(18),
      borrowableAddresses: [
        '0xB320FA815A18Bf186c8894930AA787B381f30B8a' // miMATIC_SPOOKY_V2_USDC_miMATIC
      ]
      // no pricePairAddress
    },
    '0x87d05774362ff39af4944f949a34399baeb64a35':
    {
      paused: true,
      symbol: 'tUSDC',
      decimals: BigNumber.from(18),
      underlyingAddress: '0x04068da6c83afcfa0e13ba15a6696662335d5b75',
      underlyingSymbol: 'USDC',
      underlyingDecimals: BigNumber.from(6),
      borrowableAddresses: [
        '0xb7FA3710A69487F37ae91D74Be55578d1353f9df',
        '0x65A4810e68AB2b011140B940F8edF8eE84BC141d',
        '0x710675A9c8509D3dF254792C548555D3D0a69494',
        '0x7623ABCB2A3Da6bB14Bbb713B58c9B11Fc9713B1',
        '0xD8339e66Eeb1762E699b3f0eF694269658e2421f'
      ],
      migrateToAddress: '0x68d211bc1e66814575d89bbe4f352b4cdbdacdfb'
      // no pricePairAddress
    }
  }
};

export interface SupplyVaultInfo {
  symbol: string;
  decimals: BigNumber;
  underlyingAddress: Address;
  underlyingSymbol: string;
  underlyingDecimals: BigNumber;
  borrowableAddresses: Address[];
  pricePairAddress?: Address;
  paused?: boolean;
  migrateFromAddress?: Address;
  migrateToAddress?: Address;
}

export {
  SUPPLY_VAULT_MIGRATORS, SUPPLY_VAULT_ROUTERS, SUPPLY_VAULTS
};
