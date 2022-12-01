import { InjectedConnector } from '@web3-react/injected-connector';
import { WalletConnectConnector } from '@web3-react/walletconnect-connector';

import { CHAIN_DETAILS, CHAIN_IDS } from '../../../config/web3/chains';

const injected = new InjectedConnector({
  supportedChainIds: [
    CHAIN_IDS.FANTOM,
    CHAIN_IDS.OPTIMISM,
    CHAIN_IDS.ARBITRUM
  ]
});

const walletconnect = new WalletConnectConnector({
  rpc: {
    [CHAIN_IDS.FANTOM]: CHAIN_DETAILS[CHAIN_IDS.FANTOM].rpcUrls[0],
    [CHAIN_IDS.ETHEREUM_MAIN_NET]: CHAIN_DETAILS[CHAIN_IDS.ETHEREUM_MAIN_NET].rpcUrls[0]
  },
  chainId: CHAIN_IDS.FANTOM,
  supportedChainIds: [
    CHAIN_IDS.FANTOM,
    CHAIN_IDS.OPTIMISM,
    CHAIN_IDS.ARBITRUM
  ],
  bridge: 'https://bridge.walletconnect.org',
  qrcode: true
});

export {
  injected,
  walletconnect
};
