import React from 'react';
import {View} from 'react-native';

import CustomView from '@app/components/CustomView/index';
import RenderIf from '@app/components/RenderIf/index';
import Text from '@app/components/Text';
import {
  TYPENAME_BUNDLE,
  TYPENAME_CONFIGURABLE,
  TYPENAME_SIMPLE,
} from '@app/helpers/Constants';
import {numberFormat} from '@app/helpers/General';
import {Colors} from '@app/styles';

const PriceRowBlock = ({
  product,
  getPriceRange,
  getPriceCurrency,
  getPriceRegularValue,
  getPriceFinalValue,
  getDiscountPercent,
  promoProduct,
  configurableFinalPrice,
  bundlePriceCustomization,
  row = true,
  priceRegularStyle,
  // stockLabel,
  fontSize = 18,
  fontWeight = 'bold',
}) => {
  return (
    <CustomView paddingTop={10}>
      <RenderIf condition={getPriceRange}>
        {/*<CustomView row spaceBetween>*/}
        <CustomView horizontalStart>
          {/*<CustomView>*/}
          {/*  <Text small color={Colors.GRAY_DARK2}>*/}
          {/*    {stockLabel}*/}
          {/*  </Text>*/}
          {/*</CustomView>*/}
          {/* SIMPLE */}
          <RenderIf condition={product.__typename === TYPENAME_SIMPLE}>
            <CustomView row={row}>
              <Text color={Colors.PRIMARY} style={{fontSize, fontWeight}}>
                {numberFormat(
                  getPriceCurrency,
                  getPriceFinalValue?.toFixed(2),
                  ',',
                  2,
                )}
              </Text>
              <RenderIf condition={getDiscountPercent > 0}>
                <CustomView
                  row
                  style={[{marginLeft: 10, padding: 4}, priceRegularStyle]}>
                  <Text lineThrough small_12 color={Colors.GRAY_SMOOTH5}>
                    {numberFormat(
                      getPriceCurrency,
                      getPriceRegularValue?.toFixed(2),
                      ',',
                      2,
                    )}
                  </Text>
                  <View
                    style={{
                      width: 32,
                      height: 14,
                      backgroundColor: Colors.RED_LIGHT_1,
                      borderRadius: 2,
                      marginLeft: 5,
                    }}>
                    <Text xsmall color={Colors.WHITE} center bold>
                      - {Math.round(getDiscountPercent ?? 0)?.toFixed(0)}%
                    </Text>
                  </View>
                </CustomView>
              </RenderIf>
            </CustomView>
          </RenderIf>
          {/* SIMPLE & DISCOUNT > 0 */}
          {/*<RenderIf*/}
          {/*  condition={*/}
          {/*    product.__typename === TYPENAME_SIMPLE && getDiscountPercent > 0*/}
          {/*  }>*/}
          {/*  <CustomView row>*/}
          {/*    <Text lineThrough small>*/}
          {/*      {numberFormat(*/}
          {/*        getPriceCurrency,*/}
          {/*        getPriceRegularValue?.toFixed(2),*/}
          {/*        ',',*/}
          {/*        2,*/}
          {/*      )}*/}
          {/*    </Text>*/}
          {/*    <Text small color={Colors.RED} style={{marginLeft: 8}}>*/}
          {/*      {Math.round(getDiscountPercent ?? 0)?.toFixed(0)}% OFF*/}
          {/*    </Text>*/}
          {/*  </CustomView>*/}
          {/*</RenderIf>*/}
          {/* CONFIGURABLE */}
          <RenderIf
            condition={
              product.__typename === TYPENAME_CONFIGURABLE &&
              configurableFinalPrice
            }>
            <Text
              color={Colors.PRIMARY}
              style={{fontSize: 18, fontWeight: 'bold'}}>
              {numberFormat(
                configurableFinalPrice?.currency,
                configurableFinalPrice?.value?.toFixed(2),
                ',',
                2,
              )}
            </Text>
          </RenderIf>
          {/* BUNDLE */}
          <RenderIf condition={product.__typename === TYPENAME_BUNDLE}>
            <CustomView row horizontalCenter>
              <Text small style={{marginRight: 5}}>
                FROM
              </Text>
              <Text
                primary
                style={{fontSize: 18, marginRight: 10, fontWeight: 'bold'}}>
                {numberFormat(
                  getPriceCurrency,
                  getPriceRange?.minimum_price?.final_price.value.toFixed(2),
                  ',',
                  2,
                )}
              </Text>
              <Text small style={{marginRight: 5}}>
                TO
              </Text>
              <Text primary style={{fontSize: 18, fontWeight: 'bold'}}>
                {numberFormat(
                  getPriceCurrency,
                  getPriceFinalValue?.toFixed(2),
                  ',',
                  2,
                )}
              </Text>
            </CustomView>
            <CustomView row marginTop={10}>
              <Text bold style={{marginRight: 5}}>
                Your Customization
              </Text>
              <Text primary bold>
                {numberFormat(
                  getPriceCurrency,
                  bundlePriceCustomization?.toFixed(2),
                  ',',
                  2,
                )}
              </Text>
            </CustomView>
          </RenderIf>
        </CustomView>
        {/*<RenderIf condition={promoProduct && false}>*/}
        {/*  <CustomView verticalCenter>*/}
        {/*    <Text*/}
        {/*      small*/}
        {/*      white*/}
        {/*      style={{*/}
        {/*        backgroundColor: Colors.RED,*/}
        {/*        paddingHorizontal: 10,*/}
        {/*        paddingVertical: 5,*/}
        {/*      }}>*/}
        {/*      {promoProduct?.toUpperCase()}*/}
        {/*    </Text>*/}
        {/*  </CustomView>*/}
        {/*</RenderIf>*/}
        {/*</CustomView>*/}
      </RenderIf>
    </CustomView>
  );
};

export default PriceRowBlock;
