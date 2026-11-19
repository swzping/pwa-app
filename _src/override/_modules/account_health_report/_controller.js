import React, {useState, useEffect, useCallback} from 'react';
import {useReactiveVar} from '@apollo/client';
import {modules} from '@root/swift.config';
import {useTranslation} from 'react-i18next';
import {rxUserType} from '@app/services/cache';
import {USER_GUEST} from '@app/helpers/Constants';
import Views from '@app/_modules/account_health_report/_view';
import ViewLogin from '@app/_modules/auth_signin/_controller';
import {navigateTo} from '@app/helpers/Navigation';
import useCustomQuery from '@app/hooks/useCustomQuery';
import {GET_HEALTH_CHECKS} from '@app/_modules/account_health_report/services/schema';

const PAGE_SIZE = 8;

export const formatDateTime = value => {
  if (!value) {
    return '-';
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  const dateStr = date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  return dateStr;
};

export const buildMetrics = report => {
  const formatNumber = value => {
    if (value === null || value === undefined || value === '') {
      return '-';
    }
    return value;
  };

  return [
    {
      label: 'Tekanan Darah',
      value: report?.blood_pressure ?? '-',
      unit: 'mmHg',
      icon: 'heart-pulse',
    },
    {
      label: 'Kolesterol',
      value: formatNumber(report?.cholesterol),
      unit: 'mg/dL',
      icon: 'chart-bar',
    },
    {
      label: 'Asam Urat',
      value: formatNumber(report?.uric_acid),
      unit: 'mg/dL',
      icon: 'beaker-plus',
    },
    {
      label: 'Gula Darah',
      value: formatNumber(report?.blood_glucose),
      unit: 'mg/dL',
      icon: 'water-percent',
    },
    {
      label: 'Hemoglobin',
      value: formatNumber(report?.hemoglobin),
      unit: 'mg/dL',
      icon: 'test-tube',
    },
    {
      label: 'TG (Triglyceride)',
      value: formatNumber(report?.triglyceride),
      unit: 'mg/dL',
      icon: 'test-tg',
    },
    {
      label: 'HDL (High-Density Lipoprotein Cholesterol)',
      value: formatNumber(report?.cholesterol_hdl),
      unit: 'mg/dL',
      icon: 'test-hdl',
    },
    {
      label: 'LDL (Low-Density Lipoprotein Cholesterol)',
      value: formatNumber(report?.cholesterol_ldl),
      unit: 'mg/dL',
      icon: 'test-ldl',
    },
  ];
};

export const mapHealthCheckItem = item => {
  const checkDate = formatDateTime(item?.check_date);
  const entityIdNumber = Number.parseInt(item?.entity_id, 10);
  const entityId = Number.isNaN(entityIdNumber) ? null : entityIdNumber;

  const fallbackIdParts = [
    item?.title ?? null,
    item?.check_date ?? null,
    item?.activity ?? null,
  ].filter(Boolean);
  const fallbackId =
    fallbackIdParts.length > 0
      ? fallbackIdParts.join('-')
      : 'health-report';

  return {
    id: item?.entity_id ? String(item.entity_id) : fallbackId,
    entityId,
    title: item?.title ?? '-',
    activity: item?.activity ?? '-',
    checkType: item?.check_type ?? '-',
    time: checkDate,
    isUnread: item?.is_read === 0,
    reportDetail: {
      headerTitle: item?.title ?? '-',
      headerSubtitle: item?.check_type
        ? `Jenis Pemeriksaan-${item.check_type}`
        : '',
      referenceNumber: item?.ref ? `${item.ref}` : '-',
      checkDate,
      personalInfo: {
        name: item?.customer_name ?? '-',
        phoneNumber: item?.phone_number ?? '-',
        gender: item?.gender ?? '-',
        birthday: item?.birthday ?? '-',
      },
      metrics: buildMetrics(item),
      store: item?.store?.store_name ?? '-',
    },
  };
};

const AccountHealthReport = () => {
  if (!modules.account_health_report.enable) {
    return null;
  }

  const userType = useReactiveVar(rxUserType);
  const {t} = useTranslation();
  
  const [healthReports, setHealthReports] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [noMoreData, setNoMoreData] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [queryVariables, setQueryVariables] = useState({
    pageSize: PAGE_SIZE,
    currentPage: 1,
  });

  const {
    data: healthChecksData,
    loading,
    error,
    onRefetchData,
  } = useCustomQuery({
    schema: GET_HEALTH_CHECKS,
    useInitData: true,
    variables: queryVariables,
    opts: {fetchPolicy: 'no-cache', context: {method: 'POST'}},
  });

  useEffect(() => {
    if (__DEV__) {
      console.log('[HealthReport] query variables', queryVariables);
    }
  }, [queryVariables]);

  useEffect(() => {
    if (healthChecksData?.data?.getHealthChecks) {
      const {
        healthchecks,
        total_count = 0,
        total_pages = 0,
        currentPage: responsePage = 1,
      } = healthChecksData.data.getHealthChecks;

      const healthchecksList = Array.isArray(healthchecks)
        ? healthchecks
        : [];
      const mappedItems = healthchecksList.map(mapHealthCheckItem);
      let combined = [];

      setHealthReports(prev => {
        combined = responsePage === 1 ? mappedItems : [...prev, ...mappedItems];
        return combined;
      });

      setCurrentPage(responsePage);
      const hasTotalPages =
        typeof total_pages === 'number' && total_pages > 0;
      const hasTotalCount =
        typeof total_count === 'number' && total_count > 0;
      const reachedEnd =
        (hasTotalPages && responsePage >= total_pages) ||
        (hasTotalCount && combined.length >= total_count) ||
        (!hasTotalPages && !hasTotalCount && mappedItems.length === 0);
      setNoMoreData(reachedEnd);
      setRefreshing(false);
    }
  }, [healthChecksData]);

  useEffect(() => {
    if (error) {
      setRefreshing(false);
    }
  }, [error]);

  const onLoadMore = useCallback(async () => {
    if (!loading && !noMoreData) {
      const nextPage = currentPage + 1;
      const nextVariables = {
        ...queryVariables,
        currentPage: nextPage,
      };
      setQueryVariables(nextVariables);
      await onRefetchData({params: nextVariables});
    }
  }, [currentPage, loading, noMoreData, onRefetchData, queryVariables]);

  const onRefresh = useCallback(async () => {
    if (loading) {
      return;
    }
    const resetVariables = {
      ...queryVariables,
      currentPage: 1,
    };
    setRefreshing(true);
    setNoMoreData(false);
    setHealthReports([]);
    setQueryVariables(resetVariables);
    await onRefetchData({params: resetVariables});
  }, [loading, onRefetchData, queryVariables]);

  const onPressItem = useCallback(
    reportItem => {
      if (reportItem) {
        // 立即更新该项的未读状态为已读
        setHealthReports(prev => {
          return prev.map(item => {
            if (item.id === reportItem.id) {
              return {
                ...item,
                isUnread: false,
              };
            }
            return item;
          });
        });

        const params = {
          report: reportItem,
        };
        if (reportItem?.entityId) {
          params.entityId = reportItem.entityId;
        }
        navigateTo(
          modules.account_health_report_detail?.enable,
          modules.account_health_report_detail?.name,
          params,
        );
      }
    },
    [],
  );

  if (userType === USER_GUEST) {
    return <ViewLogin />;
  }

  const controllerProps = {
    t,
    healthReports,
    loading,
    onLoadMore,
    noMoreData,
    refreshing,
    onRefresh,
    onPressItem,
  };

  return <Views {...controllerProps} />;
};

export default AccountHealthReport;

