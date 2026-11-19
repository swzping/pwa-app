import {useEffect, useState, useRef, useCallback} from 'react';
import {useApolloClient} from '@apollo/client';

const useSwitchQuery = ({withVariables = false, opts = null}) => {
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
      if (schemas !== null && mount.current) {
        if (withVariables && queryVariables) {
          onRefetchData({params: queryVariables});
        } else {
          onRefetchData({params: null});
        }
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
    async ({params = null}) => {
      try {
        setLoading(true);
        let config = {query: schemas, fetchPolicy: 'network-only'};
        if (params !== null) {
          config.variables = params;
        }
        // if (params === null) {
        //   config.variables = queryVariables;
        // }
        if (opts !== null) {
          config = {...config, ...opts};
        }
        const res = await client.query(config);
        setData(res);
        setLoading(false);
      } catch (err) {
        setError(err);
        setLoading(false);
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
