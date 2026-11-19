import React from 'react';
import {Dimensions, StyleSheet,View} from 'react-native';

import styles from '@app/_modules/account_milestone/styles';
import Shimmer from '@app/components/_Shimmer/index';
import CustomView from '@app/components/CustomView/index';
import Text from '@app/components/Text';

const {width: screenWidth} = Dimensions.get('window');
const PRODUCT_IMAGE_HEIGHT = screenWidth * 0.4 * 0.9;

const AtomShimmerMilestone = () => {
  return (
    <View style={localStyles.wrapper}>
      {/* 顶部标题和描述 */}
      <View style={styles.headerSection}>
        <Text style={styles.headerTitle}>Milestone</Text>
        <Text style={styles.headerDesc}>
          Complete tasks to earn points and unlock exclusive rewards.
        </Text>
      </View>

      {/* Progress Card */}
      <View style={styles.progressCard}>
        <View style={styles.progressHeaderRow}>
          <Text style={styles.progressTitle}>Your Progress</Text>
          <Shimmer wrapperStyle={{height: 28, width: 60, borderRadius: 16}} />
        </View>
        <Shimmer
          wrapperStyle={{
            height: PRODUCT_IMAGE_HEIGHT,
            width: '100%',
            borderRadius: 12,
            marginBottom: 12,
          }}
        />
        <CustomView row marginBottom={8} style={localStyles.progressBar}>
          <Shimmer wrapperStyle={{flex: 1, height: 10, marginHorizontal: 4, borderRadius: 5}} />
          <Shimmer wrapperStyle={{flex: 1, height: 10, marginHorizontal: 4, borderRadius: 5}} />
          <Shimmer wrapperStyle={{flex: 1, height: 10, marginHorizontal: 4, borderRadius: 5}} />
          <Shimmer wrapperStyle={{flex: 1, height: 10, marginHorizontal: 4, borderRadius: 5}} />
        </CustomView>
        <View style={styles.progressFooterRow}>
          <Text style={styles.progressFooterText}>
            Complete All Tasks to Unlock Your Rewards
          </Text>
          {/* <Shimmer wrapperStyle={{height: 13, width: 36}} /> */}
        </View>
      </View>

      {/* Task List */}
      <CustomView padding={16} style={localStyles.taskCard}>
        <View style={styles.taskHeaderRow}>
          <Text style={styles.taskTitle}>Your Tasks</Text>
        </View>
        {[1, 2, 3, 4, 5].map((_, i) => (
          <CustomView row paddingVertical={11} key={i}>
            <Shimmer wrapperStyle={{width: 44, height: 44, borderRadius: 22, marginRight: 14}} />
            <CustomView flex>
              <Shimmer wrapperStyle={{height: 14, width: '85%'}} />
              <CustomView marginTop={6}>
                <Shimmer wrapperStyle={{height: 12, width: '60%'}} />
              </CustomView>
            </CustomView>
            <Shimmer wrapperStyle={{height: 32, width: 62, borderRadius: 12}} />
          </CustomView>
        ))}
      </CustomView>
    </View>
  );
};

const localStyles = StyleSheet.create({
  wrapper: {},
  progressBar: {
    alignItems: 'center',
  },
  taskCard: {
    marginTop: 16,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
  },
});

export default AtomShimmerMilestone;
