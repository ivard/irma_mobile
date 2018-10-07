import React, {Component} from 'react';
import {
  CardItem,
  H3, Button, Icon,
  Text, View, Footer, Form, Input,
} from 'native-base';
import Card from 'lib/UnwrappedCard';
import PaddedContent from 'lib/PaddedContent';
import KeyboardAwareContainer from "../../lib/KeyboardAwareContainer";
import PropTypes from 'prop-types';
import {connect} from "react-redux";
import PinEntry from "../Session/children/PinEntry";
import FormInput from "../../lib/form/FormInput";
import {Alert} from "react-native";

const mapStateToProps = (state) => {
  const {
    recovery: {
    }
  } = state;

  return {
  };
};

@connect(mapStateToProps)
export default class RecoveryLoadBackup extends Component {

  static propTypes = {
    dispatch: PropTypes.func.isRequired,
  };

  state = {
    words: [],
    currentWord: '',
    remainingAttempts: PropTypes.number.isRequired,
    blocked: PropTypes.number.isRequired,
  };

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

  addWord() {
    const {words, currentWord} = this.state;
    console.log(currentWord);
    this.setState({
      words: words.concat(currentWord),
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
    const {dispatch} = this.props;
    const {words} = this.state;

    if (words.length == 12) {
      dispatch({
        type: 'IrmaBridge.RecoveryLoadPhrase',
        recoveryPhrase: words,
      });
    }
    else {
      Alert.alert(
        'Not enough words',
        'A recovery phrase needs 12 words.',
        [
          {text: 'OK'},
        ],
        { cancelable: false }
      );
    }
  }

  render() {
    return this.renderRequestPhrase();
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

  componentDidUpdate(prevProps, prevState) {
  }
}
