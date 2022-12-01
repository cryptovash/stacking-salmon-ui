import clsx from 'clsx';
import { InteractionModalContainer } from '.';
import React from 'react';

/**
 * Props for the connect wallet modal.
 * @property show Shows or hides the modal.
 * @property toggleShow A function to update the show variable to show or hide the Modal.
 */
export interface TermsModalProps {
  show: boolean;
  toggleShow(s: boolean): void;
}

/**
 * Styled component for the norrow modal.
 * @param param0 any Props for component
 * @see TermsModalProps
 */

export default function TermsModal({ show, toggleShow }: TermsModalProps): JSX.Element {
  return (
    <InteractionModalContainer
      title='Terms &amp; Conditions'
      show={show}
      toggleShow={toggleShow}>
      <div className='pt-4 pb-4 flex flex-col justify-center items-center space-y-8'>
        <p>Use of this site and its associated services is subject to the following terms and conditions:</p>
        <p>Tarot is an experimental protocol, and I understand the risks associated with using the protocol and its associated functions.</p>
        <p>I confirm that I am familiar with the concepts of decentralized finance, and I have read and understand the&nbsp;
          <a
            href='https://docs.tarot.to/'
            className={clsx(
              'text-tarotJade-50',
              'hover:text-textSecondary',
              'hover:underline'
            )}
            target='_blank'
            rel='noopener noreferrer'>
            <span>Tarot Documentation
            </span>
          </a>.
        </p>
        <p>I understand that my interaction with Tarot (including its website, smart contracts, or any related functions) may place my tokens at-risk, and I hereby release Tarot, its contributors, and affiliated service providers from any and all liability associated with my use of Tarot.</p>
        <p>I am lawfully permitted to access this site and my use of and interaction with Tarot is not in contravention of any laws governing my jurisdiction of residence or citizenship.</p>
      </div>
    </InteractionModalContainer>
  );
}