import React, {useCallback, useEffect, useMemo, useRef} from 'react';
import {
  ActivityIndicator,
  Image,
  Platform,
  ScrollView,
  TouchableOpacity,
  View,
} from 'react-native';

import Icon from 'react-native-vector-icons/Ionicons';

import {useRoute} from '@react-navigation/native';

import {
  trackSkuComponentExposure,
  trackSkuComponentFilter,
} from '@root/_src/core/track';
import {FlashList} from '@shopify/flash-list';

import FilterChip from '@app/_modules/product_list/atoms/FilterAndSort/atoms/FilterChip';
import {
  isVisibleAggregation,
  RENDERER,
  resolveQuickFilterChips,
  resolveRendererType,
} from '@app/_modules/product_list/atoms/FilterAndSort/filterRenderers';
import FilterAndSort from '@app/_modules/product_list/atoms/FilterAndSort/index';
import ProductItem from '@app/_modules/product_list/atoms/ProductItem';
import AtomRightCart from '@app/_modules/product_list/atoms/RightCart/rightCartForCateList';
import styles from '@app/_modules/product_list/styles';
import IconEmptyBox from '@app/assets/svgs/EmptyBox';
import IconFilter from '@app/assets/svgs/Filter';
import SortAlignCenter from '@app/assets/svgs/SortAlignCenter';
import AppModal from '@app/components/_AppModal';
import ShimmerSkeleton from '@app/components/_ShimmerSkeleton';
import CmsRender from '@app/components/Cms';
import CustomView from '@app/components/CustomView';
import FlashSaleEndedModal from '@app/components/FlashSaleEndedModal';
import NavBar from '@app/components/NavBar';
import NoData from '@app/components/NoData/index';
import SearchBar from '@app/components/SearchBar';
import Text from '@app/components/Text';
import VariantPickerModal from '@app/components/VariantPickerModal';
import useVariantPicker from '@app/components/VariantPickerModal/useVariantPicker';
import {
  CART_ACTIONS,
  TYPE_MODAL_SORT,
  TYPE_SHIMMER_CMS_HOME,
  TYPE_SHIMMER_PLP,
} from '@app/helpers/Constants';
import {useFlashListExposure} from '@app/hooks/useFlashListExposure';
import {Colors, Mixins} from '@app/styles';

/**
 * ---------------------------------------------------- *
 * @component {Header Element}
 * @summary return component for header element in product list screen, include search, banner, cms content, result count, sort and filter button
 * ---------------------------------------------------- *
 */
const HeaderElement = React.memo(
  ({
    t,
    loading,
    bannerImage,
    categoryAppContent,
    totalCount,
    selectedSortLabel,
    appliedFilterCount,
    appliedFilterChips,
    onPressVisibleSort,
    onPressVisibleFilter,
    onClearAppliedFilters,
    onRemoveAppliedFilter,
    dataFilter,
    appliedFilters,
    onToggleAppliedFilter,
    quickFilterSettings,
    search,
    disableFilterSort = false,
  }) => {
    // quick filter chips (PRD §4): Admin-configured settings
    // intersected with the page's aggregation snapshot. When the
    // bootstrap field is unavailable (backend not deployed yet)
    // fall back to scanning boolean aggregations so today's
    // Flash Sale chip keeps working
    const quickFilterChips = useMemo(() => {
      if (quickFilterSettings) {
        return resolveQuickFilterChips(quickFilterSettings, dataFilter);
      }
      return (dataFilter ?? [])
        .filter(
          aggregation =>
            isVisibleAggregation(aggregation, {isSearch: false}) &&
            resolveRendererType(aggregation, {isSearch: false}) ===
              RENDERER.BOOLEAN,
        )
        .map(aggregation => ({
          code: aggregation.attribute_code,
          attributeCode: aggregation.attribute_code,
          value: '1',
          label: aggregation.label,
          opensPanel: false,
        }));
    }, [quickFilterSettings, dataFilter]);
    return (
      <CustomView width={Mixins.MAX_WIDTH}>
        {/* Search — result pages echo the current keyword read-only */}
        <CustomView paddingHorizontal={12} paddingTop={5}>
          <SearchBar
            outStyles={{
              borderWidth: 1,
              borderColor: Colors.PRIMARY,
            }}
            searchValue={search || undefined}
          />
        </CustomView>

        {/* Banner（can be empty） */}
        {bannerImage ? (
          <CustomView paddingHorizontal={12} paddingTop={8}>
            <Image
              source={{uri: bannerImage}}
              style={{
                width: '100%',
                aspectRatio: 4,
                borderRadius: 12,
              }}
            />
          </CustomView>
        ) : null}

        {/* CMS Area: Components are never destroyed */}
        <CustomView paddingHorizontal={12} paddingTop={8}>
          {loading && !categoryAppContent ? (
            <ShimmerSkeleton type={TYPE_SHIMMER_CMS_HOME} />
          ) : categoryAppContent ? (
            <CmsRender
              isHome={false}
              htmlStr={categoryAppContent}
              useFlashList={false}
              isPLP
            />
          ) : null}
        </CustomView>

        {/* Results & Sorting & Filtering */}
        {!loading ? (
          <>
            {/* Quick filters row: Filter(n) chip + one-tap boolean chips (horizontal scroll, no wrap) */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              nestedScrollEnabled
              contentContainerStyle={{paddingHorizontal: 12, marginTop: 12, marginBottom: 8}}>
              <TouchableOpacity
                activeOpacity={0.8}
                disabled={disableFilterSort}
                onPress={onPressVisibleFilter}>
                <CustomView
                  row
                  horizontalCenter
                  verticalCenter
                  borderRadius={18}
                  marginRight={8}
                  marginBottom={8}
                  paddingVertical={6}
                  paddingHorizontal={14}
                  style={[
                    appliedFilterCount
                      ? styles.chipSelected
                      : styles.chipUnselected,
                    disableFilterSort && {opacity: 0.4},
                  ]}>
                  <IconFilter color={appliedFilterCount ? Colors.PRIMARY : '#212121'} />
                  <Text bold={Boolean(appliedFilterCount)} color={appliedFilterCount ? Colors.PRIMARY : '#212121'} style={styles.filterText}>
                    {t('product_list.view.filterAndSort')}
                  </Text>
                  {appliedFilterCount > 0 ? (
                    <Text bold color={Colors.PRIMARY} style={[styles.filterText, {marginLeft: 0}]}>
                      {`(${appliedFilterCount})`}
                    </Text>
                  ) : null}
                </CustomView>
              </TouchableOpacity>
              {quickFilterChips.map(chip => (
                <FilterChip
                  key={chip.code}
                  label={chip.label}
                  selected={
                    !chip.opensPanel &&
                    (appliedFilters?.[chip.attributeCode] ?? []).includes(
                      chip.value,
                    )
                  }
                  onPress={() => {
                    if (chip.opensPanel) {
                      onPressVisibleFilter();
                    } else {
                      onToggleAppliedFilter(chip.attributeCode, chip.value);
                    }
                  }}
                />
              ))}
            </ScrollView>

            {/* Results & sorting */}
            <CustomView
              row
              spaceBetween
              horizontalCenter
              verticalCenter
              paddingHorizontal={12}
              marginTop={2}
              marginBottom={12}>
              <Text bold style={{fontSize: 14}}>
                {totalCount} {t('product_list.view.result')}
              </Text>
              <TouchableOpacity
                disabled={disableFilterSort}
                onPress={() => onPressVisibleSort(true)}>
                <CustomView
                  row
                  horizontalCenter
                  verticalCenter
                  style={disableFilterSort && {opacity: 0.4}}>
                  {/* <Icon name="reorder-three-outline" size={18} color={Colors.BLACK} /> */}
                  <SortAlignCenter />
                  <Text bold style={{fontSize: 14, marginLeft: 2}}>
                    {selectedSortLabel ?? t('product_list.view.sort')}
                  </Text>
                  <CustomView style={{marginLeft: 4}}>
                    <Icon
                      name="code"
                      size={14}
                      color={'#9E9E9E'}
                      style={{transform: [{rotate: '-90deg'}]}}
                    />
                  </CustomView>
                </CustomView>
              </TouchableOpacity>
            </CustomView>

            {/* Filter Chips */}
            {/* {appliedFilterChips?.length > 0 ? (
              <CustomView
                paddingHorizontal={12}
                paddingBottom={10}
                marginTop={-10}>
                <CustomView
                  row
                  style={{flexWrap: 'wrap', alignItems: 'center'}}
                  horizontalCenter={false}>
                  <TouchableOpacity
                    onPress={onClearAppliedFilters}
                    style={{marginRight: 12, marginBottom: 8}}>
                    <Text
                      color={Colors.PRIMARY}
                      style={{textDecorationLine: 'underline'}}>
                      {t('product_list.view.clearAll')}
                    </Text>
                  </TouchableOpacity>

                  {appliedFilterChips.map(chip => (
                    <CustomView
                      key={`${chip.attributeCode}-${chip.value}`}
                      row
                      verticalCenter
                      style={{
                        backgroundColor: '#f0f0f0',
                        borderRadius: 16,
                        paddingVertical: 6,
                        paddingHorizontal: 12,
                        marginRight: 8,
                        marginBottom: 8,
                      }}>
                      <Text style={{fontSize: 12}}>{chip.label}</Text>
                      <TouchableOpacity
                        onPress={() =>
                          onRemoveAppliedFilter(chip.attributeCode, chip.value)
                        }
                        style={{marginLeft: 8}}>
                        <Icon name="close" size={14} color={Colors.BLACK} />
                      </TouchableOpacity>
                    </CustomView>
                  ))}
                </CustomView>
              </CustomView>
            ) : null} */}
          </>
        ) : null}
      </CustomView>
    );
  },
);

const ProductListScreen = ({
  t,
  loading,
  loadingMore = false,
  products,
  totalCount,
  onLoadMore,
  noMoreData,
  categoryId = null,
  onNavigateToProductDetail,
  bannerImage,
  onPressCart,
  dataFilter,
  appliedFilters,
  visibleFilter,
  visibleSort,
  onPressCloseFilter,
  onPressVisibleFilter,
  onPressVisibleSort,
  filters,
  onToggleOption,
  onSetFilterValues = () => {},
  applyItemCount = null,
  onApplyFilter,
  onClearFilter,
  selectedSort,
  onSelectSort,
  title,
  isErrorCategory,
  search,
  isSearch,
  selectedSortLabel,
  sortOptions = [],
  appliedFilterCount,
  appliedFilterChips = [],
  onRemoveAppliedFilter = () => {},
  onToggleAppliedFilter = () => {},
  quickFilterSettings,
  categoryFacet,
  onClearAppliedFilters = () => {},
  showFlashSaleEndedModal = false,
  onCloseFlashSaleEndedModal = () => {},
  onFlashSaleModalRefresh = () => {},
  onRefreshPLP = () => {},
  categoryAppContent = null,
  disableFilterSort = false,
}) => {
  const route = useRoute();
  const listRef = useRef(null);
  const skuModalRef = useRef(null);

  const {onViewableItemsChanged, resetExposureData} = useFlashListExposure({
    listRef,
    visibleThreshold: 0.5,
    minVisibleTime: 1000,
    enableLog: __DEV__,
    onExposure: ({item}) => {
      if (
        appliedFilters.price?.length > 0 ||
        appliedFilters.category_uid?.length > 0 ||
        appliedFilters.brand?.length > 0
      ) {
        trackSkuComponentFilter({
          location_name: route.name,
          price_scope: appliedFilters.price.join(','),
          category_name: appliedFilters.category_uid.join(','),
          brand_name: appliedFilters.brand.join(','),
          sku_name: item.name,
          sku_id: item.sku,
        });
      } else {
        trackSkuComponentExposure({
          location_name: route.name,
          sku_name: item.name,
          sku_id: item.sku,
        });
      }
    },
  });

  const picker = useVariantPicker({
    modalRef: skuModalRef,
    onClose: () => skuModalRef.current?.dismiss(),
  });

  useEffect(() => {
    if (
      appliedFilters.price?.length > 0 ||
      appliedFilters.category_uid?.length > 0 ||
      appliedFilters.brand?.length > 0
    ) {
      resetExposureData();
    }
  }, [appliedFilters.price, appliedFilters.category_uid, appliedFilters.brand]);

  /**
   * ----------------------------------------- *
   * @function FooterElement
   * @summary for display footer element
   * @returns Component
   * ----------------------------------------- *
   */
  const FooterElement = useCallback(() => {
    return (
      <View
        style={{
          height: 52,
          minHeight: 52,
          width: '100%',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        {loadingMore ? (
          <ActivityIndicator size="small" color={Colors.PRIMARY} />
        ) : noMoreData ? (
          <Text>
            {/* {t('product_list.view.noMoreData')} */}
          </Text>
        ) : null}
      </View>
    );
  }, [loadingMore, noMoreData, t]);
  /**
   * ----------------------------------------- *
   * @function EmptyElement
   * @summary for display empty element
   * @returns Component
   * ----------------------------------------- *
   */
  const EmptyElement = useCallback(() => {
    if (loading) {
      return <ShimmerSkeleton type={TYPE_SHIMMER_PLP} />;
    }
    return (
      <CustomView
        horizontalCenter
        verticalCenter
        width="100%"
        paddingTop={70}
        paddingBottom={60}>
        <IconEmptyBox />
        <Text center style={{marginTop: 8, fontSize: 13, color: '#757575'}}>
          {t('product_list.view.noProductsMatch')}
        </Text>
        {appliedFilterCount > 0 ? (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onClearAppliedFilters}
            style={{
              marginTop: 24,
              borderWidth: 1,
              borderColor: Colors.PRIMARY,
              borderRadius: 8,
              paddingVertical: 6.5,
              paddingHorizontal: 12,
            }}>
            <Text bold color={Colors.PRIMARY} style={{fontSize: 11}}>
              {t('product_list.view.clearAllFilters')}
            </Text>
          </TouchableOpacity>
        ) : null}
      </CustomView>
    );
  }, [loading, t, appliedFilterCount, onClearAppliedFilters]);

  /**
   * ----------------------------------------- *
   * @function RenderItem
   * @param {object} item
   * @summary for display single item product
   * @returns Component
   * ----------------------------------------- *
   */
  const RenderItem = useCallback(
    ({item, index}) => {
      return (
        <CustomView
          marginBottom={10}
          marginHorizontal={6}
          style={{overflow: 'hidden', flex: 1}}>
          <ProductItem
            item={item}
            onNavigateToProductDetail={onNavigateToProductDetail}
            index={index}
            onOpenVariantPopup={() => {
              picker.open({
                cacheKey: item.uid,
                urlKey: item.variant_parent_url_key,
                action:
                  item?.variant_preselected_options?.length > 0
                    ? CART_ACTIONS.ADD_TO_CART
                    : '',
                uid: item.uid,
              });
            }}
          />
        </CustomView>
      );
    },
    [onNavigateToProductDetail],
  );

  const keyExtractor = useCallback(item => item.id.toString(), []);

  // Android: onEndReached 不稳定，用 onScroll 兜底；提前约 2 屏触发
  const handleScroll = useCallback(
    event => {
      if (Platform.OS !== 'android') {
        return;
      }
      const {layoutMeasurement, contentOffset, contentSize} = event.nativeEvent;
      if (contentSize.height <= layoutMeasurement.height) {
        return;
      }
      const distanceFromBottom =
        contentSize.height - (layoutMeasurement.height + contentOffset.y);
      if (distanceFromBottom < layoutMeasurement.height * 2) {
        onLoadMore();
      }
    },
    [onLoadMore],
  );

  if (isErrorCategory) {
    return (
      <>
        <NavBar
          useWhite
          useBack
          center
          title={title}
          childrenRight={<AtomRightCart onPressCart={onPressCart} />}
        />
        <NoData />
      </>
    );
  }
  const listProps = {
    overScrollMode: 'never',
    scrollEventThrottle: 16,
    onScroll: handleScroll,
    renderItem: RenderItem,
    ListHeaderComponent: (
      <HeaderElement
        t={t}
        loading={loading}
        bannerImage={bannerImage}
        categoryAppContent={categoryAppContent}
        totalCount={totalCount}
        selectedSortLabel={selectedSortLabel}
        appliedFilterCount={appliedFilterCount}
        appliedFilterChips={appliedFilterChips}
        onPressVisibleSort={onPressVisibleSort}
        onPressVisibleFilter={onPressVisibleFilter}
        onClearAppliedFilters={onClearAppliedFilters}
        onRemoveAppliedFilter={onRemoveAppliedFilter}
        dataFilter={dataFilter}
        appliedFilters={appliedFilters}
        onToggleAppliedFilter={onToggleAppliedFilter}
        quickFilterSettings={quickFilterSettings}
        search={search}
        disableFilterSort={disableFilterSort}
      />
    ),
    ListHeaderComponentStyle: {
      alignSelf: 'center',
      backgroundColor: Colors.WHITE,
    },
    ListFooterComponent: FooterElement,
    onEndReached: onLoadMore,
    onEndReachedThreshold: 2,
    ListEmptyComponent: EmptyElement,
    numColumns: 2,
    data: products ?? [],
    keyExtractor,
    style: {
      flex: 1,
      width: Mixins.MAX_WIDTH,
      backgroundColor: Colors.WHITE,
    },
  };

  return (
    <>
      <NavBar
        useWhite
        useBack
        center
        title={title}
        childrenRight={<AtomRightCart onPressCart={onPressCart} />}
      />
      <FlashList
        {...listProps}
        ref={listRef}
        estimatedItemSize={340}
        extraData={products}
        drawDistance={500}
        viewabilityConfig={{
          itemVisiblePercentThreshold: 50,
          minimumViewTime: 100,
          waitForInteraction: false,
        }}
        onViewableItemsChanged={onViewableItemsChanged}
        contentContainerStyle={{
          paddingHorizontal: 6,
        }}
      />
      <FilterAndSort
        visible={visibleFilter}
        onBackBackButtonPress={onPressCloseFilter}
        dataFilter={dataFilter}
        categoryFacet={categoryFacet}
        filters={filters}
        onToggleOption={onToggleOption}
        onSetFilterValues={onSetFilterValues}
        applyItemCount={applyItemCount}
        onApplyFilter={onApplyFilter}
        onClearFilter={onClearFilter}
        search={search}
      />
      <AppModal
        type={TYPE_MODAL_SORT}
        show={visibleSort}
        title={'Sorting'}
        data={{items: sortOptions}}
        selectedSort={selectedSort}
        onPressVisibleSort={onPressVisibleSort}
        onSelectSort={onSelectSort}
      />
      <FlashSaleEndedModal
        visible={showFlashSaleEndedModal}
        onClose={onCloseFlashSaleEndedModal}
        onRefresh={onFlashSaleModalRefresh}
      />
      <VariantPickerModal ref={skuModalRef} {...picker} />
    </>
  );
};

export default ProductListScreen;
