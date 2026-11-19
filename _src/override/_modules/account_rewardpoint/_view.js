import React from 'react';
import {FlatList, RefreshControl} from 'react-native';
import {ActivityIndicator} from 'react-native-paper';
import {numberFormat} from '@app/helpers/General';
import {TYPE_SHIMMER_REWARD_POINT} from '@app/helpers/Constants';
import {Colors, Mixins} from '@app/styles';

import RenderIf from '@app/components/RenderIf/index';
import CustomView from '@app/components/CustomView';
import Text from '@app/components/Text';
import NavBar from '@app/components/NavBar/';
import ShimmerSkeleton from '@app/components/_ShimmerSkeleton';

const RewardPointsScreen = ({
  t,
  rewardPointsTransactions,
  currentBalance,
  loading,
  onLoadMore,
  refreshing,
  onRefresh,
  onPressDetailOrder,
}) => {
  const CurrentBalance = ({currentBalance: currentBalanceParam}) => {
    return (
      <CustomView
        backgroundColor={Colors.YELLOW_LIGHT}
        padding={20}
        horizontalCenter>
        <Text>
          {t('account_rewardpoint.view.currentBalance')}
          <Text bold> {currentBalanceParam.value}</Text>
        </Text>
        <Text>{t('account_rewardpoint.view.canBeRedeem')}</Text>
        <Text bold primary style={{fontSize: 20}}>
          {numberFormat('IDR', currentBalanceParam.value, ',', 2)}
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
      </>
    );
  };

  const TransactionItem = ({item}) => {
    let adjustmentText = item.comment;
    let transactionNumber = null;
    const regex = /(<([^>]+)>)/gi;
    if (item.comment.includes('<a')) {
      if (item.comment.split('<a')[0]) {
        adjustmentText = item.comment.split('<a')[0];
        transactionNumber = `${item.comment.split('#')[1].replace(regex, '')}`;
      } else {
        adjustmentText = item.comment.replace(regex, '');
      }
    }
    return (
      <CustomView
        paddingHorizontal={20}
        paddingVertical={10}
        borderColor={Colors.GRAY_LIGHT}
        style={{borderBottomWidth: 1}}>
        <CustomView paddingVertical={10}>
          <Text small bold>
            {t('account_rewardpoint.view.transactionId')}
          </Text>
          <Text small>{item.transactionId}</Text>
        </CustomView>
        <CustomView row paddingVertical={10}>
          <CustomView flex>
            <Text small bold>
              {t('account_rewardpoint.view.balance')}
            </Text>
            <Text small>{item.balance}</Text>
          </CustomView>
          <CustomView flex>
            <Text small bold>
              {t('account_rewardpoint.view.point')}
            </Text>
            <Text small>
              {item.points > 0 ? `+${item.points}` : item.points}
            </Text>
          </CustomView>
        </CustomView>
        <CustomView row paddingVertical={10}>
          <CustomView flex>
            <Text small bold>
              {t('account_rewardpoint.view.transactionDate')}
            </Text>
            <Text small>{item.transactionDate}</Text>
          </CustomView>
          <CustomView flex>
            <Text small bold>
              {t('account_rewardpoint.view.expiredDate')}
            </Text>
            <Text small>
              {item?.expirationDate ? item?.expirationDate : '-'}
            </Text>
          </CustomView>
        </CustomView>
        <RenderIf condition={adjustmentText}>
          <CustomView paddingVertical={10} horizontalStart verticalCenter>
            <Text small>
              {adjustmentText}
              <RenderIf condition={transactionNumber}>
                <Text
                  underline
                  small
                  onPress={() => onPressDetailOrder(transactionNumber)}>
                  #{transactionNumber}
                </Text>
              </RenderIf>
            </Text>
          </CustomView>
        </RenderIf>
      </CustomView>
    );
  };

  return (
    <>
      <NavBar
        center
        useWhite
        useClose
        titleBold
        title={t('account_rewardpoint.title.rewardPoints')}
        childrenRight={<CustomView width={'12%'} />}
      />
      <RenderIf condition={!currentBalance}>
        <ShimmerSkeleton type={TYPE_SHIMMER_REWARD_POINT} />
      </RenderIf>
      <RenderIf condition={currentBalance}>
        <CurrentBalance currentBalance={currentBalance} />
        <FlatList
          style={{width: Mixins.MAX_WIDTH}}
          data={rewardPointsTransactions}
          renderItem={TransactionItem}
          keyExtractor={item => item.transactionId.toString()}
          ListFooterComponent={FooterElement}
          ListFooterComponentStyle={{alignSelf: 'center'}}
          ListEmptyComponent={
            <CustomView paddingVertical={15}>
              <Text center>{t('account_rewardpoint.view.noData')}</Text>
            </CustomView>
          }
          onEndReached={onLoadMore}
          onEndReachedThreshold={0.5}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      </RenderIf>
    </>
  );
};

export default RewardPointsScreen;
