import React from 'react';
import { StyleSheet, View } from 'react-native'; // 引入 View 和 StyleSheet
import CustomView from '@app/components/CustomView';
import { ActivityIndicator } from 'react-native-paper';
import { useReactiveVar } from '@apollo/client';
import { rxAppLoading } from '@app/services/cache';
import { Colors, Mixins } from '@app/styles';

export default function Loader({ loading: loadingProp = null }) {
  const loading = useReactiveVar(rxAppLoading);
  const loadingStatus = loadingProp !== null ? loadingProp : loading;

  if (!loadingStatus) {
    return null;
  }

  // 移除 Modal，改用 View，并使用 absolute 样式覆盖全屏
  return (
    <View style={[styles.container, { width: Mixins.MAX_WIDTH }]}>
      <CustomView
        flex
        horizontalCenter
        verticalCenter
        backgroundColor="#00000040"
        width="100%"
        height="100%"
      >
        <CustomView
          horizontalCenter
          verticalCenter
          borderRadius={15}
          width={100}
          height={100}
        >
          <ActivityIndicator color={Colors.PRIMARY} />
        </CustomView>
      </CustomView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999, 
    elevation: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
});