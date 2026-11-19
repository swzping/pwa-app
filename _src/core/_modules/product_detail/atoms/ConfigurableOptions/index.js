import React, {useEffect} from 'react';

import Text from '@app/components/Text';
import CustomView from '@app/components/CustomView';
import {Mixins, Colors} from '@app/styles';
import {normalize} from '@app/styles/mixins';

import {StyleSheet} from 'react-native';
import {useReactiveVar} from '@apollo/client';
import {rxUserTheme} from '@app/services/cache';

const ConfigurableOptions = ({
  product,
  setSku,
  selectedColor,
  selectedSize,
  setSelectedColor,
  setSelectedSize,
}) => {
  const scheme = useReactiveVar(rxUserTheme);

  //issue : if selectedSize & color state is placed inside this component -> after rerender selectedColor & size reset to null
  useEffect(() => {
    if (selectedSize && selectedColor) {
      product?.variants?.map(variant => {
        if (
          variant.product.sku ===
            [product.sku, selectedSize, selectedColor].join('-') ||
          variant.product.sku ===
            [product.sku, selectedColor, selectedSize].join('-')
        ) {
          setSku(variant.product.sku);
        }
      });
    }
  }, [selectedColor, selectedSize]);

  const selectedBorder =
    scheme === 'dark' ? 'rgba(255,255,255, 0.7)' : 'rgba(0,0,0, 0.7)';
  const unselectedBorder =
    scheme === 'dark' ? 'rgba(255,255,255, 0.4)' : 'rgba(0,0,0, 0.4)';

  if (product.__typename === 'ConfigurableProduct') {
    const configurableOptions = product.configurable_options;
    return (
      <CustomView marginVertical={10}>
        {configurableOptions.map(option => {
          return (
            <CustomView horizontalStart key={option.id}>
              <Text
                style={{
                  paddingHorizontal: normalize(20),
                  marginTop: normalize(5),
                  fontSize: normalize(16),
                }}>
                {option.attribute_code}
              </Text>
              <CustomView
                row
                width={Mixins.MAX_WIDTH}
                paddingHorizontal={20}
                marginVertical={5}>
                {option.values.map((item, index) => {
                  if (option.attribute_code === 'color') {
                    const iconColor = {
                      backgroundColor: item.label.toString().toLowerCase(),
                    };
                    if (!selectedColor && index === 0) {
                      setSelectedColor(item.label);
                    }
                    return (
                      <CustomView
                        horizontalCenter
                        verticalCenter
                        key={item.label}
                        marginHorizontal={10}
                        borderRadius={25}
                        onPress={() => {
                          setSelectedColor(item.label);
                        }}
                        style={[
                          styles.swatchIconContainer,
                          iconColor,
                          {
                            borderColor:
                              item.label === selectedColor
                                ? selectedBorder
                                : unselectedBorder,
                          },
                        ]}
                      />
                    );
                  } else if (option.attribute_code === 'size') {
                    if (!selectedSize && index === 0) {
                      setSelectedSize(item.label);
                    }
                    return (
                      <CustomView
                        horizontalCenter
                        verticalCenter
                        key={item.label}
                        marginHorizontal={10}
                        borderRadius={25}
                        onPress={() => {
                          setSelectedSize(item.label);
                        }}
                        style={[
                          styles.swatchIconContainer,
                          {
                            borderColor:
                              item.label === selectedSize
                                ? selectedBorder
                                : unselectedBorder,
                          },
                        ]}>
                        <Text large color={Colors.GRAY_DARK}>
                          {item.label}
                        </Text>
                      </CustomView>
                    );
                  }
                })}
              </CustomView>
            </CustomView>
          );
        })}
      </CustomView>
    );
  } else {
    return null;
  }
};

const styles = StyleSheet.create({
  swatchIconContainer: {
    borderWidth: normalize(5),
    width: normalize(50),
    height: normalize(50),
  },
});

export default ConfigurableOptions;
