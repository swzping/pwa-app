import {useEffect, useState, useRef} from 'react';
import {useApolloClient} from '@apollo/client';
import {onRequestTimeout} from '@app/helpers/General';
import ErrorHandler from '@app/helpers/ErrorHandler';
import _ from 'lodash';

const useCustomMutation = ({
  schema,
  useInitData = false,
  useTimeout = false,
  variables = null,
  opts = null,
  configErr = null,
}) => {
  /**
   * ---------------------------------------------------- *
   * @var {hooks}
   * ---------------------------------------------------- *
   */
  const client = useApolloClient();
  const mount = useRef();
  const aborterRef = useRef(new AbortController());
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
      onRefetchData({params: null});
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
      setError(null);

      const config = {mutation: schema};
      if (!_.isEmpty(opts)) {
        _.assign(config, opts);
      }
      if (!_.isEmpty(paramsOpt?.opts)) {
        _.assign(config, paramsOpt.opts);
      }
      _.assign(config, {variables: !_.isEmpty(variables) ? variables : params});
      // timeout
      if (useTimeout) {
        _.assign(config, {
          notifyOnNetworkStatusChange: true,
          context: {
            fetchOptions: {
              signal: aborterRef.current.signal,
            },
          },
        });

        onRequestTimeout({
          ...paramsOpt.timeoutCallback,
          aborterRef,
          requestCallback: (resolve, reject) => {
            client
              .mutate(config)
              .then(res => resolve(res))
              .catch(err => reject(err));
          },
        });
        // without timeout
      } else {
        // console.log('mutation request:', JSON.stringify(config));
        const res = await client.mutate(config);
        // console.log('mutation response', JSON.stringify(res));
        if (!paramsOpt?.isReturn) {
          if (mount.current) {
            setData(res);
            setLoading(false);
          }
        } else {
          if (mount.current) {
            setLoading(false);
          }
          return res;
        }
      }
    } catch (err) {
      console.log('err token1', JSON.stringify(err));
      new ErrorHandler({
        source: 'useCustomMutation',
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
