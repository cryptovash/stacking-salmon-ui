// TODO: <
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
// TODO: >

import clsx from 'clsx';
import { Spinner } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck } from '@fortawesome/free-solid-svg-icons';
import './index.scss';

export enum ButtonState {
  Disabled = 'disabled',
  Ready = 'ready',
  Pending = 'pending',
  Done = 'done',
}

export interface InteractionButtonProps {
  name: string;
  nameElement?: JSX.Element;
  state: ButtonState;
  onCall(e?: any): void;
}

export default function InteractionButton({ name, nameElement, onCall, state, className }: InteractionButtonProps & React.ComponentPropsWithRef<'button'>): JSX.Element {
  return (
    <button
      onClick={state === ButtonState.Ready ? onCall : null}
      disabled={state !== ButtonState.Ready}
      className={clsx(
        'rounded',
        'px-4',
        'py-2',
        'text-center',
        'select-none',
        'leading-normal',
        'focus:outline-none',
        'focus:shadow-none',
        'border-none',
        'relative',
        'text-white',
        'bg-tarotBlackHaze-200',
        'disabled:opacity-50',
        'disabled:cursor-auto',
        className
      )}>
      <span className={state === ButtonState.Ready ? null : 'opacity-50'}>{nameElement ? nameElement : name}</span>
      {state === ButtonState.Pending ? (<Spinner
        className='absolute'
        style={{
          left: 'calc(50% - 9px)',
          top: 'calc(50% - 9px)'
        }}
        animation='border'
        size='sm' />) : null}
      {state === ButtonState.Done ? (<FontAwesomeIcon
        className='absolute'
        style={{
          left: 'calc(50% - 9px)',
          top: 'calc(50% - 9px)'
        }}
        icon={faCheck} />) : null}
    </button>
  );
}