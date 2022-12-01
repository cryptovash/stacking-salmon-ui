
import * as React from 'react';
import clsx from 'clsx';

import TarotButtonBase, { Props as TarotButtonBaseProps } from '../../../components/UI/TarotButtonBase';
import { ReactComponent as SpinIcon } from '../../../assets/images/icons/spin.svg';

interface CustomProps {
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  pending?: boolean;
}

type Ref = HTMLButtonElement;
const TarotJadeContainedButton = React.forwardRef<Ref, Props>(({
  className,
  children,
  startIcon,
  endIcon,
  disabled = false,
  pending = false,
  ...rest
}, ref): JSX.Element => {
  const disabledOrPending = disabled || pending;

  return (
    <TarotButtonBase
      ref={ref}
      type='button'
      className={clsx(
        'focus:outline-none',
        'focus:ring',
        'focus:border-tarotJade-300',
        'focus:ring-tarotJade-200',
        'focus:ring-opacity-50',

        'border',
        'border-transparent',
        'font-medium',
        'shadow-sm',

        disabledOrPending ? clsx(
          'bg-tarotBlackHaze-300',
          'bg-opacity-30',
          'text-textPrimary',
          'text-opacity-30',
          'dark:text-white',
          'dark:text-opacity-30'
        ) : clsx(
          'text-white',
          'bg-tarotJade-600',
          'hover:bg-tarotJade-700'
        ),

        'rounded',
        'px-4',
        'py-2',
        'text-sm',
        'space-x-1.5',
        'justify-center',
        className
      )}
      disabled={disabledOrPending}
      {...rest}>
      {pending && (
        <SpinIcon
          className={clsx(
            'animate-spin',
            'w-5',
            'h-5',
            'mr-3'
          )} />
      )}
      {startIcon}
      <span>
        {children}
      </span>
      {endIcon}
    </TarotButtonBase>
  );
});
TarotJadeContainedButton.displayName = 'InterlayDefaultContainedButton';

export type Props = CustomProps & TarotButtonBaseProps;

export default TarotJadeContainedButton;