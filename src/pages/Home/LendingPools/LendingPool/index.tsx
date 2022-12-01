
import LendingPoolCard from '../../../../components/LendingPoolCard';
import { LENDING_POOL_DETAILS_MAP } from '../../../../config/web3/contracts/lending-pools';
import { Link } from 'react-router-dom';
import {
  PoolDisplayDetails, TEN_18
} from '../../../../types/interfaces';
import { parse18 } from '../../../../utils/big-amount';
import React from 'react';

interface Props {
  lendingPool: PoolDisplayDetails;
  greaterThanMd: boolean;
}

const LendingPool = ({
  lendingPool
}: Props): JSX.Element => {
  return (
    <Link
      to={lendingPool.lendingPoolUrl}
      className='block'>
      <LendingPoolCard
        vaultDetails={lendingPool.vaultDetails}
        dex={lendingPool.dex}
        tokenIconA={lendingPool.tokenIcon[0]}
        tokenIconB={lendingPool.tokenIcon[1]}
        symbolA={lendingPool.symbol[0]}
        symbolB={lendingPool.symbol[1]}
        totalLp={parse18(lendingPool.totalLp)}
        totalCollateralUSD={lendingPool.totalCollateralUSD}
        supplyUSDA={lendingPool.totalSupplyUSD[0]}
        supplyUSDB={lendingPool.totalSupplyUSD[1]}
        totalBorrowsUSDA={lendingPool.totalBorrowedUSD[0]}
        totalBorrowsUSDB={lendingPool.totalBorrowedUSD[1]}
        utilizationRateA={lendingPool.utilization[0]}
        utilizationRateB={lendingPool.utilization[1]}
        supplyAPYA={lendingPool.supplyAPR[0]}
        supplyAPYB={lendingPool.supplyAPR[1]}
        borrowAPYA={lendingPool.borrowAPR[0]}
        borrowAPYB={lendingPool.borrowAPR[1]}
        dexAPY={lendingPool.dexAPR}
        vaultAPY={lendingPool.vaultAPR}
        farmingPoolAPYA={lendingPool.farmingPoolAPR[0]}
        farmingPoolAPYB={lendingPool.farmingPoolAPR[1]}
        leverage={lendingPool.multiplier}
        unleveragedAPY={lendingPool.unleveragedAPR}
        leveragedAPY={lendingPool.leveragedAPR}
        oracleIsInitialized={lendingPool.oracleIsInitialized}
        isVaultToken={lendingPool.vaultActive}
        hasFarming={(lendingPool.hasFarming[0] && lendingPool.farmingPoolAPR[0] > 0) || (lendingPool.hasFarming[1] && lendingPool.farmingPoolAPR[1] > 0)}
        lendingPool={LENDING_POOL_DETAILS_MAP[lendingPool.id.toLowerCase()]}
        poolDisabled={lendingPool.poolDisabled}
        poolDeactivated={lendingPool.poolDeactivated}
        boostMultiplier={lendingPool.boostMultiplier || TEN_18}
        stable={lendingPool.stable} />
    </Link>
  );
};

export default LendingPool;