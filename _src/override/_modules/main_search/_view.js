import React from 'react';
import {ScrollView} from 'react-native';

import {SafeAreaView} from 'react-native-safe-area-context';

import {modules} from '@root/swift.config';

import HotKeywords from '@app/_modules/main_search/atoms/HotKeywords';
// import AggregationCategoryList from '@app/_modules/main_search/atoms/AggregationCategoryList';
// import ProductList from '@app/_modules/main_search/atoms/ProductList/index';
import RecentSearch from '@app/_modules/main_search/atoms/RecentSearch';
import TopBrands from '@app/_modules/main_search/atoms/TopBrands';
import TrendingProducts from '@app/_modules/main_search/atoms/TrendingProducts';
import styles from '@app/_modules/main_search/styles';
import ShimmerSkeleton from '@app/components/_ShimmerSkeleton';
import CustomView from '@app/components/CustomView';
import RenderIf from '@app/components/RenderIf';
import SearchBar from '@app/components/SearchBar/index';
import Text from '@app/components/Text';
import {TYPE_SHIMMER_CATEGORY_LIST} from '@app/helpers/Constants';
import {Colors} from '@app/styles';
import {Mixins} from '@app/styles';

/**
 * ---------------------------------------------------- *
 * @components Views
 * @summary this is expample views
 * ---------------------------------------------------- *
 */
const Views = ({
  loading,
  searchText,
  message,
  totalCount,
  categories,
  products,
  recentSearches,
  hotKeywords,
  topBrands,
  trendingProductsCms,
  onSearchTextChange,
  onPressSearch,
  onPressRecentSearch,
  onPressHotKeyword,
  onPressBrand,
  onShowMoreKeywords,
  clearRecentSearches,
  searchPlaceholder,
}) => {
  if (!modules.main_search.enable) {
    return null;
  }
  return (
    <SafeAreaView style={{...Mixins.avoidNavbar()}}>
      <SearchBar
        useSearch
        onChangeText={onSearchTextChange}
        onPressSearch={onPressSearch}
        searchPlaceholder={searchPlaceholder}
        searchValue={searchText}
      />
      <RenderIf condition={loading}>
        <CustomView
          paddingVertical={5}
          paddingHorizontal={10}
          style={styles.frameSearchResult}>
          <Text center color={Colors.GRAY_DARK} style={{marginBottom: 5}}>
            {message}
          </Text>
        </CustomView>
        <ShimmerSkeleton type={TYPE_SHIMMER_CATEGORY_LIST} />
      </RenderIf>
      <RenderIf condition={!loading}>
        <ScrollView overScrollMode="never" style={{flex: 1}}>
          {/* 始终显示搜索历史、热门关键词和品牌 */}
          <RecentSearch
            data={recentSearches}
            onPressItem={onPressRecentSearch}
            onClear={clearRecentSearches}
          />
          <HotKeywords
            data={hotKeywords}
            onPressItem={onPressHotKeyword}
            onShowMore={onShowMoreKeywords}
          />
          <TopBrands data={topBrands} onPressBrand={onPressBrand} />
          <TrendingProducts cmsContent={trendingProductsCms} />

          {/* 当有搜索文本时，显示搜索结果或消息（如果需要的话） */}
          <RenderIf condition={searchText && searchText.length > 0 && message}>
            <CustomView
              paddingVertical={5}
              paddingHorizontal={12}
              style={styles.frameSearchResult}>
              <Text center color={Colors.GRAY_DARK} marginBottom={5}>
                {message}
              </Text>
            </CustomView>
          </RenderIf>
        </ScrollView>
      </RenderIf>
    </SafeAreaView>
  );
};

export default Views;
