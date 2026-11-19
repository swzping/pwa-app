import React, {useEffect, useState, useCallback, useRef} from 'react';
import {Colors, Mixins} from '@app/styles';
import {FlatList, Image} from 'react-native';
import {ActivityIndicator} from 'react-native-paper';
import {useReactiveVar} from '@apollo/client';

import BannerSlider from '@app/components/BannerSlider';
import RenderIf from '@app/components/RenderIf';
import RenderItemList from '@app/components/RenderItem';
import CustomView from '@app/components/CustomView';
import Text from '@app/components/Text';
import FastImage from '@d11/react-native-fast-image';
import CategorySlider from '@app/components/AddonCategorySlider';
import AppBar from '@app/components/AppBar';
import AnalyticsHelper from '@app/helpers/Analytics';
import {thumborProductList} from '@app/helpers/Thumbor';
import {numberFormat} from '@app/helpers/General';

import styles from '@app/_modules/product_list/styles';
import {rxUserTheme} from '@app/services/cache';

const ProductListScreen = ({
  t,
  loading,
  products,
  totalCount,
  onLoadMore,
  noMoreData,
  categoryId = null,
  categoryName = '',
  attributeId = '',
  onNavigateToProductDetail,
  bannerSlider,
}) => {
  /**
   * ----------------------------------------- *
   * @constant
   * @summary collections constant
   * ----------------------------------------- *
   */
  const scheme = useReactiveVar(rxUserTheme);
  const [displaySlider, setDisplaySlider] = useState(false);
  const [imageErrors, setImageErrors] = useState({});
  const mount = useRef();

  /**
   * ----------------------------------------- *
   * @function onLogCategoryToAnalytics
   * @summary log product list to analytics
   * @profiler {googleAnalytics} PLP
   * ----------------------------------------- *
   */
  const onLogCategoryToAnalytics = () => {
    let item = {
      item_list_id: attributeId
        ? attributeId.toString()
        : categoryId.toString(),
      item_list_name: categoryName.toString(),
    };
    // console.log('HERE', item);
    AnalyticsHelper.eventViewItemList(item);
  };

  /**
   * ----------------------------------------- *
   * @dependency []
   * @summary component did mount
   * ----------------------------------------- *
   */
  useEffect(() => {
    mount.current = true;
    return () => mount.current;
  }, []);

  /**
   * ----------------------------------------- *
   * @dependency [categoryId]
   * @summary for display slider
   * ----------------------------------------- *
   */
  useEffect(() => {
    if (categoryId && mount.current) {
      setDisplaySlider(true);
      onLogCategoryToAnalytics();
    }
  }, [categoryId]);

  /**
   * ----------------------------------------- *
   * @function HeaderElement
   * @dependency [
   * bannerSlider,
   * categoryId,
   * products.length
   * ]
   * @summary for display header element
   * @returns Component
   * ----------------------------------------- *
   */
  const HeaderElement = useCallback(() => {
    return (
      <CustomView>
        <RenderIf condition={displaySlider}>
          <CustomView>
            <BannerSlider
              styleFrame={styles.bannerFrame}
              autoplay={true}
              data={bannerSlider}
              clickable={true}
            />
            <CategorySlider categoryId={categoryId} />
          </CustomView>
        </RenderIf>

        <CustomView height={30} horizontalCenter verticalCenter>
          <Text center>
            {t('product_list.view.showing')} {products.length}{' '}
            {t('product_list.view.of')} {totalCount}
          </Text>
        </CustomView>
      </CustomView>
    );
  }, [bannerSlider, categoryId, products.length]);

  /**
   * ----------------------------------------- *
   * @function FooterElement
   * @summary for display footer element
   * @returns Component
   * ----------------------------------------- *
   */
  const FooterElement = () => {
    if (loading) {
      return <ActivityIndicator />;
    } else {
      return (
        <CustomView margin={20}>
          <RenderIf condition={noMoreData}>
            <Text>{t('product_list.view.noMoreData')}</Text>
          </RenderIf>
        </CustomView>
      );
    }
  };

  /**
   * ----------------------------------------- *
   * @function RenderItem
   * @param {object} item
   * @summary for display single item product
   * @returns Component
   * ----------------------------------------- *
   */
  const RenderItem = ({item, index}) => {
    const price_range = item?.price_range;
    const price_max = price_range?.maximum_price;
    const price_final = price_max?.final_price;

    let imageSourceCondition =
      item.small_image !== null &&
      item.small_image.url !== '' &&
      item.small_image !== undefined;
    if (imageErrors[item.url_key]) {
      imageSourceCondition = false;
    }

    return (
      <RenderItemList itemKey={index}>
        <CustomView
          onPress={() => onNavigateToProductDetail(item.url_key)}
          style={styles.itemContainer}>
          <RenderIf condition={imageSourceCondition}>
            <FastImage
              key={item.url_key}
              style={styles.itemImage}
              source={{
                uri: thumborProductList(item.small_image.url.toString()),
                priority: FastImage.priority.normal,
                cache: FastImage.cacheControl.immutable,
              }}
              resizeMode={FastImage.resizeMode.contain}
              onError={() => {
                const newImageErrors = {
                  ...imageErrors,
                  [item.url_key]: true,
                };
                setImageErrors(newImageErrors);
              }}
            />
          </RenderIf>
          <RenderIf condition={!imageSourceCondition}>
            <Image
              source={require('@app/assets/images/placeholder.png')}
              style={styles.itemImage}
            />
          </RenderIf>

          <CustomView width={'100%'} paddingHorizontal={10} horizontalStart>
            <Text small left>
              {item.name}
            </Text>
            <Text small bold>
              {numberFormat(price_final.currency, price_final.value)}
            </Text>
          </CustomView>
        </CustomView>
      </RenderItemList>
    );
  };

  /**
   * ----------------------------------------- *
   * @component ProductItem
   * @profiler {Sentry}
   * @summary Component for display
   * single item product
   * ----------------------------------------- *
   */
  const ProductItem = RenderItem;

  return (
    <>
      <AppBar useBack />
      <FlatList
        renderItem={ProductItem}
        ListHeaderComponent={HeaderElement}
        ListHeaderComponentStyle={{alignSelf: 'center'}}
        ListFooterComponent={FooterElement}
        ListFooterComponentStyle={{alignSelf: 'center'}}
        onEndReached={onLoadMore}
        onEndReachedThreshold={0.3}
        numColumns={2}
        data={products}
        keyExtractor={item => item.id.toString()}
        style={{
          width: Mixins.MAX_WIDTH,
          backgroundColor: scheme === 'dark' ? Colors.BLACK : Colors.WHITE,
        }}
      />
    </>
  );
};

export default ProductListScreen;
