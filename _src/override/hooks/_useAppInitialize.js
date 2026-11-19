import useUserData from '@app/hooks/useUserData';
import useFirestoreForceUpdate from '@app/hooks/useFirestoreForceUpdate';
import useStoreConfig from '@app/hooks/useStoreConfig';
import useRemoteConfig from '@app/hooks/useRemoteConfig';

const useAppInitialize = () => {
  /**
   * ---------------------------------------------------- *
   * @var {hooks}
   * ---------------------------------------------------- *
   */
  const {loading, updates, setUpdates} = useFirestoreForceUpdate();
  const {loading: loadingUser} = useUserData({useInitData: true});
  useStoreConfig({useInitData: true});
  useRemoteConfig({useInitData: true});

  return {updates, setUpdates, loading, loadingUser};
};
export default useAppInitialize;
