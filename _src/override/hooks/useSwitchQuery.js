import {useEffect, useState, useRef, useCallback} from 'react';
import {useApolloClient} from '@apollo/client';
import {onHandleError} from '@app/hooks/customer/useDataCustomer';

const useSwitchQuery = ({
  initialized = false,
  withVariables = false,
  opts = null,
  configErr = null,
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
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [schemas, setSchemas] = useState(null);
  const [queryVariables, setQueryVariables] = useState(null);

  /**
   * ---------------------------------------------------- *
   * @dependency []
   * @summary {lifecycle}
   * ---------------------------------------------------- *
   */
  useEffect(() => {
    if (mount) {
      mount.current = true;
      if (initialized && schemas !== null && mount.current) {
        if (withVariables) {
          if (queryVariables) {
            onRefetchData({params: queryVariables});
          }
        } else {
          onRefetchData({params: null});
        }

        // if (withVariables && queryVariables) {
        //   onRefetchData({params: queryVariables});
        // } else {
        //   onRefetchData({params: null});
        // }
      }
    }

    return () => (mount.current = false);
  }, [schemas, queryVariables]);

  /**
   * ---------------------------------------------------- *
   * @function {onRefetchData}
   * @summary function use for get data
   * ---------------------------------------------------- *
   */
  const onRefetchData = useCallback(
    async ({params = null, schemaParam}) => {
      let logQuery;
      if (schemas || schemaParam) {
        try {
          setLoading(true);
          let config = {query: schemas ?? schemaParam, fetchPolicy: 'no-cache'};
          if (params !== null) {
            config.variables = params;
          }
          if (opts !== null) {
            config = {...config, ...opts};
          }
          logQuery = config;
          const res = await client.query(config);

          if (mount.current) {
            setData(res);
            setLoading(false);
          }
        } catch (err) {
          const logSource =
            configErr && configErr.logSource
              ? '[err] useSwitchQuery ' + configErr.logSource
              : null;

          onHandleError(
            err,
            configErr ? {...configErr, logSource, logQuery, log: false} : null,
          );

          if (mount.current) {
            setError(err);
            setLoading(false);
          }
        }
      }
    },
    [schemas],
  );

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
    queryVariables,
    onRefetchData,
    setSchemas,
    setQueryVariables,
  };
};

export default useSwitchQuery;
