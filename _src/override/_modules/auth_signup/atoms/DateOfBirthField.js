import React, {useEffect,useMemo, useRef, useState} from 'react';
import {FlatList,Modal, StyleSheet, TouchableOpacity, View} from 'react-native';

import Icon from 'react-native-vector-icons/Feather';

import CustomView from '@app/components/CustomView';
import Text from '@app/components/Text';
import DateHelper from '@app/helpers/Date';
import {Colors} from '@app/styles';

const MONTHS = [
  {label: 'Jan', value: 1}, {label: 'Feb', value: 2}, {label: 'Mar', value: 3},
  {label: 'Apr', value: 4}, {label: 'May', value: 5}, {label: 'Jun', value: 6},
  {label: 'Jul', value: 7}, {label: 'Aug', value: 8}, {label: 'Sep', value: 9},
  {label: 'Oct', value: 10}, {label: 'Nov', value: 11}, {label: 'Dec', value: 12},
];

const getDaysInMonth = (year, month) => {
  return new Date(year, month, 0).getDate();
};

const WHEEL_ITEM_HEIGHT = 44;
const WHEEL_VISIBLE_HEIGHT = 220;
const WHEEL_PADDING = (WHEEL_VISIBLE_HEIGHT - WHEEL_ITEM_HEIGHT) / 2;

/**
 * iOS 闹钟样式的滚轮选择器，FlatList 虚拟化保证滚动流畅
 */
const WheelPicker = React.memo(({items, selectedValue, onValueChange}) => {
  const listRef = useRef(null);
  const selectedIndex = Math.max(
    0,
    items.findIndex(it => it.value === selectedValue),
  );

  useEffect(() => {
    if (items.length === 0) {return;}
    const id = requestAnimationFrame(() => {
      listRef.current?.scrollToOffset({
        offset: selectedIndex * WHEEL_ITEM_HEIGHT,
        animated: false,
      });
    });
    return () => cancelAnimationFrame(id);
  }, [selectedValue, selectedIndex, items.length]);

  const handleScrollEnd = e => {
    const offsetY = e.nativeEvent.contentOffset.y;
    let index = Math.round(offsetY / WHEEL_ITEM_HEIGHT);
    index = Math.max(0, Math.min(index, items.length - 1));
    const item = items[index];
    if (!item) {return;}
    if (item.value !== selectedValue) {onValueChange(item.value);}
    const targetY = index * WHEEL_ITEM_HEIGHT;
    if (Math.abs(offsetY - targetY) > 2 && listRef.current) {
      listRef.current.scrollToOffset({offset: targetY, animated: false});
    }
  };

  const getItemLayout = (_, index) => ({
    length: WHEEL_ITEM_HEIGHT,
    offset: index * WHEEL_ITEM_HEIGHT,
    index,
  });

  const renderItem = ({item}) => (
    <View style={[styles.wheelItem, {height: WHEEL_ITEM_HEIGHT}]}>
      <Text style={styles.wheelItemText} numberOfLines={1}>
        {item.label}
      </Text>
    </View>
  );

  const keyExtractor = (it, i) => String(it.value ?? i);

  const snapToOffsets = useMemo(
    () => items.map((_, i) => i * WHEEL_ITEM_HEIGHT),
    [items.length],
  );

  return (
    <View style={[styles.wheelWrapper, {height: WHEEL_VISIBLE_HEIGHT}]}>
      <View style={styles.wheelHighlight} pointerEvents="none" />
      <FlatList
        ref={listRef}
        data={items}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        getItemLayout={getItemLayout}
        initialScrollIndex={Math.min(selectedIndex, Math.max(0, items.length - 1))}
        showsVerticalScrollIndicator={false}
        snapToOffsets={snapToOffsets}
        snapToAlignment="start"
        decelerationRate="normal"
        contentContainerStyle={{paddingVertical: WHEEL_PADDING}}
        onMomentumScrollEnd={handleScrollEnd}
        onScrollEndDrag={handleScrollEnd}
        removeClippedSubviews={true}
        maxToRenderPerBatch={8}
        windowSize={7}
        initialNumToRender={10}
      />
    </View>
  );
});

const DateOfBirthField = ({value, onChange, error, label, disabled = false, hideDescriptions = false}) => {
  const [show, setShow] = useState(false);
  const getDefaultDate = () => {
    const d = new Date();
    d.setFullYear(d.getFullYear() - 18);
    return d;
  };

  const parseInitial = () => {
    if (!value) {return getDefaultDate();}
    if (typeof value === 'string' && value.includes('/')) {
      return new Date(value.split('/').reverse().join('-'));
    }
    return new Date(value);
  };

  const [date, setDate] = useState(parseInitial);

  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const maxDate = new Date();
  maxDate.setFullYear(maxDate.getFullYear() - 17);

  const years = useMemo(() => {
    const maxYear = maxDate.getFullYear();
    const list = [];
    for (let y = maxYear; y >= maxYear - 120; y--) {
      list.push({ label: String(y), value: y });
    }
    return list;
  }, []);

  const months = useMemo(() => {
    if (year !== maxDate.getFullYear()) {
      return MONTHS;
    }
    return MONTHS.filter(m => m.value <= maxDate.getMonth() + 1);
  }, [year]);

  const days = useMemo(() => {
    let maxDay = getDaysInMonth(year, month);
    if (
      year === maxDate.getFullYear() &&
      month === maxDate.getMonth() + 1
    ) {
      maxDay = maxDate.getDate();
    }
    const list = [];
    for (let d = 1; d <= maxDay; d++) {
      list.push({ label: String(d), value: d });
    }
    return list;
  }, [year, month]);

  const safeSetDate = (y, m, d) => {
    const maxDay = getDaysInMonth(y, m);
    const clampedDay = Math.min(Math.max(1, d), maxDay);
    let newD = new Date(y, m - 1, clampedDay);
    if (newD > maxDate) {newD = maxDate;}
    setDate(newD);
  };

  const confirmDate = () => {
    const y = date.getFullYear();
    const m = date.getMonth() + 1;
    const d = date.getDate();
    const isoDate = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    onChange(isoDate);
    setShow(false);
  };

  // 格式化显示日期
  const getDisplayDate = () => {
    if (!value) {return null;}
    try {
      const d = new Date(value);
      if (isNaN(d.getTime())) {return value;} // 如果解析失败，原样返回
      return DateHelper.convert(d, ' ', { useMonthString: true });
    } catch (e) {
      return value;
    }
  };

  const displayDate = getDisplayDate();

  return (
    <CustomView marginBottom={16}>
      <View style={styles.labelContainer}>
        {label && label.includes('*') ? (
          <>
            <Text style={styles.label}>{label.split('*')[0]}</Text>
            <Text style={styles.requiredAsterisk}>*</Text>
          </>
        ) : (
      <Text style={styles.label}>{label}</Text>
        )}
      </View>
      <TouchableOpacity
        style={[
          styles.dateInput,
          error && styles.dateInputError,
          disabled && styles.dateInputDisabled,
        ]}
        onPress={() => !disabled && setShow(true)}
        disabled={disabled}
        activeOpacity={disabled ? 1 : 0.7}>
        <Text style={[
          styles.dateText,
          !value && styles.placeholderText,
          disabled && styles.dateTextDisabled,
        ]}>
          {displayDate || 'Day/Month/Year'}
        </Text>
        <Icon
          name="calendar"
          size={20}
          color={disabled ? (Colors.GRAY_MEDIUM || '#CCCCCC') : (Colors.GRAY_DARK || '#666666')}
        />
      </TouchableOpacity>
      {error && <Text style={styles.errorText}>{error.message}</Text>}

      {/* Info Text - 只在注册页面显示 */}
      {!hideDescriptions && (
        <>
      <CustomView row horizontalCenter marginTop={8} marginBottom={8}>
        <Icon name="info" size={14} color={Colors.GRAY_DARK || '#666666'} />
        <Text style={styles.infoText}>
          Once submitted, the birthday cannot be edited again.
        </Text>
      </CustomView>

      {/* Promotional Banner */}
      <CustomView style={styles.promoBanner} row horizontalCenter>
        <Icon name="award" size={20} color={Colors.PRIMARY || '#FF8200'} />
        <Text style={styles.promoText}>
          By entering your birthdate, you will receive a birthday gift on your birthday.
        </Text>
      </CustomView>
        </>
      )}

      <Modal
        visible={show}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShow(false)}
        statusBarTranslucent={true}
        presentationStyle="overFullScreen"
        supportedOrientations={['portrait', 'landscape']}>
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setShow(false)}
          />
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setShow(false)} hitSlop={{top: 12, bottom: 12, left: 12, right: 12}}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Select Date</Text>
              <TouchableOpacity onPress={confirmDate} hitSlop={{top: 12, bottom: 12, left: 12, right: 12}}>
                <Text style={styles.doneText}>Done</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.datePickerContainer}>
              <View style={styles.pickerRow}>
                <View style={styles.pickerWrap} testID="datePickerDay">
                  <WheelPicker
                    items={days}
                    selectedValue={day}
                    onValueChange={v => safeSetDate(year, month, v)}
                  />
                </View>
                <View style={styles.pickerWrap} testID="datePickerMonth">
                  <WheelPicker
                    items={months}
                    selectedValue={month}
                    onValueChange={v => safeSetDate(year, v, day)}
                  />
                </View>
                <View style={styles.pickerWrap} testID="datePickerYear">
                  <WheelPicker
                    items={years}
                    selectedValue={year}
                    onValueChange={v => safeSetDate(v, month, day)}
                  />
                </View>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </CustomView>
  );
};

const styles = StyleSheet.create({
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
  },
  requiredAsterisk: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF0000',
  },
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: Colors.GRAY_MEDIUM || '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    minHeight: 48,
  },
  dateInputError: {
    borderColor: '#FF0000',
  },
  dateInputDisabled: {
    backgroundColor: '#F5F5F5',
    borderColor: '#E0E0E0',
    opacity: 0.6,
  },
  dateText: {
    fontSize: 16,
    color: '#000000',
    flex: 1,
  },
  dateTextDisabled: {
    color: '#999999',
  },
  errorText: {
    fontSize: 12,
    color: '#FF0000',
    marginTop: 4,
  },
  placeholderText: {
    color: Colors.GRAY_DARK || '#999999',
  },
  infoText: {
    fontSize: 12,
    color: Colors.GRAY_DARK || '#666666',
    marginLeft: 6,
    flex: 1,
  },
  promoBanner: {
    backgroundColor: '#FFF8F0',
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#FFE7BA',
  },
  promoText: {
    fontSize: 12,
    color: '#000000',
    marginLeft: 8,
    flex: 1,
    lineHeight: 18,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 24,
    minHeight: 320,
    zIndex: 1,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -2},
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  cancelText: {
    fontSize: 16,
    color: Colors.PRIMARY || '#FF8200',
  },
  doneText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.PRIMARY || '#FF8200',
  },
  datePickerContainer: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    paddingHorizontal: 4,
  },
  pickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pickerWrap: {
    flex: 1,
    height: WHEEL_VISIBLE_HEIGHT,
  },
  wheelWrapper: {
    width: '100%',
    overflow: 'hidden',
  },
  wheelHighlight: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: (WHEEL_VISIBLE_HEIGHT - WHEEL_ITEM_HEIGHT) / 2,
    height: WHEEL_ITEM_HEIGHT,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(0,0,0,0.1)',
    backgroundColor: 'rgba(0,0,0,0.04)',
    zIndex: 1,
  },
  wheelItem: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  wheelItemText: {
    fontSize: 20,
    color: '#000000',
    fontWeight: '400',
  },
});

export default DateOfBirthField;

