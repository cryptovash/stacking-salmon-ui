import { ReactComponent as SpinIcon } from '../src/assets/images/icons/spin.svg';
import clsx from 'clsx';
import LendingPoolCard from '../src/components/LendingPoolCard';
import { getVaultDetails } from '../src/config/web3/contracts/vault-details';
import usePairAddress from '../src/hooks/usePairAddress';
import { TEN_18 } from '../src/types/interfaces';
import { getAB } from '../src/utils';
import { parse18 } from '../src/utils/big-amount';
import { LAYOUT } from '../src/utils/constants/styles';
import {
  useFullLendingPoolsData
} from '../src/hooks/useData';
import AccountLendingPool from '../src/pages/LendingPool/LendingPoolContent/AccountLendingPool';
import './index.scss';
import React from 'react';

export default function LendingPoolContent(): JSX.Element {
  const lendingPoolId = usePairAddress();
  const fullLendingPoolsData = useFullLendingPoolsData() || {};
  const pool = fullLendingPoolsData[lendingPoolId.toLowerCase()] || {};
  const vaultDetails = getVaultDetails(lendingPoolId.toLowerCase());
  const {
    oracleIsInitialized,
    dex,
    tokenIcon,
    symbol,
    totalCollateralUSD,
    totalLp,
    totalBorrowedUSD,
    totalSupplyUSD,
    utilization,
    borrowAPR,
    supplyAPR,
    multiplier,
    vaultAPR,
    dexAPR,
    farmingPoolAPR,
    hasFarming,
    poolDisabled,
    poolDeactivated,
    boostMultiplier,
    priceFactor
  } = pool;
  const [tokenIconA, tokenIconB] = getAB(tokenIcon);
  const [symbolA, symbolB] = getAB(symbol);
  const [supplyUSDA, supplyUSDB] = getAB(totalSupplyUSD);
  const [totalBorrowsUSDA, totalBorrowsUSDB] = getAB(totalBorrowedUSD);
  const [utilizationRateA, utilizationRateB] = getAB(utilization);
  const [borrowAPYA, borrowAPYB] = getAB(borrowAPR);
  const [supplyAPYA, supplyAPYB] = getAB(supplyAPR);
  const leverage = multiplier;
  const vaultAPY = vaultAPR;
  const dexAPY = dexAPR;
  const [farmingPoolAPYA, farmingPoolAPYB] = getAB(farmingPoolAPR);
  const averageAPY = (borrowAPYA - farmingPoolAPYA) * priceFactor / (priceFactor + 1) + (borrowAPYB - farmingPoolAPYB) / (priceFactor + 1);
  // const averageAPY = (borrowAPYA + borrowAPYB - farmingPoolAPYA - farmingPoolAPYB) / 2;
  const leveragedAPY = (dexAPY + vaultAPY) * leverage - averageAPY * (leverage - 1);
  const unleveragedAPY = (dexAPY + vaultAPY);
  const [hasFarmingA, hasFarmingB] = getAB(hasFarming);

  if (!pool || !pool.symbol) {
    return (
      <div
        className='z-tarotAppBar bg-tarotBlackHaze fixed left-0 min-w-full flex justify-center items-center'
        style={{ top: `${LAYOUT.appBarHeight}px`, height: `calc(100% - ${LAYOUT.appBarHeight}px)` }}>
        <SpinIcon
          className={clsx(
            'animate-spin',
            'w-8',
            'h-8',
            'text-tarotJade-200',
            'filter',
            'brightness-150'
          )} />
      </div>
    );
  }

  return (
    <>{!pool &&
      <div
        className='z-tarotAppBar bg-tarotBlackHaze fixed left-0 min-w-full flex justify-center items-center'
        style={{ top: `${LAYOUT.appBarHeight}px`, height: `calc(100% - ${LAYOUT.appBarHeight}px)` }}>
        <SpinIcon
          className={clsx(
            'animate-spin',
            'w-8',
            'h-8',
            'text-tarotJade-200',
            'filter',
            'brightness-150'
          )} />
      </div>}
    <LendingPoolCard
      vaultDetails={vaultDetails}
      dex={dex}
      tokenIconA={tokenIconA}
      tokenIconB={tokenIconB}
      symbolA={symbolA}
      symbolB={symbolB}
      totalLp={parse18(totalLp)}
      totalCollateralUSD={totalCollateralUSD}
      supplyUSDA={supplyUSDA}
      supplyUSDB={supplyUSDB}
      totalBorrowsUSDA={totalBorrowsUSDA}
      totalBorrowsUSDB={totalBorrowsUSDB}
      utilizationRateA={utilizationRateA}
      utilizationRateB={utilizationRateB}
      borrowAPYA={borrowAPYA}
      borrowAPYB={borrowAPYB}
      supplyAPYA={supplyAPYA}
      supplyAPYB={supplyAPYB}
      dexAPY={dexAPY}
      vaultAPY={vaultAPY}
      farmingPoolAPYA={farmingPoolAPYA}
      farmingPoolAPYB={farmingPoolAPYB}
      leverage={leverage}
      unleveragedAPY={unleveragedAPY}
      leveragedAPY={leveragedAPY}
      isDetail={true}
      poolDisabled={poolDisabled}
      poolDeactivated={poolDeactivated}
      oracleIsInitialized={oracleIsInitialized}
      isVaultToken={vaultAPY > 0}
      hasFarming={(hasFarmingA && farmingPoolAPYA > 0) || (hasFarmingB && farmingPoolAPYB > 0)}
      boostMultiplier={boostMultiplier || TEN_18}
      stable={pool.stable} />
    {oracleIsInitialized && <AccountLendingPool />}
    </>
  );
}
