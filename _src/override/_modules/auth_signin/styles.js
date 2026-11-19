import { MAX_WIDTH, padding, margin } from '@app/styles/mixins';
import { Typography } from '@app/styles/index';
import { StyleSheet } from 'react-native';
import { MD2Colors as Colors } from 'react-native-paper';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  mainContainer: {
    width: MAX_WIDTH,
    paddingTop: 20,
    paddingHorizontal: 20,
    flexGrow: 1,
  },
  mainTitle: {
    fontSize: 23,
    fontWeight: '700',
    color: '#333333',
    marginTop: 10,
    marginBottom: 12,
  },
  instructionText: {
    fontSize: 15,
    color: '#666666',
    marginBottom: 30,
    lineHeight: 20,
  },
  phoneInputContainer: {
    marginBottom: 30,
  },
  phoneLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333333',
    marginBottom: 8,
  },
  phoneInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  countryCodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 14,
    marginRight: 12,
    // 与输入框保持一致的浅灰背景
    backgroundColor: '#FAFAFA',
    minWidth: 80,
  },
  countryCodeText: {
    fontSize: 16,
    color: '#333333',
    marginRight: 8,
  },
  phoneInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 14,
    color: '#333333',
    // borderWidth, borderColor, borderRadius, backgroundColor 由 InputUI 控制
  },
  primaryButton: {
    backgroundColor: '#FF8200',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  primaryButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    textTransform: 'uppercase',
  },
  separatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  separatorText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: '#666666',
  },
  emailAccountHint: {
    fontSize: 15,
    color: 'rgba(33, 33, 33, 1)',
    textAlign: 'center',
    marginBottom: 12,
    fontWeight: 500,
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: Colors.orange || '#FF8200',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    marginBottom: 40,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.orange || '#FF8200',
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    paddingHorizontal: 20,
  },
  caption: {
    fontSize: 14,
    color: '#666666',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  textInputFrame: { width: MAX_WIDTH, ...padding(0, 25, 0, 25) },
  textInput: { backgroundColor: Colors.white },
  btnSignin: { width: 150, ...margin(20, 0, 0, 0) },
  btnSignup: {
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
  logoImage: {
    alignSelf: 'center',
    resizeMode: 'contain',
    ...margin(0, 0, 20, 0),
    width: 300,
  },
  footerForm: {
    marginTop: -55,
  },
  navbarStyle: {
    ...Typography.FONT_BOLD,
    fontWeight: 'bold',
  },
  emailSigninContainer: {
    width: MAX_WIDTH,
    paddingTop: 10,
    // paddingHorizontal: 20,
    flexGrow: 1,
  },
  emailSigninButton: {
    backgroundColor: Colors.PRIMARY || '#FF8200',
    borderRadius: 12,
    paddingVertical: 6,
  },
  emailSigninButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  forgotPasswordLink: {
    alignItems: 'center',
    marginBottom: 24,
    marginTop: -50,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: Colors.PRIMARY || '#FF8200',
    textDecorationLine: 'underline',
    fontWeight: '500',
  },
  emailSigninTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000000',
    marginTop: 20,
    marginBottom: 12,
    paddingHorizontal: 20,
  },
  emailSigninInstruction: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 15,
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  phoneNumberButton: {
    borderWidth: 1,
    borderColor: Colors.PRIMARY || '#FF8200',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    marginTop: 20,
    marginBottom: 40,
    width: '90%',
    marginLeft: '5%',
  },
  phoneNumberButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.PRIMARY || '#FF8200',
  },
  // Close Confirm Dialog Styles
  dialogOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dialogContainer: {
    width: '90%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  dialogTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 12,
    textAlign: 'center',
  },
  dialogMessage: {
    fontSize: 14,
    color: '#000000',
    marginBottom: 20,
    textAlign: 'center',
    lineHeight: 20,
  },
  dialogButtonRow: {
    flexDirection: 'row',
    width: '100%',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingTop: 16,
    justifyContent: 'space-between',
  },
  dialogCloseButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.PRIMARY || '#FF8200',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    marginRight: 6,
  },
  dialogCloseButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.PRIMARY || '#FF8200',
  },
  dialogBackButton: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.PRIMARY || '#FF8200',
    marginLeft: 6,
  },
  dialogBackButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  errorAlert: {
    position: 'absolute',
    top: 100, // 在 NavBar 下方
    left: 16,
    right: 16,
    zIndex: 1000,
  },

  // Password Input Mode Styles
  phoneDisplayContainer: {
    borderRadius: 12,
    paddingVertical: 24,
  },
  phoneDisplayLabel: {
    fontSize: 14,
    color: '#212121',
    fontWeight: '500',
    marginBottom: 8,
  },
  phoneDisplayText: {
    fontSize: 14,
    color: '#212121',
    fontWeight: '600',
  },
  passwordInputContainer: {
    marginBottom: 4,
  },
  passwordLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333333',
    marginBottom: 8,
  },
  requiredAsterisk: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F04438',
  },
  createPasswordFormContainer: {
    paddingHorizontal: 0,
    marginBottom: 0,
  },
  passwordInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#333333',
    backgroundColor: '#FAFAFA',
  },
  passwordInputError: {
    borderColor: '#E21A23',
  },
  passwordErrorText: {
    fontSize: 12,
    color: '#E21A23',
    marginTop: 4,
  },
  forgotPasswordLinkPwd: {
    alignSelf: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  forgotPasswordTextPwd: {
    fontSize: 14,
    color: '#FF8200',
    textDecorationLine: 'underline',
    fontWeight: '500',
  },
});

export default styles;
