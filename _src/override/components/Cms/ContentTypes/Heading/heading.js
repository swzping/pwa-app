import React from 'react';
import {
  Text,
  StyleSheet,
  View,
  ImageBackground,
  TouchableOpacity,
} from 'react-native';
import Svg, {Rect, Path} from 'react-native-svg';
import {parseRoundedClasses} from '@app/helpers/StyleUtils';
import {Colors} from '@app/styles';
import {navigate, resolveLinkAndNavigate} from '@app/helpers/Navigation';
import {modules} from '@root/swift.config';
import ArrowRight from '@app/assets/svgs/ArrowRight';

const RightArrowIcon = () => (
  <Svg width={17} height={17} viewBox="0 0 12 12" fill="none">
    <Rect width={12} height={12} rx={20} fill="#F6831F" />
    <Path
      d="M5 8L7 6L5 4"
      stroke="#FAFAFA"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const HeadingWidget = ({
  text,
  view_all_title = 'Show All',
  view_all_url,
  desktop_image,
  mobile_image,
  textAlign,
  color = '#000',
  hideViewAllText = false,
  cssClasses = [],
  isPLP = false,
}) => {
  const image = mobile_image || desktop_image;
  const hasBackgroundImage = !!image;

  const hasLeftBorder = cssClasses?.includes('guardian-run-heading');
  const voucherStyle = cssClasses?.includes('voucher-heading');
  const isPLPShowAll = isPLP && !!view_all_url;
  // 如果是 PLP 且已有 view_all_url，始终不渲染左侧标题，避免重复的黑色「Show All」
  const shouldRenderTitle = !isPLPShowAll;

  const backgroundImage = StyleSheet.flatten([
    styles.backgroundImage,
    parseRoundedClasses(cssClasses),
  ]);

  const handleShowAll = () => {
    // 如果是优惠券样式，直接跳转到优惠券列表页面，不使用 URL resolver
    if (voucherStyle) {
      navigate(modules.coupon_list.name);
    } else {
      resolveLinkAndNavigate(view_all_url);
    }
  };

  // PLP 专用 Show All 样式：仅展示右侧按钮
  if (isPLPShowAll) {
    return (
      <View style={styles.plpShowAllContainer}>
        <TouchableOpacity
          style={styles.plpShowAllButton}
          onPress={handleShowAll}>
          <Text style={styles.plpShowAllText}>
            {view_all_title || 'Show All'}
          </Text>
          <ArrowRight color={Colors.PRIMARY} />
        </TouchableOpacity>
      </View>
    );
  }

  const contentView = (
    <View
      style={[
        styles.contentContainer,
        hasBackgroundImage && styles.contentContainerWithBackground,
        {backgroundColor: 'transparent', borderWidth: 0},
        voucherStyle && {marginLeft: 8, paddingVertical: 11},
      ]}>
      {hasLeftBorder && <View style={[styles.boderLeftStyle]} />}

      {text && shouldRenderTitle && (
        <Text
          style={[
            styles.content,
            {textAlign, color},
            hasBackgroundImage && styles.contentWithBackground,
            cssClasses?.includes('text-white') && {color: '#FFF'},
            cssClasses?.includes('guardian-run-heading') && {paddingLeft: 10},
            cssClasses?.includes(
              'guardian-run-relevant-info-middle-heading',
            ) && {paddingTop: 10, paddingBottom: 5, fontSize: 19},
            voucherStyle && {fontSize: 18, fontWeight: 700},
          ]}>
          {text}
        </Text>
      )}

      {(voucherStyle || isPLPShowAll) && (
        <TouchableOpacity
          style={styles.voucherShowAllButton}
          onPress={handleShowAll}>
          <Text style={styles.voucherShowAllText}>
            {view_all_title || 'Show All'}
          </Text>
          {isPLPShowAll ? (
            <ArrowRight color={Colors.PRIMARY} />
          ) : (
            <RightArrowIcon />
          )}
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View
      style={[
        styles.container,
        cssClasses?.includes('guardian-run-heading') && {
          paddingTop: 0,
          paddingBottom: 10,
          backgroundColor: 'transparent',
        },
        hasBackgroundImage && {backgroundColor: '#F5F5F5'},
      ]}>
      {hasBackgroundImage ? (
        <ImageBackground
          source={{uri: image}}
          style={styles.backgroundContainer}
          imageStyle={backgroundImage}>
          {contentView}
        </ImageBackground>
      ) : (
        contentView
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginTop: 5,
    paddingHorizontal: 0,
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  plpShowAllContainer: {
    width: '100%',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'transparent',
    alignItems: 'flex-end',
  },
  plpShowAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 12,
  },
  plpShowAllText: {
    color: Colors.PRIMARY,
    fontSize: 14,
    fontWeight: '500',
    marginRight: 4,
  },
  backgroundContainer: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  contentContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: 'transparent',
    borderWidth: 0,
    borderColor: 'transparent',
    elevation: 0,
    shadowOpacity: 0,
  },
  boderLeftStyle: {
    borderLeftColor: '#FF8200',
    borderLeftWidth: 5,
    width: 5,
    height: '70%',
  },
  contentContainerWithBackground: {
    paddingHorizontal: 8,
    backgroundColor: 'transparent',
  },
  backgroundImage: {
    resizeMode: 'cover',
  },
  content: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  contentWithBackground: {
    color: '#FFF',
  },
  viewAllButton: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 20,
    marginLeft: 'auto',
    // shadowColor: '#ccc',
    // shadowOffset: {width: 0, height: 1},
    // shadowOpacity: 0.3,
  },
  viewAllButtonNoBackground: {
    backgroundColor: 'transparent',
    alignItems: 'flex-end',
    paddingRight: 0,
    marginRight: -8,
  },
  viewAllText: {
    fontSize: 12,
    color: Colors.PRIMARY,
  },
  iconCircle: {
    width: 12,
    height: 12,
    marginLeft: 5,
    borderRadius: 6,
    backgroundColor: Colors.PRIMARY,
    justifyContent: 'center',
    alignItems: 'center',
  },
  voucherShowAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginLeft: 'auto',
  },
  voucherShowAllText: {
    color: '#FF8200',
    fontSize: 14,
    fontWeight: '600',
    marginRight: 4,
  },
});

export default HeadingWidget;
