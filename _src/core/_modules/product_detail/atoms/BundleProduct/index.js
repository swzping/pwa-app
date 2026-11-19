import RadioButton from '@app/components/RadioButton';
import Text from '@app/components/Text';
import CustomView from '@app/components/CustomView';
import RenderIf from '@app/components/RenderIf';

import React, {useEffect} from 'react';
import FastImage from '@d11/react-native-fast-image';

import styles from '@app/_modules/product_detail/styles';

const BundleProduct = ({
  product,
  selectedOptions,
  setSelectedOptions,
  setBundleItemsCount,
}) => {
  useEffect(() => {
    if (product) {
      if (product.items) {
        setBundleItemsCount(product.items.length);
      }
    }
  }, [product]);

  const BundleItem = ({bundleItem}) => {
    return (
      <CustomView
        key={bundleItem.option_id}
        style={styles.bundleOptionContainer}>
        <Text>{bundleItem.title}</Text>
        {bundleItem.options.map(option => {
          const {type} = bundleItem;
          if (type === 'radio') {
            return (
              <BundleItemsOption
                option={option}
                bundleItemOptionId={bundleItem.option_id}
              />
            );
          }
        })}
      </CustomView>
    );
  };

  const BundleItemsOption = ({bundleItemOptionId, option}) => {
    const checkSelectedStatus = optionId => {
      let found = false;
      selectedOptions.forEach(selectedOption => {
        if (
          selectedOption.id === bundleItemOptionId &&
          selectedOption.value[0] === optionId
        ) {
          found = true;
        }
      });
      return found;
    };

    const onSelectOptionItem = (bundleItemOptionIdParam, optionParam) => {
      let selectedOptionsTmp = selectedOptions.filter(selectedOption => {
        return !(selectedOption.id === bundleItemOptionId);
      });
      selectedOptionsTmp.push({
        id: bundleItemOptionIdParam,
        quantity: optionParam.quantity,
        value: [option.id],
      });
      setSelectedOptions(selectedOptionsTmp);
    };

    return (
      <CustomView style={styles.bundleOptionItemContainer}>
        <RadioButton
          selected={checkSelectedStatus(option.id)}
          onPress={() => onSelectOptionItem(bundleItemOptionId, option)}
        />
        <FastImage
          key={option.product.name}
          style={styles.bundleOptionItemImage}
          source={{
            uri: option.product.thumbnail.url,
            priority: FastImage.priority.normal,
            cache: FastImage.cacheControl.immutable,
          }}
          resizeMode={FastImage.resizeMode.contain}
        />
        <Text>{option.product.name}</Text>
      </CustomView>
    );
  };

  return (
    <RenderIf condition={product.__typename === 'BundleProduct'}>
      <CustomView style={{marginHorizontal: 20, marginTop: 20}}>
        {product.items.map(bundleItem => {
          return <BundleItem bundleItem={bundleItem} />;
        })}
      </CustomView>
    </RenderIf>
  );
};

export default BundleProduct;
