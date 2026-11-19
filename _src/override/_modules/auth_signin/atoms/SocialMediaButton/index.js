import React from 'react';
import {Image,Linking, StyleSheet, TouchableOpacity} from 'react-native';

import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';

import TiktokIcon from '@app/assets/svgs/Tiktok';
import {TIKTOK} from '@app/helpers/Constants';
import {Colors} from '@app/styles';

const SocialMediaButton = ({item}) => {
  // eslint-disable-next-line react/no-unstable-nested-components
  const Icon = () => {
    if (item.icon === TIKTOK) {
      return <TiktokIcon />;
    }
    if (item.img?.uri) {
      return (
        <Image
          source={{uri: item.img.uri}}
          style={{
            width: parseInt(item.img.width) || 40,
            height: parseInt(item.img.width) || 40,
          }}
        />
      );
    }
    return <FontAwesome5 name={item.icon} size={18} />;
  };

  const onPress = async () => {
    if (item?.url) {
      //TODO: 部分安卓机支持这个Linking.canOpenURL，先让所有设备直接跳转
      // eslint-disable-next-line no-unused-vars
      const isSupported = await Linking.canOpenURL(item?.url);
      // if (isSupported) {
      await Linking.openURL(item?.url);
      // }
    }
  };

  return (
    <TouchableOpacity style={styles.iconItem} onPress={onPress}>
      <Icon />
    </TouchableOpacity>
  );
};

export default SocialMediaButton;

const styles = StyleSheet.create({
  iconItem: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
    marginBottom: 10,
    backgroundColor: Colors.WHITE,
    borderRadius: 50,
  },
});
