import React from 'react';
import {FlatList, RefreshControl} from 'react-native';
import {ActivityIndicator} from 'react-native-paper';
import {useReactiveVar} from '@apollo/client';
import {formatDateOrder} from '@app/helpers/General';
import {Colors, Mixins} from '@app/styles';
import {navigateTo} from '@app/helpers/Navigation';
import {rxUserTheme} from '@app/services/cache';

import Button from '@app/components/Button';
import Appbar from '@app/components/AppBar';
import RenderIf from '@app/components/RenderIf';
import CustomView from '@app/components/CustomView';
import Text from '@app/components/Text';

import styles from '@app/_modules/account_myreturn/styles';
import {modules} from '@root/swift.config';

function MyReturnScreen({
  t,
  customerReturns,
  loading,
  onLoadMore,
  noMoreData,
  refreshing,
  onRefresh,
}) {
  const scheme = useReactiveVar(rxUserTheme);

  const ReturnsItem = ({item, index}) => {
    let evenRowbackgroundColor =
      scheme === 'dark' ? Colors.BLACK : Colors.WHITE;
    let oddRowbackgroundColor =
      scheme === 'dark' ? Colors.GRAY_DARK : Colors.GRAY_SMOOTH;
    let backgroundColor =
      index % 2 === 0 ? evenRowbackgroundColor : oddRowbackgroundColor;
    let order_number = item.order_number;
    let increment_id = item.increment_id;

    return (
      <CustomView
        row
        spaceBetween
        paddingHorizontal={20}
        width={Mixins.MAX_WIDTH}
        paddingVertical={10}
        height={100}
        style={[{backgroundColor}]}>
        <CustomView flex horizontalStart backgroundColor={backgroundColor}>
          <CustomView row backgroundColor={backgroundColor} marginVertical={5}>
            <Text bold>
              {t('account_myreturn.view.returnNo')}
              {item.increment_id}
            </Text>
            <Text xsmall>({formatDateOrder(item.order_date)})</Text>
          </CustomView>
          <Text>{t('account_myreturn.view.items')}</Text>
          {item.items.map(returnItem => (
            <CustomView row backgroundColor={backgroundColor}>
              <Text style={{paddingHorizontal: 5}}>{'\u2B24'}</Text>
              <Text style={{flexWrap: 'wrap'}}>{returnItem.name}</Text>
            </CustomView>
          ))}

          <Text style={{fontStyle: 'italic'}}>{item.status.name}</Text>
        </CustomView>
        <CustomView
          style={{alignSelf: 'center'}}
          backgroundColor={backgroundColor}>
          <Button
            label={t('account_myreturn.btn.detail')}
            styleProp={styles.detailsButton}
            textStyleProp={styles.detailsButtonText}
            onPress={() =>
              navigateTo(
                modules.account_myreturn_detail.enable,
                modules.account_myreturn_detail.name,
                {
                  order_number,
                  increment_id,
                },
              )
            }
          />
        </CustomView>
      </CustomView>
    );
  };

  const FooterElement = () => {
    if (loading) {
      return <ActivityIndicator />;
    }

    return (
      <CustomView
        width={Mixins.MAX_WIDTH}
        horizontalCenter
        verticalCenter
        paddingVertical={20}>
        <RenderIf condition={noMoreData}>
          <Text>{t('account_myreturn.view.noMoreData')}</Text>
        </RenderIf>
      </CustomView>
    );
  };

  return (
    <>
      <Appbar useBack title={t('account_myreturn.title.myReturn')} />
      <FlatList
        style={{width: Mixins.MAX_WIDTH, backgroundColor: Colors.WHITE}}
        data={customerReturns}
        renderItem={ReturnsItem}
        keyExtractor={item => item.increment_id.toString()}
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

export default MyReturnScreen;
