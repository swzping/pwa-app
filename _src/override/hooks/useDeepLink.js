import {useEffect} from 'react';
import {Linking} from 'react-native';
import {resolveWebUrl, redirectWebUrl} from '@app/helpers/Navigation';
import {getParamValue} from '@app/helpers/Url';
import {URL_RESOLVER} from '@app/_modules/product_list/services/schema';
import {useLazyQuery} from '@apollo/client';

const useDeepLink = () => {
  const [resolveURL] = useLazyQuery(URL_RESOLVER, {
    fetchPolicy: 'no-cache',
  });

  /**
   * handle deeplink
   */
  const resolveDeeplink = async url => {
    const linkparams = getParamValue(url, 'link');
    const linkUrlKey = resolveWebUrl(linkparams);
    if (linkUrlKey) {
      const urlRes = await resolveURL({
        variables: {url: linkUrlKey},
      });
      redirectWebUrl(urlRes?.data?.urlResolver);
    }
  };

  const fetchDeepLinkingUrl = async () => {
    // called when app is in close state.
    const url = await Linking?.getInitialURL();
    if (url) {
      resolveDeeplink(url, 'close');
    }
  };

  useEffect(() => {
    fetchDeepLinkingUrl();
    const deeplinking = Linking?.addEventListener('url', ({url}) => {
      if (url) {
        resolveDeeplink(url, 'open');
      }
    });
    return () => {
      deeplinking?.remove();
    };
  }, []);
};

export default useDeepLink;
