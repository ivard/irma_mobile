import React, {Component} from 'react';
import {Button, CardItem, Footer, H2, H3, Icon, Input, Text, View,} from 'native-base';
import Card from 'lib/UnwrappedCard';
import PaddedContent from 'lib/PaddedContent';
import KeyboardAwareContainer from "../../lib/KeyboardAwareContainer";
import PropTypes from 'prop-types';
import {Alert} from "react-native";

export default class RecoveryLoadBackup extends Component {

  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    changePinRequestReady: PropTypes.func.isRequired,
  };

  state = {
    words: [],
    currentWord: '',
    recoveryStarted: false,
  };

  static getDerivedStateFromProps(props,state) {
    const {navigation, dispatch} = props;
    let backup = navigation.getParam("backupData", undefined);
    if (backup != null && !state.recoveryStarted) {
      dispatch({
        type: 'IrmaBridge.RecoveryLoadBackup',
        backupData: backup,
      });
      return {...state, recoveryStarted: true};
    }
    return state;
  }

  addWord() {
    const {words, currentWord} = this.state;
    let word = currentWord.trim().toLowerCase();
    console.log(word);
    // TODO: Maybe also check whether typed word is a valid word from the list
    if (word === '') {
      Alert.alert(
        'Enter a word',
        'Please enter the next word from your recovery phrase.',
        [
          {text: 'OK'},
        ],
        { cancelable: true }
      );
      return;
    }
    this.setState({
      words: words.concat(currentWord.trim().toLowerCase()),
      currentWord: '',
    });
  }

  wordChanged(word) {
    if (this.state.currentWord !== word) {
      this.setState({
        currentWord: word,
      });
    }
  }

  deleteWord(index) {
    const {words} = this.state;
    console.log(index);

    words.splice(index, 1);
    this.setState({
      words: words,
    });
  }

  sendPhrase() {
    const {dispatch, changePinRequestReady} = this.props;
    const {words} = this.state;

    if (words.length == 12) {
      dispatch({
        type: 'IrmaBridge.RecoveryLoadPhrase',
        recoveryPhrase: words,
      });

      changePinRequestReady(true);
    }
    else {
      Alert.alert(
        'Not enough words',
        'A recovery phrase needs 12 words.',
        [
          {text: 'OK'},
        ],
        { cancelable: true }
      );
    }
  }

  render() {
    const {recoveryStarted} = this.state;
    if(recoveryStarted) {
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

  renderRequestPhrase() {
    const {words, currentWord} = this.state;
    console.log(words);

    console.log("Rendering words");
    const wordsRendered = words.map((word, index) => {
      return (
        <CardItem key={'phrase:' + index} bordered={true}>
          <View style={{flexDirection: 'row'}}>
            <Text style={{flex: 5, textAlignVertical: 'center'}}>{word}</Text>
            <Button style={{flex: 1}} danger square onPress={() => this.deleteWord(index)}>
              <Icon name='trash' />
            </Button>
          </View>
        </CardItem>
      );
    });

    console.log(wordsRendered);

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
        <Button primary full onPress={::this.sendPhrase}><Text>Continue</Text></Button>
        <Footer>
          <View style={[{ width: "95%", flexDirection: 'row'}]}>
            <View style={{flex: 5, marginRight: 5}}>
              <Input value={currentWord} autoCapitalize='none' onChangeText={::this.wordChanged} placeholder='New word'/>
            </View>
            <View style={{flex: 1, padding: 5}}>
              <Button primary full onPress={::this.addWord}>
                <Icon name='md-add'/>
              </Button>
            </View>
          </View>
        </Footer>
      </KeyboardAwareContainer>
    );
  }
}
