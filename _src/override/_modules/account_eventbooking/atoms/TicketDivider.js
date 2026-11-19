import React, {useState} from 'react';
import {Image, Platform, View} from 'react-native';

const TicketDivider = () => {
  const [middleWidth, setMiddleWidth] = useState(174);

  const dashWidth = 6;
  const count = middleWidth > 0 ? Math.floor(middleWidth / dashWidth) : 0;
  if (Platform.OS === 'ios') {
    return (
      <View
        style={{flex: 1, height: 89, flexDirection: 'row', overflow: 'hidden'}}
        onLayout={e => {
          const w = e.nativeEvent.layout.width;
          setMiddleWidth(w);
        }}>
        {Array.from({length: count}).map((_, i) => (
          <Image
            key={i}
            source={require('@app/assets/svg/ticket2.png')}
            style={{width: dashWidth, height: 89}}
          />
        ))}
      </View>
    );
  }

  return (
    <Image
      source={require('@app/assets/svg/ticket2.png')}
      style={{flex: 1, height: 89, resizeMode: 'repeat'}}
    />
  );
};

export default TicketDivider;
