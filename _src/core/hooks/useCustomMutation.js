import {useEffect, useState, useRef} from 'react';
import {useApolloClient} from '@apollo/client';
import {handleError} from '@app/helpers/Auth';
import {ERROR_UNAUTHORIZHED} from '@app/helpers/Constants';

const useCustomMutation = ({
  schema,
  useInitData = false,
  variables = null,
  opts = null,
}) => {
  /**
   * ---------------------------------------------------- *
   * @var {hooks}
   * ---------------------------------------------------- *
   */
  const client = useApolloClient();
  const mount = useRef();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
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
      onRefetchData();
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
      let config = {mutation: schema};
      if (variables !== null) {
        config.variables = variables;
      }
      if (params !== null) {
        config.variables = params;
      }
      if (opts !== null) {
        config = {...config, ...opts};
      }
      const res = await client.mutate(config);
      if (paramsOpt?.isReturn) {
        setLoading(false);
        return res;
      } else {
        setData(res);
        setLoading(false);
      }
    } catch (err) {
      console.log('[err] useCustomMutation', err);
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

export default useCustomMutation;
