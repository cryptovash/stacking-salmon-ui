
import clsx from 'clsx';
import TarotButtonBase, { Props as TarotButtonBaseProps } from '../../../components/UI/TarotButtonBase';
import { ReactComponent as SpinIcon } from '../../../assets/images/icons/spin.svg';
import React from 'react';

const TarotJadeButtonGroup = ({
  className,
  ...rest
}: React.ComponentPropsWithRef<'span'>): JSX.Element => (
  <span
    className={clsx(
      'z-0',
      'inline-flex',
      'shadow-sm',
      'rounded-md',
      className
    )}
    {...rest} />
);

interface CustomTarotJadeButtonGroupItem {
  pending?: boolean;
}

const TarotJadeButtonGroupItem = ({
  className,
  children,
  disabled = false,
  pending = false,
  ...rest
}: CustomTarotJadeButtonGroupItem & TarotButtonBaseProps): JSX.Element => {
  const disabledOrPending = disabled || pending;

  return (
    <TarotButtonBase
      style={{
        height: 38
      }}
      type='button'
      className={clsx(
        'focus:outline-none',

        'border',
        'border-tarotJade-300',
        'font-medium',
        'shadow-sm',
        'text-white',
        'bg-tarotJade-600',
        'hover:bg-tarotJade-700',

        'first:rounded-l',
        'last:rounded-r',
        'px-4',
        'py-2',
        'text-sm',
        '-ml-px',
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
      {children}
    </TarotButtonBase>
  );
};

export {
  TarotJadeButtonGroupItem
};

export default TarotJadeButtonGroup;