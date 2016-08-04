import { get } from '../../lib/api';
import * as constants from '../../constants/discover';

export default (tag, sort) => {
  return dispatch => {
    dispatch(request());

    return get('/discover', {params: {show: tag, sort: sort}})
    .then(json => dispatch(success(json)))
    .catch(error => dispatch(failure(error)));
  };
};

function request() {
  return {
    type: constants.DISCOVER_REQUEST
  };
}

export function success(json) {
  return {
    type: constants.DISCOVER_SUCCESS,
    json
  };
}

function failure(error) {
  return {
    type: constants.DISCOVER_FAILURE,
    error
  };
}
