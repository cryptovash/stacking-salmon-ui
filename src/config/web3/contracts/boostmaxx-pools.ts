import { ZERO_ADDRESS } from '../../../utils/address';

const BOOSTMAXX_POOL_DETAILS_MAP: {
    [pool: string]: BoostMaxxPoolDetails
} = {
  '0xd0184791adfa030bdf8a1f2d626f823d1c2b0159': {
    id: '0xd0184791adfa030bdf8a1f2d626f823d1c2b0159',
    gauge: '0xb6e09811c87ec154a2d3f7c0c060be22b47f348f',
    decimals0: 18,
    decimals1: 18,
    symbol: 'sAMM-tFTM/WFTM',
    symbol0: 'tFTM',
    symbol1: 'WFTM',
    token0: '0x0defef0c977809db8c1a3f13fd8dacbd565d968e',
    token1: '0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83'
  },
  '0x4fe782133af0f7604b9b89bf95893adde265fefd': {
    id: '0x4fe782133af0f7604b9b89bf95893adde265fefd',
    gauge: '0xa0813bccc899589b4e7d9ac42193136d0313f4eb',
    decimals0: 18,
    decimals1: 18,
    symbol: 'vAMM-xTAROT/TAROT',
    symbol0: 'xTAROT',
    symbol1: 'TAROT',
    token0: '0x74d1d2a851e339b8cb953716445be7e8abdf92f4',
    token1: '0xc5e2b037d30a390e62180970b3aa4e91868764cd'
  },
  '0x783f1edbe336981dfcb74bd0b803655f55aadf48': {
    id: '0x783f1edbe336981dfcb74bd0b803655f55aadf48',
    gauge: '0x04f12d5eb29edc7241de831e582c3b7814844fcb',
    decimals0: 18,
    decimals1: 18,
    symbol: 'vAMM-WFTM/TAROT',
    symbol0: 'WFTM',
    symbol1: 'TAROT',
    token0: '0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83',
    token1: '0xc5e2b037d30a390e62180970b3aa4e91868764cd'
  },
  '0xcb6eab779780c7fd6d014ab90d8b10e97a1227e2': {
    id: '0xcb6eab779780c7fd6d014ab90d8b10e97a1227e2',
    gauge: '0x2a6931b75ee4e062baabee7f297166871ee55837',
    decimals0: 18,
    decimals1: 18,
    symbol: 'vAMM-WFTM/OXD',
    symbol0: 'WFTM',
    symbol1: 'OXD',
    token0: '0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83',
    token1: '0xc5a9848b9d145965d821aaec8fa32aaee026492d'
  },
  '0x62e2819dd417f3b430b6fa5fd34a49a377a02ac8': {
    id: '0x62e2819dd417f3b430b6fa5fd34a49a377a02ac8',
    gauge: '0x03a1fbe02642f61a940093cc76fe5c4a2cbb8c24',
    decimals0: 18,
    decimals1: 18,
    symbol: 'sAMM-SOLIDsex/SOLID',
    symbol0: 'SOLIDsex',
    symbol1: 'SOLID',
    token0: '0x41adac6c1ff52c5e27568f27998d747f7b69795b',
    token1: '0x888ef71766ca594ded1f0fa3ae64ed2941740a20'
  },
  '0xfcec86af8774d69e2e4412b8de3f4abf1f671ecc': {
    id: '0xfcec86af8774d69e2e4412b8de3f4abf1f671ecc',
    gauge: '0x3cbd867cf1d37d9b5c3cedf28b8a41d71f6807d6',
    decimals0: 18,
    decimals1: 18,
    symbol: 'vAMM-WFTM/SEX',
    symbol0: 'WFTM',
    symbol1: 'SEX',
    token0: '0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83',
    token1: '0xd31fcd1f7ba190dbc75354046f6024a9b86014d7'
  },
  '0x94be7e51efe2a0c06c2281b6b385fcd12c84d6f9': {
    id: '0x94be7e51efe2a0c06c2281b6b385fcd12c84d6f9',
    gauge: '0x4905b9574d391c4c09bf73d0ebbd5cf71b015e2f',
    decimals0: 18,
    decimals1: 18,
    symbol: 'vAMM-WFTM/MULTI',
    symbol0: 'WFTM',
    symbol1: 'MULTI',
    token0: '0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83',
    token1: '0x9fb9a33956351cf4fa040f65a13b835a3c8764e3'
  },
  '0x4a81e80f7d77b4d1440a7fef12bd47e0344f215b': {
    id: '0x4a81e80f7d77b4d1440a7fef12bd47e0344f215b',
    gauge: '0xd013cb6dee3073c397632070eccc3032b300c6af',
    decimals0: 18,
    decimals1: 8,
    symbol: 'vAMM-WFTM/renBTC',
    symbol0: 'WFTM',
    symbol1: 'renBTC',
    token0: '0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83',
    token1: '0xdbf31df14b66535af65aac99c32e9ea844e14501'
  },
  '0xd6be7592e5c424623c8c9557738970ae19ab5de2': {
    id: '0xd6be7592e5c424623c8c9557738970ae19ab5de2',
    gauge: '0xae800bf0b96caaa6b8d578a85a5edbb1fcd6af7c',
    decimals0: 18,
    decimals1: 18,
    symbol: 'sAMM-SPIRIT/LINSPIRIT',
    symbol0: 'SPIRIT',
    symbol1: 'LINSPIRIT',
    token0: '0x5cc61a78f164885776aa610fb0fe1257df78e59b',
    token1: '0xc5713b6a0f26bf0fdc1c52b90cd184d950be515c'
  },
  '0x0ef4b983f02eec139433c17e7ffd794c0749a083': {
    id: '0x0ef4b983f02eec139433c17e7ffd794c0749a083',
    gauge: '0xf97857d58d345e85e7685db50dab28b2ced29d06',
    decimals0: 18,
    decimals1: 18,
    symbol: 'vAMM-WFTM/xBOO',
    symbol0: 'WFTM',
    symbol1: 'xBOO',
    token0: '0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83',
    token1: '0xa48d959ae2e88f1daa7d5f611e01908106de7598'
  },
  '0xca395560b6003d921d9408af011c6c61399f66ca': {
    id: '0xca395560b6003d921d9408af011c6c61399f66ca',
    gauge: '0x89e0f4d813075e178a9ddd1b18f180c0531c9653',
    decimals0: 18,
    decimals1: 18,
    symbol: 'sAMM-SPIRIT/RAINSPIRIT',
    symbol0: 'SPIRIT',
    symbol1: 'RAINSPIRIT',
    token0: '0x5cc61a78f164885776aa610fb0fe1257df78e59b',
    token1: '0xf9c6e3c123f0494a4447100bd7dbd536f43cc33a'
  },
  '0xeafb5ae6eea34954ee5e5a27b068b8705ce926a6': {
    id: '0xeafb5ae6eea34954ee5e5a27b068b8705ce926a6',
    gauge: '0x8e81ec0d9c184e73746446dfb83f86c1156744d5',
    decimals0: 6,
    decimals1: 18,
    symbol: 'vAMM-USDC/OXD',
    symbol0: 'USDC',
    symbol1: 'OXD',
    token0: '0x04068da6c83afcfa0e13ba15a6696662335d5b75',
    token1: '0xc165d941481e68696f43ee6e99bfb2b23e0e3114'
  },
  '0xe4bc39fdd4618a76f6472079c329bdfa820afa75': {
    id: '0xe4bc39fdd4618a76f6472079c329bdfa820afa75',
    gauge: '0x5990734584bf21c76cbc721858843e9574c8446f',
    decimals0: 18,
    decimals1: 18,
    symbol: 'vAMM-WFTM/SOLID',
    symbol0: 'WFTM',
    symbol1: 'SOLID',
    token0: '0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83',
    token1: '0x888ef71766ca594ded1f0fa3ae64ed2941740a20'
  },
  '0xabf18df0373749182ae2a15726d49452afa78eec': {
    id: '0xabf18df0373749182ae2a15726d49452afa78eec',
    gauge: '0x8f2cca3814f67a4127f82ea49b211b0b32b97029',
    decimals0: 18,
    decimals1: 18,
    symbol: 'vAMM-SOLIDsex/SOLID',
    symbol0: 'SOLIDsex',
    symbol1: 'SOLID',
    token0: '0x41adac6c1ff52c5e27568f27998d747f7b69795b',
    token1: '0x888ef71766ca594ded1f0fa3ae64ed2941740a20'
  },
  '0xbc5f148258716241b7f333e386b8e0e298272800': {
    id: '0xbc5f148258716241b7f333e386b8e0e298272800',
    gauge: '0xd9d4dbc1c6832baf1c1b9d92d55214c74d70a068',
    decimals0: 6,
    decimals1: 18,
    symbol: 'vAMM-USDC/SOLID',
    symbol0: 'USDC',
    symbol1: 'SOLID',
    token0: '0x04068da6c83afcfa0e13ba15a6696662335d5b75',
    token1: '0x888ef71766ca594ded1f0fa3ae64ed2941740a20'
  },
  '0xb72a50f94eee09d0731a3b4dee0ee2c774e9f2d4': {
    id: '0xb72a50f94eee09d0731a3b4dee0ee2c774e9f2d4',
    gauge: '0xd3328f81857b543d33166c72328a61ca0b19152d',
    decimals0: 18,
    decimals1: 18,
    symbol: 'sAMM-WFTM/MULTI',
    symbol0: 'WFTM',
    symbol1: 'MULTI',
    token0: '0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83',
    token1: '0x9fb9a33956351cf4fa040f65a13b835a3c8764e3'
  },
  '0xd989ca1619e66885e43d3297d00ae72372269963': {
    id: '0xd989ca1619e66885e43d3297d00ae72372269963',
    gauge: '0xf25e2c449dacc2ea353b973895d5aca02c9b4dc8',
    decimals0: 18,
    decimals1: 18,
    symbol: 'vAMM-SOLID/OXD',
    symbol0: 'SOLID',
    symbol1: 'OXD',
    token0: '0x888ef71766ca594ded1f0fa3ae64ed2941740a20',
    token1: '0xc165d941481e68696f43ee6e99bfb2b23e0e3114'
  },
  '0x817caff2dac62bdcce1ebe332ca128215dbd9e9a': {
    id: '0x817caff2dac62bdcce1ebe332ca128215dbd9e9a',
    gauge: '0xe739e348293ab675eca6611863f6822ba661d72c',
    decimals0: 18,
    decimals1: 18,
    symbol: 'vAMM-SOLIDsex/g3CRV',
    symbol0: 'SOLIDsex',
    symbol1: 'g3CRV',
    token0: '0x41adac6c1ff52c5e27568f27998d747f7b69795b',
    token1: '0xd02a30d33153877bc20e5721ee53dedee0422b2f'
  },
  '0xda1a595662b1053aabf36378d21c88d9f1ef67d0': {
    id: '0xda1a595662b1053aabf36378d21c88d9f1ef67d0',
    gauge: '0xd2a4ebb91ac3d57ca6b77696cdf6f6f2930c0e3a',
    decimals0: 18,
    decimals1: 18,
    symbol: 'vAMM-MIM/SOLID',
    symbol0: 'MIM',
    symbol1: 'SOLID',
    token0: '0x82f0b8b456c1a451378467398982d4834b6829c1',
    token1: '0x888ef71766ca594ded1f0fa3ae64ed2941740a20'
  },
  '0xbf70b035c89936328258d2eec1d813b9f86df08d': {
    id: '0xbf70b035c89936328258d2eec1d813b9f86df08d',
    gauge: '0x303acd55954a39634ccd0a079e9c664fcf1413d1',
    decimals0: 18,
    decimals1: 12,
    symbol: 'vAMM-WFTM/WOOFY',
    symbol0: 'WFTM',
    symbol1: 'WOOFY',
    token0: '0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83',
    token1: '0xd0660cd418a64a1d44e9214ad8e459324d8157f1'
  },
  '0x2d1be3c7dca1a7c4d89dfdc1554af428378cd951': {
    id: '0x2d1be3c7dca1a7c4d89dfdc1554af428378cd951',
    gauge: '0x1afe0e0a1618698e4d3e8f035effc8437713016c',
    decimals0: 18,
    decimals1: 18,
    symbol: 'sAMM-SOLIDsex/SEX',
    symbol0: 'SOLIDsex',
    symbol1: 'SEX',
    token0: '0x41adac6c1ff52c5e27568f27998d747f7b69795b',
    token1: '0xd31fcd1f7ba190dbc75354046f6024a9b86014d7'
  },
  '0x6b987e02ca5eae26d8b2bcac724d4e03b3b0c295': {
    id: '0x6b987e02ca5eae26d8b2bcac724d4e03b3b0c295',
    gauge: '0x51b6b39816cbe47a74ec3154208f86199f9225a4',
    decimals0: 18,
    decimals1: 18,
    symbol: 'vAMM-OATH/WFTM',
    symbol0: 'OATH',
    symbol1: 'WFTM',
    token0: '0x21ada0d2ac28c3a5fa3cd2ee30882da8812279b6',
    token1: '0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83'
  },
  '0xdd56b20073e4cc049dc93ef6425c27f047b4ae93': {
    id: '0xdd56b20073e4cc049dc93ef6425c27f047b4ae93',
    gauge: '0x10241914c86a2783bef22d458ff65b4762c4238a',
    decimals0: 18,
    decimals1: 18,
    symbol: 'vAMM-WFTM/BOO',
    symbol0: 'WFTM',
    symbol1: 'BOO',
    token0: '0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83',
    token1: '0x841fad6eae12c286d1fd18d1d525dffa75c7effe'
  },
  '0xbad7d3df8e1614d985c3d9ba9f6ecd32ae7dc20a': {
    id: '0xbad7d3df8e1614d985c3d9ba9f6ecd32ae7dc20a',
    gauge: '0x4f54422af23fc94847fa2107e6d774414f311c35',
    decimals0: 6,
    decimals1: 18,
    symbol: 'vAMM-USDC/WFTM',
    symbol0: 'USDC',
    symbol1: 'WFTM',
    token0: '0x04068da6c83afcfa0e13ba15a6696662335d5b75',
    token1: '0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83'
  },
  '0x60a861cd30778678e3d613db96139440bd333143': {
    id: '0x60a861cd30778678e3d613db96139440bd333143',
    gauge: '0x1d1a1871d1830d4b5087212c820e5f1252379c2c',
    decimals0: 18,
    decimals1: 18,
    symbol: 'vAMM-WFTM/TOMB',
    symbol0: 'WFTM',
    symbol1: 'TOMB',
    token0: '0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83',
    token1: '0x6c021ae822bea943b2e66552bde1d2696a53fbb7'
  },
  '0xbcab7d083cf6a01e0dda9ed7f8a02b47d125e682': {
    id: '0xbcab7d083cf6a01e0dda9ed7f8a02b47d125e682',
    gauge: '0xc009bc33201a85800b3593a40a178521a8e60a02',
    decimals0: 6,
    decimals1: 18,
    symbol: 'sAMM-USDC/MIM',
    symbol0: 'USDC',
    symbol1: 'MIM',
    token0: '0x04068da6c83afcfa0e13ba15a6696662335d5b75',
    token1: '0x82f0b8b456c1a451378467398982d4834b6829c1'
  },
  '0x9861b8a9acc9b4f249981164bfe7f84202068bfe': {
    id: '0x9861b8a9acc9b4f249981164bfe7f84202068bfe',
    gauge: '0xdf6f82eb0b596c720135c9a85960f54dd495ea8c',
    decimals0: 18,
    decimals1: 18,
    symbol: 'vAMM-LQDR/WFTM',
    symbol0: 'LQDR',
    symbol1: 'WFTM',
    token0: '0x10b620b2dbac4faa7d7ffd71da486f5d44cd86f9',
    token1: '0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83'
  },
  '0x86dd79265814756713e631dde7e162bdd538b7b1': {
    id: '0x86dd79265814756713e631dde7e162bdd538b7b1',
    gauge: '0x6642c79bd7729ec7c56954b7fdd453991342f3d8',
    decimals0: 18,
    decimals1: 18,
    symbol: 'vAMM-WFTM/SCREAM',
    symbol0: 'WFTM',
    symbol1: 'SCREAM',
    token0: '0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83',
    token1: '0xe0654c8e6fd4d733349ac7e09f6f23da256bf475'
  },
  '0xd11c9e19726d775e10e324c3cf02687994a022b3': {
    id: '0xd11c9e19726d775e10e324c3cf02687994a022b3',
    gauge: '0x1f412c4a31c9de7b4ff6fc6656eee974d42a13f0',
    decimals0: 18,
    decimals1: 18,
    symbol: 'vAMM-WFTM/SPIRIT',
    symbol0: 'WFTM',
    symbol1: 'SPIRIT',
    token0: '0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83',
    token1: '0x5cc61a78f164885776aa610fb0fe1257df78e59b'
  },
  '0x6aae93f2915b899e87b49a9254434d36ac9570d8': {
    id: '0x6aae93f2915b899e87b49a9254434d36ac9570d8',
    gauge: '0x6479352f9086474307b3fa465efc6fb550231f12',
    decimals0: 18,
    decimals1: 18,
    symbol: 'vAMM-HND/WFTM',
    symbol0: 'HND',
    symbol1: 'WFTM',
    token0: '0x10010078a54396f62c96df8532dc2b4847d47ed3',
    token1: '0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83'
  },
  '0x5b3b8f8d92472c6cdc0c6a7d0acd29e53cc00d28': {
    id: '0x5b3b8f8d92472c6cdc0c6a7d0acd29e53cc00d28',
    gauge: '0xc6416386af0fc6b357fd5b382d95faf0fb5f5456',
    decimals0: 18,
    decimals1: 0,
    symbol: 'vAMM-CRE8R/BOMB',
    symbol0: 'CRE8R',
    symbol1: 'BOMB',
    token0: '0x2ad402655243203fcfa7dcb62f8a08cc2ba88ae0',
    token1: '0x8503eb4a136bdbeb323e37aa6e0fa0c772228378'
  },
  '0xeaa8dc34d3ad1910da9ea6b2099b08fc1d6d292b': {
    id: '0xeaa8dc34d3ad1910da9ea6b2099b08fc1d6d292b',
    gauge: '0x638a8ae4c0f03afdac4d1d5f474a8355d4d9e097',
    decimals0: 18,
    decimals1: 8,
    symbol: 'vAMM-WFTM/BTC',
    symbol0: 'WFTM',
    symbol1: 'BTC',
    token0: '0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83',
    token1: '0x321162cd933e2be498cd2267a90534a804051b11'
  },
  '0x5a3aa3284ee642152d4a2b55be1160051c5eb932': {
    id: '0x5a3aa3284ee642152d4a2b55be1160051c5eb932',
    gauge: '0x6228f815d433293a4429d6ff055264fba60c6fb8',
    decimals0: 18,
    decimals1: 18,
    symbol: 'vAMM-BEETS/fBEETS',
    symbol0: 'BEETS',
    symbol1: 'fBEETS',
    token0: '0xf24bcf4d1e507740041c9cfd2dddb29585adce1e',
    token1: '0xfcef8a994209d6916eb2c86cdd2afd60aa6f54b1'
  },
  '0xa7ea870dc93ffb712ca74b43efca9b07556d1303': {
    id: '0xa7ea870dc93ffb712ca74b43efca9b07556d1303',
    gauge: '0x37b99113760cfb7d9a7152142cc36b3eab121b5f',
    decimals0: 18,
    decimals1: 18,
    symbol: 'sAMM-binSPIRIT/SPIRIT',
    symbol0: 'binSPIRIT',
    symbol1: 'SPIRIT',
    token0: '0x44e314190d9e4ce6d4c0903459204f8e21ff940a',
    token1: '0x5cc61a78f164885776aa610fb0fe1257df78e59b'
  },
  '0xae885ef155f2835dce9c66b0a7a3a0c8c0622aa1': {
    id: '0xae885ef155f2835dce9c66b0a7a3a0c8c0622aa1',
    gauge: '0xcefd993ad9a5ca049ab123a70cfb03df3b9dc5f8',
    decimals0: 18,
    decimals1: 18,
    symbol: 'vAMM-WFTM/GEIST',
    symbol0: 'WFTM',
    symbol1: 'GEIST',
    token0: '0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83',
    token1: '0xd8321aa83fb0a4ecd6348d4577431310a6e0814d'
  },
  '0x304b61f3481c977ffbe630b55f2abeee74792664': {
    id: '0x304b61f3481c977ffbe630b55f2abeee74792664',
    gauge: '0xdafacf5182437311c1f88cd6b42f881b062e2888',
    decimals0: 18,
    decimals1: 18,
    symbol: 'vAMM-IB/WFTM',
    symbol0: 'IB',
    symbol1: 'WFTM',
    token0: '0x00a35fd824c717879bf370e70ac6868b95870dfb',
    token1: '0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83'
  },
  '0x5804f6c40f44cf7593f73cf3aa16f7037213a623': {
    id: '0x5804f6c40f44cf7593f73cf3aa16f7037213a623',
    gauge: '0x9a1f8adae1a0b79ed1263640ee78421e9a5c9b68',
    decimals0: 18,
    decimals1: 18,
    symbol: 'vAMM-BOO/xBOO',
    symbol0: 'BOO',
    symbol1: 'xBOO',
    token0: '0x841fad6eae12c286d1fd18d1d525dffa75c7effe',
    token1: '0xa48d959ae2e88f1daa7d5f611e01908106de7598'
  },
  '0x5ef8f0bd4f071b0199603a28ec9343f3651999c0': {
    id: '0x5ef8f0bd4f071b0199603a28ec9343f3651999c0',
    gauge: '0x9d1a7eb2cfb99a9a1806d14366514bfb43d4f254',
    decimals0: 18,
    decimals1: 18,
    symbol: 'vAMM-WFTM/RDL',
    symbol0: 'WFTM',
    symbol1: 'RDL',
    token0: '0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83',
    token1: '0x79360af49edd44f3000303ae212671ac94bb8ba7'
  },
  '0xcc7311ac0ad11702ad674fb40f8e6e09d49c13e3': {
    id: '0xcc7311ac0ad11702ad674fb40f8e6e09d49c13e3',
    gauge: '0x942b36563ca6e02a4ea7f22a019f02303ca0172e',
    decimals0: 18,
    decimals1: 18,
    symbol: 'sAMM-MIM/DAI',
    symbol0: 'MIM',
    symbol1: 'DAI',
    token0: '0x82f0b8b456c1a451378467398982d4834b6829c1',
    token1: '0x8d11ec38a3eb5e956b052f67da8bdc9bef8abf3e'
  },
  '0x75c6904d4745713643661c1fd80205e75dafb578': {
    id: '0x75c6904d4745713643661c1fd80205e75dafb578',
    gauge: '0x1a2399c9b83065c76feabb2544fca6c9bc7fe3d9',
    decimals0: 18,
    decimals1: 18,
    symbol: 'sAMM-BEETS/fBEETS',
    symbol0: 'BEETS',
    symbol1: 'fBEETS',
    token0: '0xf24bcf4d1e507740041c9cfd2dddb29585adce1e',
    token1: '0xfcef8a994209d6916eb2c86cdd2afd60aa6f54b1'
  },
  '0xeb30fc283d1ceb163ca848d13b06261784945395': {
    id: '0xeb30fc283d1ceb163ca848d13b06261784945395',
    gauge: '0xc0be0a863092342549c69f130e057739f7709a3c',
    decimals0: 6,
    decimals1: 18,
    symbol: 'vAMM-USDC/ELITE',
    symbol0: 'USDC',
    symbol1: 'ELITE',
    token0: '0x04068da6c83afcfa0e13ba15a6696662335d5b75',
    token1: '0xf43cc235e686d7bc513f53fbffb61f760c3a1882'
  }
};

const BOOSTMAXX_POOL_IDS = Object.keys(BOOSTMAXX_POOL_DETAILS_MAP);

const BOOSTMAXX_POOLS_LIST = Object.values(BOOSTMAXX_POOL_DETAILS_MAP);

const TAROT_BOOSTMAXX_POOLS = [
  '0x783f1eDBE336981dFCb74Bd0B803655F55AaDF48',
  '0x4FE782133af0f7604B9B89Bf95893ADDE265FEFD',
  '0xd0184791ADfa030Bdf8a1F2d626f823d1c2b0159'
];

export const EMPTY_BOOSTMAXX_POOL_DETAILS = {
  id: ZERO_ADDRESS,
  gauge: ZERO_ADDRESS,
  decimals0: 0,
  decimals1: 0,
  symbol: '',
  symbol0: '',
  symbol1: '',
  token0: ZERO_ADDRESS,
  token1: ZERO_ADDRESS
};

export interface BoostMaxxPoolDetails {
  id: string;
  gauge: string;
  decimals0: number;
  decimals1: number;
  symbol: string;
  symbol0: string;
  symbol1: string;
  token0: string;
  token1: string;
  chainId?: number;
}

export {
  BOOSTMAXX_POOL_DETAILS_MAP, BOOSTMAXX_POOL_IDS, BOOSTMAXX_POOLS_LIST, TAROT_BOOSTMAXX_POOLS
};