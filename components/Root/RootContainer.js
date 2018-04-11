import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { NavigationActions } from 'react-navigation';
import { Alert } from 'react-native';
import { Sentry } from 'react-native-sentry';
import RNFS from 'react-native-fs';

import RootNavigatorContainer from './RootNavigatorContainer';

import { validateSigrequest } from 'lib/requestValidators.js';
import { canSendMail } from 'lib/mail.js';

const mapStateToProps = (state) => {
  const {
    irmaConfiguration: {
      loaded: configurationLoaded,
      sentryDSN,
    },
    preferences: {
      loaded: preferencesLoaded,
      enableCrashReporting,
    },
    enrollment: {
      loaded: enrollmentLoaded,
      unenrolledSchemeManagerIds,
    },
    credentials: {
      loaded: credentialsLoaded,
    }
  } = state;

  const loaded = configurationLoaded && preferencesLoaded && enrollmentLoaded && credentialsLoaded;

  return {
    loaded,
    unenrolledSchemeManagerIds,
    enableCrashReporting,
    sentryDSN,
  };
};

@connect(mapStateToProps)
export default class RootContainer extends Component {

  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    enableCrashReporting: PropTypes.bool,
    loaded: PropTypes.bool.isRequired,
    unenrolledSchemeManagerIds: PropTypes.array.isRequired,
    sentryDSN: PropTypes.string.isRequired,
  }

  sentryInitialized = false
  configureErrorReporting(sentryDSN) {
    // Unfortunately we cannot set the DSN for the Sentry client
    // after it has been configured. See react-native-sentry#320
    if(!this.sentryInitialized && sentryDSN !== '') {
      Sentry.config(sentryDSN).install();
      this.sentryInitialized = true;
    }
  }

  componentWillReceiveProps(nextProps) {
    const { loaded, enableCrashReporting, sentryDSN } = nextProps;

    if(loaded && enableCrashReporting) {
      this.configureErrorReporting(sentryDSN);
    }
  }

  ensureEnrollment(navigator) {
    const { dispatch, unenrolledSchemeManagerIds } = this.props;

    if(unenrolledSchemeManagerIds.length === 0)
      return;

    // Irmago doesn't actually support multiple scheme managers with keyshare enrollment,
    // so we just pick the first unenrolled, which should be PBDF
    const schemeManagerId = unenrolledSchemeManagerIds[0];

    dispatch({
      type: 'Enrollment.Start',
      schemeManagerId
    });

    navigator.dispatch(
      NavigationActions.navigate({
        routeName: 'Enrollment',
        params: { schemeManagerId },
      })
    );
  }

  // Handle URL
  handleUrl(url, navigator) {
    // Doing a manual session on Android
    if (url.startsWith('content://')) {
      this.startFromFileUrl(url, navigator);
    }

    // Doing a manual session on iOS
    if (url.startsWith('file://')) {
      const path = url.slice(7); // Strip file://
      this.startFromFileUrl(path, navigator);
    }

    // Handle errors in handleIrmaUrl
    return this.handleIrmaUrl(url, navigator);
  }

  startFromFileUrl(url, navigator) {
    return canSendMail()
      .then(() => this.handleContentUrl(url, navigator))
      .catch(() => {}); // TODO: show error that no mail client is installed
  }

  // Handle an URL of the form file://path (iOS) or content://path (Android) for signature requests
  // TODO: handle disclosure requests as well
  handleContentUrl(url, navigator) {
    RNFS.readFile(url, 'utf8')
      .then(result => {
        const sigRequest = JSON.parse(result);

        if (!validateSigrequest(sigRequest)) {
          // TODO: handle properly
          return;
        }

        const { dispatch } = this.props;
        dispatch({
          type: 'IrmaBridge.NewManualSession',
          sessionId: 0,
          request: JSON.stringify(sigRequest),
        });

        navigator.dispatch(
          NavigationActions.navigate({
            routeName: 'Session',
            params: { sessionId: 0 },
          })
        );
      })
      .catch(() => { // TODO handle properly
        Alert.alert(
          'Error starting IRMA session: could not read file',
          [{text: 'Dismiss', style: 'cancel'}],
          { cancelable: true }
        );
      });
  }

  // Handle an URL of the form irma://qr/json/$json
  handleIrmaUrl(url, navigator) {
    const decodedUrl = decodeURIComponent(url.replace(/^.*?:\/\//g, ''));

    if (!(/^qr\/json\//.test(decodedUrl))) {
      // TODO: Show error
      return;
    }

    const qrJson = decodedUrl.replace(/^qr\/json\//, '');

    let qr;
    try {
      qr = JSON.parse(qrJson);
    } catch(err) {
      // TODO: Show error
      return;
    }

    if(typeof qr !== 'object' || typeof qr.irmaqr !== 'string') {
      // TODO: show error
      return;
    }

    const { dispatch } = this.props;

    const sessionId = global.getAutoIncrementId();
    dispatch({
      type: 'IrmaBridge.NewSession',
      sessionId,
      qr,
    });

    navigator.dispatch(
      NavigationActions.reset({
        index: 1,
        actions: [
          NavigationActions.navigate({routeName: 'CredentialDashboard'}),
          NavigationActions.navigate({routeName: 'Session', params: { sessionId }}),
        ]
      })
    );
  }

  render() {
    const { loaded } = this.props;
    if(!loaded)
      return null;

    return (
      <RootNavigatorContainer
        ensureEnrollment={::this.ensureEnrollment}
        handleUrl={::this.handleUrl}
      />
    );
  }
}
