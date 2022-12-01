
import {
    useContext,
    useEffect
  } from 'react';
  import { TarotRouterContext } from '../contexts/TarotRouterProvider';
  import TarotRouter from '../tarot-router';
  
  // TODO: should be one hook
  export default function useTarotRouter() {
    const context = useContext(TarotRouterContext);
  
    if (context === undefined) {
      throw new Error('useTarotRouter must be used within a TarotRouterProvider');
    }
  
    return context.tarotRouter;
  }
  export function useRouterUpdate() {
    const context = useContext(TarotRouterContext);
  
    if (context === undefined) {
      throw new Error('useRouterUpdate must be used within a TarotRouterProvider');
    }
  
    return context.routerUpdate;
  }
  export function useDoUpdate() {
    const context = useContext(TarotRouterContext);
  
    if (context === undefined) {
      throw new Error('useDoUpdate must be used within a TarotRouterProvider');
    }
  
    return context.doUpdate;
  }
  export function usePriceInverted() {
    const context = useContext(TarotRouterContext);
  
    if (context === undefined) {
      throw new Error('usePriceInverted must be used within a TarotRouterProvider');
    }
  
    return context.priceInverted;
  }
  export function useTogglePriceInverted() {
    const context = useContext(TarotRouterContext);
  
    if (context === undefined) {
      throw new Error('useTogglePriceInverted must be used within a TarotRouterProvider');
    }
  
    return context.togglePriceInverted;
  }
  export function useUpdateDefaultChainId() {
    const context = useContext(TarotRouterContext);
  
    if (context === undefined) {
      throw new Error('useTogglePriceInverted must be used within a TarotRouterProvider');
    }
  
    return context.updateDefaultChainId;
  }
  export function useDefaultChainId() {
    const context = useContext(TarotRouterContext);
  
    if (context === undefined) {
      throw new Error('useTogglePriceInverted must be used within a TarotRouterProvider');
    }
  
    return context.defaultChainId;
  }
  export function usePriceProgress() {
    const context = useContext(TarotRouterContext);
  
    if (context === undefined) {
      throw new Error('usePriceProgress must be used within a TarotRouterProvider');
    }
  
    return context.priceProgress;
  }
  export function useProviderTriedEager() {
    const context = useContext(TarotRouterContext);
  
    if (context === undefined) {
      throw new Error('useProviderTriedEager must be used within a TarotRouterProvider');
    }
  
    return context.providerTriedEager;
  }
  
  export function useRouterCallback(f: (tarotRouter: TarotRouter) => void, additionalDeps: Array<any> = []): void {
    const context = useContext(TarotRouterContext);
  
    if (context === undefined) {
      throw new Error('useRouterCallback must be used within a TarotRouterProvider');
    }
  
    const {
      tarotRouter,
      routerUpdate,
      priceInverted
    } = context;
  
    return useEffect(() => {
      if (!tarotRouter) return;
      // if (!f) return;
  
      f(tarotRouter);
    }, [
      tarotRouter,
      routerUpdate,
      priceInverted,
      // f,
      ...additionalDeps
    ]);
  }
  