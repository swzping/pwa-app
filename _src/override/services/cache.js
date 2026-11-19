import {InMemoryCache, makeVar} from '@apollo/client';

/**
 * Set initial values when we create cache variables.
 */

export const rxAppLoading = makeVar(false);
export const rxAppSnackbar = makeVar(null);
export const rxAppMaintenance = makeVar(false);
export const rxUserInformation = makeVar(null);
export const rxUserToken = makeVar(null);
export const rxUserType = makeVar(null);
export const rxUserFontSize = makeVar(1);
export const rxUserTheme = makeVar(null);
export const rxUserWIshlistItems = makeVar(null);
export const rxUserAddresses = makeVar(null);
export const rxUserStoreCredit = makeVar(null);
export const rxUserRewardPoint = makeVar(null);
export const rxUserDefaultShippingAddressId = makeVar(null);
export const rxWishlistDataInformation = makeVar(null);

export const rxCartPayment = makeVar([]);
export const rxCartGiftCard = makeVar(null);
export const rxCartAppliedCoupon = makeVar(null);
export const rxCartAppliedStoreCredit = makeVar(null);
export const rxCartAppliedRewardPoint = makeVar(null);
export const rxCartSelectedPaymentMethod = makeVar(null);
export const rxCartAvailablePaymentMethod = makeVar(null);
export const rxCartBillingAddress = makeVar(null);
export const rxCartItems = makeVar(null);
export const rxCartId = makeVar(null);
export const rxCartIsVirtual = makeVar(false);
export const rxCartQty = makeVar(0);
export const rxProductIdCartItemIdMap = makeVar({});
export const rxCartPrices = makeVar(null);
export const rxCartExtraFee = makeVar(null);
export const rxCartPaymentMethod = makeVar(null);
export const rxCartPickupStore = makeVar(null);
export const rxCartShipping = makeVar([]);
export const rxCartShippingAmount = makeVar(null);
export const rxCartShippingAddress = makeVar(null);
export const rxCartShippingMethod = makeVar(null);
export const rxCartInfo = makeVar(null);
export const rxCartOrderId = makeVar(null);
export const rxCartSnapUrl = makeVar(null);
export const rxCartDataInformation = makeVar(null);
export const rxCartDataItem = makeVar([]);
export const rxCartDataItemBlockSubtotal = makeVar([]);
export const rxCartDataItemDiscount = makeVar([]);
export const rxCartDataAddress = makeVar(null);
export const rxCartDataPrice = makeVar(null);
export const rxCartTieringNudge = makeVar(null);
export const rxCartProcessingAPICount = makeVar(0);
export const rxCartDataBackupItem = makeVar([]);
// 标记购物车页面是否刚从 checkout 返回（用于控制是否调用 resetAutoApplyVoucher）
export const rxCartFromCheckout = makeVar(false);
// 标记是否从购物车页主动导航去 checkout（checkout 据此跳过 resetAutoApplyVoucher：
// 购物车页进店时已调用过）
export const rxCartFromCart = makeVar(false);
export const rxRefreshVoucherSlider = makeVar(0);
export const rxSelectedPoint = makeVar(null);
export const rxRefreshOrderDetail = makeVar(false);

export const rxMyTickets = makeVar(null);

export const cache = new InMemoryCache({
  addTypename: true,
  typePolicies: {
    Query: {
      fields: {
        customer: {
          merge: false,
        },
        VesMenuChildren: {
          merge: false,
        },
        Cart: {
          merge: true,
        },
      },
    },
    Cart: {
      fields: {
        prices: {
          merge(existing, incoming) {
            return incoming;
          },
        },
      },
    },
  },
});
