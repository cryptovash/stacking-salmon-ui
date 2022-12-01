import { Row, Col } from 'react-bootstrap';
import { formatFloat } from '../../../utils/format';
import React from 'react';

export interface BorrowFeeProps {
  amount: number;
  borrowFeeBps: number;
  symbol: string;
}

export default function BorrowFee({ amount, symbol, borrowFeeBps }: BorrowFeeProps): JSX.Element {
  return (
    <>
      {borrowFeeBps > 0 &&
    <Row>
      <Col xs={6}>Borrow Fee:</Col>
      <Col
        xs={6}
        className='text-right'>{formatFloat(amount * borrowFeeBps / 10000)} {symbol}
      </Col>
    </Row>
      }
    </>
  );
}