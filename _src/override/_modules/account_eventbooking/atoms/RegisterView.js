import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {ScrollView, StyleSheet, Text} from 'react-native';

import LinearGradient from 'react-native-linear-gradient';
import {ActivityIndicator} from 'react-native-paper';
import {SafeAreaView} from 'react-native-safe-area-context';

import {useQuery} from '@apollo/client';
import CustomView from '@root/_src/core/components/CustomView';
import {modules} from '@root/swift.config';

import {useTranslation} from 'react-i18next';

import EmailVerificationField from '@app/_modules/account_update_information/atoms/EmailVerificationField';
import PhoneNumberField from '@app/_modules/account_update_information/atoms/PhoneNumberField';
import FormComponent, {
  _onFormHandleResetRef,
} from '@app/components/_Forms/index';
import NavBar from '@app/components/NavBar';
import {FORM_FIELD} from '@app/helpers/Constants';
import {navigateTo} from '@app/helpers/Navigation';
import useCustomMutation from '@app/hooks/useCustomMutation';
import {useSubmitLock} from '@app/hooks/useSubmitLock';
import {GET_USER_DATA} from '@app/services/queries/user';
import * as Colors from '@app/styles/colors';

import {SUBMIT_EVENT_REGISTERATION} from '../services/schema';

import CustomDialog from './CustomDialog';
import EventBookingBg from './EventBookingBg';
import EventBookingBoxBg from './EventBookingBoxBg';

const BASE_FORM_SCHEMA = [
  {
    name: 'firstName',
    label: 'First Name',
    type: FORM_FIELD.INPUT,
    autoCapitalized: 'words',
    textContentType: 'givenName',
    placeholder: 'First Name',
    rules: {required: 'First Name is required'},
    textStyleProp: {height: 44},
    labelStyleProp: {
      marginBottom: -4,
      color: '#9E9E9E',
      fontSize: 12,
      fontWeight: '700',
      lineHeight: 22,
    },
  },
  {
    name: 'lastName',
    label: 'Last Name',
    type: FORM_FIELD.INPUT,
    textContentType: 'familyName',
    autoCapitalized: 'words',
    placeholder: 'Last Name',
    rules: {required: 'Last Name is required'},
    textStyleProp: {height: 44},
    labelStyleProp: {
      marginBottom: -4,
      color: '#9E9E9E',
      fontSize: 12,
      fontWeight: '700',
      lineHeight: 22,
    },
  },
  {
    name: 'countryCode',
    type: FORM_FIELD.CUSTOM,
    defaultValue: '+62',
    renderItem: null,
  },
  {
    name: 'phoneNumber',
    label: 'Phone Number',
    defaultValue: '',
    type: FORM_FIELD.CUSTOM,
    rules: {
      required: 'Phone Number is required',
      pattern: {
        value: /^(8[1-9][0-9]{7,10})$/,
        message: 'Please enter a valid phone number.',
      },
    },
    extraProps: ({watch, setValue}) => ({
      countryCode: watch('countryCode'),
      onCountryCodeChange: code =>
        setValue('countryCode', code, {shouldValidate: true}),
    }),
    renderItem: (
      <PhoneNumberField
        notVeritfy
        showInfoIcon={false}
        phoneCodeStyleProp={{height: 44, paddingVertical: 0, borderWidth: 2}}
        textStyleProp={{
          height: 40,
          paddingTop: 0,
          paddingBottom: 0,
          textAlignVertical: 'center',
        }}
        labelStyleProp={{
          marginTop: 8,
          marginBottom: -4,
          color: '#9E9E9E',
          fontSize: 12,
          fontWeight: '700',
          lineHeight: 22,
        }}
      />
    ),
  },
  {
    name: 'email',
    label: 'Email',
    type: FORM_FIELD.CUSTOM,
    rules: {
      required: 'Email is required',
      pattern: {
        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
        message: 'The email address format seems incorrect, please check it.',
      },
    },
    renderItem: (
      <EmailVerificationField
        notVeritfy
        showInfoIcon={false}
        textStyleProp={{
          height: 40,
          paddingTop: 0,
          paddingBottom: 0,
          textAlignVertical: 'center',
        }}
        labelStyleProp={{
          marginTop: -8,
          marginBottom: -4,
          color: '#9E9E9E',
          fontSize: 12,
          fontWeight: '700',
          lineHeight: 22,
        }}
      />
    ),
  },
];

const RegisterView = ({id, eventName}) => {
  const {t} = useTranslation();

  const [showDialog, setShowDialog] = useState({
    visible: false,
    title: '',
    subTitle: '',
  });

  const forms = useMemo(() => BASE_FORM_SCHEMA, []);

  const {data: customerInfoData, loading: customerInfoLoading} = useQuery(
    GET_USER_DATA,
    {
      fetchPolicy: 'cache-and-network',
    },
  );

  const {onRefetchData: onRegister} = useCustomMutation({
    schema: SUBMIT_EVENT_REGISTERATION,
  });

  const handleSumbit = useCallback(
    async values => {
      const {data} = await onRegister({
        params: {
          input: {
            event_id: id,
            first_name: values.firstName,
            last_name: values.lastName,
            phone: values.countryCode + values.phoneNumber,
            email: values.email,
          },
        },
        paramsOpt: {isReturn: true},
      });

      const {submitEventRegistration: res} = data || {};

      if (res?.success) {
        const {message, ticket} = res;

        const modalInfo = {
          ...ticket,
          title: message?.title,
          subTitle: message?.body,
        };

        navigateTo(modules.event_config.enable, modules.event_config.name, {
          modalName: 'CongratulationTwo',
          contentProps: {
            modalInfo,
          },
        });
      } else {
        setShowDialog({
          visible: true,
          title: res?.message?.title,
          subTitle: res?.message?.body,
        });
      }
    },
    [id, onRegister],
  );

  const {run: onSumbit, loading: btnLoading} = useSubmitLock(handleSumbit);

  useEffect(() => {
    if (customerInfoData?.customer) {
      const c = customerInfoData.customer;

      _onFormHandleResetRef.current?.({
        firstName: c.firstname,
        lastName: c.lastname,
        email: c.customer_email,
        phoneNumber: c.phonenumber?.slice(3) || '',
        countryCode: '+62',
      });
    }
  }, [customerInfoData]);

  return (
    <>
      <SafeAreaView style={{flex: 1}} edges={['bottom']}>
        <LinearGradient
          colors={['#FFD38B', '#FFA12E']}
          locations={[0.0126, 0.8576]}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          style={{...StyleSheet.absoluteFillObject}}
        />
        <EventBookingBg />
        <NavBar
          useBack
          center
          title={t('account.title.eventBooking')}
          stylesContainer={{
            backgroundColor: 'transparent',
          }}
        />
        {(customerInfoLoading || btnLoading) && (
          <CustomView
            flex={1}
            verticalCenter
            horizontalCenter
            backgroundColor="rgba(255,255,255,0.5)"
            pointerEvents="auto"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 998,
            }}>
            <ActivityIndicator size="large" color={Colors.PRIMARY} />
          </CustomView>
        )}
        <ScrollView style={{flex: 1, paddingHorizontal: 16, marginBottom: 20}}>
          <CustomView
            height={590}
            marginTop={12}
            backgroundColor={Colors.WHITE}
            borderRadius={16}>
            <EventBookingBoxBg />
            <CustomView paddingTop={20}>
              <Text
                style={{
                  marginTop: 4,
                  marginHorizontal: 20,
                  color: Colors.PRIMARY,
                  fontSize: 20,
                  fontWeight: '600',
                  lineHeight: 20,
                }}>
                {eventName}
              </Text>

              {/* form register */}
              <FormComponent
                fields={forms}
                buttonTitle="Submit"
                buttonLabelStyle={{
                  color: Colors.WHITE,
                  textTransform: 'none',
                }}
                buttonStyle={{
                  backgroundColor: Colors.PRIMARY,
                }}
                loading={btnLoading}
                onSubmit={onSumbit}
              />
            </CustomView>
          </CustomView>
        </ScrollView>
      </SafeAreaView>

      <CustomDialog
        visible={showDialog.visible}
        title={showDialog.title}
        subtitle={showDialog.subTitle}
        onClose={() => setShowDialog(prev => ({...prev, visible: false}))}
      />
    </>
  );
};

export default RegisterView;
