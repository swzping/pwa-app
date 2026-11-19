/* eslint-disable no-unused-vars */
import {useEffect, useState, useRef} from 'react';
import DeviceInfo from 'react-native-device-info';
import checkVersion from 'react-native-store-version';
import FirestoreHelper from '@app/helpers/Firestore';
import {
  STOREURL_ANDROID,
  STOREID_ANDROID,
  STOREURL_IOS,
  STOREID_IOS,
} from '@app/helpers/Constants';
import {Platform} from 'react-native';

const useFirestoreForceUpdate = () => {
  const [loading, setLoading] = useState(true);
  const [updates, setUpdates] = useState(false);
  const mount = useRef();

  const onCheckAppVersion = async () => {
    try {
      const check = await checkVersion({
        version: DeviceInfo.getVersion(),
        iosStoreURL: `${STOREURL_IOS}/${STOREID_IOS}?mt=8`,
        androidStoreURL: `${STOREURL_ANDROID}?id=${STOREID_ANDROID}`,
        country: 'id',
      });
      if (check.result === 'new') {
        setUpdates(true);
      }
    } catch (e) {
      console.log('[err] check version: ', e);
    }
  };

  // fix update by firestore
  const onInitFirestore = async () => {
    const FirestoreListener = new FirestoreHelper();
    FirestoreListener.onSnapshot(FirestoreListener.doc.MODULES, snapshot => {
      if (snapshot) {
        const modules = snapshot.data();
        if (
          modules?.force_update === true &&
          typeof modules?.version_ios === 'string' &&
          typeof modules?.version_android === 'string'
        ) {
          const deviceInfoVersion = DeviceInfo.getVersion();
          // prettier-ignore
          const currentVersion = Platform.OS === 'ios' ? modules.version_ios : modules.version_android;
          if (deviceInfoVersion < currentVersion) {
            setUpdates(true);
          }
        }
      }
    });
    setLoading(false);
  };

  useEffect(() => {
    mount.current = true;
    if (mount.current) {
      onInitFirestore();
      // onCheckAppVersion();
    }
    return () => (mount.current = false);
  }, [updates]);

  return {
    loading,
    updates,
    setUpdates,
  };
};

export default useFirestoreForceUpdate;
