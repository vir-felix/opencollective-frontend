import React, { Component, PropTypes } from 'react';
import classnames from 'classnames';
import moment from 'moment';

import formatCurrency from '../lib/format_currency';

import paymentMethods from '../ui/payment_methods';

import ImageUpload from './ImageUpload';
import Input from './Input';
import SelectTag from './SelectTag';
import Select from './Select';
import TextArea from './TextArea';
import Notification from '../containers/Notification';
import SubmitButton from './SubmitButton';
import Button from './Button';
import DatePicker from './DatePicker';

class ExpenseForm extends Component {

  vatInput() {
    const {
      enableVAT,
      transaction,
      group,
      appendTransactionForm
    } = this.props;

    if (!enableVAT) return;

    return (
      <div>
        <span className='inline'>VAT: </span>
        <Input
          placeholder={formatCurrency(0, group.currency)}
          hasError={transaction.error.vat}
          value={transaction.attributes.vat}
          handleChange={vat => appendTransactionForm({vat})} />
      </div>
    );
  }

  render() {
    const {
      transaction,
      tags,
      group,
      appendTransactionForm,
      isUploading,
      enableVAT
    } = this.props;

    const attributes = transaction.attributes;
    
    const className = classnames({
      'ExpenseForm': true,
      'ExpenseForm--isUploading': isUploading,
      'js-form': true, // for testing
    });

    let amountPlaceholder = formatCurrency(0, group.currency);
    if (enableVAT) {
      amountPlaceholder += ' (including VAT)';
    }

    return (
      <div className={className}>
        <Notification {...this.props} />
        <ImageUpload
          {...this.props}
          value={attributes.link}
          onFinished={({url: link}) => appendTransactionForm({link})} />
        <form
          name='transaction'
          className='ExpenseForm-form'
          onSubmit={this.onSubmit.bind(this)} >
          <div className='row'>
            <label>Description: </label>
            <Input
              customClass='js-transaction-description'
              hasError={transaction.error.description}
              value={attributes.description}
              handleChange={description => appendTransactionForm({description})} />
          </div>
          <div className='row'>
            <label>Amount: </label>
            <Input
              customClass='js-transaction-amount'
              placeholder={amountPlaceholder}
              hasError={transaction.error.amount}
              value={attributes.amount}
              handleChange={amount => appendTransactionForm({amount})} />
          </div>
          {this.vatInput()}
          <div className='row'>
            <label>Date:</label>
            <DatePicker
              customClass='js-transaction-createdAt'
              selected={moment(attributes.createdAt)}
              maxDate={moment()}
              handleChange={createdAt => appendTransactionForm({createdAt})} />
          </div>
          <div className='row'>
            <label>Category:</label>
            <SelectTag
              customClass='js-transaction-category'
              attributes={attributes}
              tags={tags}
              handleChange={tag => appendTransactionForm({tags: [tag]})} />
          </div>

          <div className='row'>
            <label>Reimbursement method:</label>
            <Select
              customClass='js-transaction-paymentMethod'
              options={paymentMethods}
              value={attributes.paymentMethod}
              handleChange={paymentMethod => appendTransactionForm({paymentMethod})} />
          </div>

          {attributes.paymentMethod === 'paypal' && (
            <div className='row'>
              <label>PayPal email:</label>
              <Input
                customClass='js-transaction-paypalEmail'
                hasError={transaction.error.paypalEmail}
                value={attributes.paypalEmail}
                handleChange={paypalEmail => appendTransactionForm({paypalEmail})} />
            </div>
          )}
          {attributes.paymentMethod !== 'paypal' && (
            <div className='row'>
              <label>Email:</label>
              <Input
                customClass='js-transaction-email'
                hasError={transaction.error.email}
                value={attributes.email}
                handleChange={email => appendTransactionForm({email})} />
            </div>
          )}

          <div className='row textarea'>
            <label>Note:</label>
            <TextArea
              customClass='js-transaction-note'
              placeholder='Optional'
              value={attributes.comment}
              handleChange={comment => appendTransactionForm({comment})} />
          </div>

          <div className="buttonsRow">
            <SubmitButton />
            <Button color="red" label="Cancel" onClick={this.onCancel.bind(this)} />
          </div>

        </form>
      </div>
    );
  }

  onCancel(event) {
    event.preventDefault();
    this.props.onCancel();
  };

  onSubmit(event) {
    event.preventDefault();
    this.props.onSubmit(this.props.transaction);
  };

  componentDidMount() {
    const {
      tags,
      resetTransactionForm,
      appendTransactionForm,
    } = this.props;

    resetTransactionForm();
    appendTransactionForm({tags: [tags[0]]});

  }
}

ExpenseForm.propTypes = {
  onCancel: PropTypes.func.isRequired
};

export default ExpenseForm;
