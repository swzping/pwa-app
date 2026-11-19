import {useMemo, useCallback} from 'react';
import {useLazyQuery} from '@apollo/client';
import {GET_COMMON_CMS_PAGE} from '@app/services/queries/cms';

const useCms = shouldCache => {
  const [getCmsData, {data, error, loading}] = useLazyQuery(
    GET_COMMON_CMS_PAGE,
    shouldCache
      ? {
          fetchPolicy: 'cache-and-network',
          nextFetchPolicy: 'cache-first',
        }
      : {
          fetchPolicy: 'no-cache',
        },
  );

  const content = useMemo(() => {
    return data?.cmsPageAppContent?.page_json_content;
  }, [data]);

  const httpErrorCode = useMemo(() => {
    if (error?.message?.includes("ID doesn't exist.")) {
      return 404;
    }
    return null;
  }, [error]);

  const offerTitle = useMemo(() => {
    return data?.cmsPageAppContent?.title;
  }, [data]);

  const fetchCmsData = useCallback(
    identifier => {
      let variables = {identifier, is_home: false};

      getCmsData({
        variables,
        context: {fetchOptions: {method: 'GET'}},
      });
    },
    [getCmsData],
  );

  return {
    content,
    httpErrorCode,
    loading,
    error,
    fetchCmsData,
    offerTitle,
  };
};

export default useCms;
