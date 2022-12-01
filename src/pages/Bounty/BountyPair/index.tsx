import React from 'react';
import BountyPairCard from '../../../components/BountyPairCard';
import { getVaultDetails } from '../../../config/web3/contracts/vault-details';
import { useFullLendingPoolsData } from '../../../hooks/useData';
import usePairAddress from '../../../hooks/usePairAddress';
import { getAB } from '../../../utils';

const BountyPair = (): JSX.Element => {
  const lendingPoolId = usePairAddress();
  const fullLendingPoolsMap = useFullLendingPoolsData() || {};
  const pool = fullLendingPoolsMap[lendingPoolId.toLowerCase()];
  if (!pool) {
    return <></>;
  }
  const {
    dex,
    pendingRewards,
    reinvestBounties,
    rewardsTokensAddresses,
    rewardsTokensSymbols } = pool;
  const [symbolA, symbolB] = getAB(pool.symbol);
  const [tokenIconA, tokenIconB] = getAB(pool.tokenIcon);

  const vaultDetails = getVaultDetails(lendingPoolId);

  return (
    <BountyPairCard
      dex={dex}
      vaultDetails={vaultDetails}
      symbolA={symbolA}
      symbolB={symbolB}
      pendingRewards={pendingRewards}
      reinvestBounties={reinvestBounties}
      rewardsTokensSymbols={rewardsTokensSymbols}
      rewardsTokensAddresses={rewardsTokensAddresses}
      tokenIconA={tokenIconA}
      tokenIconB={tokenIconB}
      stable={pool.stable} />
  );
};

export default BountyPair;