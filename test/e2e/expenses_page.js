const config = require('config');
const resetDb = require('../lib/reset_db.js');

module.exports = {
  '@tags': ['expenses_page'],
  beforeEach: (client) => {

    resetDb(client)
      .url(`${config.host.website}/testcollective/expenses`)
      .waitForElementVisible('body', 1000)
      .assert.containsText('body', 'OpenCollective Test Group')
      .assert.visible('.expenses-container', 5000)
  },

  'Expenses list': (client) => {

     client
       .assert.containsText('.ExpenseItem:first-child', 'Expense 2')
       .assert.containsText('.ExpenseItem:last-child', 'Expense 1')
       .end();
   },

   'Submit expense': (client) => {
     client
      .click('#submitExpenseBtn')
      .setValue('.js-transaction-name input', 'test user 1')
      .setValue('.js-transaction-email input', 'test@gmail.com')
      .setValue('.CustomTextArea textarea', 'drinks')
      .setValue('.js-transaction-amount input', 10)
      .setValue('.js-transaction-payoutMethod', 'other')
      .setValue('.ImageUpload input', 'someReceipt.pdf')
      .click('.Button')
      .waitForElementVisible('.PublicGroupThanks', 5000)
      .assert.containsText('.PublicGroupThanks', 'Expense sent')
      .end();
   }
};
