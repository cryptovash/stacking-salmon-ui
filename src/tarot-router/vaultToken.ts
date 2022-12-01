/* eslint-disable no-invalid-this */
import TarotRouter from '.';
import { Address } from '../types/interfaces';

export async function getPendingRewards(this: TarotRouter, uniswapV2PairAddress: Address) : Promise<number[]> {
  const fullLendingPoolsData = await this.getFullLendingPoolsData();
  if (!fullLendingPoolsData || !uniswapV2PairAddress || !fullLendingPoolsData[uniswapV2PairAddress.toLowerCase()] || !fullLendingPoolsData[uniswapV2PairAddress.toLowerCase()].pendingRewards) {
    return [];
  }
  return fullLendingPoolsData[uniswapV2PairAddress.toLowerCase()].pendingRewards;
}

// Reinvest Bounty
export async function getReinvestBounties(this: TarotRouter, uniswapV2PairAddress: Address) : Promise<number[]> {
  const fullLendingPoolsData = await this.getFullLendingPoolsData();
  if (!fullLendingPoolsData || !uniswapV2PairAddress || !fullLendingPoolsData[uniswapV2PairAddress.toLowerCase()] || !fullLendingPoolsData[uniswapV2PairAddress.toLowerCase()].reinvestBounties) {
    return [];
  }
  return fullLendingPoolsData[uniswapV2PairAddress.toLowerCase()].reinvestBounties;
}

export async function isVaultActive(this: TarotRouter, uniswapV2PairAddress: Address) : Promise<boolean> {
  const fullLendingPoolsData = await this.getFullLendingPoolsData();
  if (!fullLendingPoolsData || !uniswapV2PairAddress || !fullLendingPoolsData[uniswapV2PairAddress.toLowerCase()] || !fullLendingPoolsData[uniswapV2PairAddress.toLowerCase()].vaultActive) {
    return false;
  }
  return fullLendingPoolsData[uniswapV2PairAddress.toLowerCase()].vaultActive;
}

export async function getVaultAPY(this: TarotRouter, uniswapV2PairAddress: Address) : Promise<number> {
  const fullLendingPoolsData = await this.getFullLendingPoolsData();
  if (!fullLendingPoolsData || !uniswapV2PairAddress || !fullLendingPoolsData[uniswapV2PairAddress.toLowerCase()] || !fullLendingPoolsData[uniswapV2PairAddress.toLowerCase()].vaultAPR) {
    return 0;
  }
  return fullLendingPoolsData[uniswapV2PairAddress.toLowerCase()].vaultAPR;
}