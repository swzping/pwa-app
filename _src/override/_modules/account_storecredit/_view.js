import React from 'react';
import {FlatList, RefreshControl} from 'react-native';
import {ActivityIndicator} from 'react-native-paper';
import {numberFormat} from '@app/helpers/General';
import {TYPE_SHIMMER_STORE_CREDIT} from '@app/helpers/Constants';
import {Colors, Mixins} from '@app/styles';

import NavBar from '@app/components/NavBar';
import CustomView from '@app/components/CustomView';
import Text from '@app/components/Text';
import RenderIf from '@app/components/RenderIf';
import ShimmerSkeleton from '@app/components/_ShimmerSkeleton';

const StoreCreditScreen = ({
  t,
  storeCreditTransactions,
  currentBalance,
  loading,
  onLoadMore,
  noMoreData,
  refreshing,
  onRefresh,
}) => {
  const CurrentBalance = ({currentBalance: currentBalanceParam}) => {
    if (!currentBalanceParam) {
      return (
        <CustomView
          backgroundColor={Colors.YELLOW_LIGHT}
          padding={20}
          horizontalStart>
          <ActivityIndicator color={Colors.WHITE} />
        </CustomView>
      );
    }
    return (
      <CustomView
        horizontalCenter
        backgroundColor={Colors.YELLOW_LIGHT}
        padding={20}>
        <Text small>{t('account_storecredit.view.currentBalance')} </Text>
        <Text bold color={Colors.PRIMARY} style={{fontSize: 24}}>
          {numberFormat(
            currentBalanceParam.currency,
            currentBalanceParam.value,
            ',',
            2,
          )}
        </Text>
      </CustomView>
    );
  };

  const TransactionItem = ({item}) => {
    return (
      <CustomView
        padding={20}
        borderColor={Colors.GRAY_LIGHT}
        style={{borderBottomWidth: 1}}>
        <CustomView row marginBottom={10}>
          <CustomView flex>
            <Text small bold>
              TRANSCATION ID
            </Text>
            <Text small>{item.transaction_id}</Text>
          </CustomView>
          <CustomView flex>
            <Text small bold>
              TRANSCATION DATE
            </Text>
            <Text small>{item.transaction_date_time}</Text>
          </CustomView>
        </CustomView>
        <CustomView row marginBottom={10}>
          <CustomView flex>
            <Text small bold>
              STORE CREDIT ADJUSTMENT
            </Text>
            <Text small>{item.store_credit_adjustment.value}</Text>
          </CustomView>
          <CustomView flex>
            <Text small bold>
              STORE CREDIT BALANCE
            </Text>
            <Text small>
              {numberFormat(
                item.store_credit_balance.currency,
                item.store_credit_balance.value,
                ',',
                2,
              )}
            </Text>
          </CustomView>
        </CustomView>
        <CustomView>
          <Text small>{item.comment}</Text>
        </CustomView>
      </CustomView>
    );
  };

  return (
    <>
      <NavBar
        center
        titleBold
        useWhite
        useClose
        childrenRight={<CustomView width={'12%'} />}
        title={t('account_storecredit.title.storeCredit')}
      />
      <RenderIf condition={!currentBalance}>
        <ShimmerSkeleton type={TYPE_SHIMMER_STORE_CREDIT} />
      </RenderIf>
      <RenderIf condition={currentBalance}>
        <CurrentBalance currentBalance={currentBalance} />
        <FlatList
          style={{width: Mixins.MAX_WIDTH}}
          data={storeCreditTransactions}
          renderItem={TransactionItem}
          keyExtractor={item => item.transaction_id.toString()}
          onEndReached={onLoadMore}
          onEndReachedThreshold={0.5}
          ListEmptyComponent={
            <CustomView paddingVertical={15}>
              <Text small center>
                {t('account_storecredit.view.noCreditData')}
              </Text>
            </CustomView>
          }
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      </RenderIf>
    </>
  );
};

export default StoreCreditScreen;
