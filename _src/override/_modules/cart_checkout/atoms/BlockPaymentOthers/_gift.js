import React, {useContext, useState} from 'react';
import {StyleSheet} from 'react-native';
import {useTranslation} from 'react-i18next';
import {FORM_FIELD, IS_IOS} from '@app/helpers/Constants';
import {useReactiveVar} from '@apollo/client';
import {rxAppSnackbar, rxCartId} from '@app/services/cache';
import {TouchableRipple} from 'react-native-paper';
import {CHECK_GIFT_CARD} from '@app/_modules/cart_checkout/services/schema';
import {getErrorGQL, numberFormat} from '@app/helpers/General';
import {Colors, Typography} from '@app/styles/index';
import {
  APPLY_GIFT_CARD,
  REMOVE_GIFT_CARD,
} from '@app/_modules/cart/services/schema';

import Text from '@app/components/Text/index';
import CustomView from '@app/components/CustomView/index';
import Forms from '@app/components/_Forms/index';
import useCarts, {TYPES} from '@app/hooks/carts/useCarts';
import useCustomQuery from '@app/hooks/useCustomQuery';
import useCustomMutation from '@app/hooks/useCustomMutation';
import RenderIf from '@app/components/RenderIf/index';
import _ from 'lodash';
import {CheckoutContext} from '@app/_modules/cart_checkout/_controller';

/**
 * ---------------------------------------------------- *
 * @const {styles}
 * @summary for react style
 * ---------------------------------------------------- *
 */
const styles = StyleSheet.create({
  formContainer: {
    paddingHorizontal: 0,
    marginBottom: 0,
  },
  btnCheckBalance: {
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 5,
  },
});

/**
 * ---------------------------------------------------- *
 * @component CheckoutGiftCard
 * @summary MAIN_COMPONENT
 * ---------------------------------------------------- *
 */
const CheckoutGiftCard = () => {
  const {t} = useTranslation();
  const ctxCheckout = useContext(CheckoutContext);
  const getRxCartId = useReactiveVar(rxCartId);
  const [dataGiftCard, setDataGiftCard] = useState({
    loading: false,
    isApplied: false,
    isError: false,
    code: null,
    balance: null,
  });
  const {onRefetchData: onApplyCartGiftCard} = useCustomMutation({
    schema: APPLY_GIFT_CARD,
  });
  const {onRefetchData: onRemoveCartGiftCard} = useCustomMutation({
    schema: REMOVE_GIFT_CARD,
  });
  const {onRefetchData: onCheckDataGiftCard} = useCustomQuery({
    schema: CHECK_GIFT_CARD,
    useInitData: false,
  });
  const {setCart: setDataPrice} = useCarts({
    initialized: false,
    type: TYPES.PRICE,
  });
  const {data: getDataGiftCards, setCart: setGiftCard} = useCarts({
    initialized: false,
    type: TYPES.APPLIED_GIFTCARD,
  });
  const {setCart: setAvailablePaymentMethod} = useCarts({
    initialized: false,
    type: TYPES.AVAILABLE_PAYMENT,
  });
  const getGiftCardsDetail = getDataGiftCards?.giftcard_detail;
  /**
   * ---------------------------------------------------- *
   * @function onProcessGiftCard
   * @param {data} object react form hooks
   * @summary for process gift card | applied | remove
   * ---------------------------------------------------- *
   */
  const onProcessGiftCard = async data => {
    const giftCardCode = data?.giftCardCode;
    if (giftCardCode === '') {
      setDataGiftCard({
        ...dataGiftCard,
        isError: true,
        balance: t('cart_checkout.error.requiredGiftCard'),
      });
      return;
    }
    // check data gift card
    if (data?.isCheckBalance) {
      try {
        const res = await onCheckDataGiftCard({
          paramsOpt: {isReturn: true},
          params: {giftCardCode},
        });

        if (res) {
          const getError = getErrorGQL(res);
          if (getError.isError) {
            setDataGiftCard({
              ...dataGiftCard,
              isError: getError.isError,
              balance: t('label.invalidCard'),
            });
            return;
          }
          const dataRes = res?.data;
          if (dataRes) {
            const giftCardAccount = dataRes?.giftCardAccount;
            const balance = giftCardAccount?.balance;
            setDataGiftCard({...dataGiftCard, isError: false, balance});
          }
        }
      } catch (err) {
        console.log('[err] check balance', err);
        setDataGiftCard({...dataGiftCard, balance: t('label.noData')});
      }
      return;
    }

    ctxCheckout?.setIsCart({
      ...ctxCheckout?.isCart,
      loadingButtonOrder: true,
    });

    // applied gift card
    try {
      const cart_id = getRxCartId;
      const res = await onApplyCartGiftCard({
        paramsOpt: {isReturn: true},
        params: {
          input: {
            cart_id,
            gift_card_code: data?.giftCardCode,
            giftcard_code: data?.giftCardCode,
          },
        },
      });
      const getError = getErrorGQL(res);
      if (getError.isError) {
        ctxCheckout?.setIsCart({
          ...ctxCheckout?.isCart,
          loadingButtonOrder: false,
        });
        setDataGiftCard({
          ...dataGiftCard,
          isError: getError.isError,
          balance: t('label.invalidCard'),
        });
        return;
      }

      const dataParams = _.get(res, 'data.applyGiftCardToCart.cart');
      if (dataParams) {
        setGiftCard(dataParams);
        setDataPrice();
        await setAvailablePaymentMethod();
        setDataGiftCard({
          ...dataGiftCard,
          isError: false,
          balance: null,
        });
      }

      ctxCheckout?.setIsCart({
        ...ctxCheckout?.isCart,
        loadingButtonOrder: false,
      });
    } catch (err) {
      ctxCheckout?.setIsCart({
        ...ctxCheckout?.isCart,
        loadingButtonOrder: false,
      });
      console.log('[err] applied gift card', err);
    }
  };

  /**
   * ---------------------------------------------------- *
   * @const {onRemoveGiftCard}
   * @summary remove gift card
   * ---------------------------------------------------- *
   */
  const onRemoveGiftCard = async code => {
    ctxCheckout?.setIsCart({
      ...ctxCheckout?.isCart,
      loadingButtonOrder: true,
    });

    try {
      const cart_id = getRxCartId;
      const res = await onRemoveCartGiftCard({
        paramsOpt: {isReturn: true},
        params: {
          input: {
            cart_id,
            gift_card_code: code,
            giftcard_code: code,
          },
        },
      });
      const getError = getErrorGQL(res);
      if (getError.isError) {
        ctxCheckout?.setIsCart({
          ...ctxCheckout?.isCart,
          loadingButtonOrder: false,
        });
        rxAppSnackbar({
          message: getError.message,
        });
        return;
      }
      const dataParams = _.get(res, 'data.removeGiftCardFromCart.cart');
      if (dataParams) {
        setGiftCard(dataParams);
        setDataPrice();
        await setAvailablePaymentMethod();
      }

      ctxCheckout?.setIsCart({
        ...ctxCheckout?.isCart,
        loadingButtonOrder: false,
      });
    } catch (err) {
      ctxCheckout?.setIsCart({
        ...ctxCheckout?.isCart,
        loadingButtonOrder: false,
      });
      console.log('[err] remove gift card', err);
    }
  };

  /**
   * ---------------------------------------------------- *
   * @const {formInputInfo}
   * @summary for data form input info
   * ---------------------------------------------------- *
   */
  const formInputInfo =
    dataGiftCard.balance === null || dataGiftCard.balance === undefined
      ? false
      : dataGiftCard.isError
      ? dataGiftCard.balance
      : `${t('balance')}: ${numberFormat(null, dataGiftCard.balance)}`;

  /**
   * ---------------------------------------------------- *
   * @const {forms}
   * @summary for generate form builder object
   * ---------------------------------------------------- *
   */
  const forms = [
    {
      name: 'giftCardCode',
      type: FORM_FIELD.INPUT,
      defaultValue: '',
      autoCapitalize: 'none',
      value: '',
      rules: {},
      formInputInfo,
      formInputInfoTextProps: {
        style: dataGiftCard.isError
          ? IS_IOS
            ? {
                color: Colors.ALERT_SECONDARY2,
                ...Typography.FONT_BOLD,
                fontWeight: 'bold',
              }
            : {
                color: Colors.ALERT_SECONDARY2,
                ...Typography.FONT_BOLD,
              }
          : {},
      },
    },
    {
      name: 'isCheckBalance',
      type: FORM_FIELD.CUSTOM_INPUT,
      renderItem: renderProps => {
        const handleSubmit = renderProps.handleSubmit;
        return (
          <CustomView horizontalCenter>
            <TouchableRipple
              style={styles.btnCheckBalance}
              onPress={handleSubmit(data => {
                data.isCheckBalance = true;
                onProcessGiftCard(data);
              })}>
              <Text bold underline color={Colors.PRIMARY}>
                {t('cart_checkout.label.checkBalance')}
              </Text>
            </TouchableRipple>
          </CustomView>
        );
      },
    },
  ];

  return (
    <CustomView marginTop={15}>
      <RenderIf condition={!dataGiftCard?.isApplied}>
        <Text bold>{t('cart_checkout.label.giftCardNumber')}</Text>
        <Forms
          resetAfterSubmit={true}
          fields={forms}
          buttonTitle={t('apply')}
          onSubmit={onProcessGiftCard}
          loading={dataGiftCard.loading}
          formContainerStyle={styles.formContainer}
          buttonStyle={{
            marginTop: 20,
            marginBottom: 0,
            paddingVertical: 0,
            borderWidth: 2,
            borderColor: Colors.PRIMARY,
            borderRadius: 30,
          }}
          buttonLabelStyle={
            IS_IOS
              ? {fontWeight: 'bold', ...Typography.FONT_BOLD}
              : {...Typography.FONT_BOLD}
          }
        />
      </RenderIf>
      <RenderIf condition={getGiftCardsDetail?.length > 0}>
        <CustomView marginTop={15}>
          {getGiftCardsDetail &&
            getGiftCardsDetail?.map((item, index) => {
              const giftCode = item?.giftcard_code;
              const giftAmount = item?.giftcard_amount_used;
              return (
                <CustomView row key={`gift-item-${index}`}>
                  <CustomView width={'50%'}>
                    <Text>{giftCode}</Text>
                    <Text small>{`${t('balance')}: ${numberFormat(
                      null,
                      giftAmount,
                    )}`}</Text>
                  </CustomView>
                  <TouchableRipple onPress={() => onRemoveGiftCard(giftCode)}>
                    <CustomView marginLeft={5}>
                      <Text bold underline color={Colors.PRIMARY}>
                        {t('remove')}
                      </Text>
                    </CustomView>
                  </TouchableRipple>
                </CustomView>
              );
            })}
        </CustomView>
      </RenderIf>
    </CustomView>
  );
};

export default CheckoutGiftCard;
