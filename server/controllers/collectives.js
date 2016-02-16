/**
 * Dependencies
 */

import React from 'react';
import config from 'config';
import { renderToString } from 'react-dom/server';

import { get } from '../lib/api';
import Widget from '../../frontend/src/components/Widget';
// import renderClient from '../utils/render_client';

/**
 * Show the collective page
 */
const show = (req, res) => {


  // Meta data for facebook and twitter links (opengraph)
  const meta = {
    // url: group.publicUrl,
    // title: `Join ${group.name}'s open collective`,
    // description: `${group.name} is collecting funds to continue their activities. Chip in!`,
    // image: group.image || group.logo,
    // twitter: `@${group.twitterHandle}`,
  };

  // The initial state will contain the group
  // const initialState = {
  //   groups: {
  //     [group.id]: group
  //   }
  // };

  // Server side rendering of the client application
  // const html = renderClient(initialState);

  res.render('pages/collective', {
    layout: false,
    meta,
    html: '',
    initialState: JSON.stringify({})
  });
};

/**
 * Show the widget of a collective
 */
const widget = (req, res, next) => {
  const group = req.group;

  Promise.all([
    get(`/groups/${group.slug}/transactions?per_page=3`),
    get(`/groups/${group.slug}/users`)
  ])
  .then(([transactions, users]) => {
    const props = {
      options: {
        header: (req.query.header !== 'false'),
        transactions: (req.query.transactions !== 'false'),
        donate: (req.query.donate !== 'false'),
        backers: (req.query.backers !== 'false')
      },
      group,
      transactions,
      users,
      href: `${config.host.app}/${group.slug}`
    };

    const html = renderToString(<Widget {...props} />);

    res.render('pages/widget', {
      layout: false,
      html
    });
  })
  .catch(next);

};

export default { show, widget };