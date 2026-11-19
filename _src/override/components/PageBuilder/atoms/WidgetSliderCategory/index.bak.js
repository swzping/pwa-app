import React from 'react';
import {Linking} from 'react-native';
import {IS_IOS} from '@app/helpers/Constants';
import {Colors} from '@app/styles';
import {Mixins, MixinsNew} from '@app/styles/index';
import {StyleSheet, Image} from 'react-native';
import {checkIcon} from '@app/components/AddonCategorySlider/views';
import {navigateTo} from '@app/helpers/Navigation';
import {modules} from '@root/swift.config';
import {CATALOG, TYPE_BRANDS, TYPE_PAGE} from '@app/helpers/Constants';
import {CmsStyles} from '@app/styles';

import CategorySlider from '@app/components/AddonCategorySlider/index';
import CustomView from '@app/components/CustomView/index';
import RenderIf from '@app/components/RenderIf';
import Text from '@app/components/Text';
import FastImage from '@d11/react-native-fast-image';
import Icon from 'react-native-vector-icons/Foundation';

const styles = StyleSheet.create({
  mainFrame: {
    width: MixinsNew.MAX_WIDTH,
  },
  categoryImageContainer: {},
  categoryImage: {
    height: 40,
    width: 40,
    borderRadius: 10,
    alignSelf: 'center',
  },

  categoryTitle: {
    textAlign: 'center',
    ...MixinsNew.margin({top: 10}),
  },
});

const WidgetSliderCategory = ({data}) => {
  //   const dataLength = data?.length || 0;
  // const dataItemWidth = 100 / dataLength;
  const dataItemWidth = 25;
  const fontSizeStyle = {fontSize: dataItemWidth - 8};
  /**
   * ----------------------------------------- *
   * @function onNavigateToProductList
   * @param {object} item
   * @summary navigate to product list
   * ----------------------------------------- *
   */
  const onNavigateToProductList = ({
    categoryIdParam,
    categoryNameParam,
    categoryIdentifierParam,
  }) => {
    if (categoryIdentifierParam === TYPE_BRANDS) {
      navigateTo(modules.brand_page.enable, modules.brand_page.name);
    } else if (categoryIdentifierParam === CATALOG) {
      Linking.openURL('https://guardianindonesia.co.id/catalog');
    } else if (categoryIdentifierParam?.includes('blog')) {
      navigateTo(modules.blog_list.enable, modules.blog_list.name);
    } else if (categoryIdentifierParam) {
      navigateTo(modules.cms_page.enable, modules.cms_page.name, {
        identifier: categoryIdentifierParam,
        type: TYPE_PAGE,
        title: categoryNameParam,
        tagsStyles: CmsStyles.tagStylesPrivacyPolicy,
        classesStyles: CmsStyles.classesStylesPrivacyPolicy,
        isPageBuilder: categoryNameParam === 'Review Produk',
      });
    } else {
      navigateTo(modules.main_categories.enable, modules.main_categories.name, {
        variables: {
          type: 'category',
          categoryId: categoryIdParam,
          categoryName: categoryNameParam,
        },
      });
    }
  };

  if (!IS_IOS) {
    return (
      <CategorySlider
        categorySliderData={data}
        customFrameHeight={Mixins.MAX_HEIGHT * 0.5}
      />
    );
  }
  return (
    <CustomView
      row
      horizontalCenter
      paddingVertical={10}
      paddingHorizontal={8}
      paddingBottom={30}>
      {data.map((item, index) => {
        if (item.level !== 2 || item.include_in_menu) {
          const imageSourceCondition = item.category_icon !== null;
          const iconName = checkIcon(item.name);
          return (
            <CustomView
              key={'category-' + index}
              onPress={() => {
                onNavigateToProductList({
                  categoryIdParam: item.id,
                  categoryNameParam: item.name,
                  categoryIdentifierParam: item.category_identifier,
                });
              }}
              style={styles.categoryImageContainer}
              width={`${dataItemWidth}%`}>
              <RenderIf condition={imageSourceCondition}>
                <FastImage
                  key={item.id}
                  style={styles.categoryImage}
                  source={{
                    uri: item.category_icon,
                    priority: FastImage.priority.normal,
                    cache: FastImage.cacheControl.immutable,
                  }}
                  resizeMode={FastImage.resizeMode.contain}
                />
              </RenderIf>
              <RenderIf condition={!imageSourceCondition && iconName}>
                <CustomView
                  horizontalCenter
                  verticalCenter
                  style={styles.categoryImage}>
                  <Icon name={iconName} size={40} color={Colors.WHITE} />
                </CustomView>
              </RenderIf>
              <RenderIf condition={!imageSourceCondition && !iconName}>
                <Image
                  source={require('@app/assets/images/placeholder.png')}
                  style={styles.categoryImage}
                />
              </RenderIf>
              <Text style={[styles.categoryTitle, fontSizeStyle]}>
                {item.name}
              </Text>
            </CustomView>
          );
        }
      })}
    </CustomView>
  );
};

export default WidgetSliderCategory;
