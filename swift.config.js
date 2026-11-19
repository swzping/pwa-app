/**
 * ----------------------------------------- *
 * @constant {languages}
 * @summary data language support
 * ----------------------------------------- *
 */
export const languages = ['en', 'id'];

/**
 * ----------------------------------------- *
 * @constant {socialShares}
 * @summary social shares enable in PDP
 * ----------------------------------------- *
 */
export const socialShares = ['email', 'facebook', 'twitter'];

/**
 * ----------------------------------------- *
 * @constant {pushNotificationConfig}
 * @summary push notification enabled
 * ----------------------------------------- *
 */
export const pushNotificationConfig = {
  console: true,
};

/**
 * ----------------------------------------- *
 * @constant {apolloConfig}
 * @summary apollo for config
 * @file @app/services/api.js
 * ----------------------------------------- *
 */
export const apolloConfig = {
  method: 'GET',
  console: false,
};

/**
 * ----------------------------------------- *
 * @constant {tabsApp}
 * @summary name of tabs apps in main page after login
 * @file @app/navigations/_stack-app.js
 * ----------------------------------------- *
 */
export const tabsApp = {
  enable: true,
  name: 'TabStackApp',
};

/**
 * ----------------------------------------- *
 * @constant {modules}
 * @summary this all modules config
 * @file @app/_modules/*
 * ----------------------------------------- *
 */
let modules = {
  account: {
    name: 'Account',
    enable: true,
  },
  account_medical_test: {
    name: 'AccountMedicalTest',
    enable: false,
  },
  account_about_us: {
    name: 'AboutUs',
    enable: false,
  },
  account_categories: {
    name: 'AccountCategories',
    enable: true,
  },
  account_change_password: {
    name: 'AccountChangePassword',
    enable: true,
  },
  account_confirm_payment: {
    name: 'AccountConfirmPayment',
    enable: true,
  },
  account_contact_us: {
    name: 'AccountContactUs',
    enable: true,
  },
  account_gift_card: {
    name: 'AccountGiftCard',
    enable: true,
  },
  account_help: {
    name: 'AccountHelp',
    enable: true,
  },
  account_languages: {
    name: 'AccountLanguages',
    enable: true,
  },
  account_myaccount: {
    name: 'AccountMyAccount',
    enable: true,
  },
  account_myaddress: {
    name: 'AccountMyAddress',
    enable: true,
  },
  account_update_information: {
    name: 'AccountUpdateInformation',
    enable: true,
  },
  account_address_add: {
    name: 'AddAddress',
    enable: true,
  },
  account_address_edit: {
    name: 'EditAddress',
    enable: true,
    desc: 'now its component must conversion into modules (address_form)',
  },
  account_myreturn: {
    name: 'AccountMyReturn',
    enable: true,
  },
  account_storecredit: {
    name: 'AccountStoreCredit',
    enable: true,
  },
  account_myreturn_detail: {
    name: 'AccountMyReturnDetail',
    enable: true,
  },
  account_newsletter: {
    name: 'AccountNewsletter',
    enable: true,
  },
  account_notification: {
    name: 'AccountNotification',
    enable: true,
  },
  account_notification_detail: {
    name: 'AccountNotificationDetail',
    enable: true,
  },
  account_purchases: {
    name: 'AccountPurchases',
    enable: true,
  },
  account_purchases_detail: {
    name: 'AccountPurchasesDetail',
    enable: true,
  },
  account_product_review: {
    name: 'AccountProductReview',
    enable: true,
  },
  account_refer_friend: {
    name: 'AccountReferFriend',
    enable: true,
  },
  account_returns: {
    name: 'AccountReturns',
    enable: true,
  },
  account_rewardpoint: {
    name: 'AccountRewardPoint',
    enable: true,
  },
  account_settings: {
    name: 'AccountSettings',
    enable: true,
  },
  account_mycoupon: {
    name: 'AccountMyCoupon',
    enable: true,
  },
  account_mycoupon_detail: {
    name: 'AccountMyCouponDetail',
    enable: true,
  },
  account_mypointhistory: {
    name: 'AccountMyPointHistory',
    enable: true,
  },
  account_trackorder: {
    name: 'AccountTrackOrder',
    enable: true,
  },
  account_wishlist: {
    name: 'AccountWishlist',
    enable: true,
  },
  account_deletion: {
    name: 'AccountDeletion',
    enable: true,
  },
  auth_forgot: {
    name: 'AuthForgot',
    enable: true,
  },
  auth_landing: {
    name: 'AuthLanding',
    enable: true,
  },
  auth_signin: {
    name: 'AuthSignin',
    enable: true,
  },
  auth_signup: {
    name: 'AuthSignup',
    enable: true,
    atoms: {
      otp: {
        name: 'AtomOtp',
        component: false,
        enable: false,
      },
    },
  },
  blank: {
    name: 'Blank',
    enable: true,
  },
  blog_detail: {
    name: 'BlogDetail',
    enable: true,
  },
  blog_list: {
    name: 'BlogList',
    enable: true,
  },
  brand_page: {
    name: 'BrandPage',
    enable: true,
  },
  cart: {
    name: 'Cart',
    enable: true,
    atoms: {
      update_item_qty_modal: {
        name: 'QuantityModal',
        enable: false,
      },
      update_item_qty_input: {
        name: 'CustomInputQty',
        enable: true,
      },
    },
  },
  product_review: {
    name: 'productReview',
    enable: true,
  },
  cart_checkout_onestep: {
    name: 'CartCheckoutOneStep',
    enable: false,
  },
  cart_checkout_pwa: {
    name: 'CartCheckoutPwa',
    enable: false,
  },
  cart_edit: {
    name: 'CartEdit',
    enable: true,
  },
  cart_payment: {
    name: 'CartPayment',
    enable: true,
  },
  cart_shipping: {
    name: 'CartShipping',
    enable: true,
  },
  cart_checkout: {
    name: 'CartCheckout',
    enable: true,
  },
  evoucher_selection: {
    name: 'EvoucherSelection',
    enable: true,
  },
  point_selection: {
    name: 'PointSelection',
    enable: true,
  },
  coupon_list: {
    name: 'CouponList',
    enable: true,
  },
  cart_thankyou: {
    name: 'CartThankYou',
    enable: true,
  },
  cart_guestcheckout: {
    name: 'GuestCheckout',
    enable: true,
  },
  guest_add_to_cart: {
    name: 'GuestAddToCart',
    enable: false,
  },
  customer_care: {
    name: 'CustomerCare',
    enable: true,
  },
  customer_chat: {
    name: 'CustomerChat',
    enable: false,
  },
  detail_categories: {
    name: 'DetailCategories',
    enable: true,
  },
  main_categories: {
    name: 'MainCategories',
    enable: true,
  },
  main_home: {
    name: 'MainHome',
    enable: true,
  },
  detailed_rules: {
    enable: true,
    name: 'DetailedRules',
  },
  gwp_list: {
    enable: true,
    name: 'GwpList',
  },
  main_search: {
    name: 'MainSearch',
    enable: true,
    config: {
      show_category_limit: 4,
      show_product_limit: 4,
    },
  },
  maintenance_mode: {
    name: 'MaintenanceMode',
    enable: true,
  },
  product_detail: {
    name: 'ProductDetail',
    enable: true,
    atoms: {
      social_share: {
        name: 'SocialShare',
        component: true,
        enable: false,
      },
    },
  },
  product_list: {
    name: 'ProductList',
    enable: true,
  },
  store_locator: {
    name: 'StoreLocator',
    enable: true,
  },
  taxes: {
    name: 'Taxes',
    enable: true,
  },
  cms_page: {
    name: 'CmsPage',
    enable: true,
  },
  new_cms: {
    name: 'NewCms',
    enable: true,
  },
  sub_cms_page: {
    //new for cms builder
    name: 'SubCMSPage',
    enable: true,
  },
  scanner: {
    name: 'Scanner',
    enable: true,
  },
  guardian_run: {
    name: 'run',
    enable: true,
  },
  guardian_run_register: {
    name: 'GuardianRunRegister',
    enable: true,
  },
  hignlight_Web_View: {
    name: 'HigntlightWebView',
    enable: true,
  },
  full_screen_web_view: {
    name: 'FullScreenWebView',
    enable: true,
  },
  webview_becon_screen: {
    name: 'becon_page_view',
    enable: true,
  },
  account_health_report: {
    name: 'AccountHealthReport',
    enable: true,
  },
  account_health_report_detail: {
    name: 'AccountHealthReportDetail',
    enable: true,
  },
  account_milestone: {
    name: 'AccountMilestone',
    enable: true,
  },
  account_eventbooking: {
    name: 'AccountEventBooking',
    enable: true,
  },
  event_detail: {
    name: 'EventDetail',
    enable: true,
  },
  event_config: {
    name: 'EventConfigScreen',
    enable: true,
  },
  returned_product: {
    name: 'ReturnedProduct',
    enable: true,
  },
  return_or_refund: {
    name: 'ReturnOrRefund',
    enable: true,
  },
  refund_detail: {
    name: 'RefundDetail',
    enable: true,
  },
};

/**
 * ---------------------------------------------------- *
 * @const {accountMenu}
 * @summary menu account
 * ---------------------------------------------------- *
 */
modules.account.atoms = {
  ...modules.account.atoms,
  menus: [
    {
      label: 'myOrders',
      icon: 'shopping-outline',
      enable: modules.account_purchases.enable,
      moduleName: modules.account_purchases.name,
    },
    {
      label: 'notification',
      icon: 'bell',
      enable: modules.account_notification.enable,
      moduleName: modules.account_notification.name,
    },
    {
      label: 'myCoupon',
      icon: 'tag-outline',
      enable: modules.account_mycoupon.enable,
      moduleName: modules.account_mycoupon.name,
    },
    {
      label: 'pointHistory',
      icon: 'tag-outline',
      enable: modules.account_mypointhistory.enable,
      moduleName: modules.account_mypointhistory.name,
    },
    {
      label: 'customerCare',
      icon: 'account-supervisor-circle',
      enable: modules.customer_care.enable,
      moduleName: modules.customer_care.name,
    },
    {
      label: 'accountInformation',
      icon: 'account-outline',
      enable: modules.account_update_information.enable,
      moduleName: modules.account_update_information.name,
    },
    {
      label: 'healthReport',
      icon: null,
      useCustomIcon: true,
      enable: modules.account_health_report.enable,
      moduleName: modules.account_health_report.name,
    },
    {
      label: 'addressList',
      icon: 'text-box-multiple-outline',
      show: modules.account_myaddress.enable,
      enable: modules.account_myaddress.enable,
      moduleName: modules.account_myaddress.name,
    },
    {
      label: 'settings',
      icon: 'cog-outline',
      enable: modules.account_settings.enable,
      moduleName: modules.account_settings.name,
    },
    {
      label: 'milestone',
      icon: null,
      useCustomIcon: true,
      enable: modules.account_milestone.enable,
      moduleName: modules.account_milestone.name,
    },
  ],
};

export {modules};
