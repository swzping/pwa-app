import React, { useEffect, useState } from 'react';
import Views from '@app/_modules/guardian_run/_view';
import { useTranslation } from 'react-i18next';
import useCms from '@app/hooks/useCms';
import AnalyticsHelper, { EVENT_TOKEN } from '@app/helpers/Analytics';

const GuardianRunController = props => {
  const identifier = 'run';
  const [refreshing] = useState(false);
  const { t } = useTranslation();
  const { content, loading, error, fetchCmsData } = useCms(true);
  /**
   * ---------------------------------------------------- *
   * @constant controllerProps
   * @return {object}
   * ---------------------------------------------------- *
   */
  const controllerProps = {
    t,
    loading,
    refreshing,
    cmsPage: content,
    cmsPageError: error,
  };

  useEffect(() => {
    AnalyticsHelper.trackAdjustEvent(EVENT_TOKEN.GUARDIAN_RUN_PAGE);
  }, []);

  useEffect(() => {
    if (identifier) {
      fetchCmsData(identifier);
    }
  }, [identifier, fetchCmsData]);

  return <Views {...controllerProps} />;
};

export default GuardianRunController;
