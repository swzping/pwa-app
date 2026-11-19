import React from 'react';
import {Image, Text, TouchableOpacity, View} from 'react-native';

import {Appbar} from 'react-native-paper';
import {SafeAreaView} from 'react-native-safe-area-context';
import {LocalSvg} from 'react-native-svg/css';

import {useNavigation} from '@react-navigation/native';

import PropTypes from 'prop-types';

import BackgroundGradientNew from '@app/assets/svgs/BackgroundGradientNew';
import GIcon from '@app/assets/svgs/G';
import CmsBlock from '@app/components/CmsBlock';
import CustomView from '@app/components/CustomView';
import {ICONS_CONFIG} from '@app/components/LoyaltyCard/iconsConfig';
import styles from '@app/components/NavBar/styles';
import {Colors} from '@app/styles';
import {MAX_WIDTH} from '@app/styles/mixins';

const ICONS_SOURCE = require('@app/assets/svg/icons.png');
const SHOW_BACKGROUND_COINS = false;

const NavBar = ({
  center = false,
  useLogo = false,
  useBack = false,
  useClose = false,
  useBackPress,
  useSearch = false,
  childrenRight,
  title,
  // titleBold = true,
  // titleStyle,
  // subtitle,
  stylesContainer = {},
  useWhite = false,
  useShadow = true,
  useCmsHeader = null,
  bgColor = null,
  logoColor = null,
  closeColor,
  backColor,
  backgroundColor = Colors.ORANGE,
}) => {
  /**
   * ---------------------------------------------------- *
   * @var {hooks}
   * ---------------------------------------------------- *
   */
  const navigation = useNavigation();

  const handleBackPress = () => {
    if (useBackPress) {
      useBackPress();
      return;
    }
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  if (useLogo || useSearch) {
    const cmsHeader = useCmsHeader || (
      <SafeAreaView
        edges={['top']}
        style={{backgroundColor: backgroundColor}}>
        <CmsBlock identifier="hello-banner" noPadding />
      </SafeAreaView>
    );

    return (
      <>
        {cmsHeader}
        <Appbar.Header
          statusBarHeight={0}
          style={[
            {
              backgroundColor: 'transparent',
              flexDirection: 'column',
              height: 56,
              elevation: 0,
              overflow: 'hidden',
            },
            stylesContainer,
          ]}>
          <View
            pointerEvents="none"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 0,
            }}>
            {bgColor || <BackgroundGradientNew />}
          </View>
          {/* icons.png 装饰层 - 只在首页使用，固定在 NavBar 上方 */}
          {SHOW_BACKGROUND_COINS && useLogo && !bgColor ? (
            <View
              pointerEvents="none"
              style={{
                position: 'absolute',
                top: ICONS_CONFIG.TOP,
                left: ICONS_CONFIG.LEFT,
                right: 0,
                height: ICONS_CONFIG.HEIGHT,
                zIndex: ICONS_CONFIG.Z_INDEX,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Image
                source={ICONS_SOURCE}
                style={{
                  width: ICONS_CONFIG.WIDTH,
                  height: ICONS_CONFIG.HEIGHT,
                }}
                resizeMode="contain"
              />
            </View>
          ) : null}
          <CustomView style={[styles.frameNavbar, {zIndex: 3}]}>
            {useBack && (
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <Image
                  source={require('@app/assets/images/arrow_back.png')}
                  style={{width: 28, height: 28}}
                />
              </TouchableOpacity>
              // <Appbar.BackAction
              //   color={Colors.WHITE}
              //   onPress={() => navigation.goBack()}
              // />
            )}
            {!useBack && (
              <CustomView
                style={
                  useLogo ? styles.frameBackButtonLogo : styles.frameBackButton
                }>
                <GIcon
                  width={20}
                  height={25}
                  color={logoColor || Colors.WHITE}
                />
              </CustomView>
            )}
            <CustomView
              style={
                useLogo
                  ? styles.frameRightChildrenLogo
                  : styles.frameRightChildren
              }>
              {childrenRight}
            </CustomView>
          </CustomView>
        </Appbar.Header>
      </>
    );
  }

  return (
    <>
      <Appbar.Header
        style={[
          {
            backgroundColor: useWhite ? Colors.WHITE : Colors.BLACK,
            // 去掉阴影，统一改为底部细线
            elevation: 0,
            shadowOpacity: 0,
            shadowColor: 'transparent',
            borderBottomWidth: useWhite ? 1 : 0,
            borderBottomColor: '#E0E0E0',
            height: 56,
          },
          stylesContainer,
        ]}>
        {useBack && (
          <TouchableOpacity
            onPress={handleBackPress}
            style={{paddingRight: 10}}>
            <LocalSvg
              asset={require('@app/assets/svg/arrowLeft.svg')}
              width={28}
              height={28}
              color={backColor || stylesContainer.color || Colors.BLACK}
            />
          </TouchableOpacity>
        )}
        {useClose && <Appbar.Action icon="close" color={closeColor || Colors.BLACK} onPress={handleBackPress} />}
        {/*<Appbar.Content*/}
        {/*  title={title}*/}
        {/*  titleStyle={[getTitleStyle, titleStyle]}*/}
        {/*  style={center && centerTitleStyle}*/}
        {/*  subtitle={subtitle}*/}
        {/*  color={useWhite ? Colors.BLACK : Colors.WHITE}*/}
        {/*/>*/}
        <Text
          style={{
            fontSize: 17,
            fontWeight: '500',
            color: stylesContainer.color || Colors.BLACK,
            // paddingLeft: 100,
            width: useClose || useBack ? (MAX_WIDTH / 10) * 8 : MAX_WIDTH,
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
          }}>
          {title}
        </Text>
        {center && !childrenRight ? (
          <CustomView width={'12%'} />
        ) : (
          childrenRight
        )}
      </Appbar.Header>
    </>
  );
};

NavBar.propTypes = {
  // use for center title
  center: PropTypes.bool,
  // use for displaying logo or not
  useLogo: PropTypes.bool,
  // use for displaying back button or not
  useBack: PropTypes.bool,
  // use for displaying close button or not
  useClose: PropTypes.bool,
  // use for displaying search can be input:true or touch:false
  useSearch: PropTypes.bool,
  // use for embed some component in right side
  childrenRight: PropTypes.element,
  // use for displaying title,
  title: PropTypes.string,
  // use for styling title,
  titleStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  // use for displaying subtitle,
  subtitle: PropTypes.string,
  // use for styling container header,
  stylesContainer: PropTypes.object,
  // use for background color to white or not
  useWhite: PropTypes.bool,
  // use for shadow header or not
  useShadow: PropTypes.bool,
};

export default NavBar;
