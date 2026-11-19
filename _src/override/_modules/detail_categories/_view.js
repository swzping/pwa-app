import React from 'react';
import {FlatList} from 'react-native';
import {Colors, Mixins} from '@app/styles/index';

import NavBar from '@app/components/NavBar';
import CustomView from '@app/components/CustomView';
import Text from '@app/components/Text';
import Icon from 'react-native-vector-icons/Feather';
import RenderIf from '@app/components/RenderIf';
import _ from 'lodash';

import styles from '@app/_modules/detail_categories/styles';

const DetailCategoriesScreen = ({
  t,
  categories: categoriesData,
  onPress,
  title,
  onPressSignIn,
  isLogged,
  userData,
  onPressAccount,
}) => {
  /**
   * ----------------------------------------- *
   * @component renderList
   * @param {Object} Views.propTypes
   * @summary Component for category list
   * @returns Components
   * ----------------------------------------- *
   */
  const renderList = ({item}) => {
    return (
      <CustomView marginTop={20}>
        <CustomView>
          <CustomView onPress={() => onPress(item.category_id, item.name)}>
            <Text bold style={styles.titleText}>
              {item.name}
            </Text>
          </CustomView>
        </CustomView>
      </CustomView>
    );
  };

  //TODO : fix navbar position
  return (
    <>
      <NavBar useBack useWhite useShadow={false} />
      <CustomView paddingHorizontal={30} paddingTop={10} flex>
        <FlatList
          data={categoriesData.children}
          renderItem={renderList}
          keyExtractor={(item, index) => {
            return `category-children-item-${index}-${item.category_id}`;
          }}
        />
      </CustomView>
      <CustomView
        row
        spaceBetween
        verticalCenter
        paddingVertical={20}
        paddingHorizontal={30}
        style={{borderTopWidth: 1, borderColor: Colors.GRAY_LIGHT}}>
        <RenderIf condition={!isLogged}>
          <CustomView onPress={onPressSignIn}>
            <CustomView row horizontalCenter>
              <Icon name={'user'} color={Colors.GRAY_DARK} size={25} />
              <Text xlarge color={Colors.GRAY_DARK2} style={{marginLeft: 10}}>
                {_.startCase(t('accountTitle'))}
              </Text>
            </CustomView>
          </CustomView>
          <CustomView flex horizontalEnd verticalCenter onPress={onPressSignIn}>
            <Text color={Colors.PRIMARY} underline xlarge>
              {_.startCase(t('signIn'))}
            </Text>
          </CustomView>
        </RenderIf>
        <RenderIf condition={isLogged}>
          <CustomView onPress={onPressAccount}>
            <CustomView width={Mixins.MAX_WIDTH - 60} row spaceBetween>
              <CustomView row horizontalCenter>
                <Icon name={'user'} color={Colors.GRAY_DARK} size={25} />
                <Text xlarge color={Colors.GRAY_DARK2} style={{marginLeft: 10}}>
                  {_.startCase(t('hi'))}, {userData?.firstname}
                </Text>
              </CustomView>
              <CustomView>
                <Icon name={'arrow-right'} color={Colors.GRAY_DARK} size={25} />
              </CustomView>
            </CustomView>
          </CustomView>
        </RenderIf>
      </CustomView>
    </>
  );
};

export default DetailCategoriesScreen;
