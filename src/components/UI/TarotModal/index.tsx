
import * as React from 'react';
import {
  Dialog,
  Transition
} from '@headlessui/react';
import { PropsOf } from '@headlessui/react/dist/types';
import clsx from 'clsx';

const TarotModalTitle = (props: PropsOf<typeof Dialog.Title>): JSX.Element => (
  <Dialog.Title {...props} />
);

type Ref = HTMLDivElement;
const TarotModalInnerWrapper = React.forwardRef<Ref, React.ComponentPropsWithRef<'div'>>(({
  className,
  ...rest
}, ref): JSX.Element => (
  <div
    ref={ref}
    className={clsx(
      'inline-block',
      'p-5',
      'overflow-hidden',
      'text-left',
      'align-middle',
      'transition-all',
      'transform',
      'w-full',
      'my-8',
      'bg-tarotBlackHaze-600',
      'rounded-3xl',
      'shadow-xl',
      'border',
      'border-tarotBlackHaze-300',
      className
    )}
    {...rest} />
));
TarotModalInnerWrapper.displayName = 'TarotModalInnerWrapper';

const TarotModal = ({
  open = false,
  onClose,
  children,
  initialFocus
}: Props): JSX.Element => {
  return (
    <Transition
      appear
      show={open}
      as={React.Fragment}>
      <Dialog
        className={clsx(
          'fixed',
          'inset-0',
          'z-tarotModal',
          'overflow-y-auto'
        )}
        open={open}
        onClose={onClose}
        initialFocus={initialFocus}>
        <div
          className={clsx(
            'px-4',
            'text-center'
          )}>
          <Transition.Child
            as={React.Fragment}
            enter='ease-out duration-300'
            enterFrom='opacity-0'
            enterTo='opacity-100'
            leave='ease-in duration-200'
            leaveFrom='opacity-100'
            leaveTo='opacity-0'>
            <Dialog.Overlay
              className={clsx(
                'absolute',
                'inset-0',
                'bg-black',
                'bg-opacity-30',
                'transition-opacity'
              )} />
          </Transition.Child>
          {/* MEMO: this element is to trick the browser into centering the modal contents. */}
          <span
            className={clsx(
              'invisible',
              'inline-block',
              'align-middle',
              'h-screen'
            )}
            aria-hidden='true'>
            &#8203;
          </span>
          <Transition.Child
            as={React.Fragment}
            enter='ease-out duration-300'
            enterFrom='opacity-0 scale-95'
            enterTo='opacity-100 scale-100'
            leave='ease-in duration-200'
            leaveFrom='opacity-100 scale-100'
            leaveTo='opacity-0 scale-95'>
            {children}
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
};

export {
  TarotModalTitle,
  TarotModalInnerWrapper
};

// TODO: should use types from @headlessui/react
export interface Props {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  initialFocus?: React.MutableRefObject<HTMLElement | null> | undefined;
}

export default TarotModal;
