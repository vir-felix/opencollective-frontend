require('dotenv').load();
const config = require('config');
const resetDb = require('../lib/reset_db.js');

module.exports = {
  '@tags': ['donate_page'],
   beforeEach: client => resetDb(client),

  'Donate button shows €100.00': (client) => {
    client
      .url(`${config.host.website}/testcollective/donate/100/February Meetup`)
      .waitForElementVisible('body', 1000)
      .assert.containsText('div[class=Tier]', 'February Meetup')
      .assert.containsText('div[class=DonateDisclaimer]', '€100,00')
      .end();
   },

  'Donate button shows USD $100.00 per month': (client) => {
    client
      .url(`${config.host.website}/testcollective/donate/100/monthly`)
      .waitForElementVisible('body', 1000)
      .assert.containsText('div[class=DonateDisclaimer]', '€100,00 per month')
      .end();
   },

  'Donate custom amount': (client) => {
    client
      .url(`${config.host.website}/testcollective/donate`)
      .waitForElementVisible('body', 1000)
      .setValue('.DonationPicker-input input', 50)
      .assert.containsText('div[class=DonateDisclaimer]', '€50,00')
      .end();
   },
};
