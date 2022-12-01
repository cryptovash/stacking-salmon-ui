const PARAMETERS = Object.freeze({
    ACCOUNT: 'account',
    UNISWAP_V2_PAIR_ADDRESS: 'uniswapV2PairAddress',
    CHAIN_ID: 'chainId'
  });
  
  const PAGES = Object.freeze({
    HOME: '/',
    STAKE: '/stake',
    SUPPLY_VAULTS: '/supply-vaults',
    BOOST: '/boost',
    TINSPIRIT: '/tinspirit',
    LENDING_POOL: `/lending-pool/:${PARAMETERS.CHAIN_ID}/:${PARAMETERS.UNISWAP_V2_PAIR_ADDRESS}`,
    ACCOUNT: `/account/:${PARAMETERS.ACCOUNT}`,
    BOUNTY: '/bounty',
    CREATE_NEW_PAIR: '/create-new-pair',
    RISKS: '/risks',
    CLAIM: '/claim',
    LGE: '/lge',
    USER_GUIDE: '/user-guide'
  });
  
  export {
    PARAMETERS,
    PAGES
  };
  