import React from 'react';
import {FlatList, Image} from 'react-native';
import Text from '@app/components/Text';

import CustomView from '@app/components/CustomView';
import RenderIf from '@app/components/RenderIf';
import FastImage from '@d11/react-native-fast-image';
import Icon from 'react-native-vector-icons/Foundation';

import styles from '@app/components/AddonCategorySlider/styles';
import {Mixins, Colors} from '@app/styles';
import {
  WHATS_NEW,
  WOMEN,
  MEN,
  GEAR,
  SALE,
  TRAINING,
} from '@app/helpers/Constants';

/**
 * @const {checkIcon}
 * @summary this constant use for define
 * Icon Name from react-native-vector-icons at Category List
 * ---------------------------------------------------- *
 */

export const checkIcon = name => {
  if (name === WHATS_NEW) {
    return 'burst-new';
  } else if (name === WOMEN) {
    return 'female';
  } else if (name === MEN) {
    return 'male';
  } else if (name === GEAR) {
    return 'widget';
  } else if (name === SALE) {
    return 'burst-sale';
  } else if (name === TRAINING) {
    return 'target';
  } else {
    return null;
  }
};

const CategorySliderViews = ({
  loading,
  categories,
  // onNavigateToProductList,
  onNavigateToPage,
  // customFrameHeight = Mixins.MAX_HEIGHT * 0.15,
  frameStyle,
  frameListStyle,
  frameListContainerStyle,
}) => {
  return (
    <CustomView horizontalCenter verticalCenter style={frameStyle}>
      <RenderIf condition={!loading && categories?.length < 1}>
        <CustomView
          width={Mixins.MAIN_BANNER_WIDTH}
          horizontalCenter
          verticalCenter>
          <Text>This category have no category children</Text>
        </CustomView>
      </RenderIf>
      <RenderIf condition={categories?.length > 0}>
        <FlatList
          data={categories}
          style={[styles.listContainer, frameListStyle]}
          contentContainerStyle={frameListContainerStyle}
          numColumns={4}
          keyExtractor={(item, index) => {
            return `${index}-${item?.id?.toString()}`;
          }}
          renderItem={({item}) => {
            if (item.level !== 2 || item.include_in_menu) {
              const imageSourceCondition = item.category_icon !== null;
              const iconName = checkIcon(item.name);
              return (
                <CustomView
                  onPress={() =>
                    // onNavigateToProductList({
                    //   categoryIdParam: item.id,
                    //   categoryNameParam: item.name,
                    //   categoryIdentifierParam: item.category_identifier,
                    // })
                    onNavigateToPage({
                      url_redirection: item.category_identifier,
                    })
                  }
                  style={styles.categoryImageContainer}>
                  <RenderIf condition={imageSourceCondition}>
                    <Image
                      key={item.id}
                      style={styles.categoryImage}
                      source={{uri: item.category_icon + '?' + new Date()}}
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
                  <Text style={styles.categoryTitle}>{item.name}</Text>
                </CustomView>
              );
            }
          }}
        />
      </RenderIf>
    </CustomView>
  );
};

export default CategorySliderViews;
