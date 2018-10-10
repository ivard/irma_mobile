import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { resetNavigation } from 'lib/navigation';

import EnrollmentTeaser from './EnrollmentTeaser';
import fullCredentials from "../../store/mappers/fullCredentials";

const mapStateToProps = (state) => {
    const {
        enrollment: {
            status,
        }
    } = state;

    return {
        status,
    };
};

@connect(mapStateToProps)
export default class EnrollmentTeaserContainer extends Component {

  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    navigation: PropTypes.object.isRequired,
  }

  static navigationOptions = {
    header: null,
  }

  navigateToEnrollment() {
    const { dispatch, navigation } = this.props;

    dispatch({
      type: 'Enrollment.Start'
    });

    navigation.navigate('Enrollment');
  }

  recoverEnrollment() {
    const { navigation } = this.props;
    navigation.navigate('RecoveryLoadBackup');
  }

  navigateToCredentialDashboard() {
    const { navigation } = this.props;
    resetNavigation(navigation.dispatch, 'CredentialDashboard');
  }

  componentDidUpdate(prevProps) {
    if (prevProps.status !== this.props.status && this.props.status === 'recoveryDone') {
      this.navigateToCredentialDashboard();
    }
  }

  render() {
    return (
      <EnrollmentTeaser
        navigateToCredentialDashboard={::this.navigateToCredentialDashboard}
        navigateToEnrollment={::this.navigateToEnrollment}
        recoverEnrollment={::this.recoverEnrollment}
      />
    );
  }
}
