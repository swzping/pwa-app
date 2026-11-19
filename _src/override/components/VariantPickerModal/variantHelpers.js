import {IN_STOCK} from '@app/helpers/Constants';

/**
 * Match the corresponding variant object based on the currently selected attributes.
 * Single source of truth shared by useVariantPicker (current selection) and
 * VariantOptions (per-swatch hypothetical combinations).
 */
export const findMatchedVariant = (variants, selectedVariantOpt) => {
  if (!variants?.length || !selectedVariantOpt?.length) {
    return null;
  }
  return (
    variants.find(variant =>
      variant.attributes.every(attr =>
        selectedVariantOpt.some(
          sel => sel.code === attr.code && sel.uid === attr.uid,
        ),
      ),
    ) || null
  );
};

/**
 * Evaluate stock flags of a matched variant.
 * Shared by stockProps (modal header / confirm flow / qty clamp) and
 * getOptionStockStatus (swatch preview) so the stock rules live in one place.
 */
export const getVariantStockStatus = variant => {
  if (!variant) {
    return {isOutOfStock: false, isLowStock: false};
  }
  return {
    isOutOfStock: variant.product?.stock_status !== IN_STOCK,
    isLowStock: false,
  };
};
