import nock from 'nock';
import expect from 'expect';

import mockStore from '../../helpers/mockStore';
import env from '../../../../frontend/src/lib/env';
import cancelSubscription from '../../../../frontend/src/actions/subscriptions/cancel';
import * as constants from '../../../../frontend/src/constants/subscriptions';

describe('subscriptions/cancel', () => {

  afterEach(() => nock.cleanAll());

  it('dispatches CANCEL_SUBSCRIPTION_SUCCESS', (done) => {
    const token = 'token_abc';
    const id = 1;

    nock(env.API_ROOT)
      .post(`/subscriptions/${id}/cancel`)
      .reply(200, { success: true });

    const store = mockStore({});

    store.dispatch(cancelSubscription(id, token))
    .then(() => {
      const [request, success] = store.getActions();

      expect(request).toEqual({ type: constants.CANCEL_SUBSCRIPTION_REQUEST, id, token });
      expect(success).toEqual({ type: constants.CANCEL_SUBSCRIPTION_SUCCESS, id, token });
      done();
    })
    .catch(done)
  });

 it('dispatches CANCEL_SUBSCRIPTION_FAILURE when it fails', (done) => {
    const token = 'token_abc';
    const id = 1;

    nock(env.API_ROOT)
      .post(`/subscriptions/${id}/cancel`)
      .replyWithError('');

    const store = mockStore({});

    store.dispatch(cancelSubscription(id, token))
    .catch(() => {
      const [request, failure] = store.getActions();

      expect(request).toEqual({ type: constants.CANCEL_SUBSCRIPTION_REQUEST, id, token });
      expect(failure.type).toEqual(constants.CANCEL_SUBSCRIPTION_FAILURE);
      expect(failure.id).toEqual(id);
      expect(failure.token).toEqual(token);
      expect(failure.error.message).toContain(`request to http://localhost:3000/api/subscriptions/${id}/cancel failed`);
      done();
    });
  });

});
