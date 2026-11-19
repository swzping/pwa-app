import React, {useState, useRef, useEffect} from 'react';
import {Vibration} from 'react-native';
import Views from '@app/_modules/scanner/_view';
import {useLazyQuery} from '@apollo/client';
import {QUERY_PRODUCT_BY_BARCODE} from '@app/_modules/scanner/schema';
import {URL_RESOLVER} from '@app/_modules/product_list/services/schema';
import {
  navigateTo,
  resolveWebUrl,
  redirectWebUrl,
} from '@app/helpers/Navigation';
import {modules} from '@root/swift.config';
import Config from 'react-native-config';
import {useIsFocused} from '@react-navigation/core';
import {getParamValue} from '@app/helpers/Url';

const DYNAMIC_LINK_HOST = 'https://guardianid.page.link';

const ScannerController = ({route}) => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showTip, setShowTip] = useState(false);

  const cameraRef = useRef(null);
  const [isCameraPaused, setIsCameraPaused] = useState(false);
  const isFocused = useIsFocused();

  const [getProductInfo] = useLazyQuery(QUERY_PRODUCT_BY_BARCODE, {
    fetchPolicy: 'no-cache',
  });
  const [resolveURL] = useLazyQuery(URL_RESOLVER, {
    fetchPolicy: 'no-cache',
  });

  // 页面重新聚集时清除上次的提示信息
  useEffect(() => {
    if (isFocused) {
      setShowTip(false);
      setLoading(false);
      setIsCameraPaused(false);
    }
  }, [isFocused]);

  const handleBarCodeRead = barcodes => {
    if (loading) {
      return;
    }
    setLoading(true);
    const barcodeType = barcodes.type;
    const scanRes = barcodes.data;
    const decodeScanRes = decodeURIComponent(scanRes);

    Vibration.vibrate();
    if (barcodeType.includes('QR')) {
      if (decodeScanRes.includes(Config.PWA_BASE_URL)) {
        if (scanRes.includes(DYNAMIC_LINK_HOST)) {
          const linkParams = getParamValue(scanRes, 'link');
          queryQRCode(linkParams);
        } else {
          queryQRCode(scanRes);
        }
      } else {
        handleScanError('Sorry, this QR code is not the link of Guardian!');
      }
    } else {
      queryProduct(`%${scanRes}%`);
    }
  };

  const handleScanError = errorMessage => {
    setShowTip(false);
    setMessage(errorMessage);
    setTimeout(() => {
      setShowTip(true);
    }, 200);
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  const queryProduct = async barcode => {
    try {
      setLoading(true);
      const productRes = await getProductInfo({variables: {barcode}});
      const productInfo = productRes?.data?.products?.items?.[0] || undefined;
      if (productInfo) {
        pauseCamera();
        const {sku, url_key} = productInfo;
        navigateTo(modules.product_detail.enable, modules.product_detail.name, {
          productUrlKey: url_key,
          productSku: sku,
        });
      } else {
        handleScanError('Sorry, Product Not Found!');
      }
    } catch (err) {
      console.log(err);
      setLoading(false);
    }
  };

  const queryQRCode = async urlPath => {
    const linkUrlKey = resolveWebUrl(urlPath);
    if (linkUrlKey) {
      const urlRes = await resolveURL({
        variables: {url: linkUrlKey},
      });
      redirectWebUrl(urlRes?.data?.urlResolver);
    }
  };

  const pauseCamera = () => {
    if (cameraRef.current) {
      cameraRef.current.pausePreview();
      setIsCameraPaused(true);
    }
  };

  return (
    <Views
      cameraRef={cameraRef}
      handleBarCodeRead={handleBarCodeRead}
      message={message}
      showTip={showTip}
      setShowTip={setShowTip}
      isCameraPaused={isCameraPaused}
      loading={loading}
      isFocused={isFocused}
    />
  );
};

export default ScannerController;
