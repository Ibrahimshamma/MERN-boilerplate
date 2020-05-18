import * as actionTypes from "./actions";
import { login, register, update, fetchViaUsername } from "../Utils/api-auth";
import auth from "../Utils/auth-helper";
import { userInitState } from "./constants";

const intialState = {
  ...userInitState,
  open: false,
  error: "",
  show: false,
  submitted: false,
};

const reducers = (state = intialState, action) => {
  const userData = { user: { ...state } };
  switch (action.type) {
    case actionTypes.REFRESH:
      return {
        ...state,
        ...action.data,
        show: false,
        error: "",
        open: false,
      };
    case actionTypes.LOGIN:
      userData.profile = undefined;
      console.log("User", action);
      login(userData).then((data) => {
        if (data.error) {
          action.asyncDispatch({
            type: actionTypes.ERROR,
            message: data.error,
          });
        } else {
          action.asyncDispatch({ type: actionTypes.SUCCESS, user: data });
        }
      });
      return { ...state };
    case actionTypes.USERNAME_FETCH:
      fetchViaUsername(action.username).then((data) => {
        if (data.error) {
          action.asyncDispatch({
            type: actionTypes.ERROR,
            message: data.error,
          });
        } else {
          action.asyncDispatch({
            type: actionTypes.FETCH_PROFILE,
            profile: data,
          });
        }
      });
      return { ...state };
    case actionTypes.FETCH_PROFILE:
      return {
        ...state,
        profile: { ...action.profile.user },
      };
    case actionTypes.MODIFY:
      return {
        ...state,
        [action.name]: action.value,
      };
    case actionTypes.REGISTER:
      register(userData).then((data) => {
        userData.profile = undefined;
        if (data.error) {
          action.asyncDispatch({
            type: actionTypes.ERROR,
            message: data.error,
          });
        } else {
          action.asyncDispatch({ type: actionTypes.SUCCESS, user: data.user });
        }
      });
      return { ...state };
    case actionTypes.ERROR:
      return {
        ...state,
        error: action.message,
        show: true,
      };
    case actionTypes.UPDATE:
      update(action.Data).then((data) => {
        if (data.error) {
          action.asyncDispatch({
            type: actionTypes.ERROR,
            message: data.error,
          });
        } else {
          action.asyncDispatch({
            type: actionTypes.FETCH_UPDATE,
            user: data.user,
          });
        }
      });
      return state;
    case actionTypes.FETCH_UPDATE:
      auth.authenticate(action.user.token, () => {
        return { ...state, ...action.user, profile: {}, open: true };
      });
      return { ...state, ...action.user, profile: {}, open: true };

    case actionTypes.SUCCESS:
      auth.authenticate(action.user.token, () => {
        window.location.reload();
        return { ...state, ...action.user, profile: {}, open: true };
      });
      return { ...state, ...action.user, profile: {}, open: true };
    case actionTypes.LOGOUT:
      auth.signout(() => {
        return {
          open: true,
        };
      });
      return { ...state };
    case actionTypes.ExternalError:
      return {
        ...state,
        error: action.message,
      };
    default:
      return {
        ...state,
      };
  }
};

export default reducers;
