import color from 'color';

import { Platform, Dimensions, PixelRatio } from 'react-native';

const deviceHeight = Dimensions.get('window').height;
const deviceWidth = Dimensions.get('window').width;
const platform = Platform.OS;
const platformStyle = undefined;
const isIphoneX =
  platform === 'ios' && (deviceHeight === 812 || deviceWidth === 812);

const colors = {
  backgroundAlabaster: '#F8F8F8',
  logoBlue: '#009AFF', // TODO: This color is still 'off'
  darkBlue: '#0096bf',

  iosBlue: '#007aff',
  iosRed: '#ff3b30',
  iosGreen: '#4cd964',
}

// THEME CHANGE: Contains various "true ||" additions which forces iOS theming
export default {
  platformStyle,
  platform,

  colors,

  // Navigation
  topBarBgColor: colors.logoBlue,
  topBarContentColor: 'white',

  //Accordion
  headerStyle: '#edebed',
  iconStyle: '#000',
  contentStyle: '#f5f4f5',
  expandedIconStyle: '#000',
  accordionBorderColor: '#d3d3d3',

  // Android
  androidRipple: true,
  androidRippleColor: 'rgba(256, 256, 256, 0.3)',
  androidRippleColorDark: 'rgba(0, 0, 0, 0.15)',
  btnUppercaseAndroidText: false,

  // Badge
  badgeBg: '#ED1727',
  badgeColor: '#fff',
  badgePadding: platform === 'ios' ? 3 : 0,

  // Button
  btnFontFamily: platform === 'ios' ? 'System' : 'Roboto_medium',
  btnDisabledBg: '#b5b5b5',
  buttonPadding: 6,
  buttonIconPadding: 16,

  get btnPrimaryBg() {
    return this.brandPrimary;
  },
  get btnPrimaryColor() {
    return this.inverseTextColor;
  },
  get btnInfoBg() {
    return this.brandInfo;
  },
  get btnInfoColor() {
    return this.inverseTextColor;
  },
  get btnSuccessBg() {
    return this.brandSuccess;
  },
  get btnSuccessColor() {
    return this.inverseTextColor;
  },
  get btnDangerBg() {
    return this.brandDanger;
  },
  get btnDangerColor() {
    return this.inverseTextColor;
  },
  get btnWarningBg() {
    return this.brandWarning;
  },
  get btnWarningColor() {
    return this.inverseTextColor;
  },
  get btnTextSize() {
    return platform === 'ios' ? this.fontSizeBase * 1.1 : this.fontSizeBase - 1;
  },
  get btnTextSizeLarge() {
    return this.fontSizeBase * 1.5;
  },
  get btnTextSizeSmall() {
    return this.fontSizeBase * 0.8;
  },
  get borderRadiusLarge() {
    return this.fontSizeBase * 3.8;
  },
  get iconSizeLarge() {
    return this.iconFontSize * 1.5;
  },
  get iconSizeSmall() {
    return this.iconFontSize * 0.6;
  },

  // Card
  cardDefaultBg: '#fff',
  cardBorderColor: '#ccc',
  cardBorderRadius: 2,
  cardItemPadding: platform === 'ios' ? 10 : 12,

  // CheckBox
  CheckboxRadius: platform === 'ios' ? 13 : 0,
  CheckboxBorderWidth: platform === 'ios' ? 1 : 2,
  CheckboxPaddingLeft: platform === 'ios' ? 4 : 2,
  CheckboxPaddingBottom: platform === 'ios' ? 0 : 5,
  CheckboxIconSize: platform === 'ios' ? 21 : 16,
  CheckboxIconMarginTop: platform === 'ios' ? undefined : 1,
  CheckboxFontSize: platform === 'ios' ? 23 / 0.9 : 17,
  checkboxBgColor: '#039BE5',
  checkboxSize: 20,
  checkboxTickColor: '#fff',

  // Color
  brandPrimary: colors.logoBlue,
  brandInfo: '#62B1F6',
  brandSuccess: '#5cb85c',
  brandDanger: '#d9534f',
  brandWarning: '#f0ad4e',
  brandDark: '#000',
  brandLight: '#8c8c8c', // THEME CHANGE

  //Container
  containerBgColor: colors.backgroundAlabaster,

  //Date Picker
  datePickerTextColor: '#000',
  datePickerBg: 'transparent',

  // Font
  DefaultFontSize: 16,
  fontFamily: platform === 'ios' ? 'System' : 'Roboto',
  fontSizeBase: 15,
  get fontSizeH1() {
    return this.fontSizeBase * 1.8;
  },
  get fontSizeH2() {
    return this.fontSizeBase * 1.6;
  },
  get fontSizeH3() {
    return this.fontSizeBase * 1.4;
  },

  // Footer
  footerDefaultBg: 'white',
  footerHeight: isIphoneX ? 45 : 55,
  footerPaddingTop: isIphoneX ? 22 : 0,
  footerPaddingBottom: 5,

  // FooterTab
  tabBarTextColor: platform === 'ios' ? '#6b6b6b' : '#b3c7f9',
  tabBarTextSize: platform === 'ios' ? 14 : 11,
  activeTab: platform === 'ios' ? '#007aff' : '#fff',
  sTabBarActiveTextColor: '#007aff',
  tabBarActiveTextColor: platform === 'ios' ? '#007aff' : '#fff',
  tabActiveBgColor: platform === 'ios' ? '#cde1f9' : '#3F51B5',

  // Header
  toolbarBtnColor: true || platform === 'ios' ? '#007aff' : '#fff',
  toolbarDefaultBg: colors.backgroundAlabaster,
  toolbarHeight: platform === 'ios' ? 64 : 56,
  toolbarSearchIconSize: platform === 'ios' ? 20 : 23,
  toolbarInputColor: true || platform === 'ios' ? '#CECDD2' : '#fff',
  searchBarHeight: platform === 'ios' ? 30 : 40,
  searchBarInputHeight: platform === 'ios' ? 30 : 50,
  toolbarBtnTextColor: true || platform === 'ios' ? '#007aff' : '#fff',
  toolbarDefaultBorder: true || platform === 'ios' ? '#a7a6ab' : '#3F51B5',
  iosStatusbar: true || platform === 'ios' ? 'dark-content' : 'light-content',
  get statusBarColor() {
    return color(this.toolbarDefaultBg)
      .darken(0.2)
      .hex();
  },
  get darkenHeader() {
    return color(this.tabBgColor)
      .darken(0.03)
      .hex();
  },

  // Icon
  iconFamily: 'Ionicons',
  iconFontSize: platform === 'ios' ? 30 : 28,
  iconHeaderSize: platform === 'ios' ? 33 : 24,

  // InputGroup
  inputFontSize: 17,
  inputBorderColor: '#D9D5DC',
  inputSuccessBorderColor: '#2b8339',
  inputErrorBorderColor: '#ed2f2f',
  inputHeightBase: 50,
  get inputColor() {
    return this.textColor;
  },
  get inputColorPlaceholder() {
    return '#575757';
  },

  // Line Height
  btnLineHeight: 19,
  lineHeightH1: 32,
  lineHeightH2: 27,
  lineHeightH3: 22,
  lineHeight: platform === 'ios' ? 20 : 24,
  listItemSelected: platform === 'ios' ? '#007aff' : '#3F51B5',

  // List
  listBg: 'transparent',
  listBorderColor: '#c9c9c9',
  listDividerBg: '#f4f4f4',
  listBtnUnderlayColor: '#DDD',
  listItemPadding: platform === 'ios' ? 10 : 12,
  listNoteColor: '#808080',
  listNoteSize: 13,

  // Progress Bar
  defaultProgressColor: '#E4202D',
  inverseProgressColor: '#1A191B',

  // Radio Button
  radioBtnSize: platform === 'ios' ? 25 : 23,
  radioSelectedColorAndroid: '#3F51B5',
  radioBtnLineHeight: platform === 'ios' ? 29 : 24,
  get radioColor() {
    return this.brandPrimary;
  },

  // Segment
  segmentBackgroundColor: colors.backgroundAlabaster,
  segmentActiveBackgroundColor: platform === 'ios' ? '#007aff' : '#fff',
  segmentTextColor: platform === 'ios' ? '#007aff' : '#fff',
  segmentActiveTextColor: platform === 'ios' ? '#fff' : '#3F51B5',
  segmentBorderColor: platform === 'ios' ? '#007aff' : '#fff',
  segmentBorderColorMain: platform === 'ios' ? '#a7a6ab' : '#3F51B5',

  // Spinner
  defaultSpinnerColor: '#45D56E',
  inverseSpinnerColor: '#1A191B',

  // Tab
  tabDefaultBg: colors.backgroundAlabaster,
  topTabBarTextColor: platform === 'ios' ? '#6b6b6b' : '#b3c7f9',
  topTabBarActiveTextColor: platform === 'ios' ? '#007aff' : '#fff',
  topTabBarBorderColor: platform === 'ios' ? '#a7a6ab' : '#fff',
  topTabBarActiveBorderColor: platform === 'ios' ? '#007aff' : '#fff',

  // Tabs
  tabBgColor: '#F8F8F8',
  tabFontSize: 15,

  // Text
  textColor: '#000',
  inverseTextColor: '#fff',
  noteFontSize: 14,
  get defaultTextColor() {
    return this.textColor;
  },

  // Title
  titleFontfamily: platform === 'ios' ? 'System' : 'Roboto_medium',
  titleFontSize: platform === 'ios' ? 17 : 19,
  subTitleFontSize: platform === 'ios' ? 11 : 14,
  subtitleColor: platform === 'ios' ? '#8e8e93' : '#FFF',
  titleFontColor: true || platform === 'ios' ? '#000' : '#FFF',

  // Other
  borderRadiusBase: platform === 'ios' ? 5 : 2,
  borderWidth: 1 / PixelRatio.getPixelSizeForLayoutSize(1),
  contentPadding: 10,
  dropdownLinkColor: '#414142',
  inputLineHeight: 24,
  deviceWidth,
  deviceHeight,
  isIphoneX: false,
  isActuallyIphoneX: isIphoneX,
  inputGroupRoundedBorderRadius: 30,

  //iPhoneX SafeArea
  Inset: {
    portrait: {
      topInset: 24,
      leftInset: 0,
      rightInset: 0,
      bottomInset: 34
    },
    landscape: {
      topInset: 0,
      leftInset: 44,
      rightInset: 44,
      bottomInset: 21
    }
  }
};
