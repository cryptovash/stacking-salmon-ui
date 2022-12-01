/* eslint-disable no-invalid-this */
import { SUPPLY_VAULTS } from '../config/web3/contracts/supply-vault';
import { Address, BigAmount, EMPTY_SUPPLY_VAULT, SupplyVault, ZERO_BIG_AMOUNT } from '../types/interfaces';
import { parse18, parseNumber } from '../utils/big-amount';
import TarotRouter from '.';

export async function getSupplyVault(this: TarotRouter, supplyVaultAddress: Address) : Promise<SupplyVault> {
  const supplyVaultsMap = await this.getFullSupplyVaultsData();
  return supplyVaultsMap[supplyVaultAddress.toLowerCase()] || EMPTY_SUPPLY_VAULT;
}

export async function initializeSupplyVaultUnderlyingBalance(this: TarotRouter, supplyVaultAddress: Address, account: Address) : Promise<BigAmount> {
  try {
    const supplyVaultInfo = SUPPLY_VAULTS[this.chainId][supplyVaultAddress];
    const supplyVaultContract = this.newSupplyVault(supplyVaultAddress);
    const underlyingBalanceForAccount = await supplyVaultContract.callStatic.underlyingBalanceForAccount(account);
    return {
      amount: underlyingBalanceForAccount,
      decimals: supplyVaultInfo.underlyingDecimals
    };
  } catch (error) {
    return ZERO_BIG_AMOUNT;
  }
}

export async function getSupplyVaultUnderlyingBalance(this: TarotRouter, supplyVaultAddress: Address, account?: Address) : Promise<BigAmount> {
  account = account || this.account;
  if (!this.supplyVaultUnderlyingBalanceCache[account]) {
    this.supplyVaultUnderlyingBalanceCache[account] = {};
  }
  if (!this.supplyVaultUnderlyingBalanceCache[account][supplyVaultAddress]) {
    this.supplyVaultUnderlyingBalanceCache[account][supplyVaultAddress] = this.initializeSupplyVaultUnderlyingBalance(supplyVaultAddress, account);
  }
  return this.supplyVaultUnderlyingBalanceCache[account][supplyVaultAddress];
}

export async function getSupplyVaultTVLForAccount(this: TarotRouter, account?: Address) : Promise<number> {
  account = account || this.account;
  let tvl = 0;
  const tokenPriceMapTask = this.getTokenPrices();
  const supplyVaults = Object.keys(SUPPLY_VAULTS[this.chainId] || {});
  const [balances, tokenPriceMap] = await Promise.all([
    Promise.all(supplyVaults.map(supplyVaultAddress => this.getSupplyVaultUnderlyingBalance(supplyVaultAddress, account))),
    tokenPriceMapTask
  ]);
  for (let i = 0; i < balances.length; i++) {
    const balance = balances[i];
    const price = parse18(tokenPriceMap[SUPPLY_VAULTS[this.chainId][supplyVaults[i]].underlyingAddress.toLowerCase()].priceUSD.value);
    tvl += (parseNumber(balance) * price);
  }
  return tvl;
}
