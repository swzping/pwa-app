import React, {useCallback, useMemo, useRef, useState} from 'react';

import Config from 'react-native-config';

import ReCaptcha from '@valture/react-native-recaptcha-v3';

import {GET_RECAPTCHAV3_CONFIG} from '@app/_modules/auth_signin/services/schema';
import useCustomQuery from '@app/hooks/useCustomQuery';

const GOOGLE_RECAPTCHA_HEADER = 'X-ReCaptcha';
const BASE_URL =
  Config.MODE_ACTIVE === 'development'
    ? 'https://localhost'
    : Config.PWA_BASE_URL;

/**
 * Returns props necessary to attach Google ReCaptcha V3 to a form.
 *
 * @function
 *
 * @param {*} props
 * @returns
 */
export const useGoogleReCaptcha = props => {
  const {currentForm, formAction} = props || {};
  const recaptchaRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [webViewKey, setWebViewKey] = useState(0);

  const {
    data: configData,
    error: configError,
    loading: configLoading,
  } = useCustomQuery({
    schema: GET_RECAPTCHAV3_CONFIG,
    useInitData: true,
  });

  const config = configData?.data?.recaptchaV3Config;
  const recaptchaKey = config?.website_key;
  const activeForms = config?.forms || [];

  const isEnabled = useMemo(() => {
    if (configError) {
      return false;
    }
    if (!recaptchaKey || recaptchaKey.length === 0) {
      return false;
    }
    if (!currentForm || !activeForms.includes(currentForm)) {
      return false;
    }
    return true;
  }, [configError, recaptchaKey, currentForm, activeForms]);

  const generateReCaptchaData = useCallback(
    async customAction => {
      if (!isEnabled) {
        return {};
      }

      if (!recaptchaRef.current) {
        console.error('reCAPTCHA ref is not available');
        return {};
      }

      if (!recaptchaKey) {
        console.error('reCAPTCHA key is missing');
        return {};
      }

      console.log(
        'reCAPTCHA getting token for action:',
        customAction || formAction,
      );
      setIsLoading(true);
      try {
        const token = await recaptchaRef.current.getToken(
          customAction || formAction || 'default_action',
        );

        if (!token) {
          return {};
        }

        console.log('✅ reCAPTCHA token generated');
        return {
          context: {
            headers: {
              [GOOGLE_RECAPTCHA_HEADER]: token,
            },
          },
        };
      } catch (error) {
        console.log('reCAPTCHA token generation failed:', error);
        return {};
      } finally {
        setIsLoading(false);
      }
    },
    [isEnabled, formAction, recaptchaKey, config?.failure_message, currentForm],
  );

  const renderRecaptchaBridge = () => {
    if (!isEnabled || !recaptchaKey) {
      console.log('🚫 Recaptcha not rendered:', {
        isEnabled,
        siteKey: recaptchaKey,
        currentForm,
      });
      return null;
    }

    console.log('🎯 Rendering reCAPTCHA with:', {
      siteKey: recaptchaKey?.substring(0, 20) + '...',
      baseUrl: BASE_URL,
    });

    return (
      <ReCaptcha
        // 加 currentForm 前缀：同页面多实例（如登录+忘记密码桥）各自 webViewKey
        // 初始值相同（都是 0），会导致兄弟节点 key 冲突
        key={`recaptcha-${currentForm || 'default'}-${webViewKey}`}
        ref={recaptchaRef}
        siteKey={recaptchaKey}
        baseUrl={Config.PWA_BASE_URL}
        containerStyle={{
          position: 'absolute',
          width: 0,
          height: 0,
          opacity: 0,
          zIndex: -9999,
        }}
        onLoad={() => {
          console.log('✅ reCAPTCHA WebView loaded successfully');
        }}
        onError={error => {
          console.error('❌ ReCaptcha Render Error:', error);
        }}
      />
    );
  };

  // 带 2 秒兜底的封装：token 生成超时/异常时返回 {}，不阻塞调用方流程
  // （与 auth_signin/auth_forgot 现有 Promise.race 用法一致，供新接入的接口复用）
  const generateReCaptchaDataSafely = useCallback(
    async customAction => {
      try {
        return await Promise.race([
          generateReCaptchaData(customAction),
          new Promise(resolve => setTimeout(() => resolve({}), 2000)),
        ]);
      } catch (error) {
        return {};
      }
    },
    [generateReCaptchaData],
  );

  return {
    generateReCaptchaData,
    generateReCaptchaDataSafely,

    // state info
    recaptchaLoading: isLoading || configLoading,
    isEnabled,

    // render function
    renderRecaptchaBridge,

    // debug info
    debugInfo: {
      siteKey: recaptchaKey,
      baseUrl: Config.PWA_BASE_URL,
      currentForm,
      hasRef: !!recaptchaRef.current,
    },

    // util function
    resetRecaptcha: () => {
      setWebViewKey(prev => prev + 1);
    },
  };
};
