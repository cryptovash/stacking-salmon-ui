import { Address } from '../../../types/interfaces';
import { LENDING_POOL_DETAILS_MAP } from './lending-pools';

enum VaultType {
  TOMB='TOMB',
  LIF3='LIF3',
  T2OMB='T2OMB',
  T3OMB='T3OMB',
  BASED='BASED',
  SPIRIT_BOOSTED='SPIRIT_BOOSTED',
  SPIRIT_V2='SPIRIT_V2',
  OXD_V1='OXD_V1',
  OXD='OXD',
  VEDAO='VEDAO',
  SOLIDEX='SOLIDEX',
  SPOOKY_V2='SPOOKY_V2',
  ZIP='ZIP',
  VELODROME='VELODROME',
  XCAL='XCAL'
}

const SPIRIT_BOOSTED_VAULT: VaultDetails = {
  type: VaultType.SPIRIT_BOOSTED,
  veTokenAddress: '0x2fbff41a9efaeae77538bd63f1ea489494acdc08',
  masterChefAddress: '0xcf8660e267d44cc804ddbee6b1ce44f9ed564889',
  rewardsTokenAddress: '0x5cc61a78f164885776aa610fb0fe1257df78e59b',
  rewardsTokenDecimals: 18,
  rewardsTokenSymbol: 'SPIRIT',
  vaultName: 'Spirit Boosted',
  vaultFarmLabel: 'on Spirit with boosted rewards',
  iconPath: '/assets/images/dex/spirit.png',
  cardColor: '#1f3c3e'
};

const SPIRIT_V2_VAULT: VaultDetails = {
  type: VaultType.SPIRIT_V2,
  veTokenAddress: '0x2fbff41a9efaeae77538bd63f1ea489494acdc08',
  gaugeVaultProxyAddress: '0xcf8660e267d44cc804ddbee6b1ce44f9ed564889',
  gaugeVaultProxyAdminAddress: '0x44f7688aba71e462ac44fb2424b6e0cd83e0d47d',
  rewardsTokenAddress: '0x5cc61a78f164885776aa610fb0fe1257df78e59b',
  rewardsTokenDecimals: 18,
  rewardsTokenSymbol: 'SPIRIT',
  vaultName: 'Spirit V2',
  vaultFarmLabel: 'on Spirit V2 with boosted rewards',
  iconPath: '/assets/images/dex/spirit-v2.png',
  cardColor: '#1f3c3e'
};

const TOMB_TSHARE_REWARDS_POOL: VaultDetails = {
  type: VaultType.TOMB,
  masterChefAddress: '0xcc0a87f7e7c693042a9cc703661f5060c80acb43',
  rewardsTokenAddress: '0x4cdf39285d7ca8eb3f090fda0c069ba5f4145b37',
  rewardsTokenDecimals: 18,
  rewardsTokenSymbol: 'TSHARE',
  pendingRewardFunctionName: 'pendingShare',
  rewardRateFunctionName: 'tSharePerSecond',
  rewardEndFunctionName: 'poolEndTime',
  vaultName: 'Tomb Cemetery',
  vaultFarmLabel: 'in the Tomb Cemetery',
  iconPath: '/assets/images/vault/tomb.png',
  cardColor: '#3f1d5f'
};

const TOMB_LSHARE_REWARDS_POOL: VaultDetails = {
  type: VaultType.LIF3,
  masterChefAddress: '0x1f832dfba15346d25438cf7ac683b013ed03e32f',
  rewardsTokenAddress: '0xcbe0ca46399af916784cadf5bcc3aed2052d6c45',
  rewardsTokenDecimals: 18,
  rewardsTokenSymbol: 'LSHARE',
  pendingRewardFunctionName: 'pendingShare',
  rewardRateFunctionName: 'emissionPerSecond',
  rewardEndFunctionName: 'poolEndTime',
  vaultName: 'Tomb Cemetery V2',
  vaultFarmLabel: 'in Tomb Cemetery V2',
  iconPath: '/assets/images/vault/lif3.png',
  cardColor: '#2A4874'
};

const T2OMB_2SHARE_REWARDS_POOL: VaultDetails = {
  type: VaultType.T2OMB,
  masterChefAddress: '0x8d426eb8c7e19b8f13817b07c0ab55d30d209a96',
  rewardsTokenAddress: '0xc54a1684fd1bef1f077a336e6be4bd9a3096a6ca',
  rewardsTokenDecimals: 18,
  rewardsTokenSymbol: '2SHARES',
  pendingRewardFunctionName: 'pendingShare',
  rewardRateFunctionName: 'tSharePerSecond',
  rewardEndFunctionName: 'poolEndTime',
  vaultName: '2omb',
  vaultFarmLabel: 'on 2omb',
  iconPath: '/assets/images/vault/2omb.png',
  cardColor: '#391f55'
};

const T3OMB_3SHARE_REWARDS_POOL: VaultDetails = {
  type: VaultType.T3OMB,
  masterChefAddress: '0x1040085d268253e8d4f932399a8019f527e58d04',
  rewardsTokenAddress: '0x6437adac543583c4b31bf0323a0870430f5cc2e7',
  rewardsTokenDecimals: 18,
  rewardsTokenSymbol: '3SHARES',
  pendingRewardFunctionName: 'pendingShare',
  rewardRateFunctionName: 'tSharePerSecond',
  rewardEndFunctionName: 'poolEndTime',
  vaultName: '3omb',
  vaultFarmLabel: 'on 3omb',
  iconPath: '/assets/images/vault/3omb.png',
  cardColor: '#5f2a2a'
};

const BASED_BSHARE_REWARDS_POOL: VaultDetails = {
  type: VaultType.BASED,
  masterChefAddress: '0xac0fa95058616d7539b6eecb6418a68e7c18a746',
  rewardsTokenAddress: '0x49c290ff692149a4e16611c694fded42c954ab7a',
  rewardsTokenDecimals: 18,
  rewardsTokenSymbol: 'BSHARE',
  pendingRewardFunctionName: 'pendingShare',
  rewardRateFunctionName: 'bSharePerSecond',
  rewardEndFunctionName: 'poolEndTime',
  vaultName: 'Based Agora',
  vaultFarmLabel: 'in the Based Agora',
  iconPath: '/assets/images/vault/based.png',
  cardColor: '#3c2e1a'
};

const OXD_VAULT: VaultDetails = {
  type: VaultType.OXD_V1,
  masterChefAddress: '0xa7821c3e9fc1bf961e280510c471031120716c3d',
  rewardsTokenAddress: '0xc165d941481e68696f43ee6e99bfb2b23e0e3114',
  rewardsTokenDecimals: 18,
  rewardsTokenSymbol: 'OXD',
  pendingRewardFunctionName: 'pendingOXD',
  rewardRateFunctionName: 'oxdPerSecond',
  rewardEndFunctionName: 'endTime',
  vaultName: '0xDAO v1',
  vaultFarmLabel: 'on 0xDAO v1',
  iconPath: '/assets/images/vault/0xdao.png',
  cardColor: '#203661'
};

const VEDAO_VAULT: VaultDetails = {
  type: VaultType.VEDAO,
  masterChefAddress: '0xe04c26444d37fe103b9cc8033c99b09d47056f51',
  rewardsTokenAddress: '0x911da02c1232a3c3e1418b834a311921143b04d7',
  rewardsTokenDecimals: 18,
  rewardsTokenSymbol: 'WeVE',
  pendingRewardFunctionName: 'pendingRewards',
  rewardRateFunctionName: 'rewardsPerBlock',
  rewardEndFunctionName: 'endBlock',
  vaultName: 'veDAO',
  vaultFarmLabel: 'on veDAO',
  iconPath: '/assets/images/vault/vedao.png',
  cardColor: '#29494d'
};

const SOLIDEX_VAULT: VaultDetails = {
  type: VaultType.SOLIDEX,
  vaultName: 'Solidex',
  vaultFarmLabel: 'on Solidex',
  iconPath: '/assets/images/vault/solidex.png',
  veTokenAddress: '0xcbd8fea77c2452255f59743f55a3ea9d83b3c72b',
  lpDepositorAddress: '0x26e1a0d851cf28e697870e1b7f053b605c8b060f',
  rewardsTokenAddress: '0x888ef71766ca594ded1f0fa3ae64ed2941740a20',
  rewardsTokenDecimals: 18,
  rewardsTokenSymbol: 'SOLID',
  rewardsTokenBAddress: '0xd31fcd1f7ba190dbc75354046f6024a9b86014d7',
  rewardsTokenBDecimals: 18,
  cardColor: '#612e48'
};

const OXDV2_VAULT: VaultDetails = {
  type: VaultType.OXD,
  vaultName: '0xDAO',
  vaultFarmLabel: 'on 0xDAO',
  iconPath: '/assets/images/vault/0xdao.png',
  veTokenAddress: '0xcbd8fea77c2452255f59743f55a3ea9d83b3c72b',
  oxVoterProxyAddress: '0xda0027f2368ba3cb65a494b1fc7ea7fd05ab42dd',
  rewardsTokenAddress: '0x888ef71766ca594ded1f0fa3ae64ed2941740a20',
  rewardsTokenDecimals: 18,
  rewardsTokenSymbol: 'SOLID',
  rewardsTokenBAddress: '0xc5a9848b9d145965d821aaec8fa32aaee026492d',
  rewardsTokenBDecimals: 18,
  cardColor: '#203661'
};

const SPOOKY_V2_VAULT: VaultDetails = {
  type: VaultType.SPOOKY_V2,
  masterChefAddress: '0x18b4f774fdc7bf685daeef66c2990b1ddd9ea6ad',
  rewardsTokenAddress: '0x841fad6eae12c286d1fd18d1d525dffa75c7effe',
  rewardsTokenDecimals: 18,
  rewardsTokenSymbol: 'BOO',
  pendingRewardFunctionName: 'pendingBOO',
  rewardRateFunctionName: 'booPerSecond',
  vaultName: 'Spooky V2',
  vaultFarmLabel: 'in SpookySwap\'s Farm V2',
  iconPath: '/assets/images/dex/spooky.png',
  cardColor: '#1c3769'
};

const ZIP_VAULT: VaultDetails = {
  type: VaultType.ZIP,
  masterChefAddress: '0x1e2f8e5f94f366ef5dc041233c0738b1c1c2cb0c',
  rewardsTokenAddress: '0xfa436399d0458dbe8ab890c3441256e3e09022a8',
  rewardsTokenDecimals: 18,
  rewardsTokenSymbol: 'ZIP',
  pendingRewardFunctionName: 'pendingReward',
  rewardRateFunctionName: 'zipPerSecond',
  vaultName: 'ZipSwap',
  vaultFarmLabel: 'on ZipSwap',
  iconPath: '/assets/images/dex/zip.png',
  cardColor: '#325078'
};

const VELODROME_VAULT: VaultDetails = {
  type: VaultType.VELODROME,
  rewardsTokenAddress: '0x3c8b650257cfb5f272f799f5e2b4e65093a11a05',
  rewardsTokenDecimals: 18,
  rewardsTokenSymbol: 'VELO',
  vaultName: 'Velodrome',
  vaultFarmLabel: 'on Velodrome',
  iconPath: '/assets/images/dex/velodrome.png',
  cardColor: '#48212c'
};

const XCAL_VAULT: VaultDetails = {
  type: VaultType.XCAL,
  rewardsTokenAddress: '0xd2568accd10a4c98e87c44e9920360031ad89fcb',
  rewardsTokenDecimals: 18,
  rewardsTokenSymbol: 'XCAL',
  vaultName: '3xcalibur',
  vaultFarmLabel: 'on 3xcalibur',
  iconPath: '/assets/images/dex/3xcalibur.png',
  cardColor: '#294460'
};

const VAULT_DETAILS: VaultDetails[] = [
  SPIRIT_BOOSTED_VAULT,
  SPIRIT_V2_VAULT,
  TOMB_TSHARE_REWARDS_POOL,
  TOMB_LSHARE_REWARDS_POOL,
  T2OMB_2SHARE_REWARDS_POOL,
  T3OMB_3SHARE_REWARDS_POOL,
  BASED_BSHARE_REWARDS_POOL,
  OXD_VAULT,
  VEDAO_VAULT,
  SOLIDEX_VAULT,
  OXDV2_VAULT,
  SPOOKY_V2_VAULT,
  ZIP_VAULT,
  VELODROME_VAULT,
  XCAL_VAULT
];

const getVaultDetailsByType = (type: VaultType) : VaultDetails | undefined => {
  return VAULT_DETAILS.find(x => x.type === type);
};

const getVaultDetails = (vaultTokenAddress?: Address): VaultDetails | undefined => {
  if (!vaultTokenAddress) {
    return undefined;
  }
  const pool = LENDING_POOL_DETAILS_MAP[vaultTokenAddress.toLowerCase()];
  if (!pool || pool.vaultType === undefined) {
    return undefined;
  }
  return getVaultDetailsByType(pool.vaultType);
};

const getVaultMasterChef = (vaultTokenAddress?: Address): Address | undefined => {
  if (!vaultTokenAddress) {
    return undefined;
  }
  const vaultDetails = getVaultDetails(vaultTokenAddress);
  if (vaultDetails) {
    return vaultDetails.masterChefAddress;
  }
  return undefined;
};

export interface VaultDetails {
  type: VaultType;
  masterChefAddress?: Address;
  gaugeVaultProxyAddress?: Address;
  gaugeVaultProxyAdminAddress?: Address;
  veTokenAddress?: Address;
  rewardsTokenAddress: Address;
  rewardsTokenDecimals: number;
  rewardsTokenSymbol: string;
  rewardsTokenBAddress?: Address;
  rewardsTokenBDecimals?: number;
  pendingRewardFunctionName?: string;
  rewardRateFunctionName?: string;
  rewardEndFunctionName?: string;
  lpDepositorAddress?: Address;
  oxVoterProxyAddress?: Address;
  vaultName: string;
  vaultFarmLabel: string;
  iconPath: string;
  cardColor?: string;
}

export {
  VaultType, VAULT_DETAILS, getVaultMasterChef, getVaultDetails, getVaultDetailsByType
};
