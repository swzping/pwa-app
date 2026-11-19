import React from 'react';
import {ScrollView, StyleSheet, Text, TouchableOpacity} from 'react-native';

import LinearGradient from 'react-native-linear-gradient';
import {SafeAreaView} from 'react-native-safe-area-context';
import {LocalSvg} from 'react-native-svg/css';
import FeatherIcon from 'react-native-vector-icons/Feather';

import {useNavigation} from '@react-navigation/native';

import CustomView from '@root/_src/core/components/CustomView';
import {modules} from '@root/swift.config';

import {useTranslation} from 'react-i18next';

import NavBar from '@app/components/NavBar';
import {navigateTo} from '@app/helpers/Navigation';
import {Storage} from '@app/helpers/Storage';
import {buildLink} from '@app/helpers/Url';
import * as Colors from '@app/styles/colors';

import {getExpireTime} from '../services/util';
import useOfflineBookingCountdown from '../useOfflineBookingCountdown';

import CopyCode from './CopyCode';
import EventBookingBg from './EventBookingBg';
const CongratulationOneView = ({modalInfo}) => {
  const {t} = useTranslation();
  const navigation = useNavigation();
  useOfflineBookingCountdown();

  const onRegister = async () => {
    const memberId = await Storage.get(Storage.name.MEMBER_ID);
    const updatedUrl = buildLink(modalInfo.registerUrl, {
      member: memberId,
      v_code: modalInfo.code,
    });
    navigateTo(
      modules.full_screen_web_view.enable,
      modules.full_screen_web_view.name,
      {
        url: updatedUrl,
        isNavBar: false,
      },
    );
  };

  return (
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
        closeColor={Colors.BLACK}
        stylesContainer={{
          backgroundColor: 'transparent',
        }}
        useBackPress={() => {
          navigation.goBack();
        }}
      />
      <ScrollView style={{flex: 1, paddingHorizontal: 16}}>
        {/* congratulation */}
        <CustomView
          horizontalCenter
          marginTop={116}
          backgroundColor={Colors.WHITE}
          borderRadius={16}
          style={{minHeight: 251}}>
          <LocalSvg
            asset={require('@app/assets/svg/congratulation.svg')}
            style={{
              position: 'absolute',
              top: -58,
              width: 114,
              height: 114,
              alignSelf: 'center',
              zIndex: 10,
            }}
          />

          <Text
            style={{
              marginHorizontal: 40,
              marginTop: 70,
              fontSize: 24,
              fontWeight: '700',
              color: '#1B1A19',
              textAlign: 'center',
            }}>
            {modalInfo.title}
          </Text>
          <Text
            style={{
              marginHorizontal: 40,
              marginTop: 16,
              fontSize: 14,
              fontWeight: '700',
              color: '#757575',
              linheHeight: 22,
              textAlign: 'center',
            }}>
            {modalInfo.subTitle}
          </Text>
          <TouchableOpacity
            disabled={!modalInfo.registerUrl}
            activeOpacity={0.8}
            onPress={onRegister}
            style={{
              position: 'relative',
              flexDirection: 'row',
              alignItems: 'center',
              minWidth: 160,
              height: 40,
              marginHorizontal: 40,
              marginTop: 16,
              marginBottom: 20,
              paddingHorizontal: 60,
              backgroundColor: '#ff8200',
              borderRadius: 8,
            }}>
            <Text
              style={{
                color: Colors.WHITE,
                fontSize: 14,
                fontWeight: '700',
                textTransform: 'none',
              }}>
              {modalInfo.btnName}
            </Text>
            <FeatherIcon
              name="chevron-right"
              size={16}
              color={Colors.WHITE}
              style={{
                position: 'absolute',
                top: 12,
                right: 24,
              }}
            />
          </TouchableOpacity>
        </CustomView>

        {/* reserve code */}
        <CustomView
          marginTop={24}
          backgroundColor={Colors.WHITE}
          borderRadius={16}
          style={{minHeight: 138}}>
          <Text
            style={{
              marginTop: 12,
              marginHorizontal: 18,
              fontSize: 18,
              fontWeight: '700',
              color: Colors.PRIMARY,
            }}>
            {t('account_eventbooking.label.registrationCode')}
          </Text>
          <CopyCode
            bgStyle={{
              minHeight: 56,
              marginTop: 8,
              marginHorizontal: 18,
              zIndex: 10,
            }}
            code={modalInfo.code}
          />
          <CustomView
            row
            horizontalStart
            marginTop={6}
            paddingHorizontal={12}
            paddingBottom={4}
            style={{flexWrap: 'wrap'}}>
            <Text
              style={{
                flexShrink: 1,
                marginLeft: 8,
                fontSize: 12,
                fontWeight: '500',
                color: Colors.PRIMARY,
              }}>
              •{'  '}
              {t('account_eventbooking.desc.codeTips', {
                time: getExpireTime(modalInfo.createdTime, modalInfo.time),
              })}
            </Text>
          </CustomView>
          <CustomView
            row
            horizontalStart
            paddingHorizontal={12}
            paddingBottom={16}
            style={{flexWrap: 'wrap'}}>
            <Text
              style={{
                flexShrink: 1,
                marginLeft: 8,
                fontSize: 12,
                fontWeight: '500',
                color: Colors.PRIMARY,
              }}>
              •{'  '}
              {t('account_eventbooking.desc.notFinalTicket')}
            </Text>
          </CustomView>
        </CustomView>
      </ScrollView>
    </SafeAreaView>
  );
};

export default CongratulationOneView;
