// import {normalize} from '@app/styles/mixins';
import React from 'react';
import {Image, Linking, Platform} from 'react-native';

import Share from 'react-native-share';

import CustomView from '@app/components/CustomView';
import {rxAppSnackbar} from '@app/services/cache';
import {trackProductShare} from '@app/track';

import {shouldUseSystemShareSheet} from './shareStrategy';
// import AntDesignIcon from 'react-native-vector-icons/AntDesign';
// import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
// import Text from '@app/components/Text';

// const ButtonIcon = ({type, defaultTitle}) => {
//   switch (type) {
//     case 'email':
//       return <AntDesignIcon name={'mail'} size={normalize(20)} />;
//     case 'instagram':
//       return <AntDesignIcon name={'instagram'} size={normalize(20)} />;
//     case 'whatsapp':
//       return <FontAwesomeIcon name={'whatsapp'} size={normalize(20)} />;
//     case 'facebook':
//       return <FontAwesomeIcon name={'facebook'} size={normalize(20)} />;
//     case 'twitter':
//       return <FontAwesomeIcon name={'twitter'} size={normalize(20)} />;
//     default:
//       return <Text bold>{defaultTitle}</Text>;
//   }
// };

const ShareButton = ({
  message = '',
  title,
  sku,
  url,
  type = null,
  // defaultTitle = 'SHARE',
}) => {
  const shareProduct = async () => {
    try {
      trackProductShare({
        location_name: url,
        sku_name: title,
        sku_id: sku,
      });
    } catch (error) {
      console.log('[err] trackProductShare', error);
    }

    let shareOptions = {
      title: `Share ${title}`,
      message: `${message} ${title} \n`,
      url,
      failOnCancel: false,
    };

    const useSystemShareSheet = shouldUseSystemShareSheet(Platform.OS, type);

    if (type && !useSystemShareSheet) {
      switch (type) {
        case 'email':
          shareOptions = {...shareOptions, social: Share.Social.EMAIL};
          break;
        case 'instagram':
          shareOptions = {...shareOptions, social: Share.Social.INSTAGRAM};
          break;
        case 'whatsapp':
          shareOptions = {...shareOptions, social: Share.Social.WHATSAPP};
          break;
        case 'facebook':
          shareOptions = {...shareOptions, social: Share.Social.FACEBOOK};
          break;
        case 'twitter':
          shareOptions = {...shareOptions, social: Share.Social.TWITTER};
          break;
        default:
          break;
      }
    }

    if (type === 'email') {
      try {
        const urlMailTo = `mailto:person@example.com?subject=${shareOptions.title}&body=${message} ${url}`;
        await Linking.openURL(urlMailTo);
      } catch (err) {
        console.log('[err] share', err);
      }
      return;
    }

    try {
      type && !useSystemShareSheet
        ? await Share.shareSingle(shareOptions)
        : await Share.open(shareOptions);
    } catch (err) {
      // 用户主动关闭分享弹窗，不显示错误提示
      // react-native-share 在 iOS/Android 用户取消分享时均抛出 'User did not share'
      if (err?.message === 'User did not share') {
        console.log('[share]',err?.message);
        return;
      }
      rxAppSnackbar({
        message: 'Failed to share, please try again later.',
      });
    }
  };

  return (
    <CustomView
      borderRadius={15}
      // padding={5}
      onPress={shareProduct}
      style={{marginLeft: 5}}>
      {/*<ButtonIcon type={type} defaultTitle={defaultTitle} />*/}
      <Image
        source={require('@app/assets/images/sharing_icon.png')}
        style={{width: 24, height: 24, top: 3}}
      />
    </CustomView>
  );
};

export default ShareButton;
