import { JsonRpcBatchProvider, StaticJsonRpcProvider } from '@ethersproject/providers';
import { Networkish } from '@ethersproject/networks';
import { ConnectionInfo, Logger } from 'ethers/lib/utils';

export class JsonRpcBatchProviderWithRetry extends JsonRpcBatchProvider {
  constructor(
    url?: string | ConnectionInfo | undefined,
    network?: Networkish | undefined,
    readonly attempts = 5
  ) {
    super(url, network);
  }

  async perform(method: string, params: any): Promise<any> {
    let i = 0;
    do {
      try {
        return await super.perform(method, params);
      } catch (err: any) {
        let matchedErrorCode = false;
        for (const c of Object.keys(Logger.errors)) {
          if (err.code === c) {
            matchedErrorCode = true;
          }
        }
        if (!matchedErrorCode || err.code === Logger.errors.TIMEOUT || err.code === Logger.errors.SERVER_ERROR || (err.message && err.message.slice(0, 1024).indexOf('execution aborted (timeout = ') > 0)) {
          if (i >= this.attempts) {
            throw err;
          }
        } else {
          throw err;
        }
      }
      i += 1;
    } while (i <= this.attempts);
  }
}

export class StaticJsonRpcProviderWithRetry extends StaticJsonRpcProvider {
  constructor(
    url?: string | ConnectionInfo | undefined,
    network?: Networkish | undefined,
    readonly attempts = 5
  ) {
    super(url, network);
  }

  async perform(method: string, params: any): Promise<any> {
    let i = 0;
    do {
      try {
        return await super.perform(method, params);
      } catch (err: any) {
        let matchedErrorCode = false;
        for (const c of Object.keys(Logger.errors)) {
          if (err.code === c) {
            matchedErrorCode = true;
          }
        }
        if (!matchedErrorCode || err.code === Logger.errors.TIMEOUT || err.code === Logger.errors.SERVER_ERROR || (err.message && err.message.slice(0, 1024).indexOf('execution aborted (timeout = ') > 0)) {
          if (i >= this.attempts) {
            throw err;
          }
        } else {
          throw err;
        }
      }
      i += 1;
    } while (i <= this.attempts);
  }
}
