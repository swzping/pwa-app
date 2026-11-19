import React from 'react';
import {Dimensions, Image, View} from 'react-native';

import {ActivityIndicator} from 'react-native-paper';
import {SafeAreaView} from 'react-native-safe-area-context';
import {TabBar, TabView} from 'react-native-tab-view';

import {FlashList} from '@shopify/flash-list';

import styles from '@app/_modules/account_purchases/styles';
import ShimmerSkeleton from '@app/components/_ShimmerSkeleton';
import CustomView from '@app/components/CustomView/index';
import NavBar from '@app/components/NavBar/index';
import RenderIf from '@app/components/RenderIf';
import Text from '@app/components/Text';
import {TYPE_SHIMMER_PURCHASES} from '@app/helpers/Constants';
import {Colors} from '@app/styles';

import OrderCard from './atoms/OrderCard';

const initialLayout = {width: Dimensions.get('window').width};

const EmptyComponent = ({t}) => {
  return (
    <CustomView style={styles.noDataWrapper} horizontalCenter>
      <Image
        source={require('@app/assets/images/noDataImageIcon.png')}
        style={{
          width: 96,
          height: 96,
        }}
      />
      <Text style={styles.noDataText} large>
        {t('account_purchases.view.dontHaveOrder')}
      </Text>
    </CustomView>
  );
};

const FooterElement = ({t, loading, noMoreData}) => {
  return (
    <>
      <RenderIf condition={loading}>
        <CustomView marginTop={10}>
          <ActivityIndicator />
        </CustomView>
      </RenderIf>
      <RenderIf condition={noMoreData}>
        <Text style={[styles.noDataText, {paddingBottom: 20}]} large>
          {t('account_purchases.view.dontHaveOrder')}
        </Text>
      </RenderIf>
    </>
  );
};

const OrderListScene = ({route, data, t, onNavigateToPdp}) => {
  return (
    <View style={styles.container}>
      <FlashList
        data={data}
        renderItem={({item}) => (
          <OrderCard t={t} item={item} onPress={onNavigateToPdp} />
        )}
        estimatedItemSize={120}
        maintainVisibleContentPosition={{minIndexForVisible: 0}}
        ListFooterComponent={<FooterElement t={t} />}
        ListEmptyComponent={<EmptyComponent t={t} />}
        ListFooterComponentStyle={{alignSelf: 'center'}}
      />
    </View>
  );
};

function PurchasesScreen({
  t,
  routes,

  activeSection,
  setActiveSection,

  customerOrders,
  loading,
  noMoreData,
  refreshing,

  onRefresh,
  onLoadMore,

  onNavigateToPdp,
  onNavigateToPreviewPdf,

  currentSelectedSort,
  visibleSort,
  selectedSort,
  onPressVisibleSort,
  onSelectSort,
}) {
  const renderScene = ({route}) => {
    if (loading && !customerOrders?.length) {
      return (
        <View style={{flex: 1}}>
          <ShimmerSkeleton type={TYPE_SHIMMER_PURCHASES} />
        </View>
      );
    }

    return (
      <OrderListScene
        t={t}
        route={route}
        data={customerOrders}
        loading={loading}
        onNavigateToPdp={onNavigateToPdp}
        refreshing={refreshing}
        onLoadMore={onLoadMore}
        noMoreData={noMoreData}
      />
    );
  };

  return (
    <SafeAreaView style={{flex: 1}} edges={['bottom']}>
      <NavBar
        useWhite
        useBack
        center
        titleBold
        childrenRight={<CustomView width={'12%'} />}
        title={t('account_purchases.title.myOrder')}
      />
      <View style={{flex: 1, width: '100%'}}>
        <TabView
          navigationState={{index: activeSection, routes}}
          renderScene={renderScene}
          onIndexChange={setActiveSection}
          initialLayout={initialLayout}
          lazy
          lazyPreloadDistance={1}
          swipeEnabled={false}
          renderTabBar={props => (
            <TabBar
              {...props}
              style={styles.tabBar}
              contentContainerStyle={{flex: 1, paddingHorizontal: 16}}
              tabStyle={{flex: 1}}
              labelStyle={styles.label}
              indicatorStyle={styles.indicator}
              activeColor={Colors.PRIMARY}
              inactiveColor={Colors.DARK}
            />
          )}
        />
      </View>
    </SafeAreaView>
  );
}

export default PurchasesScreen;
