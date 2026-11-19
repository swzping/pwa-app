import {useEffect, useState, useRef} from 'react';
import {useApolloClient} from '@apollo/client';
import ErrorHandler from '@app/helpers/ErrorHandler';
import _ from 'lodash';

const useCustomQuery = ({
  schema,
  isDynamicQuery = false,
  isDynamicVariables = false,
  useInitData = false,
  variables = null,
  opts = null,
  configErr = null,
  usePagination = false,
  paginationLabel = '',
}) => {
  /**
   * ---------------------------------------------------- *
   * @var {hooks}
   * @params {loading} if not use init data default: false
   * if use init data default: true
   * ---------------------------------------------------- *
   */
  const client = useApolloClient();
  const mount = useRef();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(useInitData);
  const [error, setError] = useState(null);
  const [dynamicSchemas, setDynamicSchemas] = useState(null);
  const [dynamicVariables, setDynamicVariables] = useState(null);

  // for pagination data
  const [pageInfo, setPageInfo] = useState({
    data: [],
    variables: usePagination ? variables : null,
    currentPage: 0,
    currentPageTemp: 0,
    totalPages: 0,
    totalCount: 0,
    noMoreData: false,
  });

  /**
   * ---------------------------------------------------- *
   * @dependency []
   * @summary {lifecycle}
   * ---------------------------------------------------- *
   */
  useEffect(() => {
    mount.current = true;
    if (mount.current && useInitData) {
      if (usePagination) {
        onStartPage({});
      } else {
        onRefetchData({params: variables});
      }
    }
    return () => (mount.current = false);
  }, []);

  useEffect(() => {
    if (mount.current && isDynamicQuery) {
      if (dynamicSchemas !== null) {
        isDynamicVariables && dynamicVariables
          ? onRefetchData({params: dynamicVariables})
          : onRefetchData({params: null});
      }
    }
  }, [dynamicSchemas, dynamicVariables]);

  // useEffect for pagination
  useEffect(() => {
    if (usePagination) {
      const rawData = _.get(data, `data.${paginationLabel}`);
      if (rawData) {
        const current_page =
          _.get(rawData, 'page_info.current_page') ||
          _.get(rawData, 'current_page') ||
          pageInfo.currentPageTemp;
        const total_pages =
          _.get(rawData, 'page_info.total_pages') ||
          _.get(rawData, 'total_pages');
        const total_count =
          _.get(rawData, 'total_count') || _.get(rawData, 'totalCount');
        const items = _.get(rawData, 'items');

        if (items) {
          let noMoreData = pageInfo.noMoreData;
          let newData = [...pageInfo.data, ...items];
          if (current_page === total_pages || newData.length === total_count) {
            noMoreData = true;
          }

          setPageInfo({
            ...pageInfo,
            data: newData,
            currentPage: current_page,
            currentPageTemp: current_page,
            totalPages: total_pages,
            totalCount: total_count,
            noMoreData,
          });
        }
      }

      // for prevent initial
      if (pageInfo.currentPageTemp !== 0) {
        setLoading(false);
      }
    }
  }, [data]);

  /**
   * ---------------------------------------------------- *
   * @function {onRefetchData}
   * @summary function use for get data
   * ---------------------------------------------------- *
   */
  const onRefetchData = async ({params = null, paramsOpt = null}) => {
    if (dynamicSchemas || schema) {
      try {
        setLoading(true);
        setError(null);

        // init query
        const config = {query: isDynamicQuery ? dynamicSchemas : schema};
        if (!_.isEmpty(params)) {
          _.assign(config, {variables: params});
        }
        if (!_.isEmpty(opts)) {
          _.assign(config, opts);
        }
        if (!_.isEmpty(paramsOpt?.opts)) {
          _.assign(config, paramsOpt.opts);
        }
        const res = await client.query(config);

        if (!paramsOpt?.isReturn) {
          if (mount.current) {
            setData(res);
            if (!usePagination) {
              setLoading(false);
            }
          }
        } else {
          if (!usePagination && mount.current) {
            setLoading(false);
          }
          return res;
        }
      } catch (err) {
        new ErrorHandler({
          source: 'useCustomQuery',
          configErr,
          err,
        }).initHandleError();

        if (!paramsOpt?.isReturn) {
          if (mount.current) {
            setError(err);
            setLoading(false);
          }
        } else {
          if (mount.current) {
            setLoading(false);
          }
          return err;
        }
      }
    }
  };

  //start - for pagination
  const onStartPage = async ({params = null}) => {
    if (usePagination && (pageInfo.variables || params)) {
      const paramsTemp = params
        ? {...params, currentPage: 1}
        : {...pageInfo.variables, currentPage: 1};
      setPageInfo({
        ...pageInfo,
        data: [],
        variables: paramsTemp,
        currentPage: 0,
        currentPageTemp: 1,
        totalPages: 0,
        totalCount: 0,
        noMoreData: false,
      });
      await onRefetchData({
        params: paramsTemp,
      });
    }
  };

  const onReloadPage = async () => {
    if (usePagination) {
      await onRefetchData({
        params: {...pageInfo.variables, currentPage: pageInfo.currentPageTemp},
      });
    }
  };

  const onNextPage = async () => {
    if (!pageInfo.noMoreData && usePagination) {
      const pageTemp = pageInfo.currentPage + 1;
      setPageInfo({...pageInfo, currentPageTemp: pageTemp});
      await onRefetchData({
        params: {...pageInfo.variables, currentPage: pageTemp},
      });
    }
  };
  //end - for pagination

  /**
   * ---------------------------------------------------- *
   * @returns {object}
   * @summary hooks returning needed object
   * ---------------------------------------------------- *
   */
  return {
    loading,
    data,
    error,
    dynamicVariables,
    onRefetchData,
    setDynamicSchemas,
    setDynamicVariables,

    //for pagination
    pageInfo,
    onStartPage,
    onReloadPage,
    onNextPage,
  };
};

export default useCustomQuery;
