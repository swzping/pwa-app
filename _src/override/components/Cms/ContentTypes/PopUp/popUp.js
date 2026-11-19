import React, {useEffect, useRef, useState} from 'react';
import {Modal, StyleSheet, TouchableOpacity, View} from 'react-native';

import {useIsFocused} from '@react-navigation/native';

import Vector from '@app/assets/svgs/Vertor';
import {useCmsContext} from '@app/components/Cms/CmsContext';
import RNFImage from '@app/components/Image';
import {resolveLinkAndNavigate} from '@app/helpers/Navigation';
import {trackPopupClick} from '@app/track';

const PopUpWidget = ({items = []}) => {
  const {isHomePage} = useCmsContext();
  const [open, setOpen] = useState(false);
  const isFocused = useIsFocused();
  const hasShownOnce = useRef(false);

  useEffect(() => {
    // 只在首页且页面聚焦时显示，并且只显示一次
    if (isHomePage && isFocused && items.length && !hasShownOnce.current) {
      setOpen(true);
      hasShownOnce.current = true;
    }

    // 离开首页时立即关闭 popup
    if (!isFocused && open) {
      setOpen(false);
    }
  }, [items, isHomePage, isFocused]);

  const handlePress = link => {
    if (link) {
      resolveLinkAndNavigate(link);
    }
    setOpen(false);
    trackPopupClick({
      jump_url: link,
      is_closed: 'enter',
    });
  };

  if (!open || !items.length) {
    return null;
  }

  const {link, image} = items[0] || {};

  if (!image) {
    return null;
  }

  return (
    <Modal
      visible={open}
      transparent
      animationType="fade"
      onRequestClose={() => setOpen(false)}>
      <View style={styles.overlay}>
        <View style={styles.dialog}>
          <TouchableOpacity
            style={styles.imgLink}
            activeOpacity={0.9}
            onPress={() => handlePress(link)}>
            <RNFImage source={image} style={styles.img} resizeMode="cover" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={() => {
              setOpen(false);
              trackPopupClick({
                jump_url: link,
                is_closed: 'close',
              });
            }}
            accessibilityLabel="close">
            <Vector />
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dialog: {
    position: 'relative',
    width: '85%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imgLink: {
    width: '90%',
    height: '80%',
    borderRadius: 15,
    overflow: 'hidden',
  },
  img: {
    width: '100%',
    height: '100%',
  },
  closeBtn: {
    position: 'absolute',
    top: '5%',
    right: '0.5%',
    width: '8%',
    height: '4%',
    borderRadius: 190,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  closeBtnText: {
    color: '#888',
    fontSize: 22,
    fontWeight: 'bold',
    lineHeight: 30,
  },
});

export default PopUpWidget;
