import React, { Component } from 'react';
import PropTypes from 'prop-types';

import KeyboardAwareContainer from 'lib/KeyboardAwareContainer';

import Footer from './children/Footer';
import Header from './children/Header';

import PaddedContent from 'lib/PaddedContent';
import {
  Text,
} from 'native-base';

export default class IssuanceSession extends Component {

  static propTypes = {
    navigateBack: PropTypes.func.isRequired,
    session: PropTypes.object.isRequired,
  }

  render() {
    const {
      navigateBack,
      session,
    } = this.props;

    return (
      <KeyboardAwareContainer>
        <Header title={'Add scheme'} navigateBack={navigateBack} />
        <PaddedContent testID="SchemeManagerSession">
          <Text>A new scheme might be added. Check your debug console.</Text>
        </PaddedContent>
        <Footer
          navigateBack={navigateBack}
          session={session}
          nextStep={() => {}}
        />
      </KeyboardAwareContainer>
    );
  }
}
