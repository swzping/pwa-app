import React, {useState} from 'react';
import {Capitalize} from '@app/helpers/General';
import useCustomMutation from '@app/hooks/useCustomMutation';
import {rxAppSnackbar} from '@app/services/cache';
import {Colors, Mixins} from '@app/styles';
import {ADD_PRODUCT_REVIEW} from '@app/_modules/product_detail/services/schema';

import Text from '@app/components/Text';
import CustomView from '@app/components/CustomView/index';
import Rating from '@app/components/Rating';
import Button from '@app/components/Button/index';
import InputBox from '@app/components/InputBox';

//
const AddReviewBlock = ({t, product}) => {
  const [loading, setLoading] = useState(false);
  const [rating, setRating] = useState(0);
  const [nickname, setNickname] = useState(null);
  const [summary, setSummary] = useState(null);
  const [detail, setDetail] = useState(null);

  const {onRefetchData: addProductReviewHook} = useCustomMutation({
    schema: ADD_PRODUCT_REVIEW,
  });

  const submitReview = async () => {
    if (rating !== 0 && nickname !== '' && summary !== '' && detail !== '') {
      try {
        setLoading(true);
        await addProductReviewHook({
          params: {
            input: {
              entity_pk_value: product.id,
              nickname: nickname,
              title: summary,
              detail: detail,
              ratings: [
                {
                  rating_name: 'Rating',
                  value: rating,
                },
              ],
            },
          },
          paramsOpt: {isReturn: true},
        });
        setRating(0);
        setNickname(null);
        setSummary(null);
        setDetail(null);
        rxAppSnackbar({
          message: t('product_detail.review.successSubmit'),
        });
        setLoading(false);
      } catch (error) {
        setLoading(false);
      }
    } else {
      rxAppSnackbar({
        message: t('product_detail.review.requiredField'),
      });
    }
  };

  return (
    <CustomView
      padding={20}
      // backgroundColor={Colors.GRAY_SMOOTH2}
      width={Mixins.MAX_WIDTH}>
      <CustomView marginBottom={10}>
        <Text style={{fontsize: 12}}>You're Reviewing :</Text>
        {/*<Text style={{fontsize: 16, fontWeight: 'bold'}}>*/}
        {/*  {t('product_detail.review.title')} :*/}
        {/*</Text>*/}
        <Text bold large style={{paddingTop: 5}}>
          {Capitalize(product.name)}
        </Text>
      </CustomView>
      <CustomView marginBottom={20}>
        <Text style={{marginBottom: 5, fontSize: 12}}>
          {/*{t('product_detail.review.rating')}*/}
          Your Rating
        </Text>
        <Rating
          click
          sizeIcon={24}
          count={rating}
          onClick={e => setRating(e)}
        />
      </CustomView>
      <CustomView>
        <InputBox
          value={nickname}
          onChangeText={setNickname}
          height={40}
          placeholder={t('product_detail.review.nickname')}
          style={{
            marginBottom: 10,
            borderColor: Colors.GRAY_LIGHT,
            borderWidth: 1,
            borderRadius: 5,
          }}
        />
        <InputBox
          value={summary}
          onChangeText={setSummary}
          height={40}
          placeholder={t('product_detail.review.summary')}
          style={{
            marginBottom: 10,
            borderColor: Colors.GRAY_LIGHT,
            borderWidth: 1,
            borderRadius: 5,
          }}
        />
        <InputBox
          multilines
          value={detail}
          onChangeText={setDetail}
          placeholder={t('product_detail.review.review')}
          height={144}
          style={{
            marginBottom: 10,
            textAlignVertical: 'top',
            borderColor: Colors.GRAY_LIGHT,
            borderWidth: 1,
            borderRadius: 5,
          }}
        />
      </CustomView>
      <Button
        label={t('product_detail.review.submit')}
        borderRadius={3}
        width={Mixins.MAX_WIDTH * 0.4}
        styleProp={{backgroundColor: Colors.PRIMARY, borderRadius: 5}}
        textStyleProp={{color: Colors.WHITE}}
        onPress={submitReview}
        disabled={loading}
        loading={loading}
      />
    </CustomView>
  );
};

export default AddReviewBlock;
