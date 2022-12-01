import { UnsupportedChainIdError } from '@web3-react/core';
import {
  NoEthereumProviderError,
  UserRejectedRequestError as UserRejectedRequestErrorInjected
} from '@web3-react/injected-connector';

// TODO: focusing on injected for now
function getChainErrorMessage(error: Error): string {
  if (error instanceof NoEthereumProviderError) {
    // eslint-disable-next-line max-len
    return 'No wallet extension detected.';
  } else if (error instanceof UnsupportedChainIdError) {
    return 'You\'re connected to an unsupported chain. Please try again.';
  } else if (error instanceof UserRejectedRequestErrorInjected) {
    return 'Please authorize this website to access your account.';
  } else if (error && (error as any).code === -32002) {
    return 'A request is already pending. Please approve the request in your wallet.';
  } else {
    console.error('[getChainErrorMessage] error => ', error);
    return 'An unknown error occurred.';
  }
}

export default getChainErrorMessage;
