import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Dimensions, ImageBackground, Platform } from 'react-native';

import {
  Button,
  Text,
  Content,
  View,
  Footer,
} from 'native-base';

import Swiper from 'react-native-swiper';

import { namespacedTranslation } from 'lib/i18n';

import passportImage from './children/passport.jpg';
import shopImage from './children/shop.jpg';
import authImage from './children/auth.jpg';

const t = namespacedTranslation('EnrollmentTeaser');
const isSmallDevice = Dimensions.get('window').width < 350;
const isIos = Platform.OS === 'ios';

export default class EnrollmentTeaser extends Component {

  static propTypes = {
    navigateToEnrollment: PropTypes.func.isRequired,
    recoverEnrollment: PropTypes.func.isRequired,
    navigateToCredentialDashboard: PropTypes.func.isRequired,
  }

  renderFooter(index, total, swiperLib) {
    const { navigateToEnrollment, recoverEnrollment, navigateToCredentialDashboard } = this.props;

    const footerStyle = {
      height: 110,
      flexDirection: 'column',
      justifyContent: 'space-between',
      backgroundColor: 'transparent',
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
    };

    return (
      <View {...footerStyle}>
        <View style={{flexDirection: 'row', justifyContent: 'center'}}>
          <Button testID="enrollButton" onPress={navigateToEnrollment} style={{marginTop: 5, marginRight: 5}}>
            <Text>{ t('.openAccount') }</Text>
          </Button>
          <Button testID="recoverButton" onPress={recoverEnrollment} style={{marginTop: 5, marginLeft: 5}}>
                      <Text>{ 'Recover' }</Text>
                    </Button>
        </View>
        <Footer style={{height: 30, backgroundColor: 'rgba(255, 255, 255, 0.6)'}}>
          <Button testID="dismissButton" transparent small onPress={navigateToCredentialDashboard}>
            <Text>{ t('.notNow') }</Text>
          </Button>
        </Footer>
        { swiperLib.renderPagination() }
      </View>
    );
  }

  renderTexts(statement, quote) {
    let statementFontsize = 26;
    let quoteFontsize = 30;
    if (isSmallDevice) {
      statementFontsize -= 4;
      quoteFontsize -= 4;
    }
    if (!isIos) {
      statementFontsize -= 2;
      quoteFontsize -= 4;
    }

    const statementStyle = {
      color: '#305f91',
      fontFamily: isIos ? undefined : 'sans-serif',
      fontSize: statementFontsize,
      fontWeight: '300',
      marginTop: isIos ? 40 : 20,
      paddingHorizontal: 20,
    };

    const quoteStyle = {
      color: '#ffffff',
      fontFamily: isIos ? 'Times New Roman' : 'serif',
      fontSize: quoteFontsize,
      fontStyle: 'italic',
      fontWeight: '800',
      marginTop: isSmallDevice ? 24 : 30,
      paddingHorizontal: 20,
      textAlign: 'right',
    };

    return (
      <Content>
        <Text style={statementStyle}>{ statement }</Text>
        <Text style={quoteStyle}>{ quote }</Text>
      </Content>
    );
  }

  render() {
    // TODO: Can the second image be edited to show the wine bottle more prominently, for the >18 use case?

    return (
      <Swiper
        testID="EnrollmentTeaser"
        loop={false}
        paginationStyle={{bottom: 40}}
        renderPagination={::this.renderFooter}
        showsButtons={true}
      >
        <ImageBackground
          imageStyle={{marginTop: isSmallDevice && !isIos ? 225 : 300}}
          source={passportImage}
          style={{flex: 1, backgroundColor: '#2dbfce'}}
        >
          { this.renderTexts(
              t('.slide1.statement'),
              t('.slide1.quote'),
          )}
        </ImageBackground>
        <ImageBackground
          imageStyle={{marginTop: 100}}
          source={shopImage}
          style={{flex: 1, backgroundColor: '#abe3f4'}}
        >
          { this.renderTexts(
              t('.slide2.statement'),
              t('.slide2.quote'),
          )}
        </ImageBackground>
        <ImageBackground
          imageStyle={{marginTop: 100}}
          source={authImage}
          style={{flex: 1, backgroundColor: '#65b7cc'}}
        >
          { this.renderTexts(
              t('.slide3.statement'),
              t('.slide3.quote'),
          )}
        </ImageBackground>
      </Swiper>
    );
  }
}
