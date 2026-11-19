import React from 'react';
import AppBar from '@app/components/AppBar';
import RenderIf from '@app/components/RenderIf';
import RenderItemList from '@app/components/RenderItem';
import Text from '@app/components/Text';
import CustomView from '@app/components/CustomView';
import {useReactiveVar} from '@apollo/client';

import {formatDateOrder} from '@app/helpers/General';
import {Colors, Mixins} from '@app/styles';
import {Button, ActivityIndicator} from 'react-native-paper';
import {FlatList, RefreshControl} from 'react-native';
import {rxUserTheme} from '@app/services/cache';

import styles from '@app/_modules/account_purchases_detail/styles';

function PurchasesScreen({
  t,
  onNavigateToPdp,
  customerOrders,
  loading,
  onLoadMore,
  noMoreData,
  refreshing,
  onRefresh,
}) {
  const scheme = useReactiveVar(rxUserTheme);

  const FooterElement = () => {
    if (loading) {
      return <ActivityIndicator />;
    }

    return (
      <CustomView horizontalCenter VerticalCenter margin={20}>
        <RenderIf condition={noMoreData}>
          <Text>{t('account_purchases.view.noMoreData')}</Text>
        </RenderIf>
      </CustomView>
    );
  };

  const OrderItem = ({item, index}) => {
    const evenRowColor = scheme === 'dark' ? Colors.BLACK : Colors.WHITE;
    const oddRowColor =
      scheme === 'dark' ? Colors.GRAY_DARK : Colors.GRAY_SMOOTH;
    const backgroundColor = index % 2 === 0 ? evenRowColor : oddRowColor;
    const orderNumber = item.order_number;
    return (
      <RenderItemList itemKey={index}>
        <CustomView
          backgroundColor={backgroundColor}
          horizontalCenter
          row
          spaceBetween
          paddingHorizontal={20}
          paddingVertical={20}>
          <CustomView horizontalStart backgroundColor={backgroundColor}>
            <Text bold>
              {t('account_purchases.view.orderNo')}
              {item.order_number}
            </Text>
            <Text small>{formatDateOrder(item.created_at)}</Text>
            <Text style={styles.orderStatusText}>{item.status_label}</Text>
          </CustomView>
          <CustomView row backgroundColor={backgroundColor}>
            <Button
              mode="contained"
              onPress={() => onNavigateToPdp(orderNumber)}>
              {t('account_purchases.btn.detail')}
            </Button>
          </CustomView>
        </CustomView>
      </RenderItemList>
    );
  };

  return (
    <>
      <AppBar useBack title="Purchases" />
      <FlatList
        style={{width: Mixins.MAX_WIDTH, backgroundColor: Colors.WHITE}}
        data={customerOrders}
        renderItem={OrderItem}
        keyExtractor={item => item.order_number.toString()}
        ListFooterComponent={FooterElement}
        ListFooterComponentStyle={{alignSelf: 'center'}}
        onEndReached={onLoadMore}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </>
  );
}

export default PurchasesScreen;
