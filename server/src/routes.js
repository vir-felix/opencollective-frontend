import mw from './middlewares';
import serverStatus from 'express-server-status';
import favicon from 'serve-favicon';
import path from 'path';
import express from 'express';
import request from 'request';
import robots from 'robots.txt';
import * as controllers from './controllers';
import apiUrl from './utils/api_url';
import render from './lib/render';

export default (app) => {

  /**
   * Redirects
   */
  app.get('/consciousnesshackingsf', (req, res) => res.redirect('/chsf'));
  app.get('/consciousnesshackingsv', (req, res) => res.redirect('/chsv'));

  /**
   * Server status
   */
  app.use('/status', serverStatus(app));

  /**
   * Favicon
   */
  app.use(favicon(path.join(__dirname, '/../../frontend/dist/images/favicon.ico.png')));

  /**
   * Static folder
   */
  app.use('/static', express.static(path.join(__dirname, `../../frontend/dist`), { maxAge: '1d' }));

  /**
   * GET /robots.txt
   */
  app.use(robots(path.join(__dirname, '../../frontend/dist/robots.txt')));

  /**
   * Pipe the requests before the middlewares, the piping will only work with raw
   * data
   * More infos: https://github.com/request/request/issues/1664#issuecomment-117721025
   */

  app.all('/api/*', (req, res) => {
    req
      .pipe(request(apiUrl(req.url), { followRedirect: false }))
      .pipe(res);
  });

  /**
  * Email Subscription
  */
  app.get('/services/email/unsubscribe', mw.ga, controllers.unsubscribe, render);
  app.get('/services/email/approve', mw.ga, controllers.subscribe, render);

  /**
   * Routes
   */
  app.get('/:slug/banner.md', mw.cache(300), mw.fetchGroupBySlug, mw.fetchActiveUsers(), controllers.banner.markdown);
  app.get('/:slug/banner.js', mw.cache(3000), mw.fetchGroupBySlug, mw.fetchActiveUsers(), controllers.banner.js);
  app.get('/:slug/:tier.md', mw.cache(300), mw.fetchGroupBySlug, mw.fetchActiveUsers(), controllers.banner.markdown);
  app.get('/:slug/:tier.:format(svg|png)', mw.cache(300), mw.fetchActiveUsers(), controllers.banner.banner);
  app.get('/:slug/:tier/badge.svg', mw.cache(300), mw.fetchActiveUsers(), controllers.banner.badge);
  app.get('/:slug/badge/:tier.svg', mw.cache(300), mw.fetchActiveUsers(), controllers.banner.badge);
  app.get('/:slug/:tier/:position/avatar(.:format(png|jpg|svg))?', mw.cache(300), mw.ga, mw.fetchActiveUsers({cache: 300}), controllers.banner.avatar);
  app.get('/:slug/:tier/:position/website', mw.ga, mw.fetchActiveUsers(), controllers.banner.redirect);
  app.get('/:slug([A-Za-z0-9-]+)/widget', mw.cache(300), mw.fetchGroupBySlug, controllers.collectives.widget);

  /**
   * Server side render the react app
   *
   * NOTE:
   * When we refactor PublicGroup to fetch the group in the container, we can remove
   * the explicit routes and just do `app.use(render)`
   */
  app.get('/', mw.ga, mw.addTitle('OpenCollective - Collect and disburse money transparently'), controllers.homepage, render);
  app.get('/about', mw.ga, mw.addTitle('About'), render);
  app.get('/discover/:tag?', mw.ga, mw.addTitle('Discover'), render);
  app.get('/faq', mw.ga, mw.addTitle('Answers'), render);
  app.get('/addgroup', mw.ga, mw.addTitle('Create a new group'), render);
  app.get('/login/:token', mw.ga, mw.addTitle('Open Collective'), render);
  app.get('/login', mw.ga, mw.addTitle('Open Collective Login'), render);
  app.get('/leaderboard', mw.ga, mw.fetchLeaderboard, mw.addTitle('Open Collective Leaderboard'), render);
  app.get('/opensource/apply/:token', mw.ga, mw.extractGithubUsernameFromToken, mw.addTitle('Sign up your Github repository'), render);
  app.get('/opensource/apply', mw.ga, mw.addTitle('Sign up your Github repository'), render);
  /* Leaving github/apply routes for existing links */
  app.get('/github/apply/:token', mw.ga, mw.extractGithubUsernameFromToken, mw.addTitle('Sign up your Github repository'), render);
  app.get('/github/apply', mw.ga, mw.addTitle('Sign up your Github repository'), render);
  app.get('/connect/github', mw.ga, render);
  app.get('/:slug/connect/:provider', mw.ga, render);
  app.get('/:slug/edit-twitter', mw.ga, controllers.profile, render);
  app.get('/:slug/edit', mw.ga, mw.addTitle('Edit'), mw.fetchGroupBySlug, mw.addMeta, render);
  app.get('/subscriptions', mw.ga, mw.addTitle('My Subscriptions'), render);
  app.get('/:slug([A-Za-z0-9-]+)/connected-accounts', mw.ga, render);
  app.get('/:slug([A-Za-z0-9-]+)/:type(expenses|donations)', mw.ga, mw.fetchGroupBySlug, mw.addMeta, render);
  app.get('/:slug([A-Za-z0-9-]+)/expenses/new', mw.ga, mw.fetchGroupBySlug, mw.addMeta, render);
  app.get('/:slug([A-Za-z0-9-]+)/donate/:amount', mw.ga, mw.fetchGroupBySlug, mw.addMeta, render);
  app.get('/:slug([A-Za-z0-9-]+)/donate/:amount/:interval', mw.ga, mw.fetchGroupBySlug, mw.addMeta, render);
  app.get('/:slug([A-Za-z0-9-]+)', mw.ga, controllers.profile, mw.addMeta, render);

  app.use(mw.handleUncaughtError);
};
