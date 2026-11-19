import React from 'react';
import {Colors} from '@app/styles';

import NavBar from '@app/components/NavBar';
import CustomView from '@app/components/CustomView';
import Text from '@app/components/Text/index';
import styles from '@app/_modules/account_categories/styles';

const AccountCategoriesScreen = ({t, getHiddenMenus, onLogOut}) => {
  return (
    <>
      <NavBar useBack useWhite useShadow={false} />
      <CustomView paddingHorizontal={30} paddingTop={10} flex>
        {getHiddenMenus.map((item, index) => {
          return (
            <CustomView key={`${index}-${item.label}`} marginVertical={10}>
              <CustomView style={styles.headerContainer} onPress={item.onPress}>
                <Text bold xlarge color={Colors.PRIMARY}>
                  {item.label}
                </Text>
              </CustomView>
            </CustomView>
          );
        })}

        <CustomView
          marginTop={20}
          paddingTop={20}
          style={{borderTopWidth: 1, borderColor: Colors.GRAY_LIGHT}}>
          <CustomView style={styles.headerContainer} onPress={onLogOut}>
            <Text bold xlarge color={Colors.PRIMARY}>
              {t('account_categories.signOut')}
            </Text>
          </CustomView>
        </CustomView>
      </CustomView>
    </>
  );
};

export default AccountCategoriesScreen;
