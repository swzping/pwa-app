import React, {useEffect} from 'react';

import CustomView from '@app/components/CustomView';
import Text from '@app/components/Text';
import {TYPENAME_CONFIGURABLE} from '@app/helpers/Constants';
import {startPerfTrace} from '@app/helpers/perf';
import {Colors,Mixins} from '@app/styles';

const ConfigurableOptions = ({
  t,
  product,
  setSku,
  selectedVariantOpt,
  setSelectedVariantOpt,
  setSelectedVariant,
  setDisabledAddToCart,
}) => {
  useEffect(() => {
    if (selectedVariantOpt.length) {
      let variantFilter = product?.variants ?? [];
      // filter variant by selected variant user
      selectedVariantOpt?.map(opt => {
        variantFilter = variantFilter.filter(variant => {
          return !!variant?.attributes?.find(
            attr =>
              attr.code === opt.attributeCode &&
              attr.label === opt.selectedValue,
          );
        });
      });
      // set variant
      if (variantFilter.length === 1) {
        const variant = variantFilter[0];

        // 开始 pdpSelectVariant trace
        const handleSelectVariant = async () => {
          const variantTrace = await startPerfTrace('pdpSelectVariant');
          const variantStartTime = Date.now();

          try {
            setSelectedVariant(variant);
            setSku(variant.product.sku);
            setDisabledAddToCart(false);

            // 选择成功
            const duration = Date.now() - variantStartTime;
            variantTrace.putAttribute('variant_id', variant?.product?.id?.toString() || '');
            variantTrace.putAttribute('variant_sku', variant?.product?.sku || '');
            variantTrace.putMetric('duration_ms', duration);
            variantTrace.putAttribute('status', 'success');
            variantTrace.stop();
          } catch (error) {
            const duration = Date.now() - variantStartTime;
            variantTrace.putMetric('duration_ms', duration);
            variantTrace.putAttribute('status', 'error');
            variantTrace.stop();
          }
        };

        handleSelectVariant();
      }
    } else {
      //init
      let tempOpt = [];
      product?.configurable_options?.map(option => {
        tempOpt.push({
          attributeCode: option.attribute_code,
          selectedValue: '',
        });
      });
      // 仅在解析到 options 时才 setState;空数组的新引用会让本
      // effect 无限重跑(Maximum update depth exceeded)
      if (tempOpt.length) {
        setSelectedVariantOpt(tempOpt);
      }
    }
  }, [selectedVariantOpt]);

  const handleSelectVariantOpt = ({attributeCode, selectedValue}) => {
    let tempOpt = [];
    selectedVariantOpt.map(opt => {
      if (opt.attributeCode === attributeCode) {
        tempOpt.push({
          attributeCode,
          selectedValue,
        });
      } else {
        tempOpt.push(opt);
      }
    });
    setSelectedVariantOpt(tempOpt);
  };

  const checkIsSelectedVariantOpt = ({attributeCode, selectedValue}) => {
    return !!selectedVariantOpt.find(
      opt =>
        opt.attributeCode === attributeCode &&
        opt.selectedValue === selectedValue,
    );
  };

  const findSelectedVariantOpt = ({attributeCode}) => {
    return selectedVariantOpt.find(opt => opt.attributeCode === attributeCode);
  };

  if (product.__typename === TYPENAME_CONFIGURABLE) {
    const configurableOptions = product.configurable_options ?? [];
    return (
      <CustomView marginVertical={5}>
        {configurableOptions.map(option => {
          const findOptionSelect = findSelectedVariantOpt({
            attributeCode: option.attribute_code,
          });
          return (
            <CustomView key={option.id} marginVertical={5}>
              <Text large bold>
                {option.label}
              </Text>
              <CustomView row width={Mixins.MAX_WIDTH} marginVertical={5}>
                {(option.values ?? []).map((item, index) => {
                  let colorOptionStyle = {
                    backgroundColor: Colors.WHITE,
                    color: Colors.BLACK,
                  };

                  const isSelectedOpt = checkIsSelectedVariantOpt({
                    attributeCode: option.attribute_code,
                    selectedValue: item.label,
                  });

                  if (isSelectedOpt) {
                    colorOptionStyle = {
                      backgroundColor: Colors.BLACK,
                      color: Colors.WHITE,
                    };
                  }
                  return (
                    <CustomView
                      key={index}
                      paddingHorizontal={10}
                      paddingVertical={5}
                      marginRight={10}
                      border={1}
                      backgroundColor={colorOptionStyle.backgroundColor}
                      onPress={() => {
                        handleSelectVariantOpt({
                          attributeCode: option.attribute_code,
                          selectedValue: item.label,
                        });
                      }}>
                      <Text color={colorOptionStyle.color}>{item.label}</Text>
                    </CustomView>
                  );
                })}
              </CustomView>
              <CustomView row>
                <Text bold style={{marginRight: 10}}>
                  {`${t('product_detail.selected')} :`}
                </Text>
                <Text>
                  {findOptionSelect?.selectedValue !== ''
                    ? findOptionSelect?.selectedValue
                    : '-'}
                </Text>
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

export default ConfigurableOptions;
