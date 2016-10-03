import React from 'react';
import DonationPicker from '../DonationPicker';
import DonationDistributor from './DonationDistributor';

export default class AmountPicker extends React.Component {
  render() {
    const {
      group,
      donationForm,
      appendDonationForm,
      tier,
      i18n,
    } = this.props;

    donationForm[tier.name] = donationForm[tier.name] || {};
    const stripeKey = group.stripeAccount && group.stripeAccount.stripePublishableKey;
    const amount = donationForm[tier.name].amount !== undefined ? donationForm[tier.name].amount : tier.range[0];
    const frequency = donationForm[tier.name].frequency || tier.interval;
    const currency = donationForm[tier.name].currency || group.currency;
    const { hasPaypal } = group;
    const hasStripe = stripeKey && amount !== '';
    const collectives = [
      {id: group.id, name: group.name, logo: group.logo},
    ];

    // xdamman: 
    // When the PublicGroup container is displayed after a pushState (e.g. after login)
    // it tries to render this component before the group.currency is loaded.
    // Once that variable is set, the child component <DonationDistributor /> doesn't update.
    // As a result, the backer tier shows a disabled button
    // This fixes this bug. But I'm not happy with it.
    if (!currency) return (<div />);

    return (
      <div>
        {tier.presets && (
          <DonationPicker
            value={amount}
            currency={currency}
            frequency={frequency}
            presets={tier.presets}
            i18n={i18n}
            onChange={({amount, frequency, currency}) => appendDonationForm(tier.name, {amount, frequency, currency})}
            // MAJOR HACK to support a donation for this group.
            showCurrencyPicker={group.id == 10}/>
        )}
        <DonationDistributor
          amount={Number(amount)}
          method={(hasPaypal) ? 'paypal' : (hasStripe) ? 'stripe' : 'paypal'}
          currency={currency}
          frequency={frequency}
          editable={true}
          optionalComission={false}
          feesOnTop={false}
          collectives={collectives}
          buttonLabel={tier.button}
          skipModal={!(group.settings && group.settings.DonationDistributor)}
          showDisclaimer={true}
          {...this.props}
        />
      </div>
    );
  }
}
