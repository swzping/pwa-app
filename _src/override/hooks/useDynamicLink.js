import {useEffect, useRef} from 'react';
import {modules, tabsApp} from '@root/swift.config';
import {
  CATEGORY,
  BRAND,
  LOGIN_REGISTER,
  MEMBERSHIP_BENEFIT,
  GAMIFICATION,
  OFFLINE_ACTIVITY_DETAIL,
  PRODUCT,
  REGISTER,
  CMS_PAGE,
  GUARDIAN_RUN,
  TYPE_PAGE,
} from '@app/helpers/Constants';
import {navigateTo, navReset, navigatePushTo} from '@app/helpers/Navigation';
import {Linking} from 'react-native';
import {Adjust, AdjustDeeplink} from 'react-native-adjust';
import {URL} from 'react-native-url-polyfill';
import {Storage} from '@app/helpers/Storage';

/**
 *
 * @param {string} link
 * handle link from dynamic link
 */
export const handleLink = async link => {
  if (link) {
    try {
      const url = new URL(link);
      let postFix = null;
      let postFixList = [
        PRODUCT,
        CATEGORY,
        BRAND,
        LOGIN_REGISTER,
        MEMBERSHIP_BENEFIT,
        GAMIFICATION,
        OFFLINE_ACTIVITY_DETAIL,
        REGISTER,
        CMS_PAGE,
        GUARDIAN_RUN,
      ];
      let paramValue;
      if (url.protocol === 'id.app.guardian:') {
        if (postFixList.includes(url.host)) {
          postFix = url.host;
          paramValue = url.pathname?.split('/')?.filter(Boolean)?.[0] ?? '';
        }
      } else {
        const splitURL = url.pathname.split('/');

        for (let i = 0; i < splitURL.length; i++) {
          let param = splitURL[i];
          if (postFixList.includes(param)) {
            postFix = param;
            paramValue = splitURL[i + 1]?.split('?')?.[0] ?? '';
            break;
          }
        }
      }
      switch (postFix) {
        case PRODUCT:
          navigatePushTo(
            modules.product_detail.enable,
            modules.product_detail.name,
            {
              productUrlKey: paramValue,
            },
          );
          break;
        case CATEGORY:
          navigatePushTo(
            modules.product_list.enable,
            modules.product_list.name,
            {
              type: CATEGORY,
              categoryId: paramValue,
            },
          );
          break;
        case BRAND:
          if (!paramValue) {
            break;
          }
          navigatePushTo(modules.product_list.enable, modules.product_list.name, {
            type: BRAND,
            category_url: `brand/${paramValue}`,
            categoryName: paramValue,
          });
          break;
        case LOGIN_REGISTER:
          navigateTo(modules.auth_signin.enable, modules.auth_signin.name);
          break;
        case MEMBERSHIP_BENEFIT:
          navigateTo(modules.cms_page.enable, modules.cms_page.name, {
            identifier: MEMBERSHIP_BENEFIT,
            type: TYPE_PAGE,
          });
          break;
        case GAMIFICATION:
          navigateTo(
            modules.account_milestone.enable,
            modules.account_milestone.name,
          );
          break;
        case OFFLINE_ACTIVITY_DETAIL: {
          const eventId = url.searchParams?.get('eventId');
          if (eventId) {
            navigateTo(modules.event_detail.enable, modules.event_detail.name, {
              id: eventId,
            });
            break;
          }
          navigateTo(
            modules.account_eventbooking.enable,
            modules.account_eventbooking.name,
          );
          break;
        }
        case REGISTER:
          navigateTo(modules.auth_signup.enable, modules.auth_signup.name);
          break;
        case CMS_PAGE:
          navigatePushTo(modules.cms_page.enable, modules.cms_page.name, {
            identifier: paramValue,
            type: TYPE_PAGE,
            useWebview: true,
          });
          break;
        case GUARDIAN_RUN:
          await handleGuardianRunFlow();
          break;
        default:
          navReset(tabsApp.name);
          break;
      }
    } catch (err) {
      console.log('[err] handle deeplink', err);
      navReset(tabsApp.name);
    }
  }
};

const checkUserAuth = async () => {
  try {
    const token = await Storage.get(Storage.name.TOKEN);
    return token !== null;
  } catch (error) {
    console.log('[err] checking auth:', error);
    return false;
  }
};

const handleGuardianRunFlow = async () => {
  const isSignedIn = await checkUserAuth();

  if (!isSignedIn) {
    navigateTo(modules.auth_signin.enable, modules.auth_signin.name, {
      redirectTo: 'guardian-run',
    });
  } else {
    navigatePushTo(modules.guardian_run.enable, modules.guardian_run.name);
  }
};

const useDeepLinkWithAdjust = () => {
  const timeout = useRef(null);

  useEffect(() => {
    const handleUrl = ({url}) => {
      const deeplink = new AdjustDeeplink(url);
      Adjust.processAndResolveDeeplink(deeplink, function (resolvedLink) {
        handleLink(resolvedLink);
      });
    };

    // Foreground events
    const linkingListener = Linking.addEventListener('url', handleUrl);

    // Background events
    Linking.getInitialURL().then(initialUrl => {
      if (initialUrl) {
        timeout.current = setTimeout(() => {
          handleUrl({url: initialUrl});
        }, 2000);
      }
    });

    return () => {
      linkingListener?.remove
        ? linkingListener.remove()
        : Linking.removeEventListener('url', handleUrl);
      clearTimeout(timeout.current);
    };
  }, []);

  return null;
};

export default useDeepLinkWithAdjust;
