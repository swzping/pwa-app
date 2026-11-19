import {useMemo} from 'react';

export function useProductVariants(product) {
  return useMemo(() => {
    if (!product) {
      return [];
    }

    // value_index -> option
    const optionMap = {};
    product.configurable_options.forEach(opt => {
      opt.values.forEach(v => {
        optionMap[v.value_index] = {
          label: v.label,
          attributeCode: opt.attribute_code,
          optionLabel: opt.label,
        };
      });
    });

    // configurable_option group by option label
    const groups = {};

    product.variants.forEach(variant => {
      variant.attributes.forEach(attr => {
        const option = optionMap[attr.value_index];
        if (!option) {
          return;
        }

        if (!groups[option.optionLabel]) {
          groups[option.optionLabel] = [];
        }

        groups[option.optionLabel].push({
          label: option.label,
          variant,
        });
      });
    });

    return Object.entries(groups).map(([title, items]) => ({
      title,
      items,
    }));
  }, [product]);
}
