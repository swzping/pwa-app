import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import {ScrollView, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useTheme} from 'react-native-paper';
import {Colors} from '@app/styles';
import {formSchema} from '@app/_modules/auth_forgot/forms';
import CustomView from '@app/components/CustomView';
import Forms from '@app/components/_Forms/index';
import Text from '@app/components/Text';
import Alert from '@app/components/Alert';
import RenderIf from '@app/components/RenderIf';
import styles from '@app/_modules/auth_signin/styles';
import NavBar from '@app/components/NavBar/index';

/**
 * ---------------------------------------------------- *
 * @component AuthSigningView
 * @param {Object} Views.propTypes - defined using PropTypes
 * @summary View Component for Sign In
 * @returns Components
 * ---------------------------------------------------- *
 */
const Views = ({
  t,
  loading,
  alert,
  email,
  onSignin,
  onError,
  onNavigateToCart,
  requestEmail,
  renderRecaptchaBridge,
}) => {
  const theme = useTheme();
  const {background} = _.get(theme, 'colors');

  return (
    <SafeAreaView style={[styles.container, {backgroundColor: background}]}>
      <NavBar
        center
        useWhite
        useClose
        titleBold
        title={requestEmail ? t('auth_signin.welcome_guardian') : t('auth_forgot.title.forgotPassword')}
        childrenRight={<CustomView width={'12%'} />}
      />
      <RenderIf condition={alert}>
        <View style={styles.errorAlert} pointerEvents="box-none">
          <Alert type={alert?.type} message={alert?.message} />
        </View>
      </RenderIf>
      <ScrollView contentContainerStyle={styles.mainContainer}>
        <CustomView>
          <RenderIf condition={!requestEmail}>
            <CustomView marginVertical={24}>
              <Text style={{textAlign: 'center', fontSize: 26}}>
                {t('auth_forgot.view.recoverPassword')}
              </Text>
            </CustomView>
          </RenderIf>

          <RenderIf condition={requestEmail}>
            <CustomView marginTop={58}>
              <Text style={{textAlign: 'center', fontSize: 22, color: '#FF8200', lineHeight: 32, fontWeight: 700}}>
                {t('auth_forgot.view.forgetYourPassword')}
              </Text>
            </CustomView>
            <CustomView marginVertical={24} marginTop={8}>
              <Text style={{textAlign: 'center', fontSize: 16, color: '#BDBDBD', lineHeight: 34, fontWeight: 600}}>
                {t('auth_forgot.view.recoverPasswordResetPassword')}
              </Text>
            </CustomView>
            <CustomView marginBottom={24} paddingHorizontal={40}>
              <Text style={{textAlign: 'center', fontSize: 14, lineHeight: 34, color: '#000000'}}>
                {`${t('auth_forgot.view.accountAssociated')} ${email}, ${t(
                  'auth_forgot.view.receiveEmail',
                )}`}
              </Text>
            </CustomView>
          </RenderIf>
          <RenderIf condition={!requestEmail}>
            <CustomView marginBottom={24} paddingHorizontal={50}>
              <Text style={{textAlign: 'center'}}>
                {t('auth_forgot.view.pleaseEnterEmail')}
              </Text>
            </CustomView>
            <CustomView paddingHorizontal={20}>
              <Forms
                fields={formSchema}
                onSubmit={onSignin}
                onError={onError}
                loading={loading}
                buttonLabelColor={Colors.WHITE}
                buttonTitle={t('auth_forgot.title.submit')}
                buttonStyle={{backgroundColor: Colors.PRIMARY}}
                buttonCancelStyle={{backgroundColor: Colors.WHITE}}
                cancelButton
              />
            </CustomView>
          </RenderIf>
        </CustomView>
        {renderRecaptchaBridge()}
      </ScrollView>
    </SafeAreaView>
  );
};

Views.propTypes = {
  // use for displaying label from translation module
  t: PropTypes.func.isRequired,
  // use to determined loading state
  loading: PropTypes.bool,
  // use as callback function on Submit
  onSignin: PropTypes.func.isRequired,
  // use as callback function for onError from the useForm
  onError: PropTypes.func,
};

export default Views;
