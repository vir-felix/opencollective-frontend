import React, { Component } from 'react';

import { connect } from 'react-redux';
import take from 'lodash/array/take';
import values from 'lodash/object/values';
import sortBy from 'lodash/collection/sortBy';
import i18n from '../lib/i18n';
import filterCollection from '../lib/filter_collection';

import roles from '../constants/roles';
import Notification from '../containers/Notification';
import PublicFooter from '../components/PublicFooter';
import UserCard from '../components/UserCard';

import LoginTopBar from '../containers/LoginTopBar';

import PublicGroupHero from '../components/public_group/PublicGroupHero';
import PublicGroupWhoWeAre from '../components/public_group/PublicGroupWhoWeAre';
import PublicGroupWhyJoin from '../components/public_group/PublicGroupWhyJoin';
import PublicGroupJoinUs from '../components/public_group/PublicGroupJoinUs';
import PublicGroupMembersWall from '../components/public_group/PublicGroupMembersWall';
import PublicGroupExpenses from '../components/public_group/PublicGroupExpenses';
import PublicGroupDonations from '../components/public_group/PublicGroupDonations';
import PublicGroupSignupV2 from '../components/public_group/PublicGroupSignupV2';
import PublicGroupThanksV2 from '../components/public_group/PublicGroupThanksV2';
import BackerCard from '../components/public_group/BackerCard';
import ContributorList from '../components/public_group/ContributorList';
import RelatedGroups from '../components/RelatedGroups';

import fetchGroup from '../actions/groups/fetch_by_id';
import fetchUsers from '../actions/users/fetch_by_group';
import fetchTransactions from '../actions/transactions/fetch_by_group';
import donate from '../actions/groups/donate';
import notify from '../actions/notification/notify';
import appendDonationForm from '../actions/form/append_donation';
import appendProfileForm from '../actions/form/append_profile';
import updateUser from '../actions/users/update';
import getSocialMediaAvatars from '../actions/users/get_social_media_avatars';
import validateSchema from '../actions/form/validate_schema';
import decodeJWT from '../actions/session/decode_jwt';
import uploadImage from '../actions/images/upload';
import fetchProfile from '../actions/profile/fetch_by_slug';

import profileSchema from '../joi_schemas/profile';

import ProfilePage from './ProfilePage';

// Number of expenses and revenue items to show on the public page
const NUM_TRANSACTIONS_TO_SHOW = 3;

function getOrdinal(n) {
  const s=['th','st','nd','rd'], v = n % 100;
  return n + (s[(v-20)%10]||s[v]||s[0]);
}

export class PublicGroup extends Component {

  constructor(props) {
    super(props);
    this.state = {
      showThankYouMessage: false,
      showUserForm: false
    };
  }

  _donationFlow() {
    const {
      isAuthenticated,
      showPaypalThankYou,
      i18n,
      group,
      newUser
    } = this.props;

    if (this.state.showThankYouMessage || (isAuthenticated && this.state.showUserForm) || showPaypalThankYou) {
      return (
        <div className='PublicGroupDonationFlowWrapper px2 py4 border-box fixed top-0 left-0 right-0 bottom-0'>
          <PublicGroupThanksV2
            message={i18n.getString('nowOnBackersWall')}
            i18n={i18n}
            group={group}
            newUserId={newUser.id}
            closeDonationModal={this._closeDonationFlow.bind(this)} />
          <section className='pt4 center'>
            <RelatedGroups title={i18n.getString('checkOutOtherSimilarCollectives')} groupList={group.related} {...this.props} />
          </section>
        </div>

      );
    } else if (this.state.showUserForm) {
      return (
        <div className='PublicGroupDonationFlowWrapper px2 py4 border-box fixed top-0 left-0 right-0 bottom-0 bg-white'>
          <PublicGroupSignupV2 {...this.props} save={saveNewUser.bind(this)} />
        </div>
      );
    }

    return null;
  }

  _closeDonationFlow() {
    this.setState({
      showThankYouMessage: false,
      showUserForm: false
    });
  }

  renderPendingBackers() {
    const { group } = this.props;
    const backers = group.backers.slice(0);
    const backersCount = backers.length;
    if (backersCount < 10) {
      for (let i = 0, delta = 10 - backersCount; i < delta; i++) {
        backers.push(0)
      }
    }

    return (
      <div className="PublicGroup-backer-container">
        <div className="-top-gradient"></div>
        <div className="-wrap">
          {backers.map((backer, index) => {
            if (backer) {
              return <UserCard key={index} user={backer} {...this.props}/>
            } else {
              return (
                <BackerCard
                  key={index}
                  title={`${getOrdinal(index+1)} Backer`}
                  group={{}}
                  user={{avatar: ''}}
                  onClick={() => {}}
                  showButton={index === backersCount}
                  onToken={donateToGroup.bind(this)}
                  {...this.props}
                />
              )
            }
          })}
        </div>
        <div className="mb4">
          <small style={{color: '#919699'}}>You won’t be charged a single penny until we reach our 10 backer goal.</small>
        </div>
        <div className="-bottom-gradient"></div>
      </div>
    )
  }

  renderPendingContributors() {
    const { group } = this.props;
    const githubContributors = group.data && group.data.githubContributors ? group.data.githubContributors : {};
    const contributors = Object.keys(githubContributors).map((username) => {
      const commits = githubContributors[username]
      return {
        name: username,
        avatar: `https://avatars.githubusercontent.com/${username}?s=96`,
        stats: {c: commits}
      }
    });

    if (!contributors.length) {
      return <div className="mt4"></div>;
    } else {
      return (
        <div>
          <div className="line6">We are the contributors of this collective nice to meet you.</div>
          <div className="PublicGroup-contrib-container">
            <div className="line1" >Contributors</div>
            <ContributorList contributors={contributors} />
          </div>
        </div>
      )
    }
  }

  renderPendingAbout() {
    return (
      <div className="PublicGroup-about-container">
        <div className="line1">About Open Collective</div>
        <div className="line2">
          We use [Open Collective host] to collect the funds on our behalf using OpenCollective. Whenever we need to use the money for something, we will submit the invoice or expense via the OpenCollective app and once approved we will be reimbursed. That way, you can always track our budget.
          <br/>
          <b>Everything is transparent.</b>
        </div>
        <div className="more-button">learn more</div>
      </div>
    )
  }

  renderPending() {
    const { group } = this.props;
    return (
      <div className='PublicGroup PublicGroup--inactive'>
        <LoginTopBar />
        <div className="PublicGroupHero-logo mb3 bg-contain" style={{backgroundImage: `url(${'https://cldup.com/U1yzUnB9YJ.png'})`}} ></div>
        <div className="line1">Help <a href={group.website}>{group.name}</a> create an open collective to…</div>
        <div className="line2">{group.mission}</div>
        <div className="line3">Help us get the first 10 backers to start the collective going.</div>
        <div className="line4">With at least $10 you can become a member and help us cover design work, maintenance and servers.</div>
        {this.renderPendingBackers()}
        <div className="line5">Thank you for your visit</div>
        {this.renderPendingContributors()}
        {this.renderPendingAbout()}
        <PublicFooter />
      </div>
    )
  }

  isUserProfile(group) {
    return (group.username);
  }

  render() {
    const {
      group,
      expenses,
      donations,
      users
      // shareUrl,
    } = this.props;

    if (group.settings.pending) {
      return this.renderPending();
    }

	const publicGroupClassName = `PublicGroup ${group.slug}`;

    // `false` if there are no `group.data.githubContributors`, otherwise formats results for `ContributorList`
    const contributors = (group.data && group.data.githubContributors) && Object.keys(group.data.githubContributors).map((username) => {
      const commits = group.data.githubContributors[username];
      return {
        core: false,
        name: username,
        avatar: `https://avatars.githubusercontent.com/${username}?s=64`,
        stats: {
          c: commits,
          a: null,
          d: null
        }
      }
    }).sort((A, B) => (B.core * Number.MAX_SAFE_INTEGER + B.stats.c) - (A.core * Number.MAX_SAFE_INTEGER + A.stats.c));

    return (
      <div>
      { this.isUserProfile(group) &&
        <ProfilePage profile={group} />
      }

      { !this.isUserProfile(group) &&
      <div className={publicGroupClassName}>
        <Notification />

        <PublicGroupHero group={group} {...this.props} />
        <PublicGroupWhoWeAre group={group} {...this.props} />
        {group.slug === 'opensource' &&
          <div className="PublicGroupOpenSourceCTA">
            <div className="arrow-down"></div>
            <div className="line1">Apply to create an open collective for your open source project.</div>
            <div className="line2">We are slowly accepting new open collectives. Reserve your spot today.</div>
            <a href="/github/apply"><div className="button">APPLY NOW</div></a>
          </div>
        }
        {contributors && contributors.length > 1 &&
          <div className="PublicGroup-os-contrib-container">
            <div className="line1" >{contributors.length} contributors</div>
            <ContributorList contributors={contributors} />
          </div>
        }
        {group.slug !== 'opensource' && <PublicGroupWhyJoin group={group} expenses={expenses} {...this.props} />}

        <div className='bg-light-gray px2'>
          <PublicGroupJoinUs {...this.props} donateToGroup={donateToGroup.bind(this)} {...this.props} />
          <PublicGroupMembersWall group={group} {...this.props} />
        </div>

        <section id='expenses-and-activity' className='px2'>
          <div className='container'>
            <div className='PublicGroup-transactions clearfix md-flex'>
              <PublicGroupExpenses group={group} expenses={expenses} users={users} itemsToShow={NUM_TRANSACTIONS_TO_SHOW} {...this.props} />
              <PublicGroupDonations group={group} donations={donations} users={users} itemsToShow={NUM_TRANSACTIONS_TO_SHOW} {...this.props} />
            </div>
          </div>
        </section>

        <section id='related-groups' className='px2'>
          <RelatedGroups groupList={group.related} {...this.props} />
        </section>

        <PublicFooter />

        {this._donationFlow()}
      </div>
      }
      </div>
    );
  }

  componentDidMount() {
    const {
      group,
      fetchTransactions,
      fetchUsers,
      fetchGroup
    } = this.props;

    if (!this.isUserProfile(group)) {
      return Promise.all([
        fetchGroup(group.id),
        fetchTransactions(group.id, {
          per_page: NUM_TRANSACTIONS_TO_SHOW,
          sort: 'createdAt',
          direction: 'desc',
          donation: true
        }),
        fetchTransactions(group.id, {
          per_page: NUM_TRANSACTIONS_TO_SHOW,
          sort: 'createdAt',
          direction: 'desc',
          exclude: 'fees',
          expense: true
        }),
        fetchUsers(group.id)
      ])
    }
  }

  componentWillMount() {
    const {
      group,
      paypalIsDone,
      hasFullAccount,
      slug,
      fetchProfile,
      loadData
    } = this.props;

    if (paypalIsDone) {
      this.refreshData();
      this.setState({
        showUserForm: !hasFullAccount,
        showThankYouMessage: hasFullAccount
      });
    }

    if (!this.isUserProfile(group) && loadData) {
      fetchProfile(slug);
    }

  }

  // Used after a donation
  refreshData() {
    const {
      group,
      fetchGroup,
      fetchUsers,
      fetchTransactions
    } = this.props;

    return Promise.all([
      fetchGroup(group.id),
      fetchUsers(group.id),
      fetchTransactions(group.id, {
        per_page: NUM_TRANSACTIONS_TO_SHOW,
        sort: 'createdAt',
        direction: 'desc',
        donation: true
      })
    ]);
  }
}

export function donateToGroup({amount, frequency, currency, token, options}) {
  const {
    notify,
    donate,
    group
  } = this.props;

  const payment = {
    stripeToken: token && token.id,
    email: token && token.email,
    amount,
    currency,
    distribution: options && options.distribution
  };

  if (frequency === 'monthly') {
    payment.interval = 'month';
  } else if (frequency === 'yearly') {
    payment.interval = 'year';
  }

  return donate(group.id, payment, options)
    .then(() => {
      if (options && options.paypal) {
        // Paypal will redirect to this page and we will refresh at that moment
        return;
      }
        // stripe donation is immediate after the request
      return this.refreshData()
      .then(() => {
        this.setState({
          showUserForm: !this.props.hasFullAccount,
          showThankYouMessage: this.props.hasFullAccount
        });
      });
    })
    .catch((err) => notify('error', err.message));
}

export function saveNewUser() {
 const {
    newUser,
    updateUser,
    profileForm,
    validateSchema,
    notify,
    group,
    fetchUsers
  } = this.props;

  return validateSchema(profileForm.attributes, profileSchema)
    .then(() => updateUser(newUser.id, profileForm.attributes))
    .then(() => this.setState({
      showUserForm: false,
      showThankYouMessage: true
    }))
    .then(() => fetchUsers(group.id))
    .catch(({message}) => notify('error', message));
}

export default connect(mapStateToProps, {
  donate,
  uploadImage,
  notify,
  fetchTransactions,
  fetchUsers,
  fetchGroup,
  appendProfileForm,
  updateUser,
  getSocialMediaAvatars,
  validateSchema,
  decodeJWT,
  appendDonationForm,
  fetchProfile
})(PublicGroup);

function mapStateToProps({
  groups,
  form,
  transactions,
  users,
  session,
  router,
  app
}) {
  const query = router.location.query;
  const newUserId = query.userid;
  const paypalUser = {
    id: query.userid,
    hasFullAccount: query.has_full_account === 'true'
  };

  const newUser = users.newUser || paypalUser;

  const group = values(groups)[0] || {stripeAccount: {}}; // to refactor to allow only one group
  const usersByRole = group.usersByRole || {};

  /* @xdamman:
   * We should refactor this. The /api/group route should directly return
   * group.host, group.backers, group.members, group.donations, group.expenses
   */
  group.id = Number(group.id);

  group.hosts = usersByRole[roles.HOST] || [];
  group.members = usersByRole[roles.MEMBER] || [];
  group.backers = usersByRole[roles.BACKER] || [];

  group.host = group.hosts[0] || {};

  group.backersCount = group.backers.length;
  group.transactions = filterCollection(transactions, { GroupId: group.id });
  group.tiers = group.tiers || [{
    name: 'backer',
    title: "Backers",
    description: "Support us with a monthly donation and help us continue our activities.",
    presets: [1, 5, 10, 50, 100],
    range: [1, 1000000],
    interval: 'monthly',
    button: "Become a backer"
  }];

  group.settings = group.settings || {
    lang: 'en',
    formatCurrency: {
      compact: false,
      precision: 2
    }
  };

  const donations = transactions.isDonation;
  const expenses = transactions.isExpense;

  return {
    group,
    users,
    session,
    donations: take(sortBy(donations, txn => txn.createdAt).reverse(), NUM_TRANSACTIONS_TO_SHOW),
    expenses: take(sortBy(expenses, exp => exp.createdAt).reverse(), NUM_TRANSACTIONS_TO_SHOW),
    inProgress: groups.donateInProgress,
    // shareUrl: window.location.href,
    profileForm: form.profile,
    donationForm: form.donation,
    showUserForm: users.showUserForm || false,
    saveInProgress: users.updateInProgress,
    isAuthenticated: session.isAuthenticated,
    paypalIsDone: query.status === 'payment_success' && !!newUserId,
    newUser,
    hasFullAccount: newUser.hasFullAccount || false,
    i18n: i18n(group.settings.lang || 'en'),
    slug: router.params.slug,
    loadData: app.rendered,
    isSupercollective: group.isSupercollective
  };
}
