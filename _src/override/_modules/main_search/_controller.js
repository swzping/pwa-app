import React, {useEffect, useMemo, useState} from 'react';

import {useNavigation} from '@react-navigation/native';

import {useReactiveVar} from '@apollo/client';
import {adFetcher, tracker} from '@onlinesales-ai/osmos-react-native-sdk';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {modules} from '@root/swift.config';

import Views from '@app/_modules/main_search/_view';
import {
  CLEAR_RECENT_SEARCHES,
  GET_AUTOCOMPLETE_RESULT,
  GET_HOT_KEYWORDS,
  GET_RECENT_SEARCHES,
  GET_TOP_BRANDS,
} from '@app/_modules/main_search/services/schema';
// import AnalyticsHelper, {EVENT_TOKEN} from '@app/helpers/Analytics';
import {BRAND, SEARCH} from '@app/helpers/Constants';
import {pushTo} from '@app/helpers/Navigation';
import {getCliUbid, handleOsmosAdPress, normalizeOsmosClick} from '@app/helpers/Osmos';
import {startPerfTrace} from '@app/helpers/perf';
import useCustomMutation from '@app/hooks/useCustomMutation';
import useCustomQuery from '@app/hooks/useCustomQuery';
import {rxUserInformation} from '@app/services/cache';
import {GET_COMMON_CMS_BLOCKS} from '@app/services/queries/cms';
import {trackSearchClick} from '@app/track';

// let delayTimer;
const RECENT_SEARCH_KEY = 'RECENT_SEARCH_HISTORY';
const MAX_RECENT_SEARCHES = 12;
const HOT_KEYWORD_AD_UNIT = 'GUIDAppHotKeyword';
const HOT_KEYWORD_PAGE_TYPE = 'GUIDAppSearch';
const HOT_KEYWORD_CUSTOM_PARAM_1 = 'GUID';

const MainSearch = props => {
  /**
   * ---------------------------------------------------- *
   * @constant {hooks}
   * ---------------------------------------------------- *
   */
  const [loading, setLoading] = useState(false);
  // keyword echoed from the PLP search bar (route param) prefills
  // the input; no auto-search — the user edits and re-submits
  const [searchText, setSearchText] = useState(
    props?.route?.params?.searchKeyword || '',
  );
  const [message, setMessage] = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [hotKeywords, setHotKeywords] = useState([]);
  const [hotKeywordAds, setHotKeywordAds] = useState([]);
  const [topBrands, setTopBrands] = useState([]);
  const [trendingProductsCms, setTrendingProductsCms] = useState(null);

  const {
    data,
    onRefetchData,
    loading: searchLoading,
  } = useCustomQuery({
    schema: GET_AUTOCOMPLETE_RESULT,
  });

  const {
    data: recentSearchesData,
    // loading: recentSearchesLoading,
    onRefetchData: refetchRecentSearches,
  } = useCustomQuery({
    schema: GET_RECENT_SEARCHES,
    useInitData: true,
    variables: {
      limit: 15,
    },
    opts: {
      fetchPolicy: 'network-only',
    },
  });

  const {data: hotKeywordsData, // loading: hotKeywordsLoading
  } = useCustomQuery({
    schema: GET_HOT_KEYWORDS,
    useInitData: true,
    variables: {
      limit: 15,
    },
    opts: {
      fetchPolicy: 'cache-first',
    },
  });

  const {data: topBrandsData, // loading: topBrandsLoading
  } = useCustomQuery({
    schema: GET_TOP_BRANDS,
    useInitData: true,
    variables: {
      limit: 10,
    },
    opts: {
      fetchPolicy: 'cache-first',
    },
  });

  const {data: trendingProductsCmsData, // loading: trendingProductsCmsLoading
  } = useCustomQuery({
      schema: GET_COMMON_CMS_BLOCKS,
      useInitData: true,
      variables: {
        identifier: 'product_trending_search_enhancements',
      },
      opts: {
        fetchPolicy: 'cache-first',
      },
    });

  const {onRefetchData: clearRecentSearchesMutation} = useCustomMutation({
    schema: CLEAR_RECENT_SEARCHES,
  });

  const searchPlaceholder = props?.route?.params?.searchPlaceholder;
  const navigation = useNavigation();
  const userInformation = useReactiveVar(rxUserInformation);

  // 监听页面焦点，返回时清空搜索文本并重新加载搜索历史
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      setSearchText('');
      setMessage(null);
      setCategories([]);
      setProducts([]);
      // 重新获取最近搜索数据
      if (refetchRecentSearches) {
        refetchRecentSearches({
          params: {
            limit: 15,
          },
        });
      }
    });

    return unsubscribe;
  }, [navigation, refetchRecentSearches]);

  // 从接口加载搜索历史
  useEffect(() => {
    if (recentSearchesData?.data?.searchBlockEnhancement?.recent_searches) {
      const searches =
        recentSearchesData.data.searchBlockEnhancement.recent_searches.map(
          item => item.keyword,
        );
      setRecentSearches(searches);
    }
  }, [recentSearchesData]);

  // 从接口加载热词
  useEffect(() => {
    if (hotKeywordsData?.data?.searchBlockEnhancement?.hotKeywords) {
      const keywords = hotKeywordsData.data.searchBlockEnhancement.hotKeywords
        .map(item => ({
          ...item,
          query_text: item?.query_text || item?.label,
          isFromAd: false,
        }))
        .filter(item => !!item?.query_text);
      setHotKeywords(keywords);
    }
  }, [hotKeywordsData]);

  useEffect(() => {
    let isCancelled = false;

    const normalizeHotKeywordAd = item => {
      const elements = item?.elements || {};
      const click = normalizeOsmosClick(elements, item);

      return {
        query_text: elements?.keyword || '',
        redirect_url: click.link,
        clickType: click.clickType,
        clickValue: click.clickValue,
        uclid: item?.uclid,
        isFromAd: true,
      };
    };

    const fetchHotKeywordAds = async () => {
      try {
        const cliUbid = await getCliUbid(userInformation);
        const result = await adFetcher.fetchDisplayAdsWithAu({
          cliUbid,
          pageType: HOT_KEYWORD_PAGE_TYPE,
          adUnit: HOT_KEYWORD_AD_UNIT,
          customLabel1: HOT_KEYWORD_CUSTOM_PARAM_1,
          productCount: 10,
        });

        const rawAds = Array.isArray(result)
          ? result
          : result?.ads?.[HOT_KEYWORD_AD_UNIT] ||
            (result?.ads &&
              Object.values(result.ads).find(value => Array.isArray(value))) ||
            [];

        const seenUclids = new Set();
        const mappedAds = rawAds
          .map(normalizeHotKeywordAd)
          .filter(item => !!item?.query_text)
          .filter(item => {
            if (!item?.uclid) {
              return true;
            }

            if (seenUclids.has(item.uclid)) {
              return false;
            }

            seenUclids.add(item.uclid);
            return true;
          });

        mappedAds.forEach((item, index) => {
          if (!item?.uclid) {
            return;
          }

          tracker
            .registerAdImpressionEvent({
              cliUbid,
              customLabel1: HOT_KEYWORD_CUSTOM_PARAM_1,
              uclid: item.uclid,
            })
            .catch(() => {});
        });

        if (!isCancelled) {
          setHotKeywordAds(mappedAds);
        }
      } catch (error) {
        if (!isCancelled) {
          setHotKeywordAds([]);
        }
      }
    };

    fetchHotKeywordAds();

    return () => {
      isCancelled = true;
    };
  }, [userInformation]);

  // 从接口加载品牌数据
  useEffect(() => {
    if (topBrandsData?.data?.searchBlockEnhancement?.topBrands) {
      const brands = topBrandsData.data.searchBlockEnhancement.topBrands;
      setTopBrands(brands);
    }
  }, [topBrandsData]);

  // 加载 Trending Products CMS 数据
  useEffect(() => {
    if (trendingProductsCmsData?.data?.cmsBlockAppContent?.block_json_content) {
      const jsonContent =
        trendingProductsCmsData.data.cmsBlockAppContent.block_json_content;
      setTrendingProductsCms(jsonContent);
    }
  }, [trendingProductsCmsData]);

  useEffect(() => {
    setLoading(searchLoading);
  }, [searchLoading]);

  useEffect(() => {
    if (data?.data && data?.data?.products) {
      const productsData = data?.data?.products;
      const aggregations = productsData.aggregations;
      if (productsData?.total_count > 0) {
        setTotalCount(productsData?.total_count);
      } else {
        setMessage('No result were found');
      }
      setProducts(productsData?.items);

      const categoriesData = aggregations.filter(
        item => item.attribute_code === 'category_uid',
      );
      if (categoriesData[0]?.options) {
        let categoryLimitList = [];
        const options = categoriesData[0]?.options ?? [];
        const categoryLimit = modules.main_search.config.show_category_limit;

        if (options.length > categoryLimit) {
          for (let i = 0; i < categoryLimit; i++) {
            categoryLimitList.push(options[i]);
          }
        } else {
          categoryLimitList = options;
        }

        setCategories(categoryLimitList);
      } else {
        setCategories([]);
      }
      setLoading(false);
    }
  }, [data]);

  /**
   * ---------------------------------------------------- *
   * @function onSearchChange
   * @summary on search change text change
   * ---------------------------------------------------- *
   */
  const onSearchTextChange = text => {
    setSearchText(text);
    // 注释掉输入时调用接口的逻辑
    // if (text === '') {
    //   clearTimeout(delayTimer);
    //   setMessage('Search for a product');
    //   setLoading(false);
    // } else {
    //   // 去掉最少3个字符的限制
    //   // if (text.length < 3) {
    //   //   clearTimeout(delayTimer);
    //   //   setMessage('Search term must be at least three characters');
    //   // } else {
    //     console.log('Search text changed:', text);
    //     AnalyticsHelper.trackAdjustEvent(EVENT_TOKEN.SEARCH_BAR);
    //     clearTimeout(delayTimer);
    //     setCategories([]);
    //     setProducts([]);
    //     setMessage(null);
    //     delayTimer = setTimeout(() => onPostSearch(text), 250);
    //   // }
    // }
  };

  /**
   * ---------------------------------------------------- *
   * @function onPostSearch
   * @summary on search change text change
   * ---------------------------------------------------- *
   */
  // eslint-disable-next-line no-unused-vars
  const onPostSearch = async text => {
    await onRefetchData({
      params: {
        search: text,
      },
    });
  };

  /**
   * ---------------------------------------------------- *
   * @function loadRecentSearches
   * @summary 加载搜索历史
   * ---------------------------------------------------- *
   */
  // eslint-disable-next-line no-unused-vars
  const loadRecentSearches = async () => {
    try {
      const history = await AsyncStorage.getItem(RECENT_SEARCH_KEY);
      if (history) {
        setRecentSearches(JSON.parse(history));
      }
    } catch (error) {
      // Error loading recent searches
    }
  };

  /**
   * ---------------------------------------------------- *
   * @function saveRecentSearch
   * @summary 保存搜索历史
   * ---------------------------------------------------- *
   */
  // eslint-disable-next-line no-unused-vars
  const saveRecentSearch = async searchTerm => {
    try {
      const history = await AsyncStorage.getItem(RECENT_SEARCH_KEY);
      let searches = history ? JSON.parse(history) : [];

      // 移除重复项
      searches = searches.filter(item => item !== searchTerm);

      // 添加到开头
      searches.unshift(searchTerm);

      // 限制数量
      if (searches.length > MAX_RECENT_SEARCHES) {
        searches = searches.slice(0, MAX_RECENT_SEARCHES);
      }

      await AsyncStorage.setItem(RECENT_SEARCH_KEY, JSON.stringify(searches));
      setRecentSearches(searches);
    } catch (error) {
      // Error saving recent search
    }
  };

  /**
   * ---------------------------------------------------- *
   * @function clearRecentSearches
   * @summary 清空搜索历史（调用接口后隐藏模块）
   * ---------------------------------------------------- *
   */
  const clearRecentSearches = async () => {
    try {
      // 清空本地状态，RecentSearch 组件会自动隐藏
      setRecentSearches([]);
      // 调用后端 API 清空搜索历史
      await clearRecentSearchesMutation({
        params: null,
      });
    } catch (error) {
      // Error clearing recent searches
    }
  };

  /**
   * ---------------------------------------------------- *
   * @function onPressRecentSearch
   * @summary 点击搜索历史项
   * ---------------------------------------------------- *
   */
  const onPressRecentSearch = searchTerm => {
    setSearchText(searchTerm);
    performSearch(searchTerm);
  };

  /**
   * ---------------------------------------------------- *
   * @function onPressHotKeyword
   * @summary 点击热门关键词
   * ---------------------------------------------------- *
   */
  const combinedHotKeywords = useMemo(() => {
    const seenKeywords = new Set();
    const normalizeKeyword = keyword =>
      `${keyword || ''}`.trim().toLowerCase();

    const ads = hotKeywordAds
      .filter(item => {
        const key = normalizeKeyword(item?.query_text);
        if (!key || seenKeywords.has(key)) {
          return false;
        }
        seenKeywords.add(key);
        return true;
      })
      .map(item => ({...item, isFromAd: true}));

    const organicKeywords = hotKeywords
      .filter(item => {
        const key = normalizeKeyword(item?.query_text || item?.label);
        if (!key || seenKeywords.has(key)) {
          return false;
        }
        seenKeywords.add(key);
        return true;
      })
      .map(item => ({...item, isFromAd: false}));

    return [...ads, ...organicKeywords];
  }, [hotKeywordAds, hotKeywords]);

  const onPressHotKeyword = async item => {
    const keyword =
      typeof item === 'string' ? item : item?.query_text || item?.label;

    if (item?.isFromAd) {
      const clickValue = item?.clickValue || item?.redirect_url;
      const clickType = item?.clickType;
      const isUrlType = !clickType || clickType === 'URL';

      if (clickValue || (clickType && !isUrlType)) {
        await handleOsmosAdPress({
          link: item?.redirect_url,
          clickType,
          clickValue,
          uclid: item?.uclid,
          userInformation,
        });
        return;
      }

      if (item?.uclid) {
        const cliUbid = await getCliUbid(userInformation);
        tracker
          .registerAdClickEvent({
            cliUbid,
            customLabel1: HOT_KEYWORD_CUSTOM_PARAM_1,
            uclid: item.uclid,
          })
          .catch(() => {});
      }
    }

    setSearchText(keyword);
    performSearch(keyword);
  };

  /**
   * ---------------------------------------------------- *
   * @function onPressBrand
   * @summary 点击品牌
   * ---------------------------------------------------- *
   */
  const onPressBrand = brand => {
    const categoryUrl = brand?.brand_url || brand?.category_url;
    if (!categoryUrl) {
      return;
    }

    pushTo(navigation, modules.product_list.enable, modules.product_list.name, {
      type: BRAND,
      category_url: categoryUrl,
      categoryName: brand?.label || brand?.name,
    });
  };

  /**
   * ---------------------------------------------------- *
   * @function onShowMoreKeywords
   * @summary 显示更多热门关键词
   * ---------------------------------------------------- *
   */
  const onShowMoreKeywords = () => {
    // 可以打开一个模态框显示所有热门关键词
    console.log('Show more keywords');
  };

  /**
   * ---------------------------------------------------- *
   * @function performSearch
   * @summary 执行搜索
   * ---------------------------------------------------- *
   */
  const performSearch = searchTerm => {
    if (!searchTerm || searchTerm.trim() === '') {
      return;
    }

    // 注释掉本地保存，因为后端会自动记录搜索历史
    // saveRecentSearch(searchTerm.trim());

    // 导航到搜索结果页
    pushTo(navigation, modules.product_list.enable, modules.product_list.name, {
      search: searchTerm.trim(),
      type: SEARCH,
      categoryName: null,
      categoryId: null,
    });
  };

  const onPressSearch = async () => {
    // 开始搜索 trace
    const searchTrace = await startPerfTrace('search');
    const searchStartTime = Date.now();
    performSearch(searchText);

    try {
      // 搜索成功
      const duration = Date.now() - searchStartTime;
      searchTrace.putAttribute('search_text', searchText);
      searchTrace.putMetric('duration_ms', duration);
      searchTrace.putAttribute('status', 'success');
      searchTrace.stop();
    } catch (error) {
      // 搜索失败
      const duration = Date.now() - searchStartTime;
      searchTrace.putMetric('duration_ms', duration);
      searchTrace.putAttribute('status', 'error');
      searchTrace.stop();
    }

    trackSearchClick({search_keyword: searchText});
  };

  /**
   * ---------------------------------------------------- *
   * @constant controllerProps
   * @return {object}
   * ---------------------------------------------------- *
   */
  const controllerProps = {
    loading,
    searchText,
    message,
    totalCount,
    categories,
    products,
    recentSearches,
    hotKeywords: combinedHotKeywords,
    topBrands,
    trendingProductsCms,
    setSearchText,
    onSearchTextChange,
    onPressSearch,
    onPressRecentSearch,
    onPressHotKeyword,
    onPressBrand,
    onShowMoreKeywords,
    clearRecentSearches,
    searchPlaceholder,
  };

  return <Views {...props} {...controllerProps} />;
};

export default MainSearch;
