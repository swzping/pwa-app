import React from 'react';
import { useTranslation } from 'react-i18next';
import { View, ScrollView } from 'react-native';
import { Button } from 'react-native-paper';

import AppBar from '@app/components/AppBar';
import RenderIf from '@app/components/RenderIf';
import Text from '@app/components/Text';
import CustomView from '@app/components/CustomView';
import { Colors } from '@app/styles';
import styles from '@app/_modules/account_refer_friend/styles';
import Icon from 'react-native-vector-icons/FontAwesome';

const AccountReferFriendScreen = ({
  loading,
  onPressGenerate,
  referalData,
  isReferralInfoGenerated,
  onPressCart,
  onPressCopy,
}) => {
  const { t } = useTranslation();
  return (
    <View>
      <AppBar useBack useCart onPressCart={onPressCart} />
      <ScrollView>
        <CustomView paddingHorizontal={40} paddingVertical={30}>
          <Text style={{ fontSize: 24 }}>
            {t('account_refer_friend.view.referFriend')}
          </Text>
          <RenderIf
            condition={isReferralInfoGenerated === false && !referalData}>
            <Button
              color={Colors.PRIMARY}
              disabled={loading}
              loading={loading}
              onPress={onPressGenerate}
              style={styles.btnGenerate}>
              {t('account_refer_friend.label.generate')}
            </Button>
          </RenderIf>
          <RenderIf condition={referalData}>
            <Text>{referalData?.reward_message}</Text>
            <CustomView row marginTop={15}>
              <Text bold>
                {t('account_refer_friend.view.balanceExpDate')}:{' '}
              </Text>
              <Text>{referalData?.info_advocate?.balance_expired}</Text>
            </CustomView>
            <CustomView row marginTop={10}>
              <Text bold>{t('account_refer_friend.view.balance')}: </Text>
              <Text>{referalData?.info_advocate?.cumulative_balance}</Text>
            </CustomView>
            <CustomView row marginTop={10}>
              <Text bold>{t('account_refer_friend.view.invited')}: </Text>
              <Text>
                {referalData?.info_advocate?.invited_friends_count} {''}
                {t('account_refer_friend.view.friends')}
              </Text>
            </CustomView>
            <CustomView marginTop={10}>
              <Text bold>{t('account_refer_friend.view.rules')}: </Text>
              <CustomView marginLeft={-15}>
                <CustomView row marginTop={5}>
                  <CustomView marginTop={8} marginRight={10}>
                    <Icon name={'square'} size={5} />
                  </CustomView>
                  <Text>{referalData?.info_rule?.advocate_off_text}</Text>
                </CustomView>
                <CustomView row>
                  <CustomView marginTop={8} marginRight={10}>
                    <Icon name={'square'} size={5} />
                  </CustomView>
                  <Text>{referalData?.info_rule?.friend_off_text}</Text>
                </CustomView>
                <RenderIf
                  condition={
                    referalData?.info_rule?.registration_required_text
                  }>
                  <CustomView row>
                    <CustomView marginTop={8} marginRight={10}>
                      <Icon name={'square'} size={5} />
                    </CustomView>
                    <Text>
                      {referalData?.info_rule?.registration_required_text}
                    </Text>
                  </CustomView>
                </RenderIf>
              </CustomView>
              <CustomView
                marginTop={30}
                border={1}
                padding={10}
                borderRadius={30}
                borderColor={Colors.GRAY_MEDIUM}>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={{ marginHorizontal: 20 }}>
                  <Text>{referalData?.invite_url}</Text>
                </ScrollView>
              </CustomView>
              <Button
                color={Colors.WHITE}
                disabled={loading}
                loading={loading}
                onPress={() => onPressCopy(referalData?.invite_url)}
                style={styles.btnCopy}>
                {t('account_refer_friend.label.copy')}
              </Button>
            </CustomView>
          </RenderIf>
        </CustomView>
      </ScrollView>
    </View>
  );
};

export default AccountReferFriendScreen;
