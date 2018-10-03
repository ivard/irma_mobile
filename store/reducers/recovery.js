import _ from 'lodash';

const initialState = {
  phrase: null,

  status: "",
  error: null,
  remainingAttempts: -1,
  blocked: 0,

  backup: null,

  isConfigured: false, // Mapped to status
};

export default function recovery(state = initialState, action) {
  console.log(action.type);
  switch(action.type) {
    case 'IrmaClient.RecoveryStatus': {
      if (action.remainingAttempts != null) {
        return {
          ...state,
          status: action.isConfigured ? 'backupConfigured' : state.status,
          remainingAttempts: action.remainingAttempts,
          blocked: action.blocked != null ? action.blocked : 0,
        };
      }
      return {
        ...state,
        status: action.isConfigured ? 'backupConfigured' : state.status,
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

    case 'IrmaClient.RecoveryBackup': {
      console.log("Backup received from go")
      return {
        ...state,
        status: 'backupReady',
        backup: action.backup,
      }
    }

    default:
      return state;
  }
}