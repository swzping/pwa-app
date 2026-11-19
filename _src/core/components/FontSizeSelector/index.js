import {useReactiveVar} from '@apollo/client';
import CustomView from '@app/components/CustomView';
import CustomText from '@app/components/Text';
import RenderIf from '@app/components/RenderIf';
import {DARK, LARGE, MEDIUM, SMALL} from '@app/helpers/Constants';
import {Storage} from '@app/helpers/Storage';
import {rxUserFontSize, rxUserTheme} from '@app/services/cache';
import {Colors, Mixins} from '@app/styles';
import {normalize} from '@app/styles/mixins';
import React, {useState} from 'react';
import {Text} from 'react-native';
import RadioButton from '@app/components/RadioButton';

const fontSizeItemList = [SMALL, MEDIUM, LARGE];

const ItemLine = ({selectedFontSize, index}) => {
  const scheme = useReactiveVar(rxUserTheme);
  let inactiveBorderDarkThemeColor =
    scheme === DARK ? Colors.WHITE : Colors.BLACK;

  return (
    <CustomView
      height={2}
      borderColor={
        selectedFontSize ? Colors.PRIMARY : inactiveBorderDarkThemeColor
      }
      flex
      style={{
        alignSelf: 'center',
        //  marginTop: normalize(25)
        marginBottom: 17,
      }}
    />
  );
};

const FontSizeItem = ({sizeItem, selectedFontSize, setUserFontSize}) => {
  const scheme = useReactiveVar(rxUserTheme);

  const {size, label} = sizeItem;

  return (
    <CustomView
      horizontalCenter
      verticalCenter
      marginVertical={3}
      onPress={() => setUserFontSize(size)}>
      <RadioButton
        selected={selectedFontSize === size}
        size={normalize(20)}
        activeColor={Colors.PRIMARY}
      />
      <Text
        style={{
          color: scheme === DARK ? Colors.WHITE : Colors.BLACK,
        }}>
        {label[0]}
      </Text>
    </CustomView>
  );
};

const SampleText = ({selectedFontSize}) => {
  const scheme = useReactiveVar(rxUserTheme);
  return (
    <CustomView
      width={Mixins.MAX_WIDTH * 0.9}
      borderRadius={25}
      borderColor={Colors.GRAY_MEDIUM}
      horizontalCenter
      verticalCenter
      padding={20}
      marginVertical={20}>
      <Text
        style={{
          fontSize: normalize(16) * selectedFontSize,
          color: scheme === 'dark' ? Colors.WHITE : Colors.BLACK,
        }}>
        The quick brown fox jumps over the lazy dog
      </Text>
    </CustomView>
  );
};

export default function FontSizeSelector() {
  const userFontSize = useReactiveVar(rxUserFontSize);
  const [selectedFontSize, setSelectedFontSize] = useState(userFontSize);

  const setUserFontSize = size => {
    rxUserFontSize(size);
    setSelectedFontSize(size);
    Storage.set(Storage.name.USER_FONT_SIZE, size);
  };

  return (
    <CustomView horizontalCenter verticalCenter horizontalStart>
      <CustomView horizontalStart padding={20}>
        <CustomText large>Font Size</CustomText>
        <SampleText selectedFontSize={selectedFontSize} />
      </CustomView>
      <CustomView
        horizontalCenter
        verticalCenter
        row
        width="100%"
        spaceAround
        paddingHorizontal={30}
        paddingVertical={10}>
        {fontSizeItemList.map((fontSizeItem, index) => {
          return (
            <>
              <FontSizeItem
                sizeItem={fontSizeItem}
                selectedFontSize={selectedFontSize}
                setUserFontSize={setUserFontSize}
              />
              <RenderIf condition={index !== fontSizeItemList.length - 1}>
                <ItemLine />
              </RenderIf>
            </>
          );
        })}
      </CustomView>
    </CustomView>
  );
}
