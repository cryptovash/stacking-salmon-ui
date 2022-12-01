import { BigNumber } from '@ethersproject/bignumber';
import { CHAIN_IDS } from '../../../config/web3/chains';
import { Address } from '../../../types/interfaces';

const X_STAKING_POOL_CONTROLLER_ADDRESSES: {
  [chainId: number]: string;
} = {
  [CHAIN_IDS.FANTOM]: '0x466ebd9ec2027776fa11a982e9bbe4f67aa6e86b'
};

const X_STAKING_POOLS: {
  [chainId: number]: {
    [poolId: number]: XStakingPoolInfo
  }
} = {
  [CHAIN_IDS.FANTOM]: {
    0:
    {
      rewardTokenSymbol: 'tFTM',
      rewardTokenDecimals: BigNumber.from(18),
      rewardTokenAddress: '0x0defef0c977809db8c1a3f13fd8dacbd565d968e',
      rewardTokenIsSupplyVaultToken: true
    },
    1:
    {
      rewardTokenSymbol: 'tTOMB',
      rewardTokenDecimals: BigNumber.from(18),
      rewardTokenAddress: '0xc2218e377caff2cc005093124c31120aa5c902d1',
      rewardTokenIsSupplyVaultToken: true
    },
    2:
    {
      rewardTokenSymbol: 'xBOO',
      rewardTokenDecimals: BigNumber.from(18),
      rewardTokenAddress: '0xa48d959ae2e88f1daa7d5f611e01908106de7598',
      rewardTokenIsSupplyVaultToken: false
    }
  }
};

export interface XStakingPoolInfo {
  rewardTokenSymbol: string;
  rewardTokenAddress: Address;
  rewardTokenDecimals: BigNumber;
  rewardTokenIsSupplyVaultToken: boolean;
  pricePairAddress?: Address;
}

export {
  X_STAKING_POOL_CONTROLLER_ADDRESSES, X_STAKING_POOLS
};