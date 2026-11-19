import React, {useRef,useState} from 'react';
import {FlatList, Modal,StyleSheet, TouchableOpacity, View} from 'react-native';

import Icon from 'react-native-vector-icons/Feather';

import Text from '@app/components/Text';


const countryCodes = [
  {code: '+62'},
];

const CountryCodePicker = ({selectedCode, onSelectCode, textStyleProp}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({x: 0, y: 0, width: 80});
  const containerRef = useRef(null);

  const handleSelect = code => {
    onSelectCode(code);
    setShowDropdown(false);
  };

  const handleOpen = () => {
    if (containerRef.current) {
      containerRef.current.measure((x, y, width, height, pageX, pageY) => {
        setDropdownPosition({
          x: pageX,
          y: pageY + height + 4,
          width: width,
        });
        setShowDropdown(true);
      });
    } else {
      setShowDropdown(true);
    }
  };

  return (
    <>
      <TouchableOpacity
        ref={containerRef}
        style={[styles.container, textStyleProp]}
        onPress={handleOpen}>
        <Text style={styles.codeText}>{selectedCode || '+84'}</Text>
        <Icon name="chevron-down" size={16} color="#666666" />
      </TouchableOpacity>

      <Modal
        visible={showDropdown}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDropdown(false)}>
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowDropdown(false)}>
          <View
            style={[
              styles.dropdown,
              {
                left: dropdownPosition.x,
                top: dropdownPosition.y,
                width: dropdownPosition.width,
              },
            ]}
            onStartShouldSetResponder={() => true}>
            <FlatList
              data={countryCodes}
              keyExtractor={item => item.code}
              nestedScrollEnabled={true}
              style={styles.list}
              renderItem={({item}) => (
                <TouchableOpacity
                  style={[
                    styles.dropdownItem,
                    selectedCode === item.code && styles.selectedItem,
                  ]}
                  onPress={() => handleSelect(item.code)}>
                  <Text style={styles.dropdownText}>{item.code}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 14,
    marginRight: 6,
    backgroundColor: '#FAFAFA',
    minWidth: 80,
  },
  codeText: {
    fontSize: 14,
    color: '#333333',
    marginRight: 25,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  dropdown: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    maxHeight: 200,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 10,
  },
  list: {
    maxHeight: 200,
  },
  dropdownItem: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  selectedItem: {
    backgroundColor: '#FFF8F0',
  },
  dropdownText: {
    fontSize: 16,
    color: '#333333',
  },
});

export default CountryCodePicker;

