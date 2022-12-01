import { CHAIN_IDS } from '../../../config/web3/chains';

const CLAIM_AGGREGATOR_ADDRESSES: {
  [chainId: number]: string;
} = {
  [CHAIN_IDS.FANTOM]: '0x5494b29f78714397e96086ba7542e364842a74df'
};

export {
  CLAIM_AGGREGATOR_ADDRESSES
};