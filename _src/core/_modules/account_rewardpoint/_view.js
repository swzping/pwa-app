import React from 'react';
import {FlatList, RefreshControl} from 'react-native';
import {ActivityIndicator} from 'react-native-paper';
import {useReactiveVar} from '@apollo/client';
import {formatDateOrder, numberFormat} from '@app/helpers/General';
import {Colors, Mixins} from '@app/styles';
import {rxUserTheme} from '@app/services/cache';

import Appbar from '@app/components/AppBar';
import RenderIf from '@app/components/RenderIf';
import CustomView from '@app/components/CustomView';
import Text from '@app/components/Text';

const RewardPointsScreen = ({
  t,
  rewardPointsTransactions,
  currentBalance,
  loading,
  onLoadMore,
  noMoreData,
  refreshing,
  onRefresh,
}) => {
  const scheme = useReactiveVar(rxUserTheme);

  const CurrentBalance = ({currentBalance: currentBalanceParam}) => {
    if (!currentBalanceParam) {
      return (
        <CustomView
          backgroundColor={Colors.PRIMARY}
          padding={20}
          horizontalStart>
          <ActivityIndicator color={Colors.WHITE} />
        </CustomView>
      );
    }
    return (
      <CustomView backgroundColor={Colors.PRIMARY} padding={20} horizontalStart>
        <Text white bold>
          {t('account_rewardpoint.view.currentBalance')}{' '}
          {numberFormat(
            currentBalanceParam.currency,
            currentBalanceParam.value,
          )}
        </Text>
      </CustomView>
    );
  };

  const FooterElement = () => {
    return (
      <>
        <RenderIf condition={loading}>
          <CustomView margin={20} horizontalCenter verticalCenter>
            <ActivityIndicator />
          </CustomView>
        </RenderIf>
        <RenderIf condition={!loading}>
          <CustomView margin={20}>
            <RenderIf condition={noMoreData}>
              <Text>{t('account_rewardpoint.view.noMoreData')}</Text>
            </RenderIf>
          </CustomView>
        </RenderIf>
      </>
    );
  };

  const TransactionItem = ({item, index}) => {
    const adjustmentText =
      item.points < 0 ? `-${item.points}` : `+${item.points}`;

    let evenRowColor = scheme === 'dark' ? Colors.BLACK : Colors.WHITE;
    let oddRowColor = scheme === 'dark' ? Colors.GRAY_DARK : Colors.GRAY_SMOOTH;
    const backgroundColor = index % 2 === 1 ? evenRowColor : oddRowColor;

    return (
      <CustomView
        backgroundColor={backgroundColor}
        row
        paddingHorizontal={20}
        height={100}>
        <CustomView
          horizontalCenter
          verticalCenter
          height={100}
          width={50}
          paddingVertical={15}
          backgroundColor={backgroundColor}>
          <Text>{item.transactionId}</Text>
        </CustomView>
        <CustomView
          height={100}
          paddingVertical={15}
          horizontalStart
          horizontalCenter
          verticalCenter
          backgroundColor={backgroundColor}>
          <Text bold>{adjustmentText}</Text>
          <Text>{item.comment}</Text>
          <Text>{formatDateOrder(item.transactionDate)}</Text>
        </CustomView>
      </CustomView>
    );
  };

  return (
    <>
      <Appbar useBack title={t('account_rewardpoint.title.rewardPoints')} />
      <CurrentBalance currentBalance={currentBalance} />
      <FlatList
        style={{width: Mixins.MAX_WIDTH}}
        data={rewardPointsTransactions}
        renderItem={TransactionItem}
        keyExtractor={item => item.transactionId.toString()}
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
};

export default RewardPointsScreen;
