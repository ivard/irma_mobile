import React, {Component} from 'react';
import {
  Container,
  CardItem,
  H3,
  Text, View, Footer, Form,
} from 'native-base';
import {Button, Alert} from 'react-native'
import Card from 'lib/UnwrappedCard';
import PaddedContent from 'lib/PaddedContent';
import PropTypes from 'prop-types';
import KeyboardAwareContainer from "../../lib/KeyboardAwareContainer";
import {sendBackupMail} from "lib/mail";
import FormInput from "../../lib/form/FormInput";

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
    makingBackup: false,
    email: null,
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
      { cancelable: true }
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

    sendBackupMail(this.props.backup, {from: this.state.email})
  }

  phraseForgotten() {
    const {dispatch} = this.props;
    Alert.alert(
      'Continue?',
      'Recovery phrases cannot be restored. For new backups you need to generate a new recovery phrase. If you ' +
      'continue, your previous phrase is deleted from this device. Are you sure you want to continue?',
      [
        {text: 'Cancel', style: 'cancel'},
        {text: 'OK', onPress: () => dispatch({type: 'IrmaBridge.RecoveryDeletePhrase'})},
      ],
      { cancelable: true }
    )
  }

  changeEmail(email) {
    this.setState({
      email,
    })
  }

  render() {
    if (this.props.status.includes('backup')) {
      return this.renderMakeBackup();
    }
    else {
      return this.renderRecoveryInit();
    }
  }

  renderMakeBackup() {
    let makeButton = null, content = null;
    let lostPhraseButton =
      <View style={[{ width: "80%", margin: 10}]}>
        <Button title={'Recovery phrase lost?'} color={'grey'} onPress={::this.phraseForgotten}/>
      </View>;

    if (!this.state.makingBackup) {
      makeButton =
        <View style={[{ width: "90%", margin: 10}]}>
          <Button title={'Make backup'} onPress={::this.makeBackup}/>
        </View>;

      if (this.props.status === 'backupReady') {
        content = <CardItem><Text>Your backup has been sent.</Text></CardItem>
      }
      else {
        content =
          <CardItem>
            <View>
              <Form style={{width: '100%'}}>
                <FormInput
                  inputType="email"
                  key={`email`}
                  label={`Email`}
                  onChange={::this.changeEmail}
                  initialValue={this.state.email}
                  validationForced={false}
                  autoFocus={true}
                  showInvalidMessage={true}
                />
              </Form>
              {lostPhraseButton}
            </View>
          </CardItem>;
      }
    }

    return (
      <KeyboardAwareContainer>
        <PaddedContent>
          <Card>
            <CardItem>
              <Text>
                By pressing the button below a backup file of all your credentials will be generated. This backup will
                be sent by email to the following address:
              </Text>
            </CardItem>
            { content }
          </Card>
        </PaddedContent>
        <Footer>
          { makeButton }
        </Footer>
      </KeyboardAwareContainer>
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

  componentWillMount() {
    if (!this.state.email) {
      this.props.credentials.map(credential => {
        if (credential.Name === 'email') {
          // Return first email address found
          //TODO: deal with multiple email addresses
          this.setState({
            email: credential.Attributes[0].en,
          });
        }
      });
    }
  }

  componentDidUpdate(prevProps) {
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
