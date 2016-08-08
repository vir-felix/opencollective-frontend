import React from 'react';
import { Route } from 'react-router';

import PublicGroup from './containers/PublicGroup';
import Subscriptions from './containers/Subscriptions';
import Transactions from './containers/Transactions';
import DonatePage from './containers/DonatePage';
import Leaderboard from './containers/Leaderboard';
import OnBoarding from './containers/OnBoarding';
import Login from './containers/Login';
import ConnectTwitterButton from './components/ConnectTwitterButton';
import EditTwitter from './components/EditTwitter';
import HomePage from './containers/HomePage';
import Faq from './containers/Faq';
import ConnectedAccounts from './components/ConnectedAccounts';

import { requireAuthentication } from './components/AuthenticatedComponent';

export default (
  <Route>
    <Route path="/" component={HomePage} />
    <Route path="/faq" component={Faq} />
    <Route path="/login/:token" component={Login} />
    <Route path="/login" component={Login} />,
    <Route path="/subscriptions" component={requireAuthentication(Subscriptions)} />
    <Route path="/leaderboard" component={Leaderboard} />
    <Route path="/opensource/apply/:token" component={OnBoarding} />
    <Route path="/opensource/apply" component={OnBoarding} />
    {/* Leaving github/apply routes for existing links */}
    <Route path="/github/apply/:token" component={OnBoarding} />
    <Route path="/github/apply" component={OnBoarding} />
    <Route path="/:slug/connected-accounts" component={ConnectedAccounts} />
    <Route path="/:slug/connect/twitter" component={ConnectTwitterButton} />
    <Route path="/:slug/edit-twitter" component={EditTwitter} />
    <Route path="/:slug" component={PublicGroup} />
    <Route path="/:slug/expenses/new" component={Transactions} />
    <Route path="/:slug/:type(donations|expenses)" component={Transactions} />
    <Route path="/:slug/donate/:amount" component={DonatePage} />
    <Route path="/:slug/donate/:amount/:interval" component={DonatePage} />
  </Route>
);
