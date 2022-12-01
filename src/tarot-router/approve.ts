/* eslint-disable no-invalid-this */
// TODO: <
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
// TODO: >

import { Contract } from '@ethersproject/contracts';
import { BigNumber } from '@ethersproject/bignumber';
import { defaultAbiCoder } from '@ethersproject/abi';
import { MaxUint256 } from '@ethersproject/constants';

import { PermitData } from '../hooks/useApprove';
import TarotRouter from '.';
import {
  Address,
  PoolTokenType,
  ApprovalType,
  BoostMaxxPoolInfo
} from '../types/interfaces';
import { WETH_ADDRESSES } from '../config/web3/contracts/weth';
import waitForTx from '../services/wait-for-tx';
import ERC20JSON from '../abis/contracts/IERC20.json';
import { SUPPLY_VAULT_MIGRATORS, SUPPLY_VAULT_ROUTERS } from '../config/web3/contracts/supply-vault';
import { XTAROT_ADDRESSES } from '../config/web3/contracts/tarot';
import { X_STAKING_POOL_CONTROLLER_ADDRESSES } from '../config/web3/contracts/x-staking-pool';
import { BOOSTMAXXER_ADDRESSES } from '../config/web3/contracts/boostmaxxer';
import { LENDING_POOL_DETAILS_MAP } from '../config/web3/contracts/lending-pools';
import { GAUGE_VAULT_PROXY_MANAGER_ADDRESS, SPIRIT_ADDRESS } from '../config/web3/contracts/wrapped-escrow-spirit';

const EIP712DOMAIN = [
  { name: 'name', type: 'string' },
  { name: 'version', type: 'string' },
  { name: 'chainId', type: 'uint256' },
  { name: 'verifyingContract', type: 'address' }
];
const PERMIT = [
  { name: 'owner', type: 'address' },
  { name: 'spender', type: 'address' },
  { name: 'value', type: 'uint256' },
  { name: 'nonce', type: 'uint256' },
  { name: 'deadline', type: 'uint256' }
];
const TYPES = {
  EIP712Domain: EIP712DOMAIN,
  Permit: PERMIT,
  BorrowPermit: PERMIT
};

export function getOwnerSpender(this: TarotRouter, lendingPoolId: string) : {owner: string, spender: string} {
  return {
    owner: this.account,
    spender: LENDING_POOL_DETAILS_MAP[lendingPoolId.toLowerCase()].tarotRouterAddress
  };
}

export async function getAllowance(
  this: TarotRouter,
  uniswapV2PairAddress: Address,
  poolTokenType: PoolTokenType,
  approvalType: ApprovalType
) : Promise<BigNumber> {
  const [poolToken, token] = await this.getContracts(uniswapV2PairAddress, poolTokenType);
  const wethAddress = WETH_ADDRESSES[this.chainId];
  if (token.address.toLowerCase() === wethAddress.toLowerCase() && approvalType === ApprovalType.UNDERLYING) {
    return MaxUint256;
  }

  const {
    owner,
    spender
  } = this.getOwnerSpender(uniswapV2PairAddress);

  // TODO: should use `switch`
  const allowance =
    (approvalType === ApprovalType.POOL_TOKEN) ? await poolToken.allowance(owner, spender) :
      (approvalType === ApprovalType.UNDERLYING) ? await token.allowance(owner, spender) :
        (approvalType === ApprovalType.BORROW) ? await poolToken.borrowAllowance(owner, spender) : 0;

  return BigNumber.from(allowance);
}

export async function getMigrateAllowance(
  this: TarotRouter,
  toApproveAddress: Address
) : Promise<BigNumber> {
  const c = this.newERC20(toApproveAddress);
  const allowance = await c.allowance(this.account, SUPPLY_VAULT_MIGRATORS[this.chainId]);
  return BigNumber.from(allowance);
}

export async function getMintAllowance(
  this: TarotRouter
) : Promise<BigNumber> {
  const c = this.newERC20(SPIRIT_ADDRESS);
  const allowance = await c.allowance(this.account, GAUGE_VAULT_PROXY_MANAGER_ADDRESS);
  return BigNumber.from(allowance);
}

export async function getStakeAllowance(
  this: TarotRouter,
  toApproveAddress: Address
) : Promise<BigNumber> {
  const wethAddress = WETH_ADDRESSES[this.chainId];
  if (toApproveAddress.toLowerCase() === wethAddress.toLowerCase()) {
    return MaxUint256;
  }
  const c = this.newERC20(toApproveAddress);
  const allowance = await c.allowance(this.account, SUPPLY_VAULT_ROUTERS[this.chainId]);
  return BigNumber.from(allowance);
}

export async function getXStakeAllowance(
  this: TarotRouter
) : Promise<BigNumber> {
  const c = this.newERC20(XTAROT_ADDRESSES[this.chainId]);
  const allowance = await c.allowance(this.account, X_STAKING_POOL_CONTROLLER_ADDRESSES[this.chainId]);
  return BigNumber.from(allowance);
}

export async function getBoostStakeAllowance(
  this: TarotRouter,
  poolInfo: BoostMaxxPoolInfo
) : Promise<BigNumber> {
  const c = this.newERC20(poolInfo.id);
  const allowance = await c.allowance(this.account, BOOSTMAXXER_ADDRESSES[this.chainId]);
  return BigNumber.from(allowance);
}

export async function approveMigrate(
  this: TarotRouter,
  toApproveAddress: Address,
  // eslint-disable-next-line @typescript-eslint/ban-types
  onTransactionHash: Function
): Promise<void> {
  const c = new Contract(toApproveAddress, ERC20JSON, this.library.getSigner(this.account).connectUnchecked());
  const txTask = c.approve(SUPPLY_VAULT_MIGRATORS[this.chainId], MaxUint256);
  const receipt = await waitForTx(this, txTask);
  onTransactionHash(receipt.transactionHash);
}

export async function approveMint(
  this: TarotRouter,
  // eslint-disable-next-line @typescript-eslint/ban-types
  onTransactionHash: Function
): Promise<void> {
  const c = new Contract(SPIRIT_ADDRESS, ERC20JSON, this.library.getSigner(this.account).connectUnchecked());
  const txTask = c.approve(GAUGE_VAULT_PROXY_MANAGER_ADDRESS, MaxUint256);
  const receipt = await waitForTx(this, txTask);
  onTransactionHash(receipt.transactionHash);
}

export async function approveStake(
  this: TarotRouter,
  toApproveAddress: Address,
  // eslint-disable-next-line @typescript-eslint/ban-types
  onTransactionHash: Function
): Promise<void> {
  const c = new Contract(toApproveAddress, ERC20JSON, this.library.getSigner(this.account).connectUnchecked());
  const txTask = c.approve(SUPPLY_VAULT_ROUTERS[this.chainId], MaxUint256);
  const receipt = await waitForTx(this, txTask);
  onTransactionHash(receipt.transactionHash);
}

export async function approveXStake(
  this: TarotRouter,
  // eslint-disable-next-line @typescript-eslint/ban-types
  onTransactionHash: Function
): Promise<void> {
  const c = new Contract(XTAROT_ADDRESSES[this.chainId], ERC20JSON, this.library.getSigner(this.account).connectUnchecked());
  const txTask = c.approve(X_STAKING_POOL_CONTROLLER_ADDRESSES[this.chainId], MaxUint256);
  const receipt = await waitForTx(this, txTask);
  onTransactionHash(receipt.transactionHash);
}

export async function approveBoostStake(
  this: TarotRouter,
  poolInfo: BoostMaxxPoolInfo,
  // eslint-disable-next-line @typescript-eslint/ban-types
  onTransactionHash: Function
): Promise<void> {
  const c = new Contract(poolInfo.id, ERC20JSON, this.library.getSigner(this.account).connectUnchecked());
  const txTask = c.approve(BOOSTMAXXER_ADDRESSES[this.chainId], MaxUint256);
  const receipt = await waitForTx(this, txTask);
  onTransactionHash(receipt.transactionHash);
}

export async function approve(
  this: TarotRouter,
  uniswapV2PairAddress: Address,
  poolTokenType: PoolTokenType,
  approvalType: ApprovalType,
  amount: BigNumber,
  // eslint-disable-next-line @typescript-eslint/ban-types
  onTransactionHash: Function
): Promise<void> {
  const { spender } = this.getOwnerSpender(uniswapV2PairAddress);
  const [
    poolToken,
    token
  ] = await this.getContracts(uniswapV2PairAddress, poolTokenType);

  let txTask;
  if (approvalType === ApprovalType.POOL_TOKEN) {
    const c = new Contract(poolToken.address, poolToken.interface, this.library.getSigner(this.account).connectUnchecked());
    txTask = c.approve(spender, amount);
  }
  if (approvalType === ApprovalType.UNDERLYING) {
    const c = new Contract(token.address, token.interface, this.library.getSigner(this.account).connectUnchecked());
    txTask = c.approve(spender, amount);
  }
  if (approvalType === ApprovalType.BORROW) {
    const c = new Contract(poolToken.address, poolToken.interface, this.library.getSigner(this.account).connectUnchecked());
    txTask = c.borrowApprove(spender, amount);
  }
  const receipt = await waitForTx(this, txTask);
  onTransactionHash(receipt.transactionHash);
}

export async function getPermitData(
  this: TarotRouter,
  uniswapV2PairAddress: Address,
  poolTokenType: PoolTokenType,
  approvalType: ApprovalType,
  amount: BigNumber,
  deadlineArg: BigNumber | null,
  callBack: (permitData: PermitData) => void
): Promise<void> {
  try {
    if (approvalType === ApprovalType.UNDERLYING && poolTokenType !== PoolTokenType.Collateral) {
      return callBack(null);
    }

    const {
      owner,
      spender
    } = this.getOwnerSpender(uniswapV2PairAddress);
    const [
      poolToken,
      token
    ] = await this.getContracts(uniswapV2PairAddress, poolTokenType);
    const c = approvalType === ApprovalType.UNDERLYING ? token : poolToken;
    const contract = new Contract(c.address, c.interface, this.library.getSigner(this.account).connectUnchecked());
    const nonce = await contract.nonces(owner);
    const name = await contract.name();
    const deadline = deadlineArg ? deadlineArg : this.getDeadline();

    const data = {
      types: TYPES,
      domain: {
        name: name,
        version: '1',
        chainId: this.chainId,
        verifyingContract: contract.address
      },
      primaryType: approvalType === ApprovalType.BORROW ? 'BorrowPermit' : 'Permit',
      message: {
        owner: owner,
        spender: spender,
        value: amount.toString(),
        nonce: BigNumber.from(nonce).toHexString(),
        deadline: deadline.toNumber()
      }
    };

    /**
     * MEMO: inspired by:
     * - https://gist.github.com/ajb413/6ca63eb868e179a9c0a3b8dc735733cf
     * - https://www.gitmemory.com/issue/ethers-io/ethers.js/1020/683313086
     */
    const signer = this.library.getSigner(this.account);
    const signature =
      await EIP712.sign(
        data.domain,
        data.primaryType,
        data.message,
        data.types,
        signer
      );
    const permitData: string = defaultAbiCoder.encode(
      [
        'bool',
        'uint8',
        'bytes32',
        'bytes32'
      ],
      [
        false,
        signature.v,
        signature.r,
        signature.s
      ]
    );
    callBack({
      permitData,
      deadline,
      amount
    });
  } catch (error) {
    console.log('[getPermitData] error.message => ', error.message);
    callBack(null);
  }
}
