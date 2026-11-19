import React, {useCallback, useEffect, useRef, useState} from 'react';

import {useFocusEffect, useIsFocused} from '@react-navigation/native';

import {useReactiveVar} from '@apollo/client';
import {modules, tabsApp} from '@root/swift.config';

import _ from 'lodash';
import {useTranslation} from 'react-i18next';

import Views from '@app/_modules/product_list/_view';
import {
  GET_CATEGORIES_PRODUCT_LIST,
  GET_GUID_FILTER_BOOTSTRAP,
  GET_PRODUCT_FILTER_BY_SEARCH,
  GET_PRODUCT_FILTER_PRODUCT_LIST,
  GET_PRODUCT_SEARCH,
  URL_RESOLVER,
} from '@app/_modules/product_list/services/schema';
import {
  getProductListDefaultSort,
  useProductListFilter,
} from '@app/_modules/product_list/services/useProductListFilter';
import AnalyticsHelper from '@app/helpers/Analytics';
import {BRAND, CATEGORY, SEARCH} from '@app/helpers/Constants';
import DateHelper from '@app/helpers/Date';
import {
  getFlashSalePageKey,
  isFlashSaleModalShownFor,
  markFlashSaleModalShown,
  markFlashSaleSilentRefreshed,
  notifyFlashSaleEndedRefreshed,
  shouldSilentRefreshFlashSale,
} from '@app/helpers/FlashSale';
import {navigateTo, navReset} from '@app/helpers/Navigation';
import {startPerfTrace} from '@app/helpers/perf';
import {NAME, setMetricEnd, setMetricStart} from '@app/helpers/Performance';
import {warmProductCartItemMap} from '@app/hooks/carts/useCarts';
import useCustomQuery from '@app/hooks/useCustomQuery';
import {rxUserWIshlistItems} from '@app/services/cache';

const ProductList = ({route}) => {
  if (!modules.product_list.enable) {
    return null;
  }

  const {variables, type, id, categoryId, categoryName, search, category_url} =
    route.params;
  const {t} = useTranslation();
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [imageErrors, setImageErrors] = useState({});
  const [products, setProducts] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [noMoreData, setNoMoreData] = useState(false);
  const lastProcessedDataRef = useRef(null);
  const canLoadMoreRef = useRef(false);
  const [showFlashSaleEndedModal, setShowFlashSaleEndedModal] = useState(false);
  const firstFlashSaleProductRef = useRef(null);
  const flashSaleCountdownIntervalRef = useRef(null);
  const hasShownModalRef = useRef(false);
  // 本页面实例在「闪购结束刷新广播」中的唯一 key
  const flashSalePageKeyRef = useRef(getFlashSalePageKey('plp'));
  const [query, setQuery] = useState(
    type !== SEARCH ? GET_CATEGORIES_PRODUCT_LIST : GET_PRODUCT_SEARCH,
  );
  const [queryVariables, setQueryVariables] = useState(null);
  const [bannerImage, setBannerImage] = useState('');
  const [title, setTitle] = useState('');
  const [categoryAppContent, setCategoryAppContent] = useState(null);
  const mount = useRef();
  const isFocused = useIsFocused();
  const wishlist = useReactiveVar(rxUserWIshlistItems);
  const refFirebaseList = useRef();
  const categoryTraceRef = useRef(null);
  const productListTraceRef = useRef(null);
  const isSearch = type === SEARCH;
  const DEFAULT_SORT = getProductListDefaultSort(isSearch);
  const queryVariablesInit = {
    currentPage: currentPage,
    id: categoryId,
    filters: {category_id: {eq: categoryId}},
    pageSize: 20,
    sort: DEFAULT_SORT,
  };
  if (isSearch) {
    queryVariablesInit.inputText = search;
  }

  const normalizeDateValue = useCallback(value => {
    if (!value) {
      return null;
    }
    if (value instanceof Date) {
      return isNaN(value.getTime()) ? null : value;
    }
    if (typeof value === 'string') {
      const normalized = value.includes(' ') ? value.replace(' ', 'T') : value;
      const parsed = new Date(normalized);
      return isNaN(parsed.getTime()) ? null : parsed;
    }
    return null;
  }, []);

  const getFirstFlashSaleProduct = useCallback(() => {
    if (!products || products.length === 0) {
      return null;
    }
    return products.find(product => product?.is_flash_sale === 1) || null;
  }, [products]);

  const {data: dataResolver, loading: loadingResolver} = useCustomQuery({
    schema: URL_RESOLVER,
    useInitData: type === BRAND || variables?.type === BRAND ? true : false,
    variables: {
      url: category_url
        ? `${category_url}.html`
        : `/brand/${categoryName}.html`,
    },
    opts: {fetchPolicy: 'no-cache'},
  });

  const {data: dataFilter, onRefetchData: refetchFilter} = useCustomQuery({
    schema:
      type !== SEARCH
        ? GET_PRODUCT_FILTER_PRODUCT_LIST
        : GET_PRODUCT_FILTER_BY_SEARCH,
    useInitData: categoryId ? true : false,
    variables:
      type !== SEARCH
        ? {
            categoryIdFilter: {eq: categoryId},
          }
        : {
            search,
          },
    opts: {fetchPolicy: 'no-cache'},
  });

  const {
    data,
    onRefetchData,
    error,
    loading: loadingPLP,
  } = useCustomQuery({
    schema: query,
    useInitData: categoryId ? true : false,
    variables: queryVariablesInit,
    opts: {fetchPolicy: 'no-cache'},
  });
  const isErrorCategory = error !== null;

  // GUID filter bootstrap (PRD §1): quick-filter codes enabled
  // in Admin + category facet for the page context. Category
  // pages pass the node id (facet = its children); Brand pages
  // wait for the url resolver and fetch the brand category's
  // own children — facet values must be a subset of the page
  // base, because an applied facet replaces the category_id
  // base entirely (the two fields cannot coexist).
  // useInitData: true — this hook only auto-fetches on mount
  // when set (manual client.query wrapper, not Apollo useQuery)
  const {data: dataBootstrap, onRefetchData: onRefetchBootstrap} = useCustomQuery({
    schema: GET_GUID_FILTER_BOOTSTRAP,
    useInitData: !(type === BRAND || variables?.type === BRAND),
    variables:
      type === CATEGORY || variables?.type === CATEGORY
        ? {categoryId}
        : {},
    opts: {fetchPolicy: 'no-cache'},
  });
  const refetchBootstrapRef = useRef();
  refetchBootstrapRef.current = onRefetchBootstrap;
  useEffect(() => {
    if (
      (type === BRAND || variables?.type === BRAND) &&
      dataResolver?.data?.urlResolver?.id != null
    ) {
      refetchBootstrapRef.current?.({
        params: {categoryId: dataResolver.data.urlResolver.id},
      });
    }
  }, [dataResolver, type, variables]);

  /**
   * ----------------------------------------- *
   * list-state reset shared by apply-filter and
   * sort-change; the hook never touches list state
   * ----------------------------------------- *
   */
  const resetListState = useCallback(() => {
    setProducts([]);
    setLoading(true);
    setLoadingMore(false);
    setNoMoreData(false);
    setCurrentPage(1);
    lastProcessedDataRef.current = null;
    canLoadMoreRef.current = false;
  }, []);

  /**
   * ----------------------------------------- *
   * seam called by the filter hook with the
   * composed queryVariables + query schema
   * ----------------------------------------- *
   */
  const handleFilterQueryApply = useCallback(
    ({queryVariables: filterQueryVariables, querySchema}) => {
      setQuery(querySchema);
      setQueryVariables(filterQueryVariables);
      onRefetchData({params: filterQueryVariables});
    },
    [onRefetchData],
  );

  const {
    filters,
    appliedFilters,
    selectedSort,
    selectedSortLabel,
    sortOptions,
    appliedFilterCount,
    appliedFilterChips,
    visibleFilter,
    visibleSort,
    openFilter,
    closeFilter,
    setVisibleSort,
    toggleOption,
    clearDraftFilters,
    setFilterValues,
    draftFilterCount,
    applyFilters,
    selectSort,
    removeAppliedFilter,
    toggleAppliedFilter,
    clearAppliedFilters,
  } = useProductListFilter({
    aggregations: dataFilter?.data?.products?.aggregations,
    type,
    categoryId,
    search,
    brandCategoryId: dataResolver?.data?.urlResolver?.id,
    onApply: handleFilterQueryApply,
  });

  const onApplyFilter = useCallback(() => {
    resetListState();
    if (!applyFilters()) {
      setLoading(false);
      return;
    }
    // nothing fired (e.g. brand page before its resolver resolves):
    // keep the sheet open; otherwise apply + close like the
    // original filter did
    closeFilter();
  }, [applyFilters, closeFilter, resetListState]);

  const onSelectSort = useCallback(
    value => {
      resetListState();
      if (!selectSort(value)) {
        setLoading(false);
      }
    },
    [selectSort, resetListState],
  );

  const onLogCategoryToAnalytics = () => {
    const attributeId = variables?.attribute_id || (type === BRAND && id);
    const item = {
      item_list_id: attributeId
        ? attributeId.toString()
        : categoryId.toString(),
      item_list_name: categoryName ? categoryName.toString() : '',
    };
    AnalyticsHelper.eventViewItemList(item);
  };

  useEffect(() => {
    mount.current = true;
    return () => {
      mount.current = false;
      if (flashSaleCountdownIntervalRef.current) {
        clearInterval(flashSaleCountdownIntervalRef.current);
        flashSaleCountdownIntervalRef.current = null;
      }
      if (productListTraceRef.current) {
        productListTraceRef.current.stop();
        productListTraceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (categoryId && mount.current) {
      onLogCategoryToAnalytics();
    }
  }, [categoryId]);

  useEffect(() => {
    lastProcessedDataRef.current = null;
    canLoadMoreRef.current = false;
    setLoading(true);
    setLoadingMore(false);
    setCurrentPage(1);
    setProducts([]);
    setNoMoreData(false);
    setShowFlashSaleEndedModal(false);
    hasShownModalRef.current = false;
    firstFlashSaleProductRef.current = null;
    if (flashSaleCountdownIntervalRef.current) {
      clearInterval(flashSaleCountdownIntervalRef.current);
      flashSaleCountdownIntervalRef.current = null;
    }
    if (route.params.categoryName?.includes('<span')) {
      const regex = /(<([^>]+)>)/gi;
      const resTitle = categoryName.replace(regex, '');
      setTitle(resTitle);
    } else {
      setTitle(categoryName);
    }

    // 开始 categoryInit trace（仅当是分类页面时）
    if (categoryId && !isSearch) {
      const startCategoryTrace = async () => {
        categoryTraceRef.current = await startPerfTrace('categoryInit');
        categoryTraceRef.current.putAttribute(
          'category_id',
          categoryId?.toString() || '',
        );
        categoryTraceRef.current.putAttribute(
          'category_name',
          categoryName || '',
        );
        categoryTraceRef.current.startTime = Date.now();
      };
      startCategoryTrace();
    }
    // 商品列表搜索、分类页面初始化 trace
    startProductListInitTrace();
  }, [route]);

  useEffect(() => {
    if (data?.data && mount.current) {
      const categoryImage = _.get(data, 'data.category.image');
      const categoryTitle = _.get(data, 'data.category.name');
      // 从app_content中提取description字段（CMS HTML字符串）
      const categoryAppContentStr = _.get(
        data,
        'data.category.app_content.description',
      );

      if (categoryImage) {
        setBannerImage(categoryImage);
      }
      if (categoryTitle) {
        setTitle(categoryTitle);
      }

      // 设置CMS内容字符串，直接传递给CmsRender组件
      // 注意：这里可能是HTML字符串，需要后端返回JSON格式才能直接解析
      if (categoryAppContentStr) {
        setCategoryAppContent(categoryAppContentStr);
      } else {
        setCategoryAppContent(null);
      }

      // 停止 categoryInit trace（当数据加载完成时）
      if (categoryTraceRef.current && !isSearch) {
        const duration =
          Date.now() - (categoryTraceRef.current.startTime || Date.now());
        categoryTraceRef.current.putMetric('duration_ms', duration);
        categoryTraceRef.current.putAttribute('status', 'success');
        categoryTraceRef.current.stop();
        categoryTraceRef.current = null;
      }
      // 结束 productListInit trace
      stopProductListInitTrace();
    }
  }, [data, isSearch]);

  useEffect(() => {
    setLoading(true);
    if (variables) {
      let queryVariablesTmp = {};
      switch (variables?.type) {
        case BRAND:
          if (dataResolver && dataResolver.data) {
            setQuery(GET_CATEGORIES_PRODUCT_LIST);
            queryVariablesTmp = {
              id: dataResolver.data.urlResolver.id,
              filters: {category_id: {eq: dataResolver.data.urlResolver.id}},
              search: search,
            };
            refetchFilter({
              params: {
                categoryIdFilter: {eq: dataResolver.data.urlResolver.id},
              },
            });
          }
          break;
        case CATEGORY:
          setQuery(GET_CATEGORIES_PRODUCT_LIST);
          queryVariablesTmp = {
            variables: {
              currentPage: currentPage,
              id: variables?.categoryId,
              filters: {category_id: {eq: categoryId}},
              pageSize: 20,
              sort: DEFAULT_SORT,
            },
          };
          break;
      }
      queryVariablesTmp = {
        ...queryVariablesTmp,
        currentPage: currentPage,
        pageSize: 20,
        sort: DEFAULT_SORT,
      };
      setQueryVariables(queryVariablesTmp);
      onRefetchData({params: queryVariablesTmp});
    } else if (route.params) {
      let queryVariablesTmp = {};
      switch (type) {
        case BRAND:
          if (dataResolver && dataResolver.data?.urlResolver?.id) {
            setQuery(GET_CATEGORIES_PRODUCT_LIST);
            queryVariablesTmp = {
              id: dataResolver.data.urlResolver.id,
              filters: {category_id: {eq: dataResolver.data.urlResolver.id}},
              search: search,
              currentPage: currentPage,
              pageSize: 20,
              sort: DEFAULT_SORT,
            };
            refetchFilter({
              params: {
                categoryIdFilter: {eq: dataResolver.data.urlResolver.id},
              },
            });
            setQueryVariables(queryVariablesTmp);
            onRefetchData({params: queryVariablesTmp});
          } else {
            setProducts([]);
            setLoading(false);
          }
          break;
        case CATEGORY:
          setQuery(GET_CATEGORIES_PRODUCT_LIST);
          queryVariablesTmp = {
            id: route.params?.categoryId,
            filters: {category_id: {eq: route.params?.categoryId}},
            search: search,
            currentPage: currentPage,
            pageSize: 20,
            sort: DEFAULT_SORT,
          };
          setQueryVariables(queryVariablesTmp);
          onRefetchData({params: queryVariablesTmp});
          break;
        case SEARCH:
          setQuery(GET_PRODUCT_SEARCH);
          let tempFilter = route.params?.categoryId
            ? {category_id: {eq: route.params?.categoryId}}
            : {};
          queryVariablesTmp = {
            filters: tempFilter,
            inputText: search,
            currentPage: currentPage,
            pageSize: 20,
            sort: DEFAULT_SORT,
          };
          refetchFilter({params: {search: search}});
          setQueryVariables(queryVariablesTmp);
          onRefetchData({params: queryVariablesTmp});
          break;
      }
    }
  }, [type, variables, dataResolver?.data?.urlResolver?.id, categoryId]);

  useEffect(() => {
    const getProductListData = async () => {
      const dataKey = `${currentPage}-${data?.data?.products?.items?.length}-${data?.data?.products?.total_count}`;
      if (lastProcessedDataRef.current === dataKey && data?.data?.products) {
        return;
      }
      if (data === undefined) {
        await setMetricStart({
          name: NAME.PRODUCT_LIST,
          refFirebase: refFirebaseList,
        });
      } else {
        if (!queryVariables) {
          return;
        }

        if (data && data?.data) {
          lastProcessedDataRef.current = dataKey;

          const pageInfo = data?.data?.products?.page_info;
          const reachedLastPage =
            pageInfo?.current_page >= pageInfo?.total_pages;

          if (currentPage === 1) {
            if (wishlist) {
              let productTmp = [];
              let tmpWishlistId = null;
              data?.data?.products?.items.forEach((item, index) => {
                let wishlistItems = wishlist.find(
                  wishlistItem => wishlistItem.productId === item.id,
                );
                if (wishlistItems) {
                  tmpWishlistId = wishlistItems.wishlistId;
                  let tmpProduct = {
                    ...data?.data?.products?.items[index],
                    wishlistId: tmpWishlistId,
                  };
                  productTmp.push(tmpProduct);
                } else {
                  productTmp.push(data?.data?.products?.items[index]);
                }
              });
              setProducts(productTmp);
              setTotalCount(data?.data?.products.total_count);
            } else {
              setProducts(data?.data?.products.items);
              setTotalCount(data?.data?.products.total_count);
            }
            setNoMoreData(!!reachedLastPage);
            setLoadingMore(false);
            canLoadMoreRef.current = !reachedLastPage;
          } else {
            const incomingItems = data?.data?.products?.items ?? [];
            let newItems = [];
            if (wishlist) {
              incomingItems.forEach(item => {
                const wishlistItems = wishlist.find(
                  w => w.productId === item.id,
                );
                newItems.push(
                  wishlistItems
                    ? {...item, wishlistId: wishlistItems.wishlistId}
                    : item,
                );
              });
            } else {
              newItems = incomingItems;
            }
            setProducts(prev => {
              // 搜索分页可能返回重复商品(相邻页重叠),按 id 去重,
              // 避免 FlashList stableId 冲突导致整行空白占位
              const existIds = new Set(prev.map(p => p.id));
              const dedupedItems = newItems.filter(it => !existIds.has(it.id));
              return [...prev, ...dedupedItems];
            });
            setTotalCount(data?.data?.products.total_count);
            setNoMoreData(!!reachedLastPage);
            setLoadingMore(false);
            canLoadMoreRef.current = !reachedLastPage;
          }
          if (currentPage === 1) {
            setLoading(false);
          }
          await setMetricEnd({refFirebase: refFirebaseList});
        } else if (!loadingPLP) {
          setLoading(false);
          setLoadingMore(false);
        }
      }
    };
    getProductListData();
  }, [
    data?.data?.products?.items,
    data?.data?.products?.page_info,
    data?.data?.products?.total_count,
  ]);

  const onLoadMore = () => {
    if (!canLoadMoreRef.current || noMoreData || loadingMore) {
      return;
    }

    const totalPages = data?.data?.products?.page_info?.total_pages;

    if (!totalPages || currentPage >= totalPages) {
      if (totalPages && currentPage >= totalPages) {
        setNoMoreData(true);
      }
      return;
    }

    canLoadMoreRef.current = false;
    setLoadingMore(true);

    const newPage = currentPage + 1;
    setCurrentPage(newPage);
    const queryVariablesTmp = {
      ...queryVariables,
      currentPage: newPage,
    };
    setQueryVariables(queryVariablesTmp);
    onRefetchData({params: queryVariablesTmp});
  };

  useEffect(() => {
    if (flashSaleCountdownIntervalRef.current) {
      clearInterval(flashSaleCountdownIntervalRef.current);
      flashSaleCountdownIntervalRef.current = null;
    }

    // 定时器防串扰：仅在列表页获得焦点时运行倒计时。
    // 列表页压在路由栈底（失焦）时若继续跑定时器，倒计时到点会先把
    // 弹框 state 置 true，等用户返回时再次弹窗（PDP/Cart/Checkout 同理）。
    // 失焦期间闪购结束的话，回到前台时本 effect 会重新执行并立即检查兜底。
    if (!isFocused) {
      return;
    }

    // 异步竞态守卫：effect 被 cleanup（失焦/数据变化/卸载）之后，
    // 异步回调里不允许再创建定时器或弹窗，避免产生清不掉的僵尸定时器
    let isActive = true;

    // 搜索列表不显示弹窗，只有分类列表才显示
    if (isSearch) {
      firstFlashSaleProductRef.current = null;
      return;
    }

    // 如果已经有保存的 flash sale 商品，继续使用它（即使滚动到其他页面）
    if (firstFlashSaleProductRef.current) {
      // 继续使用已保存的商品
    } else {
      // 第一次加载，需要获取 flash sale 商品
      if (loading || !products || products.length === 0) {
        return;
      }

      const firstFlashSaleProduct = getFirstFlashSaleProduct();

      if (!firstFlashSaleProduct) {
        return;
      }

      const endDate = firstFlashSaleProduct?.special_to_date;
      if (!endDate) {
        return;
      }

      firstFlashSaleProductRef.current = firstFlashSaleProduct;
    }

    // 检查商品是否发生变化（用于处理商品更新的情况）
    if (!loading && products && products.length > 0) {
      const currentFlashSaleProduct = getFirstFlashSaleProduct();
      if (
        currentFlashSaleProduct &&
        currentFlashSaleProduct.id !== firstFlashSaleProductRef.current.id
      ) {
        // 全局标记按「闪购结束时间戳」识别同一轮闪购，无需在此删除；
        // 删除反而会破坏其他页面对同一轮闪购的去重（闪购活动通常共用
        // 同一个结束时间，切换商品不应重新弹框）
        hasShownModalRef.current = false;
        firstFlashSaleProductRef.current = currentFlashSaleProduct;
      }
    }

    const firstFlashSaleProduct = firstFlashSaleProductRef.current;
    if (!firstFlashSaleProduct) {
      return;
    }

    const endDate = firstFlashSaleProduct?.special_to_date;
    if (!endDate) {
      return;
    }

    const normalizedEndDateValue = normalizeDateValue(endDate);
    if (!normalizedEndDateValue) {
      return;
    }

    const converted = DateHelper.convertUTCToIndonesia(normalizedEndDateValue);
    const normalizedEndDate = converted ? new Date(converted) : null;

    if (!normalizedEndDate || isNaN(normalizedEndDate.getTime())) {
      return;
    }

    // 本轮闪购的身份标识：结束时间戳（ms），用于全局弹框去重
    const flashSaleEndMs = normalizedEndDate.getTime();

    const getRemainingMs = () => {
      if (!mount.current) {
        return null;
      }
      try {
        const now = DateHelper.getIndonesiaTimeNow();
        const remaining = normalizedEndDate.getTime() - now.getTime();
        return Math.max(remaining, 0);
      } catch (err) {
        console.error('[Flash Sale Modal] Error in getRemainingMs:', err);
        return null;
      }
    };

    const checkCountdown = async () => {
      if (!isActive || !mount.current) {
        return;
      }

      if (hasShownModalRef.current) {
        if (flashSaleCountdownIntervalRef.current) {
          clearInterval(flashSaleCountdownIntervalRef.current);
          flashSaleCountdownIntervalRef.current = null;
        }
        return;
      }

      // 全局弹框去重：仅当「已弹过的那轮闪购」的结束时间戳与当前一致
      // 时才跳过（同一商品配置新一轮闪购后标记失效，会重新弹框）
      const alreadyShown = await isFlashSaleModalShownFor(flashSaleEndMs);
      if (!isActive || !mount.current) {
        return;
      }
      if (alreadyShown) {
        hasShownModalRef.current = true;
        if (flashSaleCountdownIntervalRef.current) {
          clearInterval(flashSaleCountdownIntervalRef.current);
          flashSaleCountdownIntervalRef.current = null;
        }
        return;
      }

      const remaining = getRemainingMs();

      if (remaining === null) {
        return;
      }

      if (remaining <= 0) {
        const alreadyShownAtEnd = await isFlashSaleModalShownFor(
          flashSaleEndMs,
        );
        if (!isActive || !mount.current) {
          return;
        }
        if (alreadyShownAtEnd) {
          hasShownModalRef.current = true;
          if (flashSaleCountdownIntervalRef.current) {
            clearInterval(flashSaleCountdownIntervalRef.current);
            flashSaleCountdownIntervalRef.current = null;
          }
          return;
        }

        hasShownModalRef.current = true;
        markFlashSaleModalShown(flashSaleEndMs);
        setShowFlashSaleEndedModal(true);
        if (flashSaleCountdownIntervalRef.current) {
          clearInterval(flashSaleCountdownIntervalRef.current);
          flashSaleCountdownIntervalRef.current = null;
        }
      }
    };

    const initialRemaining = getRemainingMs();
    checkCountdown();

    if (
      isActive &&
      initialRemaining !== null &&
      initialRemaining > 0 &&
      !hasShownModalRef.current
    ) {
      flashSaleCountdownIntervalRef.current = setInterval(() => {
        checkCountdown();
      }, 1000);
    }

    return () => {
      isActive = false;
      if (flashSaleCountdownIntervalRef.current) {
        clearInterval(flashSaleCountdownIntervalRef.current);
        flashSaleCountdownIntervalRef.current = null;
      }
    };
  }, [
    products,
    loading,
    currentPage,
    isFocused,
    getFirstFlashSaleProduct,
    normalizeDateValue,
    isSearch,
  ]);

  const onNavigateToProductDetail = async ({
    productUrlKey,
    productSku,
    uid,
    variant_parent_url_key,
  }) => {
    // 开始 plpClickItem trace
    const clickTrace = await startPerfTrace('plpClickItem');
    const clickStartTime = Date.now();

    try {
      AnalyticsHelper.eventSelectItem({
        item_list_id: categoryId ? categoryId.toString() : '',
        item_list_name: categoryName ?? '',
        items: [
          {
            item_list_id: categoryId ? categoryId.toString() : '',
            item_list_name: categoryName ?? '',
            item_id: productSku.toString(),
          },
        ],
      });
      navigateTo(modules.product_detail.enable, modules.product_detail.name, {
        productUrlKey: variant_parent_url_key || productUrlKey,
        productSku,
        uid,
      });

      // 点击成功
      const duration = Date.now() - clickStartTime;
      clickTrace.putAttribute('product_sku', productSku?.toString() || '');
      clickTrace.putAttribute('product_url_key', productUrlKey || '');
      clickTrace.putAttribute('category_id', categoryId?.toString() || '');
      clickTrace.putMetric('duration_ms', duration);
      clickTrace.putAttribute('status', 'success');
      clickTrace.stop();
    } catch (err) {
      // 点击失败
      const duration = Date.now() - clickStartTime;
      clickTrace.putMetric('duration_ms', duration);
      clickTrace.putAttribute('status', 'error');
      clickTrace.stop();
    }
  };

  const onPressCart = () => {
    navigateTo(modules.cart.enable, modules.cart.name);
  };

  const onRefreshPLP = useCallback(() => {
    setProducts([]);
    setLoading(true);
    setLoadingMore(false);
    setNoMoreData(false);
    setCurrentPage(1);
    lastProcessedDataRef.current = null;
    canLoadMoreRef.current = false;
    hasShownModalRef.current = false;
    firstFlashSaleProductRef.current = null;

    if (flashSaleCountdownIntervalRef.current) {
      clearInterval(flashSaleCountdownIntervalRef.current);
      flashSaleCountdownIntervalRef.current = null;
    }

    if (queryVariables) {
      const refreshVariables = {
        ...queryVariables,
        currentPage: 1,
      };
      setQueryVariables(refreshVariables);
      onRefetchData({params: refreshVariables});
    }
  }, [queryVariables, onRefetchData]);

  const onCloseFlashSaleEndedModal = useCallback(() => {
    setShowFlashSaleEndedModal(false);

    const isFlashSaleCategoryList =
      !isSearch &&
      (category_url?.includes('flash-sale') ||
        category_url === 'flash-sale' ||
        title?.toLowerCase().includes('flash sale'));

    if (isFlashSaleCategoryList) {
      navReset(tabsApp.name);
    }
  }, [isSearch, category_url, title]);

  /**
   * ----------------------------------------- *
   * @function onFlashSaleModalRefresh
   * @summary Flash Sale弹窗点击「刷新」：刷新当前列表，并广播通知
   * 其他页面（PDP/Cart/Checkout）回到前台时静默刷新
   * ----------------------------------------- *
   */
  const onFlashSaleModalRefresh = useCallback(() => {
    // 广播：其他 3 个页面重新获得焦点时各自静默刷新一次
    notifyFlashSaleEndedRefreshed();
    // 本页立即刷新，并标记本页已消费本次广播（返回本页时不重复刷新）
    markFlashSaleSilentRefreshed(flashSalePageKeyRef.current);
    onRefreshPLP();
  }, [onRefreshPLP]);

  /**
   * ----------------------------------------- *
   * @dependency [onRefreshPLP]
   * @summary 回到列表页时，若其他页面的闪购结束弹框点击过「刷新」，
   * 则复用下拉刷新路径（onRefreshPLP）重新拉取一次列表数据
   * ----------------------------------------- *
   */
  useFocusEffect(
    useCallback(() => {
      // 每次回到列表页都刷新购物车数量映射表，使卡片上的步进器无痕同步
      // web 端（或其它端）加购后的最新数量。目录整表重载（onRefreshPLP 会
      // 清屏+转圈）仅在闪购结束广播时触发，避免每次聚焦都打断浏览。
      warmProductCartItemMap();
      if (shouldSilentRefreshFlashSale(flashSalePageKeyRef.current)) {
        markFlashSaleSilentRefreshed(flashSalePageKeyRef.current);
        onRefreshPLP();
      }
    }, [onRefreshPLP]),
  );

  // 开始 plpInit trace
  const startProductListInitTrace = async () => {
    productListTraceRef.current = await startPerfTrace('productListPageInit');
    productListTraceRef.current.startTime = Date.now();
  };
  // 结束 plpInit trace
  const stopProductListInitTrace = async () => {
    if (productListTraceRef.current) {
      const duration = Date.now() - productListTraceRef.current.startTime;
      productListTraceRef.current.putMetric('duration_ms', duration);
      productListTraceRef.current.putAttribute('type', type || '');
      productListTraceRef.current.putAttribute(
        'category_name',
        categoryName || '',
      );
      productListTraceRef.current.putAttribute(
        'category_id',
        categoryId?.toString() || '',
      );
      productListTraceRef.current.putAttribute('search_name', search || '');
      productListTraceRef.current.putAttribute('status', 'success');
      productListTraceRef.current.stop();
      productListTraceRef.current = null;
    }
  };

  // zero-result pages have nothing to filter or sort on —
  // disable both entries (needs BOTH empty: with facets
  // present the user can still adjust filters to find items)
  const disableFilterSort =
    (dataFilter?.data?.products?.aggregations ?? []).length === 0 &&
    (products ?? []).length === 0;

  return (
    <Views
      t={t}
      products={products}
      totalCount={totalCount}
      disableFilterSort={disableFilterSort}
      onLoadMore={onLoadMore}
      loading={
        loading ||
        loadingResolver ||
        (currentPage === 1 && products.length === 0 && loadingPLP)
      }
      loadingMore={loadingMore}
      noMoreData={noMoreData}
      categoryId={variables?.categoryId || (type === CATEGORY && categoryId)}
      attributeId={variables?.attribute_id || (type === BRAND && id)}
      categoryName={variables?.categoryName}
      onNavigateToProductDetail={onNavigateToProductDetail}
      bannerImage={bannerImage}
      title={title}
      onPressCart={onPressCart}
      dataFilter={dataFilter?.data?.products?.aggregations}
      quickFilterSettings={dataBootstrap?.data?.guidQuickFilterSettings}
      categoryFacet={dataBootstrap?.data?.guidCategoryFacet}
      appliedFilters={appliedFilters}
      onPressVisibleFilter={openFilter}
      onPressCloseFilter={closeFilter}
      onPressVisibleSort={setVisibleSort}
      visibleFilter={visibleFilter}
      visibleSort={visibleSort}
      filters={filters}
      onToggleOption={toggleOption}
      onSetFilterValues={setFilterValues}
      applyItemCount={draftFilterCount}
      onApplyFilter={onApplyFilter}
      onClearFilter={clearDraftFilters}
      imageErrors={imageErrors}
      setImageErrors={setImageErrors}
      selectedSort={selectedSort}
      onSelectSort={onSelectSort}
      isErrorCategory={isErrorCategory}
      search={search}
      isSearch={isSearch}
      selectedSortLabel={selectedSortLabel}
      sortOptions={sortOptions}
      appliedFilterCount={appliedFilterCount}
      appliedFilterChips={appliedFilterChips}
      onRemoveAppliedFilter={removeAppliedFilter}
      onToggleAppliedFilter={toggleAppliedFilter}
      onClearAppliedFilters={clearAppliedFilters}
      showFlashSaleEndedModal={showFlashSaleEndedModal}
      onCloseFlashSaleEndedModal={onCloseFlashSaleEndedModal}
      onFlashSaleModalRefresh={onFlashSaleModalRefresh}
      onRefreshPLP={onRefreshPLP}
      categoryAppContent={categoryAppContent}
    />
  );
};

export default ProductList;
