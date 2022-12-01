import { CHAIN_IDS } from '../../../config/web3/chains';

const DISTRIBUTOR_ADDRESSES = {
  [CHAIN_IDS.FANTOM]: [
    {
      claimableAddress: '0xd4fCD1D1252bf4A3134e0E848479AD90A60979ef',
      name: 'Tarot LGE',
      totalDistribution: 2950000,
      distributionPeriod: '1 year'
    },
    {
      claimableAddress: '0x3303a565741D0D41D026C12259fF2d4772D3622e',
      name: 'LGE Bonus',
      totalDistribution: 250000,
      distributionPeriod: '1 year'
    },
    {
      claimableAddress: '0x4C093134657904a7c3f1e47a6D9a38955094Ebef',
      name: 'Early Lender',
      totalDistribution: 1500000,
      distributionPeriod: '1 year'
    },
    {
      claimableAddress: '0xe1fE8B5c3f5b592613305Fc6Ff551C67Cbe40E17',
      name: 'Early Borrower',
      totalDistribution: 1500000,
      distributionPeriod: '1 year'
    },
    {
      claimableAddress: '0x75C604A4C22Dc3c332B6de7D6f397bD5A6258409',
      name: 'Protocol Growth',
      totalDistribution: 19000000,
      distributionPeriod: '4 years'
    },
    {
      claimableAddress: '0xD346910E464e719476372A9E9fd0bf4DdEa09C0C',
      name: 'Global Incentives',
      totalDistribution: 59000000,
      distributionPeriod: '4 years'
    },
    {
      claimableAddress: '0x11CD7361b72bCE945bB9ABd81C3F4815940B545f',
      name: 'Core Team',
      totalDistribution: 9300000,
      distributionPeriod: '4 years'
    },
    {
      claimableAddress: '0xD528c3a1a891849E9C483afa7064205960b35cCb',
      name: 'Core Team',
      totalDistribution: 4000000,
      distributionPeriod: '4 years'
    }
  ],
  [CHAIN_IDS.OPTIMISM]: [],
  [CHAIN_IDS.ARBITRUM]: []
};

export {
  DISTRIBUTOR_ADDRESSES
};
