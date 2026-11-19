import React from 'react';
import {StyleSheet, Linking, TouchableOpacity} from 'react-native';
import {Mixins, CmsStyles} from '@app/styles';
import useCustomQuery from '@app/hooks/useCustomQuery';
import {navigateTo} from '@app/helpers/Navigation';
import {
  CATEGORY,
  ONLY_ON_GUARDIAN,
  TYPE_BLOG,
  TYPE_BRANDS,
  TYPE_CONTACT,
  CHAT_WHATSAPP_URL,
} from '@app/helpers/Constants';
import {GET_CATEGORYID_BYURL} from '@app/services/queries/banner';
import {modules} from '@root/swift.config';
import Text from '@app/components/Text';
import Config from 'react-native-config';

const styles = StyleSheet.create({
  regularItem: {
    marginBottom: 7,
    width: Mixins.MAX_WIDTH * 0.5,
    alignItems: 'center',
  },
});

const MenuFooter = ({item}) => {
  const {onRefetchData: refetchCategory} = useCustomQuery({
    schema: GET_CATEGORYID_BYURL,
  });

  const onPress = async () => {
    if (item.dataType === TYPE_BLOG) {
      navigateTo(modules.blog_list.enable, modules.blog_list.name);
    }
    if (item.dataType === TYPE_BRANDS) {
      navigateTo(modules.brand_page.enable, modules.brand_page.name);
    }
    if (item.dataType === TYPE_CONTACT) {
      navigateTo(modules.customer_care.enable, modules.customer_care.name);
    }
    if (item?.identifier) {
      navigateTo(modules.cms_page.enable, modules.cms_page.name, {
        identifier: item?.identifier,
        type: item?.cmsType,
        title: item.label,
        tagsStyles: CmsStyles.tagStylesPrivacyPolicy,
        classesStyles: CmsStyles.classesStylesPrivacyPolicy,
      });
    }
    if (item?.url) {
      const isSupported = await Linking.canOpenURL(item?.url);
      if (isSupported) {
        await Linking.openURL(item?.url);
      }
    }
    if (item?.categoryUrl) {
      try {
        const res = await refetchCategory({
          params: {
            url: item?.categoryUrl.replace('.html', '').slice(1),
          },
          paramsOpt: {isReturn: true},
        });
        if (res?.data && res?.data?.categoryList?.length > 0) {
          const category = res?.data?.categoryList[0];
          navigateTo(modules.product_list.enable, modules.product_list.name, {
            type: CATEGORY,
            categoryId: category?.id,
            categoryName:
              category?.url_path === CATEGORY
                ? ONLY_ON_GUARDIAN
                : category?.name,
          });
        }
      } catch (err) {
        console.log('[err] footer category', err);
      }
    }
    if (item?.label === 'Tanya Apoteker') {
      Linking.openURL(CHAT_WHATSAPP_URL);
    }
    if (item?.label === 'E-catalog') {
      Linking.openURL(Config.PWA_BASE_URL + '/catalog');
    }
  };

  return (
    <TouchableOpacity style={styles.regularItem} onPress={onPress}>
      <Text large center>
        {item.label}
      </Text>
    </TouchableOpacity>
  );
};

export default MenuFooter;
