import React from 'react';
import {Text, View} from 'react-native';

import CustomView from '@app/components/CustomView';
import RenderIf from '@app/components/RenderIf';
import * as Colors from '@app/styles/colors';
import {normalize} from '@app/styles/mixins';

import {formatThousands} from '../services/util';

const removeAllRun = str => {
  return str?.replace(/run/gi, '');
};

export default function RemainingQuota({
  contentStyle = {},
  textOneStyle = {},
  textTwoStyle = {},
  gap = 16,
  label = '',
  labelStyle = {},
  data,
  type = 'one',
  marginLeft,
}) {
  if (type === 'one') {
    return (
      <View style={{minHeight: 98}}>
        <RenderIf condition={data?.length > 0}>
          <RenderIf condition={label}>
            <Text
              style={{
                marginTop: 22,
                marginLeft,
                fontSize: 16,
                fontWeight: '500',
                color: Colors.PRIMARY,
                lineHeight: 24,
                ...labelStyle,
              }}>
              {label}
            </Text>
          </RenderIf>
          <CustomView
            row
            verticalCenter
            marginTop={normalize(12)}
            paddingHorizontal={24}
            style={{gap}}>
            {data?.map((item, index) => (
              <CustomView
                key={index}
                horizontalCenter
                verticalCenter
                height={normalize(58)}
                style={{
                  minWidth: 92,
                  gap: 6,
                  paddingHorizontal: 8,
                  backgroundColor: Colors.WHITE,
                  borderWidth: 1,
                  borderRadius: 8,
                  borderColor: '#FFA12E',
                  ...contentStyle,
                }}>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: '600',
                    fontFamily: 'Quicksand',
                    color: Colors.PRIMARY,
                    lineHeight: 18,
                    ...textOneStyle,
                  }}>
                  {removeAllRun(item.label)}:
                </Text>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: '700',
                    fontFamily: 'Quicksand',
                    color: Colors.PRIMARY,
                    lineHeight: 16,
                    ...textTwoStyle,
                  }}>
                  {formatThousands(item.remaining_quota)}
                </Text>
              </CustomView>
            ))}
          </CustomView>
        </RenderIf>
      </View>
    );
  }

  return (
    <View style={{minHeight: 28}}>
      <RenderIf condition={data}>
        <CustomView
          verticalCenter
          marginTop={14}
          style={{
            height: 28,
            backgroundColor: Colors.PRIMARY,
            borderRadius: 8,
            alignSelf: 'center',
            paddingHorizontal: 12,
          }}>
          <Text
            style={{
              fontFamily: 'Quicksand',
              fontWeight: '700',
              fontSize: 14,
              lineHeight: 18,
              textAlign: 'center',
              color: '#ffffff',
            }}>
            {label}: {formatThousands(data)}
          </Text>
        </CustomView>
      </RenderIf>
    </View>
  );
}
