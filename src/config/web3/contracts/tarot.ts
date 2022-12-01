import { CHAIN_IDS } from '../../../config/web3/chains';

const TAROT_ADDRESSES: {
  [chainId: number]: string;
} = {
  [CHAIN_IDS.FANTOM]: '0xc5e2b037d30a390e62180970b3aa4e91868764cd',
  [CHAIN_IDS.OPTIMISM]: '0x375488f097176507e39b9653b88fdc52cde736bf'
};

const XTAROT_ADDRESSES: {
  [chainId: number]: string;
} = {
  [CHAIN_IDS.FANTOM]: '0x74d1d2a851e339b8cb953716445be7e8abdf92f4'
};

export {
  TAROT_ADDRESSES,
  XTAROT_ADDRESSES
};
