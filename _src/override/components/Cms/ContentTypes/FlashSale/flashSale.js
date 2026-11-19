import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import LinearGradient from 'react-native-linear-gradient';
import normalize from 'react-native-normalize';

import {useIsFocused} from '@react-navigation/native';

import {useQuery} from '@apollo/client';
import {modules} from '@root/swift.config';

import {GET_FLASH_SALE_PRODUCTS} from '@app/_modules/product_list/services/schema';
import ShimmerSkeleton from '@app/components/_ShimmerSkeleton';
import {useCmsContext} from '@app/components/Cms/CmsContext';
import CustomView from '@app/components/CustomView';
import {TYPE_SHIMMER_PRODUCTS} from '@app/helpers/Constants';
import DateHelper from '@app/helpers/Date';
import {navigateTo, resolveLinkAndNavigate} from '@app/helpers/Navigation';
import {Colors} from '@app/styles';

import FlashSaleProductItemHorizontal from './FlashSaleProductItemHorizontal';

const {width: screenWidth} = Dimensions.get('window');

const FlashSaleWidget = ({
  appearance = 'carousel',
  pathNames, // 保留但不使用，用于向后兼容
  settings = {},
  moduleTitle,
  endTime,
  showCountdown = true,
  pageSize = 10,
}) => {
  const {loading, data} = useQuery(GET_FLASH_SALE_PRODUCTS, {
    variables: {
      is_flash_sale: '1',
      pageSize: 10,
    },
    fetchPolicy: 'cache-and-network',
    nextFetchPolicy: 'cache-first',
    onError: err => {
      if (__DEV__) {
        console.error('[FlashSale] 闪购商品查询失败:', err);
      }
    },
  });

  const productList = data?.products?.items || [];
  // Homepage 下由 CmsRender 通过 context 注入变体抽屉打开方法（复用 main_home 的 VariantPickerModal）
  const {onOpenVariantPopup: contextOpenVariantPopup} = useCmsContext();
  const onOpenVariantPopup = useCallback(
    item => {
      if (contextOpenVariantPopup) {
        contextOpenVariantPopup(item);
      }
    },
    [contextOpenVariantPopup],
  );
  const countdownEndTime = useMemo(() => {
    const firstProduct = productList[0];
    if (firstProduct?.special_to_date) {
      // Convert UTC to Indonesia timezone (UTC+7)
      return DateHelper.convertUTCToIndonesia(firstProduct.special_to_date);
    }
    // If endTime is provided, also convert it
    if (endTime) {
      return DateHelper.convertUTCToIndonesia(endTime);
    }
    return null;
  }, [productList, endTime]);

  const [timeRemaining, setTimeRemaining] = useState(null);
  const [dataVersion, setDataVersion] = useState(0);
  const isFirstRender = useRef(true);
  const intervalRef = useRef(null);
  const isFocused = useIsFocused();

  const containerStyle = [
    styles.container,
    appearance === 'grid' && styles.paddingRegularHorizontal,
  ];

  const flatListContentContainerStyle = {
    paddingLeft: 12,
    paddingRight: 12,
    alignItems: 'flex-start', // 确保项目从顶部对齐
    flexGrow: 0, // 防止内容容器增长
  };

  // 计算每个产品的宽度
  const slidesPerView = 2.3;
  const spaceBetween = 12;
  const containerPadding = 12; // 左右各 12px
  const itemWidth = useMemo(() => {
    const availableWidth = screenWidth - containerPadding;
    const totalSpacing = spaceBetween * (Math.ceil(slidesPerView) - 1);
    return (availableWidth - totalSpacing) / slidesPerView;
  }, []);

  // 计算倒计时
  const calculateTimeRemaining = useCallback(() => {
    if (!countdownEndTime) {
      return null;
    }

    try {
      const end = new Date(countdownEndTime);
      // 使用印尼时间而不是系统时间
      const now = DateHelper.getIndonesiaTimeNow();
      const diff = end.getTime() - now.getTime();

      if (diff <= 0) {
        return {hours: 0, minutes: 0, seconds: 0, expired: true};
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      return {hours, minutes, seconds, expired: false};
    } catch (e) {
      if (__DEV__) {
        console.error('[FlashSale] 计算倒计时错误:', e, {
          countdownEndTime,
        });
      }
      return null;
    }
  }, [countdownEndTime]);

  // 更新倒计时
  useEffect(() => {
    // 如果页面不在焦点上，不启动定时器
    if (!isFocused) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    if (!showCountdown || !countdownEndTime) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    const updateCountdown = () => {
      // 如果页面不在焦点上，停止更新
      if (!isFocused) {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        return;
      }

      const remaining = calculateTimeRemaining();
      setTimeRemaining(remaining);

      if (remaining?.expired) {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      }
    };

    updateCountdown();
    intervalRef.current = setInterval(updateCountdown, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [showCountdown, countdownEndTime, calculateTimeRemaining, isFocused]);

  // 子变体商品优先跳父级 PDP（variant_parent_url_key），并带上子变体 uid 让 PDP 默认选中对应 sku
  const onNavigateToProductDetail = useCallback(
    ({productUrlKey, variant_parent_url_key, uid}) => {
      navigateTo(modules.product_detail.enable, modules.product_detail.name, {
        productUrlKey: variant_parent_url_key || productUrlKey,
        uid,
      });
    },
    [],
  );

  useEffect(() => {
    if (data?.products?.items) {
      setDataVersion(prev => prev + 1);
    }
  }, [data]);

  const flatListExtraData = useMemo(() => {
    return {
      dataVersion,
      countdownSeconds: timeRemaining?.seconds ?? 0,
    };
  }, [dataVersion, timeRemaining?.seconds]);

  const formatCountdown = useMemo(() => {
    if (!timeRemaining || timeRemaining.expired) {
      return null;
    }

    const {hours, minutes, seconds} = timeRemaining;
    const formatNumber = num => String(num).padStart(2, '0');

    return {
      hours: formatNumber(hours),
      minutes: formatNumber(minutes),
      seconds: formatNumber(seconds),
    };
  }, [timeRemaining]);

  // 导航到闪购页面 /flash-sale.html
  const onNavigateToFlashSaleList = useCallback(() => {
    resolveLinkAndNavigate('/flash-sale.html');
  }, []);

  // 检查倒计时是否已过期，如果过期则不显示整个组件
  const isCountdownExpired = useMemo(() => {
    // 如果 timeRemaining 已经标记为过期，直接返回 true
    if (timeRemaining?.expired === true) {
      return true;
    }

    // 如果 timeRemaining 还未初始化且需要显示倒计时，检查一次是否已过期
    if (timeRemaining === null && showCountdown && countdownEndTime) {
      const remaining = calculateTimeRemaining();
      return remaining?.expired === true;
    }

    return false;
  }, [timeRemaining, showCountdown, countdownEndTime, calculateTimeRemaining]);

  // 如果倒计时已过期，隐藏整个组件
  if (isCountdownExpired) {
    return null;
  }

  // 如果数据为空且不在加载中，不显示组件
  if (!loading && productList.length === 0) {
    return null;
  }

  if (isFirstRender.current && loading && productList.length === 0) {
    return (
      <LinearGradient
        colors={['#FFE2CA', '#FF943D']}
        start={{x: 0, y: 0}}
        end={{x: 0.8, y: 0.6}}
        style={containerStyle}>
        {appearance === 'carousel' ? (
          <ShimmerSkeleton
            type={TYPE_SHIMMER_PRODUCTS}
            flatListContentContainerStyle={flatListContentContainerStyle}
          />
        ) : (
          <View />
        )}
      </LinearGradient>
    );
  }

  // 使用默认标题（如果没有提供）
  const displayTitle = moduleTitle || 'Flash Sale';
  const hasHeader = displayTitle || (showCountdown && formatCountdown);
  const hasProducts = productList.length > 0;

  return (
    <LinearGradient
      colors={['#FFE2CA', '#FF943D']}
      start={{x: 0, y: 0}}
      end={{x: 0.8, y: 0.6}}
      style={styles.container}>
      {/* 标题和倒计时 - 始终显示标题区域，即使没有倒计时 */}
      {hasHeader && (
        <CustomView
          row
          spaceBetween
          horizontalCenter
          paddingHorizontal={12}
          paddingVertical={12}>
          {/* 左侧：FLASHSALE 标题 - 图片 */}
          <CustomView row horizontalCenter flex={1}>
            <Image
              source={require('@app/assets/images/image.png')}
              style={{width: 150, height: 40, marginTop: -10}}
              resizeMode="contain"
            />
          </CustomView>

          {/* 右侧：倒计时和 Show All 按钮 */}
          <CustomView row horizontalCenter>
            {showCountdown && formatCountdown && (
              <LinearGradient
                colors={['#F26522', '#F6831F']}
                locations={[0, 0.9305]}
                start={{x: 0.043, y: 0.703}}
                end={{x: 0.957, y: 0.297}}
                style={styles.countdownContainer}>
                <CustomView row horizontalCenter>
                  {/* 小时 */}
                  <CustomView style={styles.countdownBox}>
                    <Text style={styles.countdownTime}>
                      {formatCountdown.hours}
                    </Text>
                  </CustomView>
                  {/* 冒号 */}
                  <Text style={styles.countdownColon}>:</Text>
                  {/* 分钟 */}
                  <CustomView style={styles.countdownBox}>
                    <Text style={styles.countdownTime}>
                      {formatCountdown.minutes}
                    </Text>
                  </CustomView>
                  {/* 冒号 */}
                  <Text style={styles.countdownColon}>:</Text>
                  {/* 秒 */}
                  <CustomView style={styles.countdownBox}>
                    <Text style={styles.countdownTime}>
                      {formatCountdown.seconds}
                    </Text>
                  </CustomView>

                  <TouchableOpacity
                    onPress={onNavigateToFlashSaleList}
                    style={styles.showAllButton}>
                    <Text style={styles.showAllText}>Show All {'>'}</Text>
                  </TouchableOpacity>
                </CustomView>
              </LinearGradient>
            )}
          </CustomView>
        </CustomView>
      )}

      {/* 产品列表 - 始终使用横向滚动，无论 appearance 设置 */}
      {hasProducts ? (
        <FlatList
          data={productList}
          horizontal={true}
          showsHorizontalScrollIndicator={false}
          nestedScrollEnabled={false}
          contentContainerStyle={[
            flatListContentContainerStyle,
            {
              paddingRight: 12, // 确保最后一个元素有右边距
            },
          ]}
          style={{
            flexGrow: 0,
            marginTop: 5,
          }}
          keyExtractor={(item, index) => {
            // 使用稳定的 key，包含 sku 和 special_to_date 以确保数据变化时能更新
            return `flash-sale-${item.sku || index}-${
              item.special_to_date || ''
            }-${index}`;
          }}
          renderItem={({item, index}) => (
            <View
              style={{
                width: itemWidth,
                marginRight: index < productList.length - 1 ? spaceBetween : 0,
                flexShrink: 0, // 防止收缩
                flexGrow: 0, // 防止增长
                flexBasis: itemWidth, // 设置基础宽度
              }}>
              <FlashSaleProductItemHorizontal
                item={item}
                index={index}
                itemWidth={itemWidth}
                onNavigateToProductDetail={onNavigateToProductDetail}
                onOpenVariantPopup={onOpenVariantPopup}
                endTime={countdownEndTime}
              />
            </View>
          )}
          initialNumToRender={5}
          maxToRenderPerBatch={5}
          windowSize={5}
          removeClippedSubviews={false}
          extraData={flatListExtraData}
        />
      ) : null}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    // 背景色已由 LinearGradient 处理
    marginTop: 20, // 顶部间距
    marginBottom: 20, // 底部间距
    paddingBottom: 16, // 容器底部留出间距
  },
  containerImage: {
    marginTop: normalize(-1),
  },
  paddingRegularHorizontal: {
    paddingLeft: 12,
    paddingRight: 12,
  },
  titleGradient: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  flashSaleTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.WHITE,
    letterSpacing: 1,
  },
  countdownContainer: {
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingLeft: normalize(8),
    paddingVertical: 6,
  },
  countdownBox: {
    backgroundColor: Colors.WHITE, // 白色数字框
    borderRadius: 4,
    paddingHorizontal: 2,
    paddingVertical: 4,
    width: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countdownTime: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Colors.BLACK, // 黑色数字
    fontFamily: 'monospace',
  },
  countdownColon: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Colors.WHITE, // 白色冒号
    marginHorizontal: 2,
  },
  showAllButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  showAllText: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.WHITE,
  },
});

export default FlashSaleWidget;
