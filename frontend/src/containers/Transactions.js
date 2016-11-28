import React, { Component } from 'react';

import { connect } from 'react-redux';
import filterCollection from '../lib/filter_collection';

import LoginTopBar from '../containers/LoginTopBar';
import ExpenseItem from '../components/ExpenseItem';
import TransactionItem from '../components/TransactionItem';
import Button from '../components/Button';
import Icon from '../components/Icon';
import Currency from '../components/Currency';

import PublicFooter from '../components/PublicFooter';
import SubmitExpense from '../containers/SubmitExpense';
import i18n from '../lib/i18n';

import fetchUsers from '../actions/users/fetch_by_group';
import fetchExpenses from '../actions/expenses/fetch_by_group';
import fetchTransactions from '../actions/transactions/fetch_by_group';
import decodeJWT from '../actions/session/decode_jwt';

export class Transactions extends Component {

  constructor(props) {
    super(props);
    this.state = {showSubmitExpense: Boolean(props.router.location.pathname.match(/new$/)) };
  }

  toggleAddExpense() {
    this.setState({ showSubmitExpense: !this.state.showSubmitExpense });
  }

  render() {
    const { users, i18n, group, type, user } = this.props;
    const { showSubmitExpense } = this.state;
    const items = group[type];
    if (!items) return (<div />);
    const hasItems = Boolean(items.length);
    return (
     <div className='Transactions'>
        <LoginTopBar />
        <div className='Transactions-container padding40' style={{marginBottom: '0'}}>
          <div className='line1'>collective information</div>
          <div className='info-block mr3'>
            <div className='info-block-value'>{group.name}</div>
            <div className='info-block-label'>collective</div>
          </div>
          <div className='info-block'>
            <div className='info-block-value'>
              <Currency value={group.balance} currency={group.currency} precision={2} />
            </div>
            <div className='info-block-label'>funds</div>
          </div>
        </div>

        {type === 'expenses' && showSubmitExpense && (
          <div className='Transactions-container' style={{marginTop: '0'}}>
            <SubmitExpense onCancel={this.toggleAddExpense.bind(this)} user={user} />
          </div>
        )}
        {(!showSubmitExpense && type === 'expenses') && (
          <div className='Transactions-container padding40' style={{marginTop: '0'}}>
            <Button onClick={this.toggleAddExpense.bind(this)} label='Submit Expense' id='submitExpenseBtn' />
          </div>
        )}
        {hasItems &&
          <div className='Transactions-container padding40 expenses-container'>
            <div className='line1'>latest {type}</div>
            <div className='-list'>
              {items.map(item => {
                if (type === 'expenses') {
                  return <ExpenseItem key={item.id} expense={item} i18n={i18n} user={users[item.UserId]} precision={2} />;
                } else {
                  return <TransactionItem key={item.id} transaction={item} i18n={i18n} user={users[item.UserId]} precision={2} />;
                }
              })}
            </div>
          </div>
        }
        {!hasItems && (
          <div className='Transactions-container padding40 expenses-container -empty-state' style={{height: '140px'}}>
            <Icon type='expense' />
            <div className='line1 inline'>
              {i18n.getString(`${type}List-showUpHere`)}
            </div>
          </div>
        )}

        <PublicFooter />
      </div>
    );
  }

  componentWillMount() {
    const {
      group,
      users,
      type,
      fetchExpenses,
      fetchTransactions,
      fetchUsers
    } = this.props;

    const options = {
      sort: 'createdAt',
      direction: 'desc',
      type: (type === 'expenses') ? type : 'transactions',
      per_page: 100
    };

    switch (type) {
      case 'expenses':
        if (!group.expenses || group.expenses.length < 4)
          fetchExpenses(group.slug, options);
        break;

      case 'donations':
        if (!group.donations || group.donations.length < 4)
          fetchTransactions(group.slug, options);
        break;
    }
    if (users.length === 0) fetchUsers(group.slug);
  }

  componentDidMount() {
    // decode here because we don't handle auth on the server side yet
    this.props.decodeJWT();
  }
}

export default connect(mapStateToProps, {
  fetchExpenses,
  fetchTransactions,
  fetchUsers,
  decodeJWT
})(Transactions);

function mapStateToProps({
  session,
  groups,
  transactions,
  expenses,
  users,
  router
}) {
  const slug = router.params.slug.toLowerCase();
  const type = router.params.type || 'expenses'; // `expenses` or `donations` -> should be `revenue` to be more accurate

  const group = groups[slug] || {slug}; // to refactor to allow only one group
  group.donations = transactions.donations;
  group.expenses = filterCollection(expenses, { GroupId: group.id });

  group.settings = group.settings || { lang: 'en' };
  return {
    session,
    group,
    router,
    users,
    i18n: i18n(group.settings.lang),
    type,
    user: session.isAuthenticated ? users[session.user.id] : null
  };
}
