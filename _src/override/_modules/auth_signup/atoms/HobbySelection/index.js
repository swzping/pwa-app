import React, {useState} from 'react';
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import {useSafeAreaInsets} from 'react-native-safe-area-context';

import Shimmer from '@app/components/_Shimmer';

import styles from './styles';

const HobbySelection = ({
  onConfirm,
  onSkip,
  tempToken,
  hobbyCategories = [],
  initialHobbies = [],
  loading = false,
  hobbyLoading = false,
}) => {
  // 选中的爱好：{ [category]: [option1, option2] }
  const [selectedHobbiesMap, setSelectedHobbiesMap] = useState(() => {
    // 根据 initialHobbies 初始化已选状态
    const initialMap = {};
    if (initialHobbies && Array.isArray(initialHobbies)) {
      initialHobbies.forEach(item => {
        if (item.category && item.selectedOptions) {
          initialMap[item.category] = item.selectedOptions;
        }
      });
    }
    return initialMap;
  });
  const insets = useSafeAreaInsets();

  const toggleHobby = (category, option) => {
    setSelectedHobbiesMap(prev => {
      const currentOptions = prev[category] || [];
      if (currentOptions.includes(option)) {
        return {
          ...prev,
          [category]: currentOptions.filter(o => o !== option),
        };
      } else {
        return {
          ...prev,
          [category]: [...currentOptions, option],
        };
      }
    });
  };

  const handleConfirm = () => {
    // 转换成后端要求的格式
    const hobbiesToSave = Object.keys(selectedHobbiesMap)
      .filter(category => selectedHobbiesMap[category].length > 0)
      .map(category => ({
        category: category,
        selectedOptions: selectedHobbiesMap[category],
      }));

    if (onConfirm) {
      onConfirm(hobbiesToSave);
    }
  };

  const handleSkip = () => {
    if (onSkip) {
      onSkip();
    }
  };

  // 渲染骨架屏
  const renderSkeleton = () => {
    return (
      <View style={styles.container}>
        <View style={styles.contentWrapper}>
          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            showsVerticalScrollIndicator={false}>
            {/* Title */}
            <Text style={styles.title}>What Are You Into?</Text>
            <Text style={styles.subtitle}>
              Tell us what you love for better recommendations.
            </Text>

            {/* Skeleton Categories */}
            {[0, 1, 2].map(categoryIndex => (
              <View key={categoryIndex} style={styles.categoryContainer}>
                {/* Category Title Skeleton */}
                <Shimmer
                  wrapperStyle={{
                    height: 18,
                    width: 150,
                    borderRadius: 4,
                    marginBottom: 16,
                  }}
                />
                {/* Hobby Buttons Skeleton */}
                <View style={styles.hobbyGrid}>
                  {[0, 1, 2, 3, 4, 5].map(optionIndex => (
                    <Shimmer
                      key={optionIndex}
                      wrapperStyle={{
                        height: 44,
                        width: 100,
                        borderRadius: 12,
                        margin: 6,
                      }}
                    />
                  ))}
                </View>
              </View>
            ))}
          </ScrollView>

          {/* Fixed Bottom Buttons */}
          <View
            style={[
              styles.bottomContainer,
              {paddingBottom: Math.max(insets.bottom, 20)},
            ]}>
            {/* Confirm Button Skeleton */}
            <Shimmer
              wrapperStyle={{
                height: 56,
                width: '100%',
                borderRadius: 12,
                marginBottom: 12,
              }}
            />
            {/* Skip Link Skeleton */}
            <Shimmer
              wrapperStyle={{
                height: 20,
                width: 100,
                borderRadius: 4,
                alignSelf: 'center',
              }}
            />
          </View>
        </View>
      </View>
    );
  };

  // 如果正在加载且没有数据，显示骨架屏
  if (hobbyLoading && hobbyCategories.length === 0) {
    return renderSkeleton();
  }

  return (
    <View style={styles.container}>
      <View style={styles.contentWrapper}>
        <ScrollView
          contentContainerStyle={{
            ...styles.scrollContainer,
            paddingBottom: 160 + insets.bottom,
          }}
          showsVerticalScrollIndicator={false}>
          {/* Title */}
          <Text style={styles.title}>What Are You Into?</Text>
          <Text style={styles.subtitle}>
            Tell us what you love for better recommendations.
          </Text>

          {/* Hobby Categories */}
          {hobbyCategories.map((item, categoryIndex) => {
            // 兼容后端可能的 key 错误 (例如示例中的 Deodorant: "Skincare")
            const categoryName = item.category || item.Deodorant;
            if (!categoryName) {return null;}

            return (
              <View key={categoryIndex} style={styles.categoryContainer}>
                <Text style={styles.categoryTitle}>{categoryName}</Text>
                <View style={styles.hobbyGrid}>
                  {item.options.map((option, optionIndex) => {
                    const isSelected = (
                      selectedHobbiesMap[categoryName] || []
                    ).includes(option);
                    return (
                      <TouchableOpacity
                        key={optionIndex}
                        style={[
                          styles.hobbyButton,
                          isSelected && styles.hobbyButtonSelected,
                        ]}
                        onPress={() => toggleHobby(categoryName, option)}>
                        <Text
                          style={[
                            styles.hobbyButtonText,
                            isSelected && styles.hobbyButtonTextSelected,
                          ]}>
                          {option}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            );
          })}
        </ScrollView>

        {/* Fixed Bottom Buttons */}
        <View
          style={[
            styles.bottomContainer,
            {paddingBottom: Math.max(insets.bottom, 20)},
          ]}>
          {/* Confirm Button */}
          <TouchableOpacity
            style={[
              styles.confirmButton,
              loading && styles.confirmButtonDisabled,
            ]}
            onPress={handleConfirm}
            disabled={loading}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              {loading && (
                <ActivityIndicator
                  color="#FFFFFF"
                  size="small"
                  style={{marginRight: 8}}
                />
              )}
              <Text style={styles.confirmButtonText}>Confirm</Text>
            </View>
          </TouchableOpacity>

          {/* Skip Link */}
          <TouchableOpacity
            style={styles.skipButton}
            onPress={handleSkip}
            disabled={loading}>
            <Text style={styles.skipButtonText}>Skip for now</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default HobbySelection;
