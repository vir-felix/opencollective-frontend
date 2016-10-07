import React from 'react';

import UsersList from './UsersList';
import Currency from './Currency';

export default ({
  options,
  group,
  i18n,
  href
}) => {

  return (
    <div className='Widget'>
      {options.header && (
        <div className='Widget-header'>
          <img src={group.logo} />
          <h1>{group.name}</h1>
          <p>{group.description}</p>

          <div className='Widget-balance'>
            <Currency
              value={group.balance/100}
              currency={group.currency} />
          </div>
          <div className='Widget-label'>Funds Raised</div>
        </div>
      )}

      {options.backers && (
        <div className='Widget-backers'>
          <h2>Meet our backers</h2>
          <UsersList users={group.backers} i18n={i18n} />
        </div>
      )}

      {options.donate && (
        <center>
          <a href={href} target="_blank">
            <div className='Button Widget-button'>
              Donate
            </div>
          </a>
        </center>
      )}
    </div>
  );
}