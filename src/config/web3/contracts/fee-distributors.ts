import { CHAIN_IDS } from '../../../config/web3/chains';

const FEE_DISTRIBUTOR_ADDRESSES: {
  [chainId: number]: string;
} = {
  [CHAIN_IDS.FANTOM]: '0x04d04f9a200d63d8ff5d2dc1f59bff49410c565a'
};

export {
  FEE_DISTRIBUTOR_ADDRESSES
};