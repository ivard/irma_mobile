import _ from 'lodash';

const initialState = {
  phrase: null,

  status: '',
  remainingAttempts: -1,
  blocked: 0,

  errorStatus: '',
  errorMessage: '',

  backup: null,

  isConfigured: false, // Mapped to status
};

export default function recovery(state = initialState, action) {
  console.log(action.type);
  state = {
    // Reset previous error value
    ...state,
    errorStatus: '',
    errorMessage: '',
  };
  switch(action.type) {
    case 'IrmaClient.RecoveryReset': {
      return {
        ...initialState,
        status: action.status,
      };
    }

    case 'IrmaClient.RecoveryIsConfigured': {
      return {
        ...state,
        status: action.isConfigured ? 'backupConfigured' : state.status,
      };
    }

    case 'IrmaClient.RecoveryStatus': {
      return {
        ...state,
        status: action.status,
        remainingAttempts: action.remainingAttempts != null ? action.remainingAttempts : state.remainingAttempts,
        blocked: action.blocked != null ? action.blocked : 0,
      };
    }

    case 'IrmaClient.RecoveryError': {
      return {
        ...state,
        errorStatus: action.errorStatus,
        errorMessage: action.errorMessage,
      }
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
      console.log("Backup received from go");
      return {
        ...state,
        status: 'backupReady',
        backup: action.backup,
      }
    }

    case 'IrmaClient.RecoveryDone': {
      return {
        ...state,
        status: 'done',
      }
    }

    default:
      return state;
  }
}