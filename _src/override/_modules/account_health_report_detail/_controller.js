import React, {useEffect, useMemo, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {modules} from '@root/swift.config';
import Views from '@app/_modules/account_health_report_detail/_view';
import useCustomQuery from '@app/hooks/useCustomQuery';
import {VIEW_HEALTH_CHECK} from '@app/_modules/account_health_report/services/schema';
import {mapHealthCheckItem} from '@app/_modules/account_health_report/_controller';

const AccountHealthReportDetail = ({route}) => {
  if (!modules.account_health_report_detail.enable) {
    return null;
  }

  const {t} = useTranslation();
  const previewReport = route?.params?.report ?? null;
  const entityIdParam =
    route?.params?.entityId ??
    previewReport?.entityId ??
    previewReport?.id ??
    null;

  const entityId = useMemo(() => {
    if (entityIdParam === null || entityIdParam === undefined) {
      return null;
    }
    const parsed = Number.parseInt(entityIdParam, 10);
    return Number.isNaN(parsed) ? null : parsed;
  }, [entityIdParam]);

  const [report, setReport] = useState(previewReport);

  const {data, loading, error} = useCustomQuery({
    schema: VIEW_HEALTH_CHECK,
    useInitData: Boolean(entityId),
    variables: entityId ? {entityId} : null,
    opts: {fetchPolicy: 'no-cache', context: {method: 'POST'}},
  });

  useEffect(() => {
    const detail = data?.data?.viewHealthCheck;
    console.log('HealthReportDetailsss',detail)
    if (detail) {
      const mappedDetail = mapHealthCheckItem(detail);
      setReport(mappedDetail);
     
    }
  }, [data]);

  useEffect(() => {
    if (error && __DEV__) {
      console.warn('[HealthReportDetail] fetch error', error);
    }
  }, [error]);

  return <Views t={t} report={report} loading={loading} />;
};

export default AccountHealthReportDetail;

