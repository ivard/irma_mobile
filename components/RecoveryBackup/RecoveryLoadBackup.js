import React, {Component} from 'react';
import {Button, CardItem, Footer, H2, H3, Input, Text, View,} from 'native-base';
import Card from 'lib/UnwrappedCard';
import PaddedContent from 'lib/PaddedContent';
import KeyboardAwareContainer from "../../lib/KeyboardAwareContainer";
import PropTypes from 'prop-types';

export default class RecoveryLoadBackup extends Component {

  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    changePinRequestReady: PropTypes.func.isRequired,
    errorPresent: PropTypes.func.isRequired,
  };

  state = {
    words: Array(12).fill(''),
    wordsError: Array(12).fill(undefined),
    phraseSent: false,
  };

  static getDerivedStateFromProps(props, state) {
    if (props.errorPresent() && props.status === 'requestPhrase') {
      return {...state, phraseSent: false};
    }
    return state;
  }

  wordChanged(index, word) {
    const {words} = this.state;
    words[index] = word.trim().toLowerCase();
    this.setState({
      words: words,
    });
  }

  sendPhrase() {
    const {dispatch, changePinRequestReady} = this.props;
    const {words, wordsError} = this.state;

    //Check for errors
    //TODO: maybe add check if entered word is in list of words.
    let errorFound = false;
    words.map((word, index) => {
      if (word === '') {
        wordsError[index] = 'Required';
        errorFound = true;
      }
      else {
        wordsError[index] = '';
      }
    });
    this.setState({
      wordsError: wordsError,
    });

    if (!errorFound) {
      this.setState({
        phraseSent: true,
      });
      dispatch({
        type: 'IrmaBridge.RecoveryLoadPhrase',
        recoveryPhrase: words,
        proceed: true,
      });

      changePinRequestReady(true);
    }
  }

  render() {
    const {status} = this.props;
    if(status === 'requestPhrase') {
      return this.renderRequestPhrase();
    }
    else {
      return this.renderExplanation();
    }
  }

  renderExplanation(){
    return (
      <PaddedContent>
        <Card>
          <CardItem>
            <H2>Welcome back to IRMA!</H2>
          </CardItem>
          <CardItem>
            <Text>
              In order to restore your attributes, you need to have your backup file. Open this file with the
              IRMA app and the recovery process will continue automatically. Please also have your recovery
              phrase at hand. You will need this during the process.
            </Text>
          </CardItem>
          <CardItem>
            <H3>Backup file... Do I have that?</H3>
          </CardItem>
          <CardItem>
            <Text>
            If you don't have a backup file, you can generate one in the old instance of the app via the sidebar menu
            and then press 'Make backup'. If you don't have the old app anymore, then we have to disappoint you. It is
            not possible to recover your attributes in this case.
            </Text>
          </CardItem>
        </Card>
      </PaddedContent>
    );
  }

  renderWordInputField(index) {
    const {wordsError} = this.state;
    let error = null;
    if (wordsError[index]) {
      error = <Text style={{color: 'red'}}>{wordsError[index]}</Text>;
    }

    return (
      <View style={{flex: 1}}>
        {error}
        <Input autoCapitalize='none'
               onChangeText={(x) => this.wordChanged(index, x)}
               placeholder={'Word '+(index+1)}
               keyboardShouldPersistTaps={true}
        />
      </View>
    );
  }

  renderRequestPhrase() {
    const {errorPresent} = this.props;
    const {words, phraseSent} = this.state;
    const wordsRendered = words.map((word, index) => {
      return (
        <CardItem key={'phrase:' + index} bordered={true}>
            {this.renderWordInputField(index)}
        </CardItem>
      );
    });

    let disabled = phraseSent ? {disabled: true, color: '#8C8C8C'} : null;

    return (
      <KeyboardAwareContainer>
        <PaddedContent>
          <Card>
            <CardItem>
              <Text>Please enter the words of the recovery phrase belonging to your backup:</Text>
            </CardItem>
            {wordsRendered}
          </Card>
        </PaddedContent>
        <Footer>
          <View style={{ width: "100%"}}>
            <Button primary full onPress={::this.sendPhrase} {...disabled}>
              <Text>Continue{phraseSent && !errorPresent() ? '...' : null}</Text>
            </Button>
          </View>
        </Footer>
      </KeyboardAwareContainer>
    );
  }
}
