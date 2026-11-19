import React from 'react';
import {FlatList} from 'react-native';
import {navigateTo} from '@app/helpers/Navigation';
import {Colors, Mixins} from '@app/styles';
import {modules} from '@root/swift.config';
import useWishlists from '@app/hooks/wishlists/useWishlists';

import Text from '@app/components/Text';
import CustomView from '@app/components/CustomView/index';
import WishlistItem from '@app/_modules/account/atoms/WishlistSlider/atoms/WishlistItem';

const WishlistSlider = ({t, data, onPressWishlist}) => {
  const {removeFromWishlist} = useWishlists({
    initialized: false,
  });

  /**
   * ---------------------------------------------------- *
   * @function onRemoveFromWishlist
   * @summary remove product to wishlist and refetch list
   * ---------------------------------------------------- *
   */
  const onRemoveFromWishlist = async item => {
    await removeFromWishlist(item);
  };

  /**
   * ----------------------------------------- *
   * @function onNavigateToProductDetail
   * @summary navigate to product detail
   * ----------------------------------------- *
   */
  const onNavigateToProductDetail = ({productUrlKey, productSku}) => {
    navigateTo(modules.product_detail.enable, modules.product_detail.name, {
      productUrlKey,
      productSku,
    });
  };

  const _renderItem = ({item, index}) => {
    return (
      <WishlistItem
        t={t}
        index={index}
        item={item}
        wishlistId={item.wishlistId}
        onRemoveFromWishlist={onRemoveFromWishlist}
        onNavigateToProductDetail={onNavigateToProductDetail}
      />
    );
  };

  return (
    <CustomView marginTop={5} marginBottom={15}>
      <CustomView row spaceBetween marginBottom={5}>
        <Text bold>{t('account.view.wishlist')}</Text>
        <Text small color={Colors.PRIMARY} onPress={onPressWishlist}>
          {t('account.label.viewAll')}
        </Text>
      </CustomView>
      <FlatList
        data={data}
        renderItem={_renderItem}
        keyExtractor={item => item.wishlistId.toString()}
        horizontal={true}
        ListEmptyComponent={() => (
          <CustomView
            horizontalCenter
            paddingVertical={10}
            width={Mixins.MAX_WIDTH - 50}>
            <Text center>{t('account.view.emptyWishlist')}</Text>
          </CustomView>
        )}
      />
    </CustomView>
  );
};

export default WishlistSlider;
