import React, {useEffect, useState, useRef, useCallback} from 'react';
import {Linking} from 'react-native';
import {STORE_LOCATION} from '@app/_modules/store_locator/services/schema';
import {IS_IOS} from '@app/helpers/Constants';
import {modules} from '@root/swift.config';
import {useTranslation} from 'react-i18next';
import Views from '@app/_modules/store_locator/_view';
import Geolocation from '@react-native-community/geolocation';
import useCustomQuery from '@app/hooks/useCustomQuery';
import {startPerfTrace} from '@app/helpers/perf';

const StoreLocator = () => {
  if (!modules.store_locator.enable) {
    return null;
  }

  /**
   * ---------------------------------------------------- *
   * @var hooks
   * ---------------------------------------------------- *
   */
  const {t} = useTranslation();
  const [location, setLocation] = useState({
    longitude: 106.841036,
    latitude: -6.173292,
  });
  const [search, setSearch] = useState('');
  const [dataFilter, setDataFilter] = useState([]);
  const [listStore, setListStore] = useState([]);
  const [listVisible, setListVisible] = useState(false);
  const debounceTimerRef = useRef(null);
  const drugstoreTraceRef = useRef(null);
  const {data, loading} = useCustomQuery({
    schema: STORE_LOCATION,
    useInitData: true,
  });

  useEffect(() => {
    Geolocation.getCurrentPosition(
      async info => {
        const {longitude, latitude} = info.coords;
        setLocation({longitude, latitude});
      },
      async () => {},
      !IS_IOS
        ? {}
        : {enableHighAccuracy: true, timeout: 20000, maximumAge: 3600000},
    );
    startApotekInitTrace();
  }, []);

  // 停止初始化追踪
  useEffect(() => {
     if(data?.length || !loading){
      stopApotekInitTrace();
     }
     return () => {
       if(drugstoreTraceRef.current){
        drugstoreTraceRef.current.stop();
        drugstoreTraceRef.current = null;
       }
     };
    }, [data, loading]);

  /**
   * ---------------------------------------------------- *
   * @function normalizeQuery
   * @param {String} query
   * @summary 标准化查询：小写、trim、合并多个空格
   * ---------------------------------------------------- *
   */
  const normalizeQuery = useCallback(query => {
    return query.toLowerCase().trim().replace(/\s+/g, ' '); // 合并多个空格为单个空格
  }, []);

  /**
   * ---------------------------------------------------- *
   * @function normalizeField
   * @param {String} fieldValue
   * @summary 标准化字段值：小写、去除所有空格（用于匹配）
   * ---------------------------------------------------- *
   */
  const normalizeField = useCallback(fieldValue => {
    return (fieldValue || '').toLowerCase().replace(/\s+/g, ''); // 去除所有空格
  }, []);

  /**
   * ---------------------------------------------------- *
   * @function tokenizeQuery
   * @param {String} query
   * @summary 将查询分割成词元（tokens）
   * ---------------------------------------------------- *
   */
  const tokenizeQuery = useCallback(
    query => {
      const normalized = normalizeQuery(query);
      return normalized.split(' ').filter(token => token.length > 0);
    },
    [normalizeQuery],
  );

  /**
   * ---------------------------------------------------- *
   * @function searchStores
   * @param {String} query
   * @summary 根据新的搜索逻辑搜索商店
   * ---------------------------------------------------- *
   */
  const searchStores = useCallback(
    query => {
      if (!listStore?.items || listStore.items.length === 0) {
        setDataFilter([]);
        return;
      }

      const normalizedQuery = normalizeQuery(query);

      // 如果查询为空，显示所有数据
      if (normalizedQuery.length === 0) {
        setDataFilter(listStore.items);
        return;
      }

      const tokens = tokenizeQuery(query);
      const fullQuery = normalizedQuery;

      // 用于记录已经匹配的项，避免重复
      const matchedItems = new Set();
      const resultGroups = [];

      // 辅助函数：检查所有词元是否在指定字段中匹配（AND 逻辑 - 所有词元都在该字段中）
      // 匹配时去除字段值中的空格
      const checkFieldMatch = fieldValue => {
        const normalizedField = fieldValue.replace(/\s+/g, ''); // 去除字段值中的空格
        return tokens.every(token => {
          const normalizedToken = token.replace(/\s+/g, ''); // 去除词元中的空格
          return normalizedField.includes(normalizedToken);
        });
      };

      // 辅助函数：检查所有词元是否在任意字段中匹配（AND 逻辑 - 每个词元在任意字段中）
      // 匹配时去除字段值中的空格
      const checkAllTokensMatch = item => {
        const storeName = normalizeField(item.store_name || '');
        const address = normalizeField(item.address || '');
        const city = normalizeField(item.city || '');
        const zipcode = normalizeField(item.zipcode || '');

        // 每个词元都要在至少一个字段中匹配（去除空格后）
        return tokens.every(token => {
          const normalizedToken = token.replace(/\s+/g, ''); // 去除词元中的空格
          return (
            storeName.includes(normalizedToken) ||
            address.includes(normalizedToken) ||
            city.includes(normalizedToken) ||
            (zipcode && zipcode.includes(normalizedToken))
          );
        });
      };

      // 辅助函数：检查精确短语匹配（去除空格后）
      const checkExactPhrase = fieldValue => {
        const normalizedField = fieldValue.replace(/\s+/g, ''); // 去除字段值中的空格
        const normalizedFullQuery = fullQuery.replace(/\s+/g, ''); // 去除查询中的空格
        return normalizedField.includes(normalizedFullQuery);
      };

      // 辅助函数：计算字段中的标记数量（去除空格后）
      const countTokensInField = fieldValue => {
        const normalizedField = fieldValue.replace(/\s+/g, ''); // 去除字段值中的空格
        return tokens.filter(token => {
          const normalizedToken = token.replace(/\s+/g, ''); // 去除词元中的空格
          return normalizedField.includes(normalizedToken);
        }).length;
      };

      // 辅助函数：排序单个组内的项（权重越高越靠前）
      const sortGroup = items => {
        return items.sort((a, b) => {
          // b. 精确短语匹配：精确短语匹配的排名高于仅匹配词元的结果
          // 如果 b 有精确短语匹配而 a 没有，b 排在前面（权重更高）
          if (a.exactPhraseMatch !== b.exactPhraseMatch) {
            return b.exactPhraseMatch ? 1 : -1;
          }

          // c. 标记数量：在同一字段中找到更多标记（词元）的排名更高
          // 如果 b 的标记数量更多，b 排在前面（权重更高）
          if (b.tokenCount !== a.tokenCount) {
            return b.tokenCount - a.tokenCount;
          }

          // d. 决胜条件：最终按店铺名称字母顺序（升序）
          return a.storeName.localeCompare(b.storeName);
        });
      };

      // 第一次遍历：Store_name 字段匹配（所有词元都在 Store_name 中）
      const storeNameMatches = [];
      listStore.items.forEach(item => {
        // 先检查是否所有词元都能匹配（任意字段）
        if (!checkAllTokensMatch(item)) {
          return; // 不匹配，跳过
        }

        const storeName = normalizeField(item.store_name || '');
        // 检查是否所有词元都在 Store_name 字段中
        if (checkFieldMatch(storeName)) {
          matchedItems.add(item);
          storeNameMatches.push({
            item,
            exactPhraseMatch: checkExactPhrase(storeName),
            tokenCount: countTokensInField(storeName),
            storeName: normalizeQuery(item.store_name || ''), // 用于显示和排序，保留空格
          });
        }
      });
      if (storeNameMatches.length > 0) {
        resultGroups.push(...sortGroup(storeNameMatches));
      }

      // 第二次遍历：Address 字段匹配（排除已在 Store_name 中匹配的，所有词元都在 Address 中）
      const addressMatches = [];
      listStore.items.forEach(item => {
        if (matchedItems.has(item)) {
          return;
        } // 跳过已匹配的

        // 先检查是否所有词元都能匹配（任意字段）
        if (!checkAllTokensMatch(item)) {
          return; // 不匹配，跳过
        }

        const address = normalizeField(item.address || '');
        // 检查是否所有词元都在 Address 字段中
        if (checkFieldMatch(address)) {
          matchedItems.add(item);
          addressMatches.push({
            item,
            exactPhraseMatch: checkExactPhrase(address),
            tokenCount: countTokensInField(address),
            storeName: normalizeQuery(item.store_name || ''), // 用于显示和排序，保留空格
          });
        }
      });
      if (addressMatches.length > 0) {
        resultGroups.push(...sortGroup(addressMatches));
      }

      // 第三次遍历：City 字段匹配（排除已在前面字段中匹配的，所有词元都在 City 中）
      const cityMatches = [];
      listStore.items.forEach(item => {
        if (matchedItems.has(item)) {
          return;
        } // 跳过已匹配的

        // 先检查是否所有词元都能匹配（任意字段）
        if (!checkAllTokensMatch(item)) {
          return; // 不匹配，跳过
        }

        const city = normalizeField(item.city || '');
        // 检查是否所有词元都在 City 字段中
        if (checkFieldMatch(city)) {
          matchedItems.add(item);
          cityMatches.push({
            item,
            exactPhraseMatch: checkExactPhrase(city),
            tokenCount: countTokensInField(city),
            storeName: normalizeQuery(item.store_name || ''), // 用于显示和排序，保留空格
          });
        }
      });
      if (cityMatches.length > 0) {
        resultGroups.push(...sortGroup(cityMatches));
      }

      // 第四次遍历：Postal_code 字段匹配（排除已在前面字段中匹配的，所有词元都在 Postal_code 中）
      const zipcodeMatches = [];
      listStore.items.forEach(item => {
        if (matchedItems.has(item)) {
          return;
        } // 跳过已匹配的

        // 先检查是否所有词元都能匹配（任意字段）
        if (!checkAllTokensMatch(item)) {
          return; // 不匹配，跳过
        }

        const zipcode = normalizeField(item.zipcode || '');
        // 检查是否所有词元都在 Postal_code 字段中
        if (zipcode && checkFieldMatch(zipcode)) {
          matchedItems.add(item);
          zipcodeMatches.push({
            item,
            exactPhraseMatch: checkExactPhrase(zipcode),
            tokenCount: countTokensInField(zipcode),
            storeName: normalizeQuery(item.store_name || ''), // 用于显示和排序，保留空格
          });
        }
      });
      if (zipcodeMatches.length > 0) {
        resultGroups.push(...sortGroup(zipcodeMatches));
      }

      // 提取最终的 item 数组
      const finalResults = resultGroups.map(result => result.item);

      setDataFilter(finalResults);
    },
    [listStore, normalizeQuery, tokenizeQuery],
  );

  useEffect(() => {
    if (data.length !== 0) {
      const storeData = data?.data?.storeLocation;
      setListStore(storeData);
      setDataFilter(storeData?.items || []);
    }
  }, [data]);

  /**
   * ---------------------------------------------------- *
   * @function onSearchChangeText
   * @param {String} text
   * @summary 搜索文本变化处理，带防抖功能（300ms）
   * ---------------------------------------------------- *
   */
  const onSearchChangeText = useCallback(
    text => {
      setSearch(text);

      // 清除之前的定时器
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // 如果搜索文本为空，立即显示所有数据
      if (!text || text.trim().length === 0) {
        setDataFilter(listStore?.items || []);
        return;
      }

      // 防抖：300ms 后执行搜索
      debounceTimerRef.current = setTimeout(() => {
        if (listStore?.items) {
          searchStores(text);
        }
      }, 300);
    },
    [listStore, searchStores],
  );

  // 清理定时器
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  /**
   * ---------------------------------------------------- *
   * @function onPressDirection
   * @param {Object} item
   * @summary for event click go to google maps direction
   * ---------------------------------------------------- *
   */
  const onPressDirection = ({item}) => {
    const {longitude, latitude} = item;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${latitude}%20${longitude}`;
    Linking.openURL(url);
  };

  /**
   * ---------------------------------------------------- *
   * @function onPressStore
   * @param {Object} item
   * @summary for event click go to store location
   * ---------------------------------------------------- *
   */
  const onPressStore = ({item}) => {
    const {longitude, latitude} = item;
    setLocation({longitude, latitude});
  };

  /**
   * ---------------------------------------------------- *
   * @function onPressAccordion
   * @param {boolean} expand
   * @summary for event expand list Store
   * ---------------------------------------------------- *
   */
  const onPressAccordion = expand => {
    setListVisible(!expand);
  };

  // 开始 apotekInit trace
  const startApotekInitTrace = async () => {
    drugstoreTraceRef.current = await startPerfTrace('apotekPageInit');
    drugstoreTraceRef.current.startTime = Date.now();
  };
  // 结束 apotekInit trace
  const stopApotekInitTrace = async () => {
    if (drugstoreTraceRef.current){
      const duration = Date.now() - drugstoreTraceRef.current.startTime;
      drugstoreTraceRef.current.putMetric('duration_ms', duration);
      drugstoreTraceRef.current.putAttribute('status', 'success');
      drugstoreTraceRef.current.stop();
      drugstoreTraceRef.current = null;
    }
  };

  return (
    <Views
      t={t}
      loading={loading}
      listVisible={listVisible}
      location={location}
      search={search}
      dataFilter={dataFilter}
      onChangeSearch={onSearchChangeText}
      storeLocation={listStore}
      onPressDirection={onPressDirection}
      onPressAccordion={onPressAccordion}
      onPressStore={onPressStore}
    />
  );
};

export default StoreLocator;
