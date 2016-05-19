require('dotenv').load();
const config = require('config');
const resetDb = require('../lib/reset_db.js');

module.exports = {
  '@tags': ['connect_account_page'],

  beforeEach: (client) => resetDb(client)
      .url(`${config.host.website}/connect/github`)
      .waitForElementVisible('body', 1000)
      .assert.containsText('body', 'Connect to github'),


  'Redirects to Github after clicking connect': (client) => {

    // const clientId = config.github.clientId;
    // const apiKeyEnc = how to have the key reliably?
    // const callbackUrl = encodeURIComponent(`${config.host.website}/connected-accounts/github/callback${apiKeyEnc}`);
    // const githubScope = encodeURIComponent('user:email');

    client
      .click('.connectAccountBtn')
      .waitForElementVisible('body', 4000)
      .assert.urlContains('https://github.com/login?return_to=%2Flogin%2Foauth%2Fauthorize')
      .setValue('input[name=login]', config.github.testUsername)
      .setValue('input[name=password]', config.github.testPassword)
      .click('input.btn-primary') // click 'Sign In'

      // This part is only necessary when user wasn't granted a token yet, so must be commented out after first run
      // .waitForElementVisible('body', 2000)
      // .assert.urlContains(`https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${callbackUrl}&response_type=code&scope=${githubScope}`)
      // .click('button[name=authorize]') // click 'Authorize application'

      .waitForElementVisible('body', 4000)
      // TODO this returns OK even if it's a 404 page: 404s should change window location
      .assert.urlContains('http://localhost:3000/github/apply')
      .end();
   }
};
