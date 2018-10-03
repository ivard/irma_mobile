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

const mapStateToProps = (state) => {
  const {
    recovery: {
      phrase,
      status,
      remainingAttempts,
      blocked,
    }
  } = state;

  return {
    phrase,
    status,
    remainingAttempts,
    blocked,
  };
};

@connect(mapStateToProps)
export default class RecoveryMakeBackup extends Component {

  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    phrase: PropTypes.arrayOf(PropTypes.string),
    status: PropTypes.string,
    remainingAttempts: PropTypes.number.isRequired,
    blocked: PropTypes.number.isRequired,
  };

  state = {
    initializing: false,
    phraseWrittenDown: false,
    showPhrase: false,
    pin: "",
    validationForced: false,
  };

  initRecovery() {
    if (!this.state.initializing) {
      console.log("Init!");
      console.log(this.props);
      const {dispatch} = this.props;

      this.setState({
        ...this.state,
        initializing: true,
      });

      dispatch({
        type: 'IrmaBridge.RecoveryInit',
      });
    }
  }

  phraseWrittenDown() {
    Alert.alert(
      'Continue?',
      'Are you sure you wrote down the words? The words will be deleted from your phone permanently.',
      [
        {text: 'Cancel', style: 'cancel'},
        {text: 'OK', onPress: () => {console.log("Hallo?"); this.setState({...this.state, phraseWrittenDown: true,})}},
      ],
      { cancelable: false }
    );
  }

  sendPin(proceed){
    const { pin } = this.state;
    if (!pin) {
      this.setState({
        validationForced: true
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
    console.log("Hallo");
    console.log(this.props.status);
    console.log(this.state.phraseWrittenDown);
    if (this.props.status === 'configured') {
      return (
        <Text>Hallo!</Text>
      );
    }
    else if (this.props.status === 'requestPin' && this.state.phraseWrittenDown) {
      return this.renderPinRequest();
    }
    else if (this.props.status === 'blocked' && this.state.pin !== "") {
      return <Card><CardItem><Text>
        Your PIN is blocked for {this.props.blocked} seconds. Please try again later.
      </Text></CardItem></Card>
    }
    else {
      return (
        <Container>
          <PaddedContent>
            <Card>
              <CardItem>
                <H3 style={{textAlign: 'center'}}>
                  Recovery Initialization
                </H3>
              </CardItem>
              <CardItem>
                <Text>
                  Recovery must be initialized first.
                </Text>
              </CardItem>
              <CardItem>
                <Button
                  onPress={::this.initRecovery}
                  title={this.state.initializing ? 'Initializing...' : "Initialize"}
                  color={this.state.initializing ? '#8C8C8C' : "#841584"}
                />
              </CardItem>
            </Card>
            {this.renderPhrase()}
          </PaddedContent>
        </Container>
      );
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

  renderPhrase () {
    const {phrase} = this.props;

    if (!this.state.showPhrase) {
      return (null);
    }

    let phraseRendered = phrase.map(( (p, index) => {
      return <CardItem key={'phrase:' + index} bordered={true}><Text>{p}</Text></CardItem>
    }));

    return <Card>
        <CardItem><Text>Write down the following words and keep it safe. You need these words when restoring one of your backups.</Text></CardItem>
        {phraseRendered}
        <CardItem>
          <Button
          onPress={::this.phraseWrittenDown}
          title='Continue'
          color={"#841584"}
        /></CardItem>
      </Card>;
  }

  componentDidUpdate(prevProps) {
    console.log("change!");
    if (prevProps.status !== this.props.status && this.props.status === 'showPhrase') {
      this.setState({
        ...this.state,
        showPhrase: true,
      });
    }
  }
}

/*
const styles = StyleSheet.create({
  baseText: {
    fontFamily: 'Cochin',
  },
  titleText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});*/
