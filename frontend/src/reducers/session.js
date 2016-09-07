import merge from 'lodash/merge';
import * as constants from '../constants/session';

export default function session(state={
  user: {},
  isAuthenticated: false
}, action={
  hasPopOverMenuOpen: false
}) {
  switch (action.type) {

    case constants.DECODE_JWT_SUCCESS:
      return merge({}, state, {
        user: action.user,
        isAuthenticated: true
      });

    case constants.DECODE_JWT_FAILURE:
    case constants.DECODE_JWT_EMPTY:
      return merge({}, state, {
        isAuthenticated: false
      });

    case constants.HYDRATE:
      return merge({}, state, {
        jwtExpired: action.data.jwtExpired,
        jwtInvalid: action.data.jwtInvalid
      });

    default:
      return state;
  }
}

