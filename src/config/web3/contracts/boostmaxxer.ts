import { CHAIN_IDS } from '../../../config/web3/chains';

const BOOSTMAXXER_ADDRESSES: {
  [chainId: number]: string;
} = {
  [CHAIN_IDS.FANTOM]: '0xe21ca4536e447C13C79B807C0Df4f511A21Db6c7'
};

const SOLIDLY_VOTER_ADDRESSES: {
  [chainId: number]: string;
} = {
  [CHAIN_IDS.FANTOM]: '0xdC819F5d05a6859D2faCbB4A44E5aB105762dbaE'
};

const SOLID_ADDRESSES: {
  [chainId: number]: string;
} = {
  [CHAIN_IDS.FANTOM]: '0x888ef71766ca594ded1f0fa3ae64ed2941740a20'
};
export {
  BOOSTMAXXER_ADDRESSES, SOLIDLY_VOTER_ADDRESSES, SOLID_ADDRESSES
};
