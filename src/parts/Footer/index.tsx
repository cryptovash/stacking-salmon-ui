
import * as React from 'react';
import clsx from 'clsx';

import {
  TAROT_TWITTER_LINK,
  TAROT_DISCORD_LINK,
  TAROT_MEDIUM_LINK,
  TAROT_GIT_HUB_LINK,
  TAROT_GITBOOK_LINK
} from '../../config/links';
import { ReactComponent as TwitterLogoIcon } from '../../assets/images/icons/twitter-logo.svg';
import { ReactComponent as GitHubLogoIcon } from '../../assets/images/icons/git-hub-logo.svg';
import { ReactComponent as DiscordLogoIcon } from '../../assets/images/icons/discord-logo.svg';
import { ReactComponent as MediumLogoIcon } from '../../assets/images/icons/medium-logo.svg';
import { ReactComponent as GitBookLogoIcon } from '../../assets/images/icons/gitbook-logo.svg';

const navigation = {
  social: [
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
  ]
};

type Ref = HTMLDivElement;
type Props = React.ComponentPropsWithRef<'footer'>;

const Footer = React.forwardRef<Ref, Props>(({
  className,
  ...rest
}, ref): JSX.Element => (
  <footer
    ref={ref}
    className={clsx(
      className
    )}
    aria-labelledby='footerHeading'
    {...rest}>
    <h2
      id='footerHeading'
      className='sr-only'>
      Footer
    </h2>
    <div
      className={clsx(
        'flex',
        'justify-center',
        'mx-auto',
        'pb-8',
        'px-4',
        'sm:px-6',
        'lg:pb-16',
        'lg:px-8'
      )}>
      <div
        className={clsx(
          'md:flex',
          'md:items-center',
          'md:justify-between'
        )}>
        <div
          className={clsx(
            'flex',
            'space-x-6',
            'md:order-2',
            'items-center'
          )}>
          {navigation.social.map(item => (
            <a
              key={item.name}
              href={item.href}
              className={clsx(
                'text-gray-400',
                'hover:text-textSecondary'
              )}
              target='_blank'
              rel='noopener noreferrer'>
              <span className='sr-only'>{item.name}</span>
              <item.icon aria-hidden='true' />
            </a>
          ))}
        </div>
      </div>
    </div>
  </footer>
));
Footer.displayName = 'Footer';

export default Footer;
