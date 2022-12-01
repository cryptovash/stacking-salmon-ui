
import { Web3Provider } from '@ethersproject/providers';
import { faEllipsisH } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Disclosure, Menu, Transition } from '@headlessui/react';
import {
  MenuIcon,
  XIcon
} from '@heroicons/react/outline';
import { useWeb3React } from '@web3-react/core';
import { ReactComponent as DiscordLogoIcon } from '../../assets/images/icons/discord-logo.svg';
import { ReactComponent as GitHubLogoIcon } from '../../assets/images/icons/git-hub-logo.svg';
import { ReactComponent as GitBookLogoIcon } from '../../assets/images/icons/gitbook-logo.svg';
import { ReactComponent as MediumLogoIcon } from '../../assets/images/icons/medium-logo.svg';
import { ReactComponent as OlympusLogoIcon } from '../../assets/images/icons/olympus-logo.svg';
import { ReactComponent as TarotLogoFace } from '../../assets/images/icons/tarotlogoface.inline.svg';
// import { CHAIN_IDS } from 'config/web3/chains';
import { ReactComponent as TarotLogoRays } from '../../assets/images/icons/tarotlogorays.inline.svg';
import { ReactComponent as TwitterLogoIcon } from '../../assets/images/icons/twitter-logo.svg';
import clsx from 'clsx';
import {
  TAROT_DISCORD_LINK, TAROT_GITBOOK_LINK, TAROT_GIT_HUB_LINK, TAROT_MEDIUM_LINK, TAROT_TWITTER_LINK
} from 'config/links';
import { CHAIN_IDS } from '../../config/web3/chains';
import { DISTRIBUTOR_ADDRESSES } from '../../config/web3/contracts/distributors';
import { LIQUIDITY_GENERATOR_ADDRESSES } from '../../config/web3/contracts/liquidity-generator';
// import ClaimAirdropButton from 'containers/ClaimAirdropButton';
// import WalletConnect from 'containers/WalletConnect';
// import ChainConnect from 'containers/ChainConnect';
import ConnectedWalletInfo from '../../containers/ConnectedWalletInfo';
import { useDefaultChainId } from '../../hooks/useTarotRouter';
import { useEffect, useRef, useState } from 'react';
import {
  NavLink,
  useRouteMatch
} from 'react-router-dom';
import { useScrolling, useWindowScroll } from 'react-use';
import {
  PAGES,
  PARAMETERS
} from '../../utils/constants/links';
import React from 'react';

const social = [
  {
    name: 'Twitter',
    href: TAROT_TWITTER_LINK,
    // eslint-disable-next-line react/display-name
    icon: (props: React.ComponentPropsWithRef<'svg'>) => (
      <TwitterLogoIcon
        width={24}
        height={24}
        {...props} />
    )
  },
  {
    name: 'Medium',
    href: TAROT_MEDIUM_LINK,
    // eslint-disable-next-line react/display-name
    icon: (props: React.ComponentPropsWithRef<'svg'>) => (
      <MediumLogoIcon
        width={16}
        height={14}
        {...props} />
    )
  },
  {
    name: 'GitBook',
    href: TAROT_GITBOOK_LINK,
    // eslint-disable-next-line react/display-name
    icon: (props: React.ComponentPropsWithRef<'svg'>) => (
      <GitBookLogoIcon
        width={24}
        height={24}
        {...props} />
    )
  },
  {
    name: 'Discord',
    href: TAROT_DISCORD_LINK,
    // eslint-disable-next-line react/display-name
    icon: (props: React.ComponentPropsWithRef<'svg'>) => (
      <DiscordLogoIcon
        width={18}
        height={12}
        {...props} />
    )
  },
  {
    name: 'GitHub',
    href: TAROT_GIT_HUB_LINK,
    // eslint-disable-next-line react/display-name
    icon: (props: React.ComponentPropsWithRef<'svg'>) => (
      <GitHubLogoIcon
        width={24}
        height={24}
        {...props} />
    )
  }
];
interface CustomProps {
  appBarHeight: number;
  accountModalOpen: boolean;
  setAccountModalOpen: (arg0: boolean) => void;
  walletModalOpen: boolean;
  setWalletModalOpen: (arg0: boolean) => void;
  setChainModalOpen: (arg0: boolean) => void;
}

const AppBar = ({
  appBarHeight,
  className,
  accountModalOpen,
  setAccountModalOpen,
  walletModalOpen,
  setWalletModalOpen,
  setChainModalOpen,
  ...rest
}: CustomProps & React.ComponentPropsWithRef<'nav'>): JSX.Element => {
  const {
    chainId: walletChainId,
    account
  } = useWeb3React<Web3Provider>();
  const defaultChainId = useDefaultChainId();
  const chainId = walletChainId || defaultChainId;
  const { y } = useWindowScroll();
  const [rotateDegrees, setRotateDegrees] = useState<number>(0);
  const bodyRef = useRef(window as any);
  const scrolling = useScrolling(bodyRef);

  useEffect(() => {
    /* if (scrolling) {
      return;
    }*/
    setRotateDegrees(-y / 30);
  }, [scrolling, y]);

  const NAVIGATION_ITEMS = [
    {
      title: 'Markets',
      link: PAGES.HOME,
      enabled: true,
      matched: (
        useRouteMatch({
          path: PAGES.HOME,
          strict: true
        })
      )?.isExact
    },
    {
      title: 'Dashboard',
      link: account ? PAGES.ACCOUNT.replace(`:${PARAMETERS.ACCOUNT}`, account) : '',
      enabled: !!account,
      matched: (
        useRouteMatch({
          path: PAGES.ACCOUNT,
          strict: true
        })
      )?.isExact
    },
    {
      title: 'Vaults',
      link: PAGES.SUPPLY_VAULTS,
      enabled: !chainId || chainId === CHAIN_IDS.FANTOM,
      matched: (
        useRouteMatch({
          path: PAGES.SUPPLY_VAULTS,
          strict: true
        })
      )?.isExact
    },
    {
      title: 'xTAROT',
      link: PAGES.STAKE,
      enabled: !chainId || chainId === CHAIN_IDS.FANTOM,
      matched: (
        useRouteMatch({
          path: PAGES.STAKE,
          strict: true
        })
      )?.isExact
    },
    {
      title: 'tinSPIRIT',
      link: PAGES.TINSPIRIT,
      enabled: !chainId || chainId === CHAIN_IDS.FANTOM,
      matched: (
        useRouteMatch({
          path: PAGES.TINSPIRIT,
          strict: true
        })
      )?.isExact
    }
    /*
    ,
    {
      title: 'User Guide',
      link: PAGES.USER_GUIDE,
      enabled: true,
      matched: (
        useRouteMatch({
          path: PAGES.USER_GUIDE,
          strict: true
        })
      )?.isExact
    },
    {
      title: 'Risks',
      link: PAGES.RISKS,
      enabled: chainId === CHAIN_IDS.FANTOM,
      matched: (
        useRouteMatch({
          path: PAGES.RISKS,
          strict: true
        })
      )?.isExact
    }
    */
  ];

  const NAVIGATION_OVERFLOW_ITEMS = [
    {
      title: 'Vote',
      link: 'https://vote.tarot.to',
      enabled: true,
      matched: false,
      isExternalLink: true
    },
    {
      title: 'Bond',
      content:
        <div className='flex flex-row items-center'><OlympusLogoIcon
          width={12}
          height={12} /><div className='pl-1.5 pt-0.5'>Bond</div>
        </div>,
      link: 'https://pro.olympusdao.finance/#/partners/Tarot',
      enabled: true,
      matched: false,
      isExternalLink: true
    },
    {
      title: 'BoostMaxx',
      link: PAGES.BOOST,
      enabled: !chainId || chainId === CHAIN_IDS.FANTOM,
      matched: (
        useRouteMatch({
          path: PAGES.BOOST,
          strict: true
        })
      )?.isExact
    },
    {
      title: 'LP Vault Bounties',
      link: PAGES.BOUNTY,
      enabled: true,
      matched: (
        useRouteMatch({
          path: PAGES.BOUNTY,
          strict: true
        })
      )?.isExact
    },
    {
      title: 'Distribution Claims',
      link: PAGES.CLAIM,
      enabled: chainId && DISTRIBUTOR_ADDRESSES[chainId],
      matched: (
        useRouteMatch({
          path: PAGES.CLAIM,
          strict: true
        })
      )?.isExact
    },
    {
      title: 'The Tarot LGE',
      link: PAGES.LGE,
      enabled: chainId && LIQUIDITY_GENERATOR_ADDRESSES[chainId],
      matched: (
        useRouteMatch({
          path: PAGES.LGE,
          strict: true
        })
      )?.isExact
    }
  ];
  function NavOverflow() {
    return (
      <div className='flex flex-col items-start justify-start self-start mt-1.5'>
        <Menu>
          <Menu.Button
            className='focus:outline-none'><FontAwesomeIcon
              className='focus:outline-none'
              icon={faEllipsisH} />
          </Menu.Button>
          <Menu.Items className='flex flex-col border border-tarotBlackHaze-750 bg-tarotBlackHaze-850 py-0 shadow-lg'>
            {/* Use the `active` render prop to conditionally style the active item. */}

            <div
              className={clsx(
                'space-y-1'
              )}>
              {NAVIGATION_OVERFLOW_ITEMS.map(navigationItem => (
                navigationItem.enabled ? (
                  <Menu.Item
                    key={navigationItem.title}>
                    {() => (
                      navigationItem.isExternalLink ?
                        <a
                          target='_blank'
                          rel='noopener noreferrer'
                          href={navigationItem.link}
                          className={clsx(
                            navigationItem.matched ?
                              'bg-tarotJade-400 border-gray-200 text-textPrimary' :
                              'border-transparent text-textSecondary hover:bg-tarotJade-700',
                            'block',
                            'pl-3',
                            'pr-4',
                            'py-2',
                            'border-l-4',
                            'text-sm',
                            'font-medium'
                          )}>
                          {navigationItem.content || navigationItem.title}
                        </a> :
                        <NavLink
                          to={navigationItem.link}
                          className={clsx(
                            navigationItem.matched ?
                              'bg-tarotJade-400 border-gray-200 text-textPrimary' :
                              'border-transparent text-textSecondary hover:bg-tarotJade-700',
                            'block',
                            'pl-3',
                            'pr-4',
                            'py-2',
                            'border-l-4',
                            'text-sm',
                            'font-medium'
                          )}>
                          {navigationItem.content || navigationItem.title}
                        </NavLink>
                    )}
                  </Menu.Item>
                ) : null
              ))}
              <Menu.Item>
                {() => (
                  <div
                    className={clsx(
                      'flex',
                      'space-x-6',
                      'items-center',
                      'self-center',
                      'justify-center',
                      'pt-2',
                      'px-4',
                      'pb-4'
                    )}>
                    {social.map(item => (
                      <a
                        key={item.name}
                        href={item.href}
                        className={clsx(
                          'text-gray-400',
                          'hover:text-tarotJade-200'
                        )}
                        title={item.name}
                        target='_blank'
                        rel='noopener noreferrer'>
                        <span className='sr-only'>{item.name}</span>
                        <item.icon aria-hidden='true' />
                      </a>
                    ))}
                  </div>)}
              </Menu.Item>
            </div>
            {/* ... */}
          </Menu.Items>
        </Menu>
      </div>
    );
  }

  return (
    <>
      <Disclosure
        key={window.location.pathname}
        as='nav'
        className={clsx(
          'bg-tarotBlackHaze',
          className
        )}
        {...rest}>
        {({ open }) => (
          <>
            <div
              className={clsx(
                'max-w-7xl',
                'mx-auto',
                'px-4',
                'lg:px-6',
                'xl:px-8'
              )}>
              <div
                style={{ height: appBarHeight }}
                className={clsx(
                  'flex',
                  'justify-between',
                  'bg-tarotBlackHaze'
                )}>
                <div className='flex'>
                  <div
                    className={clsx(
                      'flex-shrink-0',
                      'flex',
                      'items-center'
                    )}>
                    <NavLink to={PAGES.HOME}>
                      <div className='nav-logo'>
                        <div className='combined'>
                          <div>
                            <TarotLogoRays
                              className='transform-gpu transition-transform duration-200'
                              style={{
                                transform: `rotate(${rotateDegrees}deg)`
                              }} />
                          </div>
                          <TarotLogoFace />
                        </div>
                      </div>
                    </NavLink>
                  </div>
                  <div
                    className={clsx(
                      'hidden',
                      'lg:ml-6',
                      'lg:flex',
                      'lg:space-x-6',
                      'h-10',
                      'self-center'
                    )}>
                    {NAVIGATION_ITEMS.map(navigationItem => (
                      navigationItem.enabled ? (
                        <NavLink
                          key={navigationItem.title}
                          to={navigationItem.link}
                          className={clsx(
                            navigationItem.matched ?
                              'border-tarotJade-50 text-tarotJade-50' :
                              'border-transparent text-textSecondary hover:border-tarotJade-300 hover:text-tarotJade-300',
                            'inline-flex',
                            'items-center',
                            'px-1',
                            'pt-1',
                            'border-b-2',
                            'text-xs',
                            'xl:text-sm',
                            'font-medium',
                            'filter',
                            'brightness-150'
                          )}>
                          {navigationItem.title}
                        </NavLink>
                      ) : null
                    ))}
                    <div
                      className={clsx(
                        'cursor-pointer',
                        'border-transparent text-textSecondary hover:text-tarotJade-300',
                        'inline-flex',
                        'items-center',
                        'px-1',
                        'pt-1',
                        'border-b-2',
                        'text-xs',
                        'lg:text-sm',
                        'font-medium',
                        'filter',
                        'brightness-150',
                        'z-50'
                      )}><div className='absolute top-2'><NavOverflow /></div>
                    </div>
                  </div>
                </div>
                <div
                  className={clsx(
                    'hidden',
                    'lg:ml-6',
                    'lg:flex',
                    'lg:items-center',
                    'space-x-2'
                  )}>
                  {/* <ClaimAirdropButton /> */}
                  {/* <ChainConnect /> */}
                  <ConnectedWalletInfo
                    accountModalOpen={accountModalOpen}
                    setAccountModalOpen={setAccountModalOpen}
                    walletModalOpen={walletModalOpen}
                    setWalletModalOpen={setWalletModalOpen}
                    setChainModalOpen={setChainModalOpen} />
                  {/* <WalletConnect /> */}
                </div>
                <div
                  className={clsx(
                    '-mr-2',
                    'flex',
                    'items-center',
                    'lg:hidden'
                  )}>
                  {/* Mobile menu button */}
                  <Disclosure.Button
                    className={clsx(
                      'inline-flex',
                      'items-center',
                      'justify-center',
                      'p-2',
                      'rounded-md',
                      'text-gray-400',
                      'hover:text-textSecondary',
                      'hover:bg-gray-100',
                      'focus:outline-none',
                      'focus:ring-2',
                      'focus:ring-inset',
                      'focus:ring-tarotAstral-500'
                    )}>
                    <span className='sr-only'>Open main menu</span>
                    {open ? (
                      <XIcon
                        className={clsx(
                          'block',
                          'h-6',
                          'w-6'
                        )}
                        aria-hidden='true' />
                    ) : (
                      <MenuIcon
                        className={clsx(
                          'block',
                          'h-6',
                          'w-6'
                        )}
                        aria-hidden='true' />
                    )}
                  </Disclosure.Button>
                </div>
              </div>
            </div>
            <Transition
              show={open}
              enter='transition duration-100 ease-out'
              enterFrom='transform-gpu -translate-y-5 opacity-0'
              enterTo='transform-gpu translate-y-0 opacity-100'
              leave='transition duration-75 ease-out'
              leaveFrom='transform-gpu opacity-100'
              leaveTo='transform-gpu opacity-0'>
              <Disclosure.Panel
                static
                className='lg:hidden min-h-screen bg-tarotBlackHaze'>
                <div
                  className={clsx(
                    'pt-2',
                    'pb-3',
                    'space-y-1',
                    'grid',
                    'grid-cols-3',
                    'portrait:grid-cols-1'
                  )}>
                  {[...NAVIGATION_ITEMS, ...NAVIGATION_OVERFLOW_ITEMS].map(navigationItem => (
                    navigationItem.enabled ?
                      ((navigationItem as any).isExternalLink ? (
                        <a
                          target='_blank'
                          rel='noopener noreferrer'
                          key={navigationItem.title}
                          href={navigationItem.link}
                          className={clsx(
                            navigationItem.matched ?
                              'bg-tarotJade-400 border-gray-200 text-textPrimary' :
                              'border-transparent text-textSecondary hover:bg-tarotJade-700',
                            'flex',
                            'pl-3',
                            'pr-4',
                            'py-2',
                            'border-l-4',
                            'text-sm',
                            'sm:text-base',
                            'font-medium'
                          )}>
                          {(navigationItem as any).content || navigationItem.title}
                        </a>
                      ) :
                        (
                          <NavLink
                            key={navigationItem.title}
                            to={navigationItem.link}
                            className={clsx(
                              navigationItem.matched ?
                                'bg-tarotJade-400 border-gray-200 text-textPrimary' :
                                'border-transparent text-textSecondary hover:bg-tarotJade-700',
                              'flex',
                              'pl-3',
                              'pr-4',
                              'py-2',
                              'border-l-4',
                              'text-sm',
                              'sm:text-base',
                              'font-medium'
                            )}>
                            {navigationItem.title}
                          </NavLink>
                        )) : null
                  ))}
                </div>
                <div
                  className={clsx(
                    'pt-4',
                    'pb-3',
                    'border-t',
                    'border-gray-200'
                  )}>
                  <div className='flex items-center px-4'>
                    {/* <ClaimAirdropButton /> */}
                    {/* <WalletConnect /> */}
                    <ConnectedWalletInfo
                      accountModalOpen={accountModalOpen}
                      setAccountModalOpen={setAccountModalOpen}
                      walletModalOpen={walletModalOpen}
                      setWalletModalOpen={setWalletModalOpen}
                      setChainModalOpen={setChainModalOpen} />
                  </div>
                </div>
                <div className='flex flex-col pt-4'>
                  <div
                    className={clsx(
                      'flex',
                      'space-x-6',
                      'items-center',
                      'self-center',
                      'justify-center',
                      'pt-2',
                      'px-4',
                      'pb-4'
                    )}>
                    {social.map(item => (
                      <a
                        key={item.name}
                        href={item.href}
                        className={clsx(
                          'text-gray-400',
                          'hover:text-tarotJade-200'
                        )}
                        title={item.name}
                        target='_blank'
                        rel='noopener noreferrer'>
                        <span className='sr-only'>{item.name}</span>
                        <item.icon aria-hidden='true' />
                      </a>
                    ))}
                  </div>
                </div>
              </Disclosure.Panel>
            </Transition>
          </>
        )}
      </Disclosure>
    </>
  );
};

export default AppBar;
