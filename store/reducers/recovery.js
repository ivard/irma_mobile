import _ from 'lodash';

const initialState = {
  phrase: null,

  status: "",
  error: null,
  remainingAttempts: -1,
  blocked: 0,
};

export default function recovery(state = initialState, action) {
  console.log(action.type);
  switch(action.type) {
    case 'IrmaClient.RecoveryStatus': {
      console.log("Update");
      console.log(action.remainingAttempts);
      console.log(action.blocked);
      if (action.remainingAttempts != null) {
        return {
          ...state,
          status: action.status,
          remainingAttempts: action.remainingAttempts,
          blocked: action.blocked != null ? action.blocked : 0,
        };
      }
      return {
        ...state,
        status: action.status,
      };
    }

    case 'IrmaClient.RecoveryShowPhrase': {
      console.log("Show phrase");
      return {
        ...state,
        phrase: action.phrase,
        status: 'showPhrase',
      }
    }

    default:
      return state;
  }
}