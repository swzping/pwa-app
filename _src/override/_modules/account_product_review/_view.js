import React from 'react';
import { FlatList, View, RefreshControl } from 'react-native';
import { Colors } from '@app/styles';
import { ActivityIndicator } from 'react-native-paper';

import RenderIf from '@app/components/RenderIf';
import NavBar from '@app/components/NavBar/index';
import Text from '@app/components/Text';
import CustomView from '@app/components/CustomView';
import ShimmerSkeleton from '@app/components/_ShimmerSkeleton';
import { TYPE_SHIMMER_STORE_CREDIT } from '@app/helpers/Constants';

const FooterElement = ({ loading }) => {
  return (
    <RenderIf condition={loading}>
      <ActivityIndicator />
    </RenderIf>
  );
};

const AccountProductReviewScreen = ({
  t,
  data,
  loading,
  onPressCart,
  refreshing,
  onLoadMore,
  onRefresh,
}) => {
  const RenderItem = ({ item, index }) => {
    return (
      <CustomView
        key={`${index}-${item?.id}`}
        padding={20}
        borderColor={Colors.GRAY_LIGHT}
        style={{ borderBottomWidth: 1 }}>
        <CustomView paddingVertical={5}>
          <Text small bold>
            {t('account_product_review.view.productName')}
          </Text>
          <Text small>{item.product.name}</Text>
        </CustomView>
        <CustomView row paddingVertical={5}>
          <CustomView flex>
            <Text small bold>
              {t('account_product_review.view.created')}
            </Text>
            <Text small>{item.created_at}</Text>
          </CustomView>
          <CustomView flex>
            <Text small bold>
              {t('account_product_review.view.rating')}
            </Text>
            <Text small>{item.ratings_breakdown[0].value}</Text>
          </CustomView>
        </CustomView>
        <CustomView paddingTop={5}>
          <Text small>{item.text}</Text>
        </CustomView>
      </CustomView>
    );
  };

  return (
    <View>
      <NavBar
        useWhite
        useBack
        center
        titleBold
        childrenRight={<CustomView width={'12%'} />}
        title={t('account_product_review.title.productReview')}
      />
      <RenderIf condition={loading}>
        <ShimmerSkeleton type={TYPE_SHIMMER_STORE_CREDIT} />
      </RenderIf>
      <RenderIf condition={!loading}>
        <CustomView
          backgroundColor={Colors.YELLOW_LIGHT}
          horizontalCenter
          verticalCenter
          paddingVertical={30}>
          <Text small center>
            {t('account_product_review.view.myProductReview')}
          </Text>
        </CustomView>
        <FlatList
          data={data}
          renderItem={RenderItem}
          keyExtractor={item => item.created_at.toString()}
          onEndReached={onLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={<FooterElement loading={loading} />}
          ListFooterComponentStyle={{ alignSelf: 'center' }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <CustomView horizontalCenter paddingVertical={20}>
              <Text small center>
                {t('account_product_review.view.noProductReviewData')}
              </Text>
            </CustomView>
          }
        />
      </RenderIf>
    </View>
  );
};

export default AccountProductReviewScreen;
