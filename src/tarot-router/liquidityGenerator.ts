/* eslint-disable no-invalid-this */
import { BigNumber } from '@ethersproject/bignumber';
import TarotRouter from '.';

export async function getLGEPeriodBegin(this: TarotRouter) : Promise<number> {
  if (!this.liquidityGenerator) {
    return 0;
  }
  return (await this.liquidityGenerator.periodBegin()).toNumber();
}

export async function getLGEPeriodEnd(this: TarotRouter) : Promise<number> {
  if (!this.liquidityGenerator) {
    return 0;
  }
  return (await this.liquidityGenerator.periodEnd()).toNumber();
}

export async function getLGEBonusEnd(this: TarotRouter) : Promise<number> {
  if (!this.liquidityGenerator) {
    return 0;
  }
  return (await this.liquidityGenerator.bonusEnd()).toNumber();
}

export async function getLiquidityGenDistributorShares(this: TarotRouter) : Promise<BigNumber> {
  if (!this.liquidityGenerator) {
    return BigNumber.from(0);
  }
  return (await this.liquidityGenerator.distributorRecipients(this.account)).shares;
}

export async function getLiquidityGenBonusDistributorShares(this: TarotRouter) : Promise<BigNumber> {
  if (!this.liquidityGenerator) {
    return BigNumber.from(0);
  }
  return (await this.liquidityGenerator.bonusDistributorRecipients(this.account)).shares;
}

export async function getLiquidityGenDistributorTotalShares(this: TarotRouter) : Promise<BigNumber> {
  if (!this.liquidityGenerator) {
    return BigNumber.from(0);
  }
  return (await this.liquidityGenerator.distributorTotalShares());
}

export async function getLiquidityGenBonusDistributorTotalShares(this: TarotRouter) : Promise<BigNumber> {
  if (!this.liquidityGenerator) {
    return BigNumber.from(0);
  }
  return (await this.liquidityGenerator.bonusDistributorTotalShares());
}
