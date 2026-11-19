import {useEffect, useState, useRef} from 'react';
import {useApolloClient} from '@apollo/client';
import {handleError} from '@app/helpers/Auth';
import {ERROR_UNAUTHORIZHED} from '@app/helpers/Constants';

const useCustomQuery = ({
  schema,
  useInitData = false,
  variables = null,
  opts = null,
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

  /**
   * ---------------------------------------------------- *
   * @dependency []
   * @summary {lifecycle}
   * ---------------------------------------------------- *
   */
  useEffect(() => {
    mount.current = true;
    if (mount.current && useInitData) {
      onRefetchData({params: variables});
    }
    return () => (mount.current = false);
  }, []);

  /**
   * ---------------------------------------------------- *
   * @function {onRefetchData}
   * @summary function use for get data
   * ---------------------------------------------------- *
   */
  const onRefetchData = async ({params = null, paramsOpt = null}) => {
    try {
      setLoading(true);
      let config = {query: schema};
      if (params !== null) {
        config.variables = params;
      }
      if (opts !== null) {
        config = {...config, ...opts};
      }
      const res = await client.query(config);
      if (paramsOpt?.isReturn) {
        setLoading(false);
        return res;
      } else {
        setData(res);
        setLoading(false);
      }
    } catch (err) {
      console.log('[err] useCustomQuery', err);
      if (err?.message) {
        if (err?.message.includes(ERROR_UNAUTHORIZHED)) {
          handleError({message: err?.message});
        }
      }
      if (paramsOpt?.isReturn) {
        setLoading(false);
        return err;
      } else {
        setError(err);
        setLoading(false);
      }
    }
  };

  /**
   * ---------------------------------------------------- *
   * @returns {object}
   * @summary hooks returning needed object
   * ---------------------------------------------------- *
   */
  return {loading, data, error, onRefetchData};
};

export default useCustomQuery;
