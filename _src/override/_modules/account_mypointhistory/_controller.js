import {useCallback, useEffect, useRef, useState} from 'react';

import {useReactiveVar, useLazyQuery} from '@apollo/client';
import {modules} from '@root/swift.config';

import {useTranslation} from 'react-i18next';

import {GET_CMS_PAGE} from '@app/_modules/cms_page/services/schema';
import useCustomQuery from '@app/hooks/useCustomQuery';
import {rxUserToken} from '@app/services/cache';
import {
  GET_BALANCE_POINT,
  GET_POINT_RECORDS,
} from '@app/services/queries/points';
import {GET_LOYALTY_CARD_DATA} from '@app/services/queries/user';

const PAGE_SIZE = 20;
const POINT_STATUS = {
  all: null,
  earning: 'VALID',
  redemption: 'USED',
  expiration: 'EXPIRE',
};
const POINT_RECORD_TYPE = {
  earning: 'SEND',
  redemption: 'DEDUCT',
};

const DEFAULT_QUERY_VARS = {
  page: 0,
  pageSize: PAGE_SIZE,
};

const useMyPointHistory = () => {
  if (!modules.account_mypointhistory.enable) {
    return {disabled: true};
  }

  const userToken = useReactiveVar(rxUserToken);
  if (!userToken) {
    return {isGuest: true};
  }

  const {t} = useTranslation();

  const [loadedTabs, setLoadedTabs] = useState(['all']);
  const [activedTab, setActivedTab] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const [loadingStates, setLoadingStates] = useState({
    all: false,
    earning: false,
    redemption: false,
    expiration: false,
  });

  const [pointRecords, setPointRecords] = useState({
    all: [],
    earning: [],
    redemption: [],
    expiration: [],
  });

  const [hasMore, setHasMore] = useState({
    all: true,
    earning: true,
    redemption: true,
    expiration: true,
  });

  const [modalVisible, setModalVisible] = useState(false);

  const queryVariablesRef = useRef({
    all: {...DEFAULT_QUERY_VARS},
    earning: {...DEFAULT_QUERY_VARS, status: POINT_STATUS.earning, recordType: POINT_RECORD_TYPE.earning},
    redemption: {...DEFAULT_QUERY_VARS, status: POINT_STATUS.redemption, recordType: POINT_RECORD_TYPE.redemption},
    expiration: {...DEFAULT_QUERY_VARS, status: POINT_STATUS.expiration},
  });

  const flatListRefs = useRef({
    all: null,
    earning: null,
    redemption: null,
    expiration: null,
  });

  const activedTabRef = useRef('all');

  const {data: point, loading: pointsLoading} = useCustomQuery({
    schema: GET_BALANCE_POINT,
    useInitData: true,
    opts: {fetchPolicy: 'network-only'},
  });
  const balancePoint = point?.data?.getBalancePoint?.data?.point;
  const expiringPoint = point?.data?.getExpiringPoints?.data?.expiringPoint;
  const expiringTime = point?.data?.getExpiringPoints?.data?.expiringTime;

  const [getPointRecords] = useLazyQuery(GET_POINT_RECORDS, {
    variables: {input: DEFAULT_QUERY_VARS},
    fetchPolicy: 'cache-and-network',
  });

  const {data: loyaltyCardData} = useCustomQuery({
    schema: GET_LOYALTY_CARD_DATA,
    useInitData: true,
    opts: {fetchPolicy: 'network-only'},
  });
  const cmsHomepageIdentifier =
    loyaltyCardData?.data?.storeConfig?.cms_homepage_identifer;

  const {
    data: cmsPageData,
    loading: cmsPageLoading,
    error: cmsPageError,
    onRefetchData: refetchCmsPage,
  } = useCustomQuery({
    schema: GET_CMS_PAGE,
    useInitData: false,
    variables: {identifier: cmsHomepageIdentifier},
    opts: {context: {method: 'POST'}},
  });
  const cmsPageTitle = cmsPageData?.data?.cmsPage?.title || 'About Your Points';
  const cmsPageContent = cmsPageData?.data?.cmsPage?.content || '';

  const doFetch = useCallback(
    async (tab, input, paramsOpt = {}) => {
      if (tab !== activedTabRef.current) {
        return;
      }

      setLoadingStates(prev => ({...prev, [tab]: true}));

      try {
        queryVariablesRef.current[tab] = input;

        const res = await getPointRecords({
          variables: {
            input,
          },
          ...paramsOpt,
        });

        if (tab !== activedTabRef.current) {
          return;
        }

        if (res?.data?.getPointRecords?.data) {
          const {items, totalCount: total} = res.data.getPointRecords.data;

          setPointRecords(prev => ({
            ...prev,
            [tab]: input.page === 0 ? items : [...prev[tab], ...items],
          }));

          setHasMore(prev => ({
            ...prev,
            [tab]: (input.page + 1) * PAGE_SIZE < total,
          }));
        } else {
          if (input.page === 0) {
            setPointRecords(prev => ({...prev, [tab]: []}));
          }
          setHasMore(prev => ({...prev, [tab]: false}));
        }
      } catch (error) {
        if (tab === activedTabRef.current) {
          console.log(`[${tab}] Fetch error:`, error);
          setPointRecords(prev => ({...prev, [tab]: []}));
          setHasMore(prev => ({...prev, [tab]: false}));
        }
      } finally {
        if (tab === activedTabRef.current) {
          setLoadingStates(prev => ({...prev, [tab]: false}));
        }
      }
    },
    [getPointRecords],
  );

  const onRefresh = useCallback(
    async tab => {
      if (tab !== activedTabRef.current) {
        return;
      }
      if (refreshing) {
        return;
      }
      setRefreshing(true);

      setHasMore(prev => ({...prev, [tab]: true}));

      await doFetch(
        tab,
        {...queryVariablesRef.current[tab], page: 0},
        {fetchPolicy: 'network-only'},
      );

      setRefreshing(false);
    },
    [refreshing, doFetch],
  );

  const onLoadMore = useCallback(
    async tab => {
      if (tab !== activedTabRef.current) {
        return;
      }

      if (loadingStates[tab] || !hasMore[tab] || refreshing) {
        return;
      }

      const nextPage = queryVariablesRef.current[tab].page + 1;
      const newQueryVars = {
        ...queryVariablesRef.current[tab],
        page: nextPage,
      };

      await doFetch(tab, newQueryVars);
    },
    [loadingStates, hasMore, refreshing, doFetch],
  );

  const onTabChange = useCallback(
    async tab => {
      if (tab === activedTabRef.current) {
        return;
      }

      activedTabRef.current = tab;
      setActivedTab(tab);

      if (flatListRefs.current[tab]) {
        try {
          flatListRefs.current[tab].scrollToOffset({
            offset: 0,
            animated: false,
          });
        } catch (error) {
          console.log('Scroll to top error:', error);
        }
      }

      if (!loadedTabs.includes(tab)) {
        setLoadedTabs(prev => [...prev, tab]);
        await doFetch(tab, queryVariablesRef.current[tab]);
      }
    },
    [pointRecords, doFetch],
  );

  useEffect(() => {
    doFetch('all', queryVariablesRef.current.all);
  }, []);

  useEffect(() => {
    if (!modalVisible || !cmsHomepageIdentifier) {
      return;
    }

    refetchCmsPage({
      params: {identifier: cmsHomepageIdentifier},
      paramsOpt: {isReturn: false},
    });
  }, [modalVisible, cmsHomepageIdentifier]);

  return {
    t,
    pointRecords,
    loadingStates,
    refreshing,
    hasMore,
    activedTab,
    pointsLoading,
    balancePoint,
    expiringPoint,
    expiringTime,
    modalVisible,
    cmsPageTitle,
    cmsPageLoading,
    cmsPageError,
    cmsPageContent,
    flatListRefs,
    onRefresh,
    onTabChange,
    onLoadMore,
    setModalVisible,
  };
};

export default useMyPointHistory;
