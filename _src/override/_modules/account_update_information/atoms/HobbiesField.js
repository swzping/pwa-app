import React, {useEffect,useState} from 'react';
import {Modal, ScrollView,StyleSheet, TouchableOpacity, View} from 'react-native';

import {Button, Chip} from 'react-native-paper';
import Icon from 'react-native-vector-icons/Feather';

import CustomView from '@app/components/CustomView';
import Text from '@app/components/Text';
import {Colors} from '@app/styles';

const HobbiesField = ({value, onChange, error, label, hobbyCategories = []}) => {
  const [showModal, setShowModal] = useState(false);
  // 选中的爱好：{ [category]: [option1, option2] }
  const [selectedHobbiesMap, setSelectedHobbiesMap] = useState(() => {
    // 根据 value 初始化已选状态
    const initialMap = {};
    if (value && Array.isArray(value) && value.length > 0) {
      value.forEach(item => {
        if (item.category && item.selectedOptions && Array.isArray(item.selectedOptions)) {
          initialMap[item.category] = item.selectedOptions;
        }
      });
    }
    return initialMap;
  });

  // 当外部 value 改变时更新内部状态
  useEffect(() => {
    const initialMap = {};
    if (value && Array.isArray(value) && value.length > 0) {
      value.forEach(item => {
        if (item.category && item.selectedOptions && Array.isArray(item.selectedOptions)) {
          // 确保 category 和 selectedOptions 都正确设置，创建新数组避免引用问题
          initialMap[item.category] = [...item.selectedOptions];
        } else {
          console.warn('Invalid hobby item:', item);
        }
      });
    } else {
      console.log('Value is empty or invalid:', value);
    }
    setSelectedHobbiesMap(initialMap);
  }, [value]);

  // 当打开模态框时，确保状态同步
  useEffect(() => {
    if (showModal) {
      const initialMap = {};
      if (value && Array.isArray(value) && value.length > 0) {
        value.forEach(item => {
          if (item.category && item.selectedOptions && Array.isArray(item.selectedOptions)) {
            // 确保 category 名称匹配
            const categoryKey = item.category;
            initialMap[categoryKey] = [...item.selectedOptions];
          }
        });
      }
      setSelectedHobbiesMap(initialMap);
    }
  }, [showModal, value]);

  const toggleHobby = (category, option) => {
    setSelectedHobbiesMap(prev => {
      const currentOptions = prev[category] || [];

      // 精确匹配：后端返回什么就存什么，不做任何归一化/模糊匹配
      if (currentOptions.includes(option)) {
        // 移除选项
        return {
          ...prev,
          [category]: currentOptions.filter(o => o !== option),
        };
      } else {
        // 添加选项（原样保存后端提供的字符串）
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

    onChange(hobbiesToSave);
    setShowModal(false);
  };

  // 获取所有已选中的爱好用于显示
  const getAllSelectedHobbies = () => {
    const allSelected = [];
    Object.keys(selectedHobbiesMap).forEach(category => {
      selectedHobbiesMap[category].forEach(option => {
        allSelected.push({category, option});
      });
    });
    return allSelected;
  };

  const handleRemoveHobby = (category, option) => {
    setSelectedHobbiesMap(prev => {
      const currentOptions = prev[category] || [];
      const newOptions = currentOptions.filter(o => o !== option);
      if (newOptions.length === 0) {
        const newMap = {...prev};
        delete newMap[category];
        return newMap;
      }
      return {
        ...prev,
        [category]: newOptions,
      };
    });

    // 立即更新到父组件
    const updatedMap = {...selectedHobbiesMap};
    const currentOptions = updatedMap[category] || [];
    const newOptions = currentOptions.filter(o => o !== option);
    if (newOptions.length === 0) {
      delete updatedMap[category];
    } else {
      updatedMap[category] = newOptions;
    }

    const hobbiesToSave = Object.keys(updatedMap)
      .filter(cat => updatedMap[cat].length > 0)
      .map(cat => ({
        category: cat,
        selectedOptions: updatedMap[cat],
      }));
    onChange(hobbiesToSave);
  };

  const handleHobbieModalClose = () => {
    const initialMap = {};
    if (value && Array.isArray(value) && value.length > 0) {
      value.forEach(item => {
        if (item.category && item.selectedOptions && Array.isArray(item.selectedOptions)) {
          initialMap[item.category] = [...item.selectedOptions];
        }
      });
    }
    setSelectedHobbiesMap(initialMap);
    setShowModal(false);
  };

  return (
    <CustomView marginBottom={16}>
      <CustomView row horizontalCenter style={styles.header}>
        <Text style={styles.label}>{label || 'Interests'}</Text>
        {getAllSelectedHobbies().length > 0 && (
          <TouchableOpacity onPress={() => setShowModal(true)} style={styles.editButton}>
            <Icon name="edit-2" size={16} color={Colors.PRIMARY || '#FF8200'} />
            <Text style={styles.editText}>Edit</Text>
          </TouchableOpacity>
        )}
      </CustomView>

      {getAllSelectedHobbies().length > 0 ? (
        <View style={styles.chipsContainer}>
          {getAllSelectedHobbies().map((item, index) => (
            <View key={`${item.category}-${item.option}-${index}`} style={styles.chipWrapper}>
              <Chip
                style={styles.chip}
                textStyle={styles.chipText}
                onClose={() => handleRemoveHobby(item.category, item.option)}>
                {item.option}
              </Chip>
            </View>
          ))}
        </View>
      ) : (
        <TouchableOpacity
          style={[styles.input, error && styles.inputError]}
          onPress={() => setShowModal(true)}>
          <Text style={[styles.inputText, styles.placeholderText]}>
            Add your interests
          </Text>
          <Icon name="chevron-right" size={20} color={Colors.GRAY_DARK || '#666666'} />
        </TouchableOpacity>
      )}
      {error && <Text style={styles.errorText}>{error.message}</Text>}

      <Modal
        visible={showModal}
        transparent={true}
        animationType="slide"
        onRequestClose={handleHobbieModalClose}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <CustomView row horizontalCenter marginBottom={16}>
              <Text style={styles.modalTitle}>Interests</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={handleHobbieModalClose}>
                <Icon name="x" size={24} color="#333333" />
              </TouchableOpacity>
            </CustomView>

            <Text style={styles.modalSubtitle}>
              What Are You Into?
            </Text>
            <Text style={styles.modalDescription}>
              Tell us what you love for better recommendations.
            </Text>

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
              {hobbyCategories && hobbyCategories.length > 0 ? (
                hobbyCategories.map((item, categoryIndex) => {
                  const categoryName = item.category;
                  if (!categoryName) {return null;}

                  return (
                    <CustomView key={categoryIndex} marginBottom={24}>
                      <Text style={styles.categoryTitle}>{categoryName}</Text>
                      <View style={styles.hobbiesContainer}>
                        {item.options && item.options.length > 0 ? (
                          item.options.map((option, optionIndex) => {
                            // 获取该分类下已选中的选项
                            const selectedOptionsForCategory = selectedHobbiesMap[categoryName] || [];

                            // 精确匹配：后端返回什么就存什么
                            const isSelected = selectedOptionsForCategory.includes(option);

                            return (
                              <TouchableOpacity
                                key={`${categoryName}-${optionIndex}`}
                                style={[
                                  styles.hobbyTag,
                                  isSelected && styles.hobbyTagSelected,
                                ]}
                                onPress={() => toggleHobby(categoryName, option)}>
                                <Text
                                  style={[
                                    styles.hobbyText,
                                    isSelected && styles.hobbyTextSelected,
                                  ]}>
                                  {option}
                                </Text>
                              </TouchableOpacity>
                            );
                          })
                        ) : (
                          <Text style={styles.emptyText}>No options available</Text>
                        )}
                      </View>
                    </CustomView>
                  );
                })
              ) : (
                <CustomView marginTop={20}>
                  <Text style={styles.emptyText}>Loading hobbies...</Text>
                </CustomView>
              )}
            </ScrollView>

            <Button
              mode="contained"
              onPress={handleConfirm}
              style={styles.confirmButton}
              labelStyle={styles.confirmButtonText}
              disabled={getAllSelectedHobbies().length === 0}>
              Confirm
            </Button>
          </View>
        </View>
      </Modal>
    </CustomView>
  );
};

const styles = StyleSheet.create({
  header: {
    marginBottom: 8,
    justifyContent: 'space-between',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  editText: {
    fontSize: 14,
    color: Colors.PRIMARY || '#FF8200',
    textDecorationLine: 'underline',
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.GRAY_MEDIUM || '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#FFFFFF',
    minHeight: 60,
  },
  chipWrapper: {
    marginBottom: 8,
    position: 'relative',
  },
  primaryLabel: {
    position: 'absolute',
    top: -8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
    zIndex: 1,
    gap: 2,
  },
  primaryText: {
    fontSize: 10,
    color: Colors.PRIMARY || '#FF8200',
    fontWeight: '600',
  },
  chip: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: Colors.GRAY_MEDIUM || '#E0E0E0',
    marginRight: 8,
  },
  chipPrimary: {
    borderColor: Colors.PRIMARY || '#FF8200',
    borderWidth: 2,
  },
  chipText: {
    fontSize: 14,
    color: '#000000',
  },
  chipTextPrimary: {
    color: Colors.PRIMARY || '#FF8200',
    fontWeight: '600',
  },
  input: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: Colors.GRAY_MEDIUM || '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    minHeight: 48,
  },
  inputError: {
    borderColor: '#FF0000',
  },
  inputText: {
    fontSize: 16,
    color: '#000000',
    flex: 1,
  },
  placeholderText: {
    color: Colors.GRAY_DARK || '#999999',
  },
  errorText: {
    fontSize: 12,
    color: '#FF0000',
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFF8F0',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
    maxHeight: '90%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
    flex: 1,
    textAlign: 'center',
  },
  closeButton: {
    position: 'absolute',
    right: 0,
    top: 0,
    padding: 4,
  },
  modalSubtitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalDescription: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 24,
    textAlign: 'center',
  },
  scrollView: {
    maxHeight: 400,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 12,
  },
  hobbiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  hobbyTag: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
    marginBottom: 8,
  },
  hobbyTagSelected: {
    borderColor: Colors.PRIMARY || '#FF8200',
    backgroundColor: '#FFFFFF',
  },
  hobbyText: {
    fontSize: 14,
    color: '#666666',
  },
  hobbyTextSelected: {
    color: Colors.PRIMARY || '#FF8200',
    fontWeight: '600',
  },
  confirmButton: {
    marginTop: 20,
    backgroundColor: Colors.PRIMARY || '#FF8200',
    borderRadius: 8,
    paddingVertical: 4,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  emptyText: {
    fontSize: 14,
    color: Colors.GRAY_DARK || '#999999',
    textAlign: 'center',
    paddingVertical: 20,
  },
});

export default HobbiesField;

