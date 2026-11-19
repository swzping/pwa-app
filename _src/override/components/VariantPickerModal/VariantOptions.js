import React, {memo, useCallback, useMemo} from 'react';
import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';

import FastImage from '@d11/react-native-fast-image';

import FlashSaleBoltIcon from '@app/assets/svgs/FlashSaleBoltIcon';
import CustomView from '@app/components/CustomView';
import RenderIf from '@app/components/RenderIf';
import {thumborSquareImage} from '@app/helpers/Thumbor';
import {Colors} from '@app/styles';

import {findMatchedVariant, getVariantStockStatus} from './variantHelpers';

// Display size (dp) of the variant swatch image, converted to px by thumborSquareImage
export const SWATCH_IMAGE_SIZE = 36;
// Display size (dp) of the modal header product image
export const HEADER_IMAGE_SIZE = 140;

const placeholderImg = require('@app/assets/images/placeholder.png');

const getOptionKey = (code, uid) => `${code}__${uid}`;

const isOptionAvailable = (currentSelected, code, uid, variants) => {
  // Construct the test selection state
  const testSelected = [
    ...currentSelected.filter(opt => opt.code !== code),
    {code, uid},
  ];

  // Find all variants that 'do not conflict with the currently selected ones'
  const compatibleVariants = variants.filter(variant =>
    variant.attributes.every(attr => {
      const selected = testSelected.find(s => s.code === attr.code);
      // If the attribute has not yet been selected, there is no restriction.
      if (!selected) {
        return true;
      }
      return selected.uid === attr.uid;
    }),
  );

  // If there is no compatible variant → not selected
  if (compatibleVariants.length === 0) {
    return false;
  }

  // Has this option appeared in the compatible variant
  return compatibleVariants.some(variant =>
    variant.attributes.some(attr => attr.code === code && attr.uid === uid),
  );
};

const getOptionStockStatus = (currentSelected, code, uid, variants) => {
  // Mock selected combination with current attribute
  const testSelected = [
    ...currentSelected.filter(opt => opt.code !== code),
    {code, uid},
  ];

  // Stock flags of the variant that would match this hypothetical combination
  return getVariantStockStatus(findMatchedVariant(variants, testSelected));
};

// 闪购标记在不同 query 下后台可能返回 1 / '1' / true，统一做真值归一，
// 否则角标时有时无。
const isFlashSaleFlag = value => value === 1 || value === '1' || value === true;

// Whether the variant previewed by this option (current selection + this
// attribute value) is a flash-sale item — drives the small bolt badge.
const getOptionFlashSale = (currentSelected, code, uid, variants) => {
  const testSelected = [
    ...currentSelected.filter(opt => opt.code !== code),
    {code, uid},
  ];
  const matched = findMatchedVariant(variants, testSelected);
  return isFlashSaleFlag(matched?.product?.is_flash_sale);
};

/**
 * Single variant option item. Memoized so that only items whose own state
 * (selected / available / stock) changed re-render — unrelated parent renders
 * (quantity change, alert dismiss, sheet animation) no longer touch them.
 */
const VariantItem = memo(
  ({
    item,
    attributeCode,
    selected,
    available,
    isOutOfStock,
    isLowStock,
    isFlashSale,
    labels,
    onChange,
  }) => {
    const handlePress = useCallback(() => {
      onChange(attributeCode, item.uid, item.swatch_data?.thumbnail);
    }, [onChange, attributeCode, item.uid, item.swatch_data?.thumbnail]);

    const thumbnail = item.swatch_data?.thumbnail;
    const swatchType = item.swatch_data?.__typename;
    // 只有当选项存在「可见」的 swatch（真实图片缩略图或合法色值）时，
    // 才有可供闪购角标锚定的缩略图。纯文字选项（如 Size: 100ml）即便
    // 后端返回了空的 ColorSwatchData / 无缩略图的 ImageSwatchData，也不会
    // 渲染出一个不可见的占位块——否则绝对定位的角标会盖在文字上导致遮挡。
    const hasVisibleImageSwatch =
      swatchType === 'ImageSwatchData' &&
      typeof thumbnail === 'string' &&
      thumbnail.length > 0;
    const hasVisibleColorSwatch =
      swatchType === 'ColorSwatchData' &&
      typeof item.swatch_data?.value === 'string' &&
      /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(item.swatch_data.value.trim());
    const hasSwatch = hasVisibleImageSwatch || hasVisibleColorSwatch;

    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={handlePress}
        style={[styles.skuItem, selected && styles.skuItemSelected]}>
        {hasSwatch ? (
          <View style={styles.swatchWrap}>
            {item.swatch_data?.__typename === 'ImageSwatchData' ? (
              thumbnail ? (
                // Small webp thumbnail via Thumbor + native disk/memory cache,
                // avoids downloading full-size original images for a 36x36 box
                <FastImage
                  source={{
                    uri: thumborSquareImage(thumbnail, SWATCH_IMAGE_SIZE),
                    priority: FastImage.priority.normal,
                    cache: FastImage.cacheControl.immutable,
                  }}
                  resizeMode={FastImage.resizeMode.cover}
                  style={styles.swatchImage}
                />
              ) : (
                <Image
                  source={placeholderImg}
                  style={styles.swatchImage}
                  fadeDuration={0}
                />
              )
            ) : (
              <View
                style={[
                  styles.swatchImage,
                  {backgroundColor: item.swatch_data.value},
                ]}
              />
            )}
            {/* flash sale bolt badge on the swatch corner */}
            <RenderIf condition={isFlashSale}>
              <View style={styles.boltBadge}>
                <FlashSaleBoltIcon width={16} height={16} />
              </View>
            </RenderIf>
          </View>
        ) : null}
        <Text style={[styles.skuText]}>
          {/* swatch 型颜色属性后台可能只填了 default_label/store_label 而 label
              为空，只读 label 会让该选项只剩色块没有文字，故做逐级回退 */}
          {item.label || item.default_label || item.store_label}
        </Text>
        {/* mask */}
        <View
          style={[
            styles.mask,
            (!available || isOutOfStock || isLowStock) &&
              styles.skuItemDisabled,
          ]}
        />
        {/* 纯文字选项（如 Size: 200ml）没有 swatch 可以挂角标，闪购变体对应的
            规格改为把闪电徽标贴在卡片左上角内部（与卡片边框齐平），
            与 swatch 选项的闪购标记保持同一视觉语言。 */}
        <RenderIf condition={!hasSwatch && isFlashSale}>
          <View style={styles.boltBadgeCorner}>
            <FlashSaleBoltIcon width={16} height={16} />
          </View>
        </RenderIf>
        {/* out of stock tag */}
        <RenderIf condition={false && (isOutOfStock || isLowStock)}>
          <CustomView
            verticalCenter
            width={'fit-content'}
            height={20}
            paddingHorizontal={8}
            style={{
              position: 'absolute',
              top: -10,
              right: 0,
              borderRadius: 26,
              borderWidth: 1,
              borderColor: '#fff',
              backgroundColor: '#808080',
              zIndex: 2,
            }}>
            <Text
              style={{
                color: Colors.WHITE,
                fontSize: 8,
                fontWeight: '500',
                textAlign: 'center',
              }}>
              {isLowStock ? labels.lowStock : labels.outOfStock}
            </Text>
          </CustomView>
        </RenderIf>
      </TouchableOpacity>
    );
  },
);

const VariantOptions = ({
  options,
  setSelectedVariant,
  selectedVariantOpt,
  setSelectedVariantOpt,
  setQuantity,
  variants,
  labels,
  onSelectVariant,
}) => {
  const onChange = useCallback(
    (code, uid, img) => {
      const prevSelected = selectedVariantOpt;
      const isAlreadySelected = prevSelected.some(
        opt => opt.code === code && opt.uid === uid,
      );

      let newSelected;
      if (isAlreadySelected) {
        newSelected = prevSelected.filter(opt => opt.code !== code);
      } else {
        const filtered = prevSelected.filter(opt => opt.code !== code);
        newSelected = [...filtered, {code, uid}];
      }

      setSelectedVariantOpt(newSelected);

      const matched = findMatchedVariant(variants, newSelected);
      if (matched) {
        setQuantity(1);
        setSelectedVariant(matched);
        onSelectVariant?.(matched);
      }
    },
    [
      selectedVariantOpt,
      setSelectedVariantOpt,
      setSelectedVariant,
      setQuantity,
      variants,
      onSelectVariant,
    ],
  );

  // Pre-compute availability & stock status of every option in one pass.
  // The O(variants x attributes) helpers are no longer re-executed per item
  // on every parent render — only when the selection or product data changes.
  const optionStatusMap = useMemo(() => {
    const statusMap = new Map();
    options?.forEach(group => {
      const code = group?.attribute_code;
      group?.values?.forEach(item => {
        statusMap.set(getOptionKey(code, item.uid), {
          available: isOptionAvailable(
            selectedVariantOpt,
            code,
            item.uid,
            variants,
          ),
          ...getOptionStockStatus(selectedVariantOpt, code, item.uid, variants),
          isFlashSale: getOptionFlashSale(
            selectedVariantOpt,
            code,
            item.uid,
            variants,
          ),
        });
      });
    });
    return statusMap;
  }, [options, selectedVariantOpt, variants]);

  return options?.map((group, index) => (
    <View key={index} style={styles.section}>
      <Text style={styles.sectionTitle}>{group.label}</Text>
      <View style={styles.skuWrap}>
        {group?.values.map(item => {
          const {
            available = true,
            isOutOfStock = false,
            isLowStock = false,
            isFlashSale = false,
          } = optionStatusMap.get(
            getOptionKey(group.attribute_code, item.uid),
          ) || {};

          return (
            <VariantItem
              key={item.uid}
              item={item}
              attributeCode={group.attribute_code}
              selected={selectedVariantOpt.some(
                opt =>
                  opt.code === group.attribute_code && opt.uid === item.uid,
              )}
              available={available}
              isOutOfStock={isOutOfStock}
              isLowStock={isLowStock}
              isFlashSale={isFlashSale}
              labels={labels}
              onChange={onChange}
            />
          );
        })}
      </View>
    </View>
  ));
};

export default memo(VariantOptions);

const styles = StyleSheet.create({
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 16,
  },
  skuWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  skuItem: {
    position: 'relative',
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    marginRight: '2%',
  },
  skuItemSelected: {
    borderColor: '#ff8800',
    backgroundColor: '#fff4e8',
  },
  mask: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
    borderRadius: 12,
    pointerEvents: 'none',
  },
  skuItemDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  swatchWrap: {
    position: 'relative',
    flexShrink: 0,
    marginRight: 10,
  },
  swatchImage: {
    width: 36,
    height: 36,
    borderRadius: 8,
  },
  boltBadge: {
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 3,
  },
  boltBadgeCorner: {
    position: 'absolute',
    // 与卡片左上角边框齐平（负 1px 盖住边框描边），不再半悬在卡片外部，
    // 否则边框会从徽标中间穿过去，看起来是歪的。
    top: -1,
    left: -1,
    zIndex: 3,
  },
  skuText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    // On Android, zIndex maps to elevation; the mask (zIndex:1) creates a
    // hardware compositing layer that can obscure sibling Text rendered at
    // the default elevation. Explicitly raise the text above the mask.
    position: 'relative',
    zIndex: 2,
  },
});
