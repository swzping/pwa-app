import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';

import {useRoute} from '@react-navigation/native';

import {useReactiveVar} from '@apollo/client';
import {useTranslation} from 'react-i18next';

import ChevronRightOutlined from '@app/assets/svgs/outlined/ChevronRight';
import Shimmer from '@app/components/_Shimmer/index';
import {useParentData} from '@app/components/Cms/hooks/useParentData';
import RNFImage from '@app/components/Image';
import AnalyticsHelper, {EVENT_TOKEN} from '@app/helpers/Analytics';
import {NavigatorContext} from '@app/helpers/Context';
import resourceUrl from '@app/helpers/MakeUrl';
import {resolveLinkAndNavigate} from '@app/helpers/Navigation';
import {handleOsmosAdPress} from '@app/helpers/Osmos';
import {rxUserInformation} from '@app/services/cache';
import {Colors} from '@app/styles';
import {trackHomepageModuleClick} from '@app/track';

const ImageWidget = ({
  desktopImage,
  mobileImage,
  link,
  showView,
  borderRadius = 12,
  noPadding,
  customStyles,
  position,
  contentType,
  title,
  needMariginTop = false,
  isOsmosAd = false,
  isOsmosPlaceholder = false,
  clickType,
  clickValue,
  uclid,
}) => {
  const {routeName} = useContext(NavigatorContext);
  const parentDataFromContext = useParentData();
  const route = useRoute();
  const userInformation = useReactiveVar(rxUserInformation);
  const [containerWidth, setContainerWidth] = useState(0);
  const [imageRatio, setImageRatio] = useState(null);
  const imageSource = resourceUrl(mobileImage || desktopImage, {
    type: 'image-wysiwyg',
    quality: 85,
  });
  const [calculatedHeight, setCalculatedHeight] = useState();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [sizeError, setSizeError] = useState(false);
  const {t} = useTranslation();

  const isMountedRef = useRef(true);
  const getSizeAttemptedRef = useRef(false);
  const containerStyles = StyleSheet.flatten(customStyles?.container) || {};
  const forcedAspectRatio =
    typeof containerStyles.aspectRatio === 'number' && containerStyles.aspectRatio > 0
      ? containerStyles.aspectRatio
      : null;

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    getSizeAttemptedRef.current = false;
    setImageRatio(null);
    setSizeError(false);
  }, [imageSource]);

  useEffect(() => {
    if (!imageSource || getSizeAttemptedRef.current || sizeError || forcedAspectRatio) {
      return;
    }

    getSizeAttemptedRef.current = true;

    Image.getSize(
      imageSource,
      (width, height) => {
        if (isMountedRef.current && height && width) {
          setImageRatio(width / height);
        }
      },
      error => {
        if (isMountedRef.current) {
          setSizeError(true);
          // 使用默认宽高比（16:9）作为回退方案
          setImageRatio(16 / 9);
          // 只在开发环境记录错误，避免生产环境重复报错
          if (__DEV__) {
            console.warn(
              `Failed to get image size for ${imageSource}:`,
              error?.message || error,
            );
          }
        }
      },
    );
  }, [imageSource, sizeError, forcedAspectRatio]);

  const handlePress = useCallback(async () => {
    if (isOsmosAd) {
      if (!link && !clickValue) {
        return;
      }

      await handleOsmosAdPress({
        link,
        clickType,
        clickValue,
        uclid,
        userInformation,
      });
    } else {
      if (!link) {
        return;
      }

      AnalyticsHelper.trackAdjustEvent(EVENT_TOKEN.SCROLL_BANNER_HOMEPAGE);
      resolveLinkAndNavigate(link);
    }

    trackHomepageModuleClick({
      routeName,
      module_rank: position,
      module_content: parentDataFromContext.rawData.cssClasses,
      location_name: title,
      resource_type: contentType,
    });
  }, [
    clickType,
    clickValue,
    contentType,
    isOsmosAd,
    link,
    parentDataFromContext.rawData.cssClasses,
    position,
    route,
    title,
    uclid,
    userInformation,
  ]);

  const handleLayout = useCallback(
    event => {
      const {width} = event.nativeEvent.layout;
      if (isMountedRef.current && width !== containerWidth) {
        setContainerWidth(width);
      }
    },
    [containerWidth],
  );

  useEffect(() => {
    const ratio = forcedAspectRatio || imageRatio;
    const newHeight =
      containerWidth && ratio ? containerWidth / ratio : undefined;

    if (isMountedRef.current && newHeight) {
      const maxHeight = containerStyles.maxHeight;
      const height = maxHeight ? Math.min(newHeight, maxHeight) : newHeight;
      setCalculatedHeight(prev => (prev !== height ? height : prev));
    }
  }, [
    containerWidth,
    imageRatio,
    forcedAspectRatio,
    containerStyles.maxHeight,
  ]);

  if (!imageSource) {
    if (isOsmosPlaceholder) {
      const placeholderRatio = forcedAspectRatio || 16 / 9;

      return (
        <View
          style={[
            styles.container,
            noPadding ? styles.noPaddingContainer : {},
            needMariginTop ? styles.needMariginTopStyle : {},
            customStyles?.container,
          ]}
          onLayout={handleLayout}>
          <Shimmer
            wrapperStyle={{
              width: '100%',
              aspectRatio: placeholderRatio,
              borderRadius,
            }}
          />
        </View>
      );
    }

    return null;
  }

  const effectiveRatio = forcedAspectRatio || imageRatio;
  const imageResizeMode = forcedAspectRatio ? 'cover' : 'contain';
  const imageHeightStyle = forcedAspectRatio
    ? {height: '100%'}
    : {height: calculatedHeight};

  const imageContainer = (
    <View
      style={[
        styles.imageContainer,
        calculatedHeight ? {height: calculatedHeight} : {},
        containerStyles,
      ]}>
      <RNFImage
        source={imageSource}
        style={[
          styles.image,
          {borderRadius},
          imageHeightStyle,
          {opacity: imageLoaded ? 1 : 0},
        ]}
        resizeMode={imageResizeMode}
        onLoadEnd={() => {
          if (isMountedRef.current) {
            setImageLoaded(true);
          }
        }}
      />
      {!imageLoaded && calculatedHeight && (
        <Shimmer wrapperStyle={{width: '100%', height: calculatedHeight}} />
      )}
    </View>
  );

  const contentView = (
    <View
      style={[
        styles.innerContainer,
        calculatedHeight ? {height: calculatedHeight} : {},
      ]}
      onLayout={handleLayout}>
      {effectiveRatio ? (
        imageContainer
      ) : (
        <View style={styles.imageContainer}>
          <RNFImage
            source={imageSource}
            style={[
              styles.image,
              {borderRadius},
              {opacity: imageLoaded ? 1 : 0},
            ]}
            resizeMode="contain"
            onLoadEnd={() => {
              if (isMountedRef.current) {
                setImageLoaded(true);
              }
            }}
          />
          {!imageLoaded && (
            <Shimmer wrapperStyle={{width: '100%', aspectRatio: 16 / 9}} />
          )}
        </View>
      )}
      {link && showView && (
        <View style={[styles.viewButton]}>
          <Text style={[{fontSize: 10, color: 'black'}]}>{t('view')}</Text>
          <ChevronRightOutlined width={10} height={10} color={'#212121'} />
        </View>
      )}
    </View>
  );

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={handlePress}
      disabled={!link && !(isOsmosAd && clickValue)}
      style={[
        styles.container,
        noPadding ? styles.noPaddingContainer : {},
        needMariginTop ? styles.needMariginTopStyle : {},
        customStyles?.container,
      ]}>
      {contentView}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  needMariginTopStyle: {
    marginTop: 16,
  },
  noPaddingContainer: {
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  innerContainer: {
    width: '100%',
  },
  imageContainer: {
    width: '100%',
    position: 'relative',
  },
  image: {
    width: '100%',
    borderRadius: 12,
    position: 'absolute',
    top: 0,
    left: 0,
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    right: 5,
    bottom: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9,
    backgroundColor: Colors.WHITE,
  },
});

export default React.memo(ImageWidget);
