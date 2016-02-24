import React from 'react';
import moment from 'moment';

import ProfilePhoto from './ProfilePhoto';
import Currency from './Currency';
import TransactionStatus from './TransactionStatus';

export default ({transaction, user}) => (
  <div className='TransactionItem'>
    <ProfilePhoto
      hasBorder={true}
      url={user && user.avatar} />

    <div className='TransactionItem-info'>
      <div className='TransactionItem-amount'>
        <Currency value={transaction.amount} currency={transaction.currency} />
      </div>
      <div className='TransactionItem-description'>
        {transaction.description}
      </div>

      <div className='TransactionItem-created'>
        {transaction.createdAt && moment(transaction.createdAt).fromNow()}
      </div>

      <div className='TransactionItem-status'>
          <TransactionStatus {...transaction} />
      </div>

      <div className='TransactionItem-tags'>
        {transaction.tags}
      </div>
    </div>
  </div>
);
