import React, {Component} from 'react';
import {CardItem, Footer, Text, View,} from 'native-base';
import {Alert, Button} from 'react-native'
import Card from 'lib/UnwrappedCard';
import PaddedContent from 'lib/PaddedContent';
import PropTypes from 'prop-types';
import {connect} from "react-redux";
import PinEntry from "../Session/children/PinEntry";
import KeyboardAwareContainer from "../../lib/KeyboardAwareContainer";
import RecoveryMakeBackup from "./RecoveryMakeBackup";
import RecoveryLoadBackup from "./RecoveryLoadBackup";
import ReactTimeout from "react-timeout";
import {resetNavigation} from "../../lib/navigation";

const mapStateToProps = (state) => {
  const {
    recovery: {
      phrase,
      status,
      remainingAttempts,
      blocked,
      backup,
      isConfigured,
      errorStatus,
      errorMessage,
    }
  } = state;

  return {
    phrase,
    status,
    remainingAttempts,
    blocked,
    backup,
    isConfigured,
    errorStatus,
    errorMessage,
  };
};

@ReactTimeout
@connect(mapStateToProps)
export default class RecoveryBackupContainer extends Component {

  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    navigation: PropTypes.object.isRequired,
    status: PropTypes.string.isRequired,
    remainingAttempts: PropTypes.number.isRequired,
    blocked: PropTypes.number.isRequired,
    errorStatus: PropTypes.string.isRequired,
    errorMessage: PropTypes.string.isRequired,
  };

  state = {
    pin: '',
    pinRequestReady: false,
    validationForced: false,
    pinSent: false,
    errorPresent: false,
  };

  static getDerivedStateFromProps(props, state) {
    if (props.status === '') {
      // Reset state to initial state after RecoveryReset
      return {
        pin: '',
        pinRequestReady: false,
        validationForced: false,
        pinSent: false,
        errorPresent: false,
      };
    }
    return state;
  }

  changePinRequestReady(ready) {
    this.setState({
      pinRequestReady: ready,
    });
  }

  sendPin(proceed){
    const { pin } = this.state;
    if (proceed && !pin) {
      this.setState({
        validationForced: true,
        pinRequestReady: false,
      });
    }
    else {
      this.setState({
        pinSent: true,
      });
      this.props.dispatch({
        type: 'IrmaBridge.RecoveryInitPin',
        pin: pin,
        proceed: proceed,
      });
    }
  }

  pinChange(pin) {
    this.setState({
      pin,
    });
  }

  dismissAlert(fatal) {
    const { navigation, dispatch, status } = this.props;

    if (fatal || ['done', 'cancelled'].includes(status)) {
      resetNavigation(navigation.dispatch, 'CredentialDashboard');

      dispatch({
        type: 'IrmaBridge.RecoveryReset',
      });
    }
  }

  render() {
    const {status, blocked, errorStatus, navigation} = this.props;

    console.log("RecoveryBackupContainer", status);
    if (['done', 'cancelled'].includes(status) || errorStatus === 'error') {
      // Alert is spawn in componentDidUpdate
      return null;
    }
    else if (status === 'requestPin' && this.state.pinRequestReady) {
      return this.renderPinRequest();
    }
    else if (status === 'blocked' && this.state.pin !== "") {
      return <Card><CardItem><Text>
        Your PIN is blocked for {blocked} seconds. Please try again later.
      </Text></CardItem></Card>
    }
    else if (navigation.state.routeName === 'RecoveryLoadBackup'){
      return <RecoveryLoadBackup {...this.props} changePinRequestReady={::this.changePinRequestReady}/>;
    }
    else {
      return <RecoveryMakeBackup {...this.props} changePinRequestReady={::this.changePinRequestReady}/>;
    }
  }

  renderPinRequest() {
    const confirmButtons = (
      <View style={[{ width: "90%", margin: 10, flexDirection: 'row'}]}>
        <View style={{flex: 1, marginRight: 5}}>
          <Button title={'Cancel'} onPress={() => this.sendPin(false)} color={'#ff0000'}/>
        </View>
        <View style={{flex: 1, marginLeft: 5}}>
          <Button title={'OK'} onPress={() => this.sendPin(true)}/>
        </View>
      </View>
    );

    return <KeyboardAwareContainer>
      <PaddedContent>
        <Text>Please enter your PIN code to confirm your recovery settings.</Text>
        <PinEntry pinChange={::this.pinChange}
                  session={{status: this.props.status, remainingAttempts: this.props.remainingAttempts}}
                  validationForced={this.state.validationForced}
                  keyboardShouldPersistTaps={true}
        />
      </PaddedContent>
      <Footer style={{height: 60, paddingTop: 7}}>
        {this.state.pinSent ? null : confirmButtons}
      </Footer>
    </KeyboardAwareContainer>;
  }

  spawnErrorMessage() {
    const {errorStatus, errorMessage} = this.props;
    let fatal = errorStatus === 'error';
    Alert.alert(
      'Error',
      errorMessage,
      [
        {text: 'OK', onPress: () => {::this.dismissAlert(fatal)}},
      ],
      { cancelable: false }
    );
  }

  spawnDoneMessage() {
    Alert.alert(
      'Success',
      'Your backup was recovered sucessfully.',
      [{text: 'OK', onPress: ::this.dismissAlert}],
      { cancelable: false },
    );
  }

  spawnCancelledMessage() {
    Alert.alert(
      'Cancelled',
      'The recovery process was cancelled.',
      [{text: 'OK', onPress: ::this.dismissAlert}],
      { cancelable: false },
    );
  }

  componentDidUpdate(prevProps) {
    const { status, remainingAttempts, errorStatus, errorMessage} = this.props;
    if(errorStatus !== '' && prevProps.errorMessage !== errorMessage && !this.state.errorPresent) {
      this.spawnErrorMessage();
      this.setState({
        errorPresent: true,
      });
    }
    else if (this.state.errorPresent && errorStatus === ''){
      this.setState({
        errorPresent: false,
      });
    }
    if(prevProps.status !== status) {
      if (status === 'done') {
        this.spawnDoneMessage();
      }
      else if (status === 'cancelled') {
        this.spawnCancelledMessage();
      }
    }
    if (remainingAttempts !== prevProps.remainingAttempts) {
      this.setState({
        pinSent: false,
      });
    }
  }
}
