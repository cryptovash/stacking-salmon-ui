const FACTORY_DETAILS_MAP: {
    [pool: string]: FactoryDetails
  } = {
    '0x35c052bbf8338b06351782a565aa9aad173432ea': {
      borrowFeeBps: 10,
      kinkMultiplier: 5,
      kinkBorrowRateMax: 100,
      tarotPriceOracleAddress: '0x36df0a76a124d8b2205fa11766ec2eff8ce38a35',
      label: 'Classic'
    },
    '0xf6d943c8904195d0f69ba03d97c0baf5bbdcd01b': {
      borrowFeeBps: 1,
      kinkMultiplier: 3,
      kinkBorrowRateMax: 888,
      tarotPriceOracleAddress: '0x36df0a76a124d8b2205fa11766ec2eff8ce38a35',
      label: 'Requiem'
    },
    '0xbf76f858b42bb9b196a87e43235c2f0058cf7322': {
      borrowFeeBps: 1,
      kinkMultiplier: 3,
      kinkBorrowRateMax: 888,
      tarotPriceOracleAddress: '0xeb2d736b9588ed16af4a3ef11f3fdd96b1b0478e',
      label: 'Carcosa'
    },
    '0x1d90fdac4dd30c3ba38d53f52a884f6e75d0989e': {
      borrowFeeBps: 1,
      kinkMultiplier: 3,
      kinkBorrowRateMax: 888,
      tarotPriceOracleAddress: '0x981bd9f77c8aafc14ebc86769503f86a3cc29af5',
      label: 'Opaline'
    },
    '0xd7cabef2c1fd77a31c5ba97c724b82d3e25fc83c': {
      borrowFeeBps: 1,
      kinkMultiplier: 3,
      kinkBorrowRateMax: 888,
      tarotPriceOracleAddress: '0x5a8931f2b235caa2eabf3f07cd1154360c933e17',
      label: 'Velours'
    },
    '0x8b2e286afa241307261622abd2878ad8ec9f0723': {
      borrowFeeBps: 1,
      kinkMultiplier: 6,
      kinkBorrowRateMax: 28,
      tarotPriceOracleAddress: '0x0a3b938d51f1b6d7bf960a0cb6ac9f1154d0008c',
      label: 'Jupiter'
    },
    '0x2217aec3440e8fd6d49a118b1502e539f88dba55': {
      borrowFeeBps: 1,
      kinkMultiplier: 3,
      kinkBorrowRateMax: 888,
      tarotPriceOracleAddress: '0xd4a6a05081fd270dc111332845a778a49fe01741',
      label: 'Galahad'
    },
    '0xc20099a3f0728634c1136489074508be7b406d3a': {
      borrowFeeBps: 1,
      kinkMultiplier: 6,
      kinkBorrowRateMax: 28,
      tarotPriceOracleAddress: '0x36df0a76a124d8b2205fa11766ec2eff8ce38a35',
      label: 'Ulysses'
    }
  };
  
  const FACTORY_LIST = Object.values(FACTORY_DETAILS_MAP);
  
  export interface FactoryDetails {
    borrowFeeBps: number;
    kinkMultiplier: number;
    kinkBorrowRateMax: number;
    tarotPriceOracleAddress: string;
    label: string;
  }
  
  export {
    FACTORY_DETAILS_MAP, FACTORY_LIST
  };