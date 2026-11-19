import React from 'react';
import { Modal, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { Colors, Mixins } from '@app/styles';

import CustomView from '@app/components/CustomView';
import Text from '@app/components/Text';
import RenderIf from '@app/components/RenderIf';

const ModalSort = ({
  show,
  data,
  title,
  selectedSort,
  onPressVisibleSort,
  onSelectSort,
}) => {
  const selectedIndex = selectedSort !== '' ? selectedSort : undefined;
  return (
    <Modal
      visible={show}
      transparent={true}
      animationType={'slide'}
      statusBarTranslucent
      onRequestClose={() => onPressVisibleSort(false)}>
      <CustomView flex row style={{ alignItems: 'flex-end' }}>
        <CustomView
          onPress={() => onPressVisibleSort(false)}
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
          }}
        />
        <CustomView
          column
          backgroundColor={Colors.WHITE}
          width={Mixins.MAX_WIDTH}
          paddingBottom={30}
          style={{
            borderTopLeftRadius: 10,
            borderTopRightRadius: 10,
            borderWidth: 0.2,
            borderColor: Colors.GRAY_LIGHT,
            borderBottomColor: 'white',
          }}>
          <CustomView
            row
            paddingVertical={12}
            verticalCenter
            horizontalCenter
            style={{
              borderBottomWidth: 1,
              borderBottomColor: Colors.GRAY_LIGHT,
            }}>
            <Text large bold>
              {title}
            </Text>
            <CustomView
              onPress={() => onPressVisibleSort(false)}
              style={{
                position: 'absolute',
                right: 10,
              }}>
              <Icon name="close-outline" size={34} color={Colors.BLACK} />
            </CustomView>
          </CustomView>
          <CustomView paddingLeft={10} backgroundColor={Colors.WHITE}>
            {data.items.map((item, index) => {
              const isLastItem = index === data.items.length - 1;
              return (
                <TouchableOpacity
                  key={`modal-sort-item-${index}`}
                  onPress={() => onSelectSort(index)}>
                  <CustomView
                    row
                    spaceBetween
                    paddingLeft={4}
                    paddingVertical={12}
                    verticalCenter
                    horizontalCenter
                    borderColor={Colors.GRAY_LIGHT}
                    style={{ borderBottomWidth: isLastItem ? 0 : 1 }}>
                    <Text>{item.label}</Text>
                    <RenderIf condition={selectedIndex === index}>
                      <Icon
                        name="checkmark-outline"
                        size={30}
                        color={Colors.PRIMARY}
                        style={{ marginRight: 10 }}
                      />
                    </RenderIf>
                  </CustomView>
                </TouchableOpacity>
              );
            })}
          </CustomView>
        </CustomView>
      </CustomView>
    </Modal>
  );
};

export default ModalSort;
