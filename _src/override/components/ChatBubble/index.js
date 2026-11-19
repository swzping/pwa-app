import React from 'react';
import {Mixins} from '@app/styles';
import {Image, Linking} from 'react-native';
import {CHAT_WHATSAPP_URL} from '@app/helpers/Constants';
import CustomView from '@app/components/CustomView';

const ChatBubble = () => {
  return (
    <CustomView
      onPress={() => Linking.openURL(CHAT_WHATSAPP_URL)}
      style={{
        position: 'absolute',
        bottom: 0,
        right: 10,
        width: Mixins.MAX_WIDTH * 0.3,
        alignItems: 'flex-end',
      }}>
      <Image
        source={require('@app/assets/images/tanya-dokter.png')}
        resizeMode="contain"
        style={{width: Mixins.MAX_WIDTH * 0.3, height: 50}}
      />
    </CustomView>
  );
};

export default ChatBubble;
