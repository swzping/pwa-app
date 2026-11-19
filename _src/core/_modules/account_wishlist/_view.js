import React from 'react';
import {FlatList} from 'react-native';
import {ActivityIndicator} from 'react-native-paper';
import {useReactiveVar} from '@apollo/client';
import {Colors, Mixins} from '@app/styles';
import {normalize} from '@app/styles/mixins';

import FastImage from '@d11/react-native-fast-image';
import Appbar from '@app/components/AppBar';
import CustomView from '@app/components/CustomView';
import Text from '@app/components/Text';
import Button from '@app/components/Button';
import {rxUserTheme} from '@app/services/cache';
import NavBar from '@app/components/NavBar';

const WishlistScreen = ({
  t,
  wishlist,
  onNavigateToProductDetail,
  onNavigateToAccount,
  userType,
}) => {
  const scheme = useReactiveVar(rxUserTheme);
  const renderItem = ({item}) => {
    return (
      <CustomView
        padding={10}
        borderColor={scheme === 'dark' ? Colors.WHITE : Colors.BLACK}
        borderRadius={15}
        flexNumber={0.5}
        width={Mixins.MAX_WIDTH / 2}
        horizontalCenter
        verticalCenter
        marginVertical={10}
        marginHorizontal={10}
        onPress={() => onNavigateToProductDetail(item.url_key)}>
        {item.image ? (
          <FastImage
            key={item.url_key}
            style={{
              height: normalize(180),
              width: Mixins.MAX_WIDTH / 2 - 30,
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
            height={180}
            width={Mixins.MAX_WIDTH / 2 - 30}
            backgroundColor={Colors.GRAY_LIGHT}
          />
        )}
        <Text small center>
          {item.name}
        </Text>
      </CustomView>
    );
  };

  if (userType === 'guest') {
    return (
      <CustomView flex>
        <NavBar useBack title={t('account_wishlist.title.wishlist')} />
        <CustomView
          horizontalCenter
          verticalCenter
          flex
          width={Mixins.MAX_WIDTH}>
          <Text style={{marginBottom: 20}}>Please Login First</Text>
          <Button
            label={t('account_wishlist.label.goToLogin')}
            onPress={onNavigateToAccount}
          />
        </CustomView>
      </CustomView>
    );
  } else {
    return (
      <FlatList
        ListHeaderComponent={<Appbar useBack title="WishList" />}
        ListHeaderComponentStyle={{
          marginBottom: normalize(20),
        }}
        numColumns={2}
        style={{width: Mixins.MAX_WIDTH}}
        data={wishlist}
        renderItem={renderItem}
        keyExtractor={item => item.wishlistId.toString()}
        ListEmptyComponent={
          wishlist ? (
            <Text center>{t('account_wishlist.view.noData')}</Text>
          ) : (
            <ActivityIndicator />
          )
        }
      />
    );
  }
};

export default WishlistScreen;
