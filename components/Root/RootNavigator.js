import {DrawerNavigator, StackNavigator} from 'react-navigation';

import About from 'components/About';
import CredentialDashboard from 'components/CredentialDashboard';
import Enrollment from 'components/Enrollment';
import EnrollmentTeaser from 'components/EnrollmentTeaser';
import ChangePin from 'components/ChangePin';
import PreferencesDashboard from 'components/PreferencesDashboard';
import QRScanner from 'components/QRScanner';
import Session from 'components/Session';
import Sidebar from './children/Sidebar';
import RecoveryMakeBackup from "components/RecoveryMakeBackup";
import RecoveryLoadBackup from "components/RecoveryLoadBackup";

const CredentialDashboardNavigator = StackNavigator({
  About: About,
  CredentialDashboard: CredentialDashboard,
  Enrollment: Enrollment,
  EnrollmentTeaser: EnrollmentTeaser,
  ChangePin: ChangePin,
  PreferencesDashboard: PreferencesDashboard,
  QRScanner: QRScanner,
  Session: Session,
  RecoveryMakeBackup: RecoveryMakeBackup,
  RecoveryLoadBackup: RecoveryLoadBackup,
}, {
  initialRouteName: 'CredentialDashboard',
});

const PreferencesDashboardNavigator = StackNavigator({
  PreferencesDashboard: PreferencesDashboard,
}, {
  initialRouteName: 'PreferencesDashboard',
  headerMode: 'none',
});

const RootNavigator = DrawerNavigator(
  {
    CredentialDashboardNavigator: CredentialDashboardNavigator,
    Enrollment: Enrollment,
    EnrollmentTeaser: EnrollmentTeaser,
    PreferencesDashboardNavigator: PreferencesDashboardNavigator,
  }, {
    initialRouteName: 'CredentialDashboardNavigator',
    contentComponent: Sidebar,
  }
);

export default RootNavigator;
