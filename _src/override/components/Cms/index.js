import React, {forwardRef, useCallback, useEffect, useMemo} from 'react';
import {useWindowDimensions, View} from 'react-native';

import {useReactiveVar} from '@apollo/client';
import {FlashList} from '@shopify/flash-list';

import AnalyticsHelper from '@app/helpers/Analytics';
import {useFlashListExposure} from '@app/hooks/useFlashListExposure';
import {rxUserToken} from '@app/services/cache';

import {CmsContext} from './CmsContext';
import {createContentTypeElement} from './factory';
import FadeInView from './FadeInView';
import GradientView from './GradientView';
import HtmlStylesContext from './HtmlStylesContext';
import parseStorageJSON from './parseStorageJSON';

const MemoizedComponent = React.memo(createContentTypeElement);

const CmsRender = forwardRef(
  (
    {
      htmlStr,
      isHome,
      noPadding,
      noBorderRadius,
      headerComponent,
      refreshControl,
      contentContainerStyle,
      useFlashList = true,
      onScroll,
      voucherSliderRef,
      tagsStyles,
      classesStyles,
      isPLP = false,
      onOpenVariantPopup,
    },
    ref,
  ) => {
    const getRxUserToken = useReactiveVar(rxUserToken);

    const {height} = useWindowDimensions();
    const data = useMemo(
      () =>
        htmlStr
          ? parseStorageJSON(htmlStr, {noPadding, noBorderRadius, isPLP})
          : null,
      [htmlStr, noPadding, noBorderRadius, isPLP],
    );

    const modules = useMemo(() => {
      const arr = data?.children || [];
      if (isHome && arr.length > 0) {
        const first3 = arr.slice(0, 3);
        const rest = arr.slice(3);
        return [
          {position: 'gradient-group', isGradientGroup: true, items: first3},
          ...rest,
        ];
      }
      return arr;
    }, [data, isHome]);

    const {onViewableItemsChanged, resetExposureData} = useFlashListExposure({
      ref,
      visibleThreshold: 0.5,
      minVisibleTime: 1000,
      enableLog: __DEV__,
      onExposure: ({item}) => {
        if (item?.cssClasses?.includes('health-check-service-app')) {
          AnalyticsHelper.eventHealthCheckImpression();
          AnalyticsHelper.eventBeconImpression();
        }
      },
    });

    const renderItem = useCallback(
      ({item, index}) => {
        // 为 VoucherSlider 组件添加 voucherSliderRef
        const isVoucherSlider =
          item.contentType === 'voucherSlider' ||
          item.contentTypeMap === 'voucherSlider';

        let itemWithProps = item;
        if (isVoucherSlider) {
          itemWithProps = {...itemWithProps, voucherSliderRef};
        }

        if (item.isGradientGroup) {
          return (
            <GradientView key={item.position}>
              {item.items.map((child, idx) => {
                const isChildVoucherSlider =
                  child.contentType === 'voucherSlider' ||
                  child.contentTypeMap === 'voucherSlider';

                let childWithProps = child;
                if (isChildVoucherSlider) {
                  childWithProps = {...childWithProps, voucherSliderRef};
                }

                return (
                  <FadeInView key={child.position} delay={idx * 50}>
                    <MemoizedComponent {...childWithProps} />
                  </FadeInView>
                );
              })}
            </GradientView>
          );
        }

        return (
          <FadeInView key={item.position} delay={index * 50}>
            <MemoizedComponent {...itemWithProps} />
          </FadeInView>
        );
      },
      [voucherSliderRef, isHome],
    );

    const renderList = () => {
      if (!useFlashList) {
        return (
          <View style={contentContainerStyle}>
            {modules.map(item => {
              return <MemoizedComponent key={item.position} {...item} />;
            })}
          </View>
        );
      }

      return (
        <FlashList
          ref={ref}
          overScrollMode="never"
          data={modules}
          renderItem={renderItem}
          estimatedItemSize={100}
          keyExtractor={item => `floor-${item.position}`}
          showsVerticalScrollIndicator={false}
          refreshControl={refreshControl}
          ListHeaderComponent={
            headerComponent ? <View>{headerComponent}</View> : null
          }
          contentContainerStyle={contentContainerStyle}
          scrollEventThrottle={16}
          removeClippedSubviews={false}
          drawDistance={height * 1.5}
          onScroll={onScroll}
          onViewableItemsChanged={onViewableItemsChanged}
        />
      );
    };

    useEffect(() => {
      resetExposureData();
    }, [getRxUserToken]);

    return (
      <CmsContext.Provider value={{isHomePage: isHome, onOpenVariantPopup}}>
        <HtmlStylesContext.Provider value={{tagsStyles, classesStyles}}>
          {renderList()}
        </HtmlStylesContext.Provider>
      </CmsContext.Provider>
    );
  },
);

export default CmsRender;
