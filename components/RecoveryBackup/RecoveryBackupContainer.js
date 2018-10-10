import React, {Component} from 'react';
import {
  Container,
  CardItem,
  H3,
  Text, View, Footer,
} from 'native-base';
import {Button, Alert, Platform, BackHandler} from 'react-native'
import Card from 'lib/UnwrappedCard';
import PaddedContent from 'lib/PaddedContent';
import PropTypes from 'prop-types';
import {connect} from "react-redux";
import PinEntry from "../Session/children/PinEntry";
import KeyboardAwareContainer from "../../lib/KeyboardAwareContainer";
import RecoveryMakeBackup from "./RecoveryMakeBackup";
import RecoveryLoadBackup from "./RecoveryLoadBackup";
import {sendBackupMail} from "lib/mail";
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
    }
  } = state;

  return {
    phrase,
    status,
    remainingAttempts,
    blocked,
    backup,
    isConfigured,
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
  };

  state = {
    pin: "",
    pinRequestReady: false,
    validationForced: false,
  };

  changePinRequestReady(ready) {
    console.log("Change PIN request ready");
    this.setState({
      pinRequestReady: ready,
    });
  }

  sendPin(proceed){
    const { pin } = this.state;
    if (!pin) {
      this.setState({
        validationForced: true,
        pinRequestReady: false,
      });
    }
    else {
      this.props.dispatch({
        type: 'IrmaBridge.RecoveryInitPin',
        pin: pin,
        proceed: proceed,
      });
    }
    if (!proceed) {
      this.navigateBack();
    }
  }

  navigateBack() {
    const { navigation } = this.props;
    navigation.goBack();
  }

  pinChange(pin) {
    console.log("PIN change", pin);
    this.setState({
      pin,
    });
  }

  render() {
    const {status, blocked, navigation} = this.props;

    console.log("RecoveryBackupContainer", status);
    if (status === 'requestPin' && this.state.pinRequestReady) {
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
    console.log("Render")
    console.log(this.props.remainingAttempts);

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
        <View style={[{ width: "90%", margin: 10, flexDirection: 'row'}]}>
          <View style={{flex: 1, marginRight: 5}}>
            <Button title={'Cancel'} onPress={() => this.sendPin(false)} color={'#ff0000'}/>
          </View>
          <View style={{flex: 1, marginLeft: 5}}>
            <Button title={'OK'} onPress={() => this.sendPin(true)}/>
          </View>
        </View>
      </Footer>
    </KeyboardAwareContainer>;
  }

  componentDidUpdate(prevProps) {
    const { navigation, status} = this.props;
    if (status !== prevProps.status && status === 'done') {
      resetNavigation(navigation.dispatch, 'CredentialDashboard');
    }
  }
}
