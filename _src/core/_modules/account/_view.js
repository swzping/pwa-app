import React from 'react';
import {
  Button,
  useTheme,
  Avatar,
  TouchableRipple,
  Caption,
  Badge,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/Feather';
import {SafeAreaView, ScrollView} from 'react-native';
import {modules} from '@root/swift.config';

import Text from '@app/components/Text';
import RenderIf from '@app/components/RenderIf/index';
import CustomView from '@app/components/CustomView/index';

import styles from '@app/_modules/account/styles';
import AppBarComponent from '@app/components/AppBar/index';
import _ from 'lodash';

const AccountScreen = ({
  t,
  onLogOut,
  userData,
  onEditProfile,
  onNavigateMenuPage,
}) => {
  const theme = useTheme();
  const {disabled} = _.get(theme, 'colors');
  const NavigationBar = ({label, icon, onPress, mode, style}) => {
    return (
      <Button
        mode={mode}
        onPress={onPress}
        style={
          style || {
            width: '100%',
            paddingVertical: 10,
            borderBottomWidth: 1,
            borderBottomColor: disabled,
          }
        }
        contentStyle={
          !style && {
            paddingHorizontal: 10,
            justifyContent: 'space-between',
            flexDirection: 'row-reverse',
          }
        }
        compact={!mode && true}
        icon={({size, color}) => (
          <Icon color={mode ? color : disabled} size={size} name={icon} />
        )}>
        {label}
      </Button>
    );
  };

  return (
    <SafeAreaView style={{flex: 1}}>
      <AppBarComponent title="Account Preferences" />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <CustomView style={{paddingHorizontal: 20}}>
          <RenderIf condition={userData && userData?.firstname}>
            <TouchableRipple onPress={onEditProfile}>
              <CustomView horizontalCenter row paddingVertical={30}>
                <Avatar.Text
                  style={{marginRight: -20}}
                  labelStyle={{fontSize: 18}}
                  size={75}
                  label={_.first(_.words(userData?.firstname)) || 'U'}
                />
                <Badge style={{marginRight: 20}}>
                  <Icon name={'edit'} />
                </Badge>
                <CustomView>
                  <RenderIf condition={userData === null}>
                    <Text>{t('account.view.loading')}</Text>
                  </RenderIf>
                  <CustomView horizontalStart>
                    <RenderIf condition={userData !== null}>
                      <Text large bold>
                        {_.startCase(userData?.firstname)}{' '}
                        {_.startCase(userData?.lastname)}
                      </Text>
                      <Caption>{userData?.email}</Caption>
                    </RenderIf>
                  </CustomView>
                </CustomView>
              </CustomView>
            </TouchableRipple>
          </RenderIf>
          {modules.account.atoms.menus.map((item, index) => {
            return (
              item.enable && (
                <NavigationBar
                  key={'navigation-bar-' + index}
                  label={item.label}
                  icon={item.icon}
                  onPress={() => onNavigateMenuPage(item)}
                />
              )
            );
          })}

          <NavigationBar
            label={'Log out'}
            mode={'contained'}
            icon={'log-out'}
            onPress={onLogOut}
            style={{marginVertical: 20}}
          />
        </CustomView>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AccountScreen;
