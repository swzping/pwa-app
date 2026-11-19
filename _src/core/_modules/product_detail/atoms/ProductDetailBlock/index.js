import React, { useState } from 'react';
import { formatDateOrder } from '@app/helpers/General';
import { Colors, Mixins } from '@app/styles';
import { Text, Button, MD2Colors as ColorsPaper } from 'react-native-paper';
import { PRODUCT_TAB_DETAIL, PRODUCT_TAB_REVIEW } from '@app/helpers/Constants';
import { MixinsNew } from '@app/styles/index';
import { MAX_WIDTH } from '@app/styles/mixins';

import RenderIf from '@app/components/RenderIf/index';
import CustomView from '@app/components/CustomView/index';
import NoData from '@app/components/NoData/index';
import WebViewContent from '@app/components/WebViewContent/index';
import Icon from 'react-native-vector-icons/FontAwesome';

import AddReviewModal from '@app/_modules/product_detail/atoms/AddReviewModal';
import styles from '@app/_modules/product_detail/styles';

/**
 * ---------------------------------------------------- *
 * @profiler {ProductDescription} Sentry
 * @summary product description component with profiler
 * ---------------------------------------------------- *
 */
const ProductDescription = ({ selected, product }) => {
  const getDescription = product?.description?.html;
  if (getDescription === '' && selected === 'details') {
    return <NoData />;
  }
  return (
    <RenderIf condition={selected === 'details'}>
      <WebViewContent
        htmlBlock={product.description?.html}
        contentFontSize={40}
        contentBackgroundColor={Colors.PRIMARY}
        contentTextColor={Colors.WHITE}
        styleProp={{ backgroundColor: Colors.PRIMARY }}
      />
    </RenderIf>
  );
};

/**
 * ---------------------------------------------------- *
 * @profiler {ProductReview} Sentry
 * @summary product review component with profiler
 * ---------------------------------------------------- *
 */
const ProductReview = ({
  selected,
  product,
  productReviews,
  totalReview,
  refetchProductReviews,
}) => {
  const ratingDummyCounter = [0, 1, 2, 3, 4];
  const [showAddReviewModal, setShowAddReviewModal] = useState(false);
  const Ratings = ({ ratings }) => {
    return (
      <CustomView row>
        {ratingDummyCounter.map((rating, index) => {
          if (ratings[0].value > rating) {
            return (
              <Icon
                key={`icon-rating-${index}`}
                name="star"
                size={16}
                color={Colors.PRIMARY}
              />
            );
          } else {
            return (
              <Icon
                key={`icon-rating-${index}`}
                name="star-o"
                size={16}
                color={Colors.PRIMARY}
              />
            );
          }
        })}
      </CustomView>
    );
  };

  return (
    <RenderIf condition={selected === 'review'}>
      <CustomView
        style={{
          backgroundColor: Colors.PRIMARY,
          width: MAX_WIDTH,
        }}>
        <CustomView
          style={{
            width: '100%',
            flexDirection: 'row',
            ...MixinsNew.padding({ top: 15, bottom: 15, left: 25, right: 25 }),
          }}>
          <Text style={{ color: Colors.WHITE, width: '50%' }}>
            Customer Reviews
          </Text>
          <Text
            style={{
              color: Colors.WHITE,
              width: '50%',
              textAlign: 'right',
            }}>
            {totalReview} Reviews
          </Text>
        </CustomView>

        {productReviews.map(review => {
          return (
            <CustomView
              key={review.id}
              keyIndex={review.id}
              padding={15}
              borderRadius={15}
              marginVertical={10}
              border={Colors.PRIMARY}>
              <CustomView
                row
                spaceBetween
                horizontalCenter
                width={Mixins.MAX_WIDTH * 0.75}
                marginVertical={5}>
                <CustomView horizontalStart>
                  <Text bold>{review.nickname}</Text>
                  <Text small>{formatDateOrder(review.created_at)}</Text>
                </CustomView>
                <Ratings ratings={review.ratings} />
              </CustomView>
              <Text>{review.detail}</Text>
            </CustomView>
          );
        })}

        <RenderIf condition={productReviews.length < totalReview}>
          <Button label="Read More Reviews" styleProp={{ borderWidth: 0 }} />
        </RenderIf>

        <CustomView backgroundColor={'transparent'}>
          <Button
            key={'pdp-detail'}
            mode="contained"
            onPress={() => setShowAddReviewModal(true)}
            style={{
              backgroundColor: ColorsPaper.grey100,
              ...MixinsNew.margin({ right: 25, bottom: 20 }),
            }}>
            <Text
              style={{
                color: Colors.PRIMARY,
              }}>
              Write a Review
            </Text>
          </Button>
        </CustomView>
      </CustomView>
      <AddReviewModal
        showAddReviewModal={showAddReviewModal}
        setShowAddReviewModal={setShowAddReviewModal}
        product={product}
        refetchProductReviews={refetchProductReviews}
      />
    </RenderIf>
  );
};

const ProductDetailBlock = ({
  product,
  productReviews,
  totalReview,
  refetchProductReviews,
}) => {
  /**
   * ---------------------------------------------------- *
   * @const {hooks}
   * ---------------------------------------------------- *
   */
  const [selected, setSelected] = useState(null);
  const isSelectedDetail = selected === PRODUCT_TAB_DETAIL;
  const isSelectedReview = selected === PRODUCT_TAB_REVIEW;
  const fontWeightDetail = isSelectedDetail ? { fontWeight: 'bold' } : {};
  const fontWeightReview = isSelectedReview ? { fontWeight: 'bold' } : {};
  const textStyleDetail = {
    color: isSelectedDetail ? ColorsPaper.white : ColorsPaper.grey500,
    ...fontWeightDetail,
  };
  const textStyleReview = {
    color: isSelectedReview ? ColorsPaper.white : ColorsPaper.grey500,
    ...fontWeightReview,
  };

  const btnStyleDetail = [
    styles.btnCategory,
    {
      backgroundColor: isSelectedDetail ? Colors.PRIMARY : ColorsPaper.grey300,
      ...MixinsNew.borderRadius({
        topRight: 0,
        bottomRight: 0,
        bottomLeft: 0,
      }),
    },
  ];

  const btnStyleReview = [
    styles.btnCategory,
    {
      backgroundColor: isSelectedReview ? Colors.PRIMARY : ColorsPaper.grey300,
      ...MixinsNew.borderRadius({
        topLeft: 0,
        bottomRight: 0,
        bottomLeft: 0,
      }),
    },
  ];

  return (
    <>
      <CustomView row marginHorizontal={20} style={styles.headerContainer}>
        <Button
          key={'pdp-detail'}
          mode="contained"
          onPress={() => setSelected(PRODUCT_TAB_DETAIL)}
          style={btnStyleDetail}>
          <Text style={textStyleDetail}>Detail</Text>
        </Button>
        <Button
          key={'pdp-review'}
          mode="contained"
          onPress={() => setSelected(PRODUCT_TAB_REVIEW)}
          style={btnStyleReview}>
          <Text style={textStyleReview}>Review</Text>
        </Button>
      </CustomView>
      <ProductDescription selected={selected} product={product} />
      <ProductReview
        selected={selected}
        product={product}
        productReviews={productReviews}
        totalReview={totalReview}
        refetchProductReviews={refetchProductReviews}
      />
    </>
  );
};

export default ProductDetailBlock;
