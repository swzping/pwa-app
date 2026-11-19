import React from 'react';
import {Image, Text} from 'react-native';

import Svg, {Path} from 'react-native-svg';

import CustomView from '@app/components/CustomView';
import {formatDateBy} from '@app/helpers/General';
import * as Colors from '@app/styles/colors';

const Ticket = ({
  width = '100%',
  height = 82,
  BgComponent,
  titleStyle,
  codeAlign = 'flex-end',
  data,
  onPress,
}) => {
  return (
    <CustomView
      marginBottom={16}
      width={width}
      height={height}
      style={{position: 'relative'}}
      onPress={onPress}>
      {BgComponent}
      <CustomView
        row
        spaceBetween
        padding={6}
        marginTop={6}
        marginHorizontal={20}
        borderRadius={4}
        backgroundColor={'#FFF8E8'}>
        <CustomView>
          <Text
            style={{
              fontSize: 16,
              fontWeight: '700',
              color: Colors.PRIMARY,
              ...titleStyle,
            }}>
            {data.event_name}
          </Text>
          <Text
            style={{
              marginTop: 4,
              fontSize: 10,
              fontWeight: '500',
              color: '#BDBDBD',
            }}>
            Event Date: {formatDateBy(data.event_date_time, 'yyyy M-d')}
          </Text>
        </CustomView>
        {data.image_url && (
          <Image
            source={{uri: data.image_url}}
            style={{
              width: 42,
              height: 'auto',
              resizeMode: 'contain',
            }}
          />
        )}
      </CustomView>
      <CustomView row marginTop={4} marginHorizontal={20}>
        <Svg height={2} width="100%" viewBox="0 0 271 1" fill="none">
          <Path
            d="M0 0.362793H271"
            stroke="#E0E0E0"
            strokeWidth={0.725539}
            strokeDasharray="5.08 5.08"
          />
        </Svg>
      </CustomView>
      <CustomView row marginHorizontal={20} style={{justifyContent: codeAlign}}>
        <Text
          style={[
            {
              fontSize: 12,
              fontWeight: '500',
              color: '#BDBDBD',
            },
            codeAlign === 'center' && {flex: 1},
          ]}
          numberOfLines={1}
          ellipsizeMode="tail">
          Unique Code:{' '}
          <Text style={{fontWeight: '700', color: Colors.PRIMARY}}>
            {data.ticket_code}
          </Text>
        </Text>
      </CustomView>
    </CustomView>
  );
};

export default Ticket;
