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
import {sendBackupMail} from "lib/mail";

export default class RecoveryMakeBackup extends Component {

  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    phrase: PropTypes.arrayOf(PropTypes.string),
    status: PropTypes.string.isRequired,
    backup: PropTypes.string,
    changePinRequestReady: PropTypes.func.isRequired,
  };

  state = {
    initializing: false,
    showPhrase: false,
    pin: "",
    validationForced: false,
    makingBackup: false,
  };

  initRecovery() {
    if (!this.state.initializing) {
      console.log("Init!");
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
        {text: 'OK', onPress: () => this.props.changePinRequestReady(true)},
      ],
      { cancelable: false }
    );
  }

  navigateBack() {
    const { navigation } = this.props;
    navigation.goBack();
  }

  makeBackup() {
    this.setState({
      makingBackup: true,
    });

    this.props.dispatch({
      type: 'IrmaBridge.RecoveryMakeBackup',
    });
  }

  sendBackup() {
    this.setState({
      makingBackup: false,
    });

    sendBackupMail(this.props.backup, {from: 'ivarderksen@gmail.com'})
    //TODO: Replace email address with address from a certain field
  }

  render() {
    console.log("RecoveryMakeBackup")
    if (this.props.status.includes('backup')) {
      return this.renderMakeBackup();
    }
    else {
      return this.renderRecoveryInit();
    }
  }

  renderMakeBackup() {
    let button = null, done = null;
    if (!this.state.makingBackup) {
      button =
        <View style={[{ width: "90%", margin: 10}]}>
          <Button title={'Make backup'} onPress={::this.makeBackup}/>
        </View>;
      if (this.props.status === 'backupReady') {
        done = <CardItem><Text>Your backup has been sent.</Text></CardItem>
      }
    }

    return (
      <Container>
        <PaddedContent>
          <Card>
            <CardItem>
              <Text>
                By pressing the button below a backup file of all your credentials will be generated. This backup will
                be sent to you by mail.
              </Text>
            </CardItem>
            { done }
          </Card>
        </PaddedContent>
        <Footer>
          { button }
        </Footer>
      </Container>
    );
  }

  renderRecoveryInit() {
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

  renderPhrase () {
    const {phrase} = this.props;

    if (!this.state.showPhrase) {
      return null;
    }

    let phraseRendered = phrase.map(( (p, index) => {
      return <CardItem key={'phrase:' + index} bordered={true}><Text>{p}</Text></CardItem>
    }));

    return (
      <Card>
        <CardItem><Text>Write down the following words and keep it safe. You need these words when restoring one of your backups.</Text></CardItem>
        {phraseRendered}
        <CardItem>
          <Button
            onPress={::this.phraseWrittenDown}
            title='Continue'
            color={"#841584"}
          /></CardItem>
      </Card>
    );
  }

  componentDidUpdate(prevProps) {
    console.log("change!");
    if (prevProps.status !== this.props.status && this.props.status === 'showPhrase') {
      this.setState({
        ...this.state,
        showPhrase: true,
      });
    }
    if (prevProps.status !== this.props.status && this.props.status === 'backupReady') {
      this.sendBackup();
    }
  }
}
