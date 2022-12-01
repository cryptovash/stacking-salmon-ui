import TarotRouter from '../tarot-router';
import {
  TransactionReceipt,
  TransactionResponse
} from '@ethersproject/abstract-provider';
import { Logger } from 'ethers/lib/utils';

async function waitForTx(
  router: TarotRouter,
  txTask: Promise<TransactionResponse>
): Promise<TransactionReceipt> {
  try {
    try {
      router.isWaitingForBlock = true;
      const tx = await txTask;
      const timeoutPromise = new Promise((resolve, reject) => {
        setTimeout(reject, 180000);
      });
      const receipt = await Promise.race([tx.wait(), timeoutPromise]) as TransactionReceipt;
      await waitForBlock(router, receipt.blockNumber);
      router.isWaitingForBlock = false;
      return receipt;
    } catch (error: any) {
      if (error.code === Logger.errors.TRANSACTION_REPLACED) {
        if (error.cancelled) {
          throw error;
        } else {
          return waitForTx(router, error.replacement);
        }
      } else {
        throw error;
      }
    }
  } catch (error) {
    router.isWaitingForBlock = false;
    throw error;
  }
}

async function waitForBlock(
  router: TarotRouter,
  blockNumberToWaitFor: number
): Promise<void> {
  await Promise.all(
    [router.readLibrary, router.mcLibrary].map(
      provider =>
        new Promise(resolve => {
          const handleBlock = (pollId: number, blockNumber: number) => {
            if (blockNumber > blockNumberToWaitFor) {
              provider.off('poll', handleBlock);
              resolve(null);
            }
          };
          provider.on('poll', handleBlock);
        })
    )
  );
}

export default waitForTx;