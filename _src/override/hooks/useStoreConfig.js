import {useEffect, useState, useRef} from 'react';
import {GET_STORE_CONFIG} from '@app/services/queries/config';
import {useApolloClient} from '@apollo/client';
import {rxAppMaintenance} from '@app/services/cache';

const useStoreConfig = ({useInitData = false}) => {
  const [storeConfig, setStoreConfig] = useState(null);
  const client = useApolloClient();
  const mount = useRef();

  const getStoreConfig = async () => {
    try {
      const storeConfigData = await client.query({
        query: GET_STORE_CONFIG,
        fetchPolicy: 'no-cache',
      });

      if (storeConfigData) {
        const config = JSON.stringify(storeConfigData.data)
          .replace(/\\n/g, '')
          .replace(/\\r/g, '')
          .replace(/\\t/g, '');
        setStoreConfig(JSON.parse(config).storeConfig);
      }

      const isMaintenance = storeConfigData?.data?.storeConfig?.is_maintenance;
      if (isMaintenance === 1) {
        rxAppMaintenance(true);
      } else {
        rxAppMaintenance(false);
      }
    } catch (error) {
      rxAppMaintenance(true);
    }
  };

  useEffect(() => {
    mount.current = true;
    if (mount.current && useInitData) {
      getStoreConfig();
    }
    return () => (mount.current = false);
  }, []);

  return {storeConfig, getStoreConfig};
};

export default useStoreConfig;
