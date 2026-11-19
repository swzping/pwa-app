import React from 'react';
import {FlatList} from 'react-native';
import {ActivityIndicator} from 'react-native-paper';
import {useReactiveVar} from '@apollo/client';
import {Colors, Mixins} from '@app/styles';
import {normalize} from '@app/styles/mixins';
import EvilIcons from 'react-native-vector-icons/EvilIcons';
import {numberFormat} from '@app/helpers/General';

import FastImage from '@d11/react-native-fast-image';
import NavBar from '@app/components/NavBar';
import CustomView from '@app/components/CustomView';
import Text from '@app/components/Text';
import {rxUserTheme} from '@app/services/cache';
import ButtonAddToCart from '@app/components/ButtonAddToCart';
import ProductBadges from '@app/components/ProductBadges';
import AtomRightCart from '@app/_modules/product_list/atoms/RightCart/index';

const WishlistScreen = ({t, wishlist, onPressCart, onPressRemove}) => {
  const scheme = useReactiveVar(rxUserTheme);
  const renderItem = ({item}) => {
    return (
      <CustomView
        flex
        padding={10}
        borderColor={scheme === 'dark' ? Colors.WHITE : Colors.BLACK}
        borderRadius={15}
        width={Mixins.MAX_WIDTH - 20}
        verticalCenter
        marginVertical={10}
        marginHorizontal={10}>
        <CustomView flex row>
          {item.image ? (
            <FastImage
              key={item.url_key}
              style={{
                height: normalize(120),
                width: Mixins.MAX_WIDTH / 3,
              }}
              resizeMode={FastImage.resizeMode.contain}
              source={{
                uri: item.image,
                priority: FastImage.priority.normal,
                cache: FastImage.cacheControl.immutable,
              }}
            />
          ) : (
            <CustomView
              height={120}
              width={Mixins.MAX_WIDTH / 3}
              backgroundColor={Colors.GRAY_LIGHT}
            />
          )}
          <CustomView flex horizontalCenter paddingHorizontal={20} spaceBetween>
            <Text bold small center>
              {item.name}
            </Text>
            <CustomView style={{width: '100%'}}>
              <Text small center>
                {numberFormat(
                  item.price_range?.maximum_price.final_price.currency,
                  item.price_range?.maximum_price.final_price.value,
                  ',',
                  2,
                )}
              </Text>
              <ProductBadges item={item?.offers} />
              <ButtonAddToCart
                item={item}
                type={item.__typename}
                isWishlistSlider
              />
            </CustomView>
          </CustomView>
          <CustomView
            onPress={() => onPressRemove(item)}
            verticalCenter
            horizontalCenter>
            <EvilIcons
              name="trash"
              size={normalize(25)}
              color={Colors.GRAY_DARK}
            />
          </CustomView>
        </CustomView>
      </CustomView>
    );
  };

  /* eslint-disable react/no-unstable-nested-components */
  const EmptyWishlist = () => {
    return (
      <CustomView flex horizontalCenter verticalCenter marginHorizontal={40}>
        <EvilIcons
          name="heart"
          size={normalize(100)}
          color={Colors.GRAY_LIGHT}
          style={{marginBottom: 10}}
        />
        <Text large color={Colors.GRAY_DARK}>
          {t('account_wishlist.view.noDataWishlist.title')}
        </Text>
        <Text center color={Colors.GRAY_MEDIUM}>
          {t('account_wishlist.view.noDataWishlist.subtitle')}
        </Text>
      </CustomView>
    );
  };

  return (
    <FlatList
      ListHeaderComponent={
        <NavBar
          useWhite
          useBack
          center
          titleBold
          childrenRight={<AtomRightCart onPressCart={onPressCart} />}
          title={t('account_wishlist.title.wishlist')}
        />
      }
      ListHeaderComponentStyle={{
        marginBottom: normalize(20),
      }}
      numColumns={1}
      style={{width: Mixins.MAX_WIDTH}}
      data={wishlist}
      renderItem={renderItem}
      keyExtractor={item => item.wishlistId.toString()}
      ListEmptyComponent={wishlist ? <EmptyWishlist /> : <ActivityIndicator />}
    />
  );
};

export default WishlistScreen;
