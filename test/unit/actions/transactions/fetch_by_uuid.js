import nock from 'nock';
import expect from 'expect';

import mockStore from '../../helpers/mockStore';
import env from '../../../../frontend/src/lib/env';
import * as constants from '../../../../frontend/src/constants/transactions';
import fetchById from '../../../../frontend/src/actions/transactions/fetch_by_uuid';

describe('transactions/fetch_by_uuid', () => {

  afterEach(() => nock.cleanAll());

  it('creates TRANSACTION_SUCCESS if it fetches successfully', (done) => {
    const transaction = {
      id: 1,
      uuid: '32a6b676-2b92-48f9-b6e9-b084a94238b0',
      amount: 999
    };
    const slug = 'testgroup';
    const transactionuuid = transaction.uuid;

    nock(env.API_ROOT)
      .get(`/groups/${slug}/transactions/${transactionuuid}`)
      .reply(200, transaction);

    const store = mockStore({});

    store.dispatch(fetchById(slug, transactionuuid))
    .then(() => {
      const [request, success] = store.getActions();

      expect(request).toEqual({ type: constants.TRANSACTION_REQUEST, slug, transactionuuid });
      expect(success).toEqual({
        type: constants.TRANSACTION_SUCCESS,
        slug,
        transactionuuid,
        transactions: transaction
      });

      done();
    })
    .catch(done);
  });

  it('creates TRANSACTION_FAILURE if it fails to fetch a transaction', (done) => {
    const transaction = {
      id: 2,
      uuid: '32a6b676-2b92-48f9-b6e9-b084a94238b0',
      amount: 999
    };
    const slug = 1;
    const transactionuuid = transaction.uuid;

    nock(env.API_ROOT)
      .get(`/groups/${slug}/transactions/${transactionuuid}`)
      .replyWithError('');

    const store = mockStore({});

    store.dispatch(fetchById(slug, transactionuuid))
    .then(() => {
      const [request, failure] = store.getActions();

      expect(request).toEqual({ type: constants.TRANSACTION_REQUEST, slug, transactionuuid });
      expect(failure.type).toEqual(constants.TRANSACTION_FAILURE);
      expect(failure.error.message).toContain(`request to http://localhost:3000/api/groups/1/transactions/${transactionuuid} failed`);
      done();
    })
    .catch(done);
  });
});
