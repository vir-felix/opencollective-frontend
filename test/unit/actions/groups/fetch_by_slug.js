import nock from 'nock';
import expect from 'expect';

import mockStore from '../../helpers/mockStore';
import env from '../../../../frontend/src/lib/env';
import fetchBySlug from '../../../../frontend/src/actions/groups/fetch_by_slug';
import * as constants from '../../../../frontend/src/constants/groups';

const group = {
  id: 1,
  slug: 'testgroup',
  description: 'happy stuff'
};

describe('groups/fetch_by_slug', () => {

  afterEach(() => nock.cleanAll());

  it('creates GROUP_SUCCESS when fetching a group is done', (done) => {

    nock(env.API_ROOT)
      .get(`/groups/${group.slug}`)
      .reply(200, group);

    const store = mockStore({});

    store.dispatch(fetchBySlug(group.slug))
    .then(() => {
      const [request, success] = store.getActions();
      expect(request).toEqual({ type: constants.GROUP_REQUEST, slug: group.slug });
      expect(success).toEqual({ type: constants.GROUP_SUCCESS, slug: group.slug, groups: { [group.slug] : group} });
      done();
    })
    .catch(done)
  });

  it('creates GROUP_ERROR when fetching a group fails', (done) => {
    nock(env.API_ROOT)
      .get(`/groups/${group.slug}`)
      .replyWithError('');

    const store = mockStore({});

    store.dispatch(fetchBySlug(group.slug))
    .then(() => {
      const [request, failure] = store.getActions();
      expect(request).toEqual({ type: constants.GROUP_REQUEST, slug: group.slug });
      expect(failure.type).toEqual(constants.GROUP_FAILURE);
      expect(failure.slug).toEqual(group.slug);
      expect(failure.error.message).toContain(`request to http://localhost:3000/api/groups/${group.slug} failed`);
      done();
    })
    .catch(done)
  });

});
