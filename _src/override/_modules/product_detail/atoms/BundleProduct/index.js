import React, {useEffect} from 'react';
import {Colors} from '@app/styles';
import {Capitalize, numberFormat} from '@app/helpers/General';
import RadioButton from '@app/components/RadioButton/index';
import Text from '@app/components/Text';
import Show from '@app/components/Show';
import CustomView from '@app/components/CustomView/index';
import CheckBox from '@app/components/CheckBox';
import RenderIf from '@app/components/RenderIf';
import styles from '@app/_modules/product_detail/styles';
import InputField from '@app/components/InputField/index';
import {FORM_FIELD} from '@app/helpers/Constants';

const BundleProduct = ({
  t,
  product,
  selectedOptions,
  setSelectedOptions,
  setBundleItemsCount,
  setBundlePriceCustomization,
  setDisabledAddToCart,
}) => {
  useEffect(() => {
    if (product) {
      if (product.items) {
        setBundleItemsCount(product.items.length);
      }
    }
  }, [product]);

  useEffect(() => {
    let bundlePrice = 0;
    setDisabledAddToCart(true);
    if (selectedOptions && selectedOptions.length > 0) {
      selectedOptions.map(opt => {
        let findOpt = product.items.find(item => opt.id === item.option_id);
        if (findOpt) {
          opt.value.map(val => {
            let findValue = findOpt.options.find(optItem => optItem.id === val);
            if (findValue) {
              const finalPrice =
                findValue.product.price_range.maximum_price.final_price.value;
              bundlePrice += finalPrice;
            }
          });
        }
      });

      // checking required has filled or not
      const requiredOpts = product?.items?.filter(item => item.required);
      let disableButton = false;
      requiredOpts?.map(opt => {
        const findSelected = selectedOptions.find(
          sel => sel.id === opt.option_id,
        );
        if (!findSelected) {
          disableButton = true;
        }
      });
      setDisabledAddToCart(disableButton);
    }
    setBundlePriceCustomization(bundlePrice);
  }, [selectedOptions]);

  /**
   *
   * Render Bundle Item By Type
   * Select , Radio, Checkbox, Multi Select
   */
  const BundleType = ({bundleItem}) => {
    const {type} = bundleItem;
    if (type === 'radio') {
      return bundleItem.options.map((option, index) => {
        return (
          <RadioOption
            option={option}
            bundleItemOptionId={bundleItem.option_id}
            key={index}
          />
        );
      });
    } else if (type === 'checkbox') {
      return bundleItem.options.map((option, index) => {
        return (
          <CheckboxOption
            option={option}
            bundleItemOptionId={bundleItem.option_id}
            key={index}
          />
        );
      });
    } else if (type === 'select') {
      return (
        <SelectComponent
          bundleItem={bundleItem}
          selectedOptions={selectedOptions}
          setSelectedOptions={setSelectedOptions}
        />
      );
    } else if (type === 'multi') {
      return (
        <SelectComponent
          bundleItem={bundleItem}
          multiselect
          selectedOptions={selectedOptions}
          setSelectedOptions={setSelectedOptions}
        />
      );
    }

    return <></>;
  };

  // Render All Bundle Item
  const BundleItem = ({bundleItem}) => {
    return (
      <CustomView key={bundleItem.option_id} marginBottom={10}>
        <Text large bold style={{marginBottom: 5}}>
          {Capitalize(bundleItem.title)}{' '}
          <Show when={bundleItem.required}>
            <Text style={{color: Colors.ALERT}}>*</Text>
          </Show>
        </Text>
        {<BundleType bundleItem={bundleItem} />}
      </CustomView>
    );
  };

  // Radio
  const RadioOption = ({bundleItemOptionId, option}) => {
    const finalPrice = option.product.price_range.maximum_price.final_price;
    const currency = finalPrice.currency;
    const price = finalPrice.value;

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
          activeColor={Colors.PRIMARY}
          selected={checkSelectedStatus(option.id)}
          onPress={() => onSelectOptionItem(bundleItemOptionId, option)}
        />
        <CustomView flex row spaceBetween marginTop={3}>
          <CustomView flex flexNumber={2}>
            <Text small style={{marginLeft: 10}}>
              {option.product.name}
            </Text>
          </CustomView>
          <CustomView flex horizontalEnd>
            <Text small bold>
              {numberFormat(currency, price?.toFixed(2), ',', 2)}
            </Text>
          </CustomView>
        </CustomView>
      </CustomView>
    );
  };

  // Checkbox
  const CheckboxOption = ({bundleItemOptionId, option}) => {
    const finalPrice = option.product.price_range.maximum_price.final_price;
    const currency = finalPrice.currency;
    const price = finalPrice.value;

    // checkbox type selected status
    const checkSelectedCheckbox = (bundleItemOptionIdParam, optionId) => {
      let found = false;

      let optionFind = selectedOptions.find(
        selectedOption => selectedOption.id === bundleItemOptionIdParam,
      );

      if (optionFind) {
        let valueFind = optionFind.value.find(val => val === optionId);
        if (valueFind) {
          found = true;
        }
      }

      return found;
    };

    // checkbox type onPress
    const onSelectCheckboxItem = (bundleItemOptionIdParam, optionParam) => {
      let selectedOptionsTmp = selectedOptions.filter(selectedOption => {
        return !(selectedOption.id === bundleItemOptionId);
      });

      let optionFind = selectedOptions.find(
        selectedOption => selectedOption.id === bundleItemOptionIdParam,
      );

      if (optionFind) {
        let valueFind = optionFind.value.find(val => val === option.id);
        if (valueFind) {
          let newValue = optionFind.value
            .filter(val => val !== valueFind)
            .sort();
          if (newValue.length > 0) {
            selectedOptionsTmp.push({
              id: bundleItemOptionIdParam,
              quantity: optionParam.quantity,
              value: newValue,
            });
          }
        } else {
          selectedOptionsTmp.push({
            id: bundleItemOptionIdParam,
            quantity: optionParam.quantity,
            value: [...optionFind.value, option.id].sort(),
          });
        }
      } else {
        selectedOptionsTmp.push({
          id: bundleItemOptionIdParam,
          quantity: optionParam.quantity,
          value: [option.id],
        });
      }

      setSelectedOptions(selectedOptionsTmp);
    };

    return (
      <CustomView row horizontalCenter marginHorizontal={5}>
        <CheckBox
          checkedColor={Colors.PRIMARY}
          size={20}
          selected={checkSelectedCheckbox(bundleItemOptionId, option.id)}
          onPress={() => onSelectCheckboxItem(bundleItemOptionId, option)}
        />
        <CustomView flex row spaceBetween paddingVertical={5} marginTop={3}>
          <CustomView flex flexNumber={2}>
            <Text small style={{marginLeft: 10}}>
              {option.product.name}
            </Text>
          </CustomView>
          <CustomView flex horizontalEnd>
            <Text small bold>
              {numberFormat(currency, price?.toFixed(2), ',', 2)}
            </Text>
          </CustomView>
        </CustomView>
      </CustomView>
    );
  };

  // For Single & Multi Select Component
  const SelectComponent = ({bundleItem, multiselect = false}) => {
    const {options, title, option_id: bundleItemOptionId} = bundleItem;
    let value = t('product_detail.bundle.chooseProduct');

    const optSelected = selectedOptions.find(
      selectedOption => selectedOption.id === bundleItemOptionId,
    );

    // selected value show on input
    if (optSelected) {
      if (!multiselect) {
        const findSelected = options.find(
          opt => opt.id === optSelected?.value[0],
        );
        value = findSelected?.label ?? value;
      } else {
        value = t('product_detail.bundle.changeProduct');
      }
    }

    // init option data
    let optionData = [];
    let findSelectedOption = selectedOptions.find(selectedOption => {
      return selectedOption.id === bundleItemOptionId;
    });
    options.map(option => {
      const finalPrice = option.product.price_range.maximum_price.final_price;
      const currency = finalPrice.currency;
      const price = finalPrice.value;
      const name = `${option?.product?.name} (${numberFormat(
        currency,
        price?.toFixed(2),
        ',',
        2,
      )})`;
      const selectedValue = !!findSelectedOption?.value?.find(
        val => val === option.id,
      );

      optionData.push({...option, name, selected: selectedValue});
    });

    // select single
    const onSelectSingle = optionParam => {
      let selectedOptionsTmp = selectedOptions.filter(selectedOption => {
        return !(selectedOption.id === bundleItemOptionId);
      });
      selectedOptionsTmp.push({
        id: bundleItemOptionId,
        quantity: optionParam.quantity,
        value: [optionParam.id],
      });
      setSelectedOptions(selectedOptionsTmp);
    };

    // select multiple
    const onSelectMulti = multiOptionParam => {
      let selectedOptionsTmp = selectedOptions.filter(selectedOption => {
        return !(selectedOption.id === bundleItemOptionId);
      });

      const selectedMulti = multiOptionParam.filter(opt => opt.selected);
      if (selectedMulti.length > 0) {
        let multiValue = [];
        selectedMulti.map(opt => multiValue.push(opt.id));
        selectedOptionsTmp.push({
          id: bundleItemOptionId,
          quantity: selectedMulti[0].quantity,
          value: multiValue.sort(),
        });
      }
      setSelectedOptions(selectedOptionsTmp);
    };

    // remove per-item on multiselect
    const onRemoveItemInMulti = optionParam => {
      let selectedOptionsTmp = selectedOptions.filter(selectedOption => {
        return !(selectedOption.id === bundleItemOptionId);
      });

      const selectedMulti = optionData.filter(
        opt => opt.selected && opt.id !== optionParam.id,
      );
      if (selectedMulti.length > 0) {
        let multiValue = [];
        selectedMulti.map(opt => multiValue.push(opt.id));
        selectedOptionsTmp.push({
          id: bundleItemOptionId,
          quantity: selectedMulti[0].quantity,
          value: multiValue.sort(),
        });
      }

      setSelectedOptions(selectedOptionsTmp);
    };

    return (
      <CustomView marginTop={-15} marginBottom={5}>
        <InputField
          label={title}
          data={optionData}
          type={FORM_FIELD.INPUT_DROPDOWN}
          onChange={() => {}}
          value={value}
          onPress={pressProps => {
            onSelectSingle(pressProps.selected);
          }}
          multiselect={multiselect}
          onSaveMultiselect={multiProps => {
            onSelectMulti(multiProps);
          }}
          onRemoveMultiselect={onRemoveItemInMulti}
        />
      </CustomView>
    );
  };

  return (
    <RenderIf condition={product.__typename === 'BundleProduct'}>
      <CustomView paddingVertical={10}>
        {product.items.map((bundleItem, index) => {
          return <BundleItem bundleItem={bundleItem} key={index} />;
        })}
      </CustomView>
    </RenderIf>
  );
};

export default BundleProduct;
