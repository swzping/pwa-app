import {Platform} from 'react-native';
/**
 * ---------------------------------------------------- *
 * @constant {platform}
 * @summary this constants condition for platform
 * ---------------------------------------------------- *
 */
export const IS_IOS = Platform.OS === 'ios';

/**
 * ---------------------------------------------------- *
 * @constant {user}
 * @summary this constants condition for user
 * ---------------------------------------------------- *
 */
export const USER_GUEST = 'guest';
export const USER_CUSTOMER = 'customer';

/**
 * ---------------------------------------------------- *
 * @summary constant for alert type
 * ---------------------------------------------------- *
 */
export const ERROR = 'error';
export const SUCCESS = 'success';

/**
 * ---------------------------------------------------- *
 * @constant {size}
 * @summary this constants use for styling
 * ---------------------------------------------------- *
 */
export const SMALL = {label: 'Small', size: 0.8};
export const MEDIUM = {label: 'Medium', size: 1};
export const LARGE = {label: 'Large', size: 1.35};

/**
 * ---------------------------------------------------- *
 * @constant {key item}
 * @summary this constants use for key on items
 * ---------------------------------------------------- *
 */
export const TOTAL_PRICE_BLOCK = 'total-price-block-';

/**
 * ---------------------------------------------------- *
 * @summary use for Form Field types
 * ---------------------------------------------------- *
 */
export const FORM_FIELD = {
  CHECKBOX: 'Checkbox',
  DATE: 'Date',
  INPUT: 'Input',
  INPUT_DROPDOWN: 'InputDropDown',
  CUSTOM: 'Custom',
  CUSTOM_INPUT: 'CustomInput',
};

/**
 * ----------------------------------------- *
 * @constant {crashlytics}
 * @summary this constants use for
 * crashlytics attributes
 * ----------------------------------------- *
 */
export const CART_ID = 'CART ID';
export const CART_ID_CART = 'CART ID CART';
export const USER_TYPE = 'USER TYPE';
export const BEARER = 'BEARER';
export const COUPONS = 'COUPONS';
export const DARK = 'dark';
export const EMAIL = 'EMAIL';
export const LIGHT = 'light';
export const REMOVE = 'REMOVE';
export const SHIPPING_ADDRESS_ID = 'SHIPPING ADDRESS ID';
export const SHIPPING_METHOD_CODE = 'SHIPPING ADDRESS CODE';
export const PAYMENT_METHOD = 'PAYMENT METHOD';

/**
 * ---------------------------------------------------- *
 * @const {typeProducts}
 * @summary this constant use for product type name
 * from graphql
 * ---------------------------------------------------- *
 */
export const TYPE_ID_CONFIGURABLE = 'configurable';
export const TYPENAME_SIMPLE = 'SimpleProduct';
export const TYPENAME_CONFIGURABLE = 'ConfigurableProduct';
export const TYPENAME_VARIANT = 'ConfigurableVariant';
export const TYPENAME_BUNDLE = 'BundleProduct';
export const TYPENAME_VIRTUAL = 'VirtualProduct';
export const PRODUCT = 'product';
export const CATEGORY = 'category';
export const BRAND = 'brand';
export const BRANDS = 'Brands';
export const LOGIN_REGISTER = 'login-register';
export const MEMBERSHIP_BENEFIT = 'membership-benefit';
export const GAMIFICATION = 'gamification';
export const OFFLINE_ACTIVITY_DETAIL = 'offline-activity-detail';
export const SIMPLE = 'simple';
export const CATALOG = 'catalog';
export const TIPS = 'Tips';
export const SEARCH = 'search';
export const REGISTER = 'register';
export const CMS_PAGE = 'cms';
export const GUARDIAN_RUN = 'run';

/**
 * ---------------------------------------------------- *
 * @const {typeProducts}
 * @summary this constant use for product type name
 * from graphql
 * ---------------------------------------------------- *
 */

export const NOTIF_PROMO_CATEGORY = 'promo-category';
export const NOTIF_PROMO_PRODUCT = 'promo-product';
export const NOTIF_ABANDONED_CART = 'abandoned-cart';
export const NOTIF_CMS_PAGE = 'landing-page';

/**
 * ---------------------------------------------------- *
 * @const {productStatus}
 * @summary this constant use for product status
 * in oms or backoffice
 * ---------------------------------------------------- *
 */
export const IN_STOCK = 'IN_STOCK';
export const OUT_OF_STOCK = 'OUT_OF_STOCK';
export const PRODUCT_TAB_DETAIL = 'details';
export const PRODUCT_TAB_REVIEW = 'review';

/**
 * ---------------------------------------------------- *
 * @const {delivery Method}
 * @summary this constant use for delivery method
 * ---------------------------------------------------- *
 */
export const HOME_DELIVERY = 'HOME_DELIVERY';
export const PICKUP_IN_STORE = 'PICKUP_IN_STORE';

/**
 * ---------------------------------------------------- *
 * @const {onClickHandlerPrice}
 * @summary this constant use for on click handler key
 * on TotalPriceBlock
 * ---------------------------------------------------- *
 */
export const TOTAL_DISCOUNT = 'totalDiscount';

/**
 * ---------------------------------------------------- *
 * @const {SPECIAL_PRICE}
 * @summary this constant use for marking item discount
 * on Cart
 * ---------------------------------------------------- *
 */
export const SPECIAL_PRICE = 'special_price';

/**
 * ---------------------------------------------------- *
 * @const {typeHTMLNode}
 * @summary this constant use for atom decision
 * on WebViewContent component
 * ---------------------------------------------------- *
 */
export const NODE_IMG = 'img';

/**
 * ---------------------------------------------------- *
 * @const {storeURL}
 * @summary this constant use for version checking
 * in useFirestoreForceUpdate and Version helper
 * ---------------------------------------------------- *
 */
export const STOREURL_ANDROID = 'http://play.google.com/store/apps/details';
export const STOREID_ANDROID = 'id.app.guardian';
export const STOREURL_IOS = 'itms-apps://itunes.apple.com/us/app/apple-store';
export const STOREID_IOS = '1623324002';

/**
 * ---------------------------------------------------- *
 * @const {responseMessage}
 * @summary this constant use checking condition
 * based on response message
 * ---------------------------------------------------- *
 */
export const RESPONSE_EMAIL_ALREADY_REGISTERED =
  'Email address is already registered';
export const RESPONSE_EMAIL_NOT_VERIFIED =
  'Email is not verified. Please check your email';
export const RESPONSE_ACCOUNT_CREATED =
  'Your account has been created successfully';
export const RESPONSE_SUCCEED_CONTACT = 'Thanks For Contacting Us';
export const SUBSCRIBED = 'SUBSCRIBED';
export const EMAIL_SUBSCRIBED = 'The email address is subscribed.';

/**
 * ---------------------------------------------------- *
 * @const {errorMessage}
 * @summary this constant use checking condition
 * based on error message
 * ---------------------------------------------------- *
 */
export const ERROR_UNFILLED_FORM =
  'The form is unfilled. Please fill the form.';
export const ERROR_UNAUTHORIZHED = "The current customer isn't authorized.";
export const ERROR_UNAUTHORIZHED_TOKEN = 'Received status code 401';
export const ERROR_USER_NOT_EXIST = 'User does not exist';
export const ERROR_CUSTOMER_NOT_EXIST_LIST = [
  'Customer does not exist',
  'Customer does not exist.',
];
export const ERROR_EMAIL_NOT_EXIST = 'Email address does not exist';
export const ERROR_EMAIL_NOT_VERIFIED = 'Email is not verified';
export const ERROR_LIMIT_SENDING_EMAILS =
  'You have reached a limit for sending emails';
export const ERROR_INVALID_ID_OR_PASSWORD = 'Invalid user ID and/or password';
export const ERROR_INVALID_LOGIN_OR_PASSWORD = 'Invalid login or password.';
export const ERROR_INVALID_CURRENT_PASSWORD = 'Current password is invalid';
export const ERROR_INVALID_NEW_PASSWORD = 'The new password is invalid';
export const ERROR_PHONE_NUMBER_EXIST =
  'There is already an account with this phone number.';
export const ERROR_CANNOT_SUBSCRIBE =
  'Cannot create a newsletter subscription.';
export const ERROR_EMAIL_ALREADY_SUBSCRIBE =
  'This email address is already subscribed.';
export const ERROR_ACCOUNT_INCORRECT_OR_DISABLED =
  'The account sign-in was incorrect or your account is disabled temporarily';

export const ERROR_SESSION_EXPIRED =
  'The current user cannot perform operations';
export const ERROR_USER_HAVENT_CART =
  'Current user does not have an active cart.';
export const ERROR_INACTIVE_CART = "The cart isn't active.";
export const ERROR_QTY_UPDATE = 'The requested qty is not available';
export const ERROR_QTY_OOS = 'Some of the products are out of stock';
export const ERROR_COULDNT_FIND_ITEM = 'Could not find cart item with id';
export const ERROR_NO_INTERNET_CONNECTION = 'Network request failed';
export const ERROR_NO_ITEM_IN_CART = "The cart doesn't contain the item";
export const ERROR_NOT_FOUND_ID_CART = 'Could not find a cart with ID';
export const ERROR_GUEST_CHECKOUT = 'Guest checkout is not allowed.';
export const ERROR_INTERNAL_SERVER = 'Internal server error';
export const ERROR_PRODUCT_NOT_AVAILABLE =
  'Product that you are trying to add is not available';
export const ERROR_CANNOT_RESET_PASSWORD =
  "Cannot reset the customer's password";
export const ERROR_MAX_RESET_ATTEMPTS =
  'You have reached the maximum number of password reset attempts';
export const ERROR_MINIMUM_PURCHASE_QTY = 'The fewest you may purchase is';
export const ERROR_MAXIMUM_PURCHASE_QTY =
  'The requested qty exceeds the maximum qty allowed in shopping cart';
/**
 * ---------------------------------------------------- *
 * @const {configLinking}
 * @summary this constant use for config navigation
 * on index Navigation
 * ---------------------------------------------------- *
 */

export const config = {
  screens: {
    MainHome: {
      path: 'home',
    },
    ProductList: {
      path: 'product-list/:type?/:categoryId?',
      parse: {
        type: type => `${type}`,
        categoryId: categoryId => `${categoryId}`,
      },
    },
    ProductDetail: {
      path: 'product-detail/:productUrlKey?',
      parse: {
        productUrlKey: productUrlKey => `${productUrlKey}`,
      },
    },
  },
};

export const linking = {
  prefixes: ['guardian://'],
  config,
};

/**
 * ---------------------------------------------------- *
 * @const {remoteConfigParameterTypes}
 * @summary this constant use for define
 * remote config parameter types
 * ---------------------------------------------------- *
 */
export const TYPE_BOOLEAN = 'boolean';
export const TYPE_NUMBER = 'number';
export const TYPE_STRING = 'string';

/**
 * ---------------------------------------------------- *
 * @const {FilterName}
 * @summary this constant use for define
 * Filter Name
 * ---------------------------------------------------- *
 */
export const PRICE = 'price';
export const CATEGORY_ID = 'category_id';
export const CATEGORY_UID = 'category_uid';

/**
 * ---------------------------------------------------- *
 * @const {remoteConfigParameters}
 * @summary this constant use for define
 * remote config parameters
 * ---------------------------------------------------- *
 */
export const PWA_CHECKOUT_PARAMETER = 'pwa_checkout';

/**
 * ---------------------------------------------------- *
 * @const {categoryList}
 * @summary this constant use for define
 * Category List
 * ---------------------------------------------------- *
 */
export const WHATS_NEW = "What's New";
export const WOMEN = 'Women';
export const MEN = 'Men';
export const GEAR = 'Gear';
export const SALE = 'Sale';
export const TRAINING = 'Training';
export const ONLY_ON_GUARDIAN = 'Hanya Di Guardian';

/**
 * ---------------------------------------------------- *
 * @const {socialMedia}
 * @summary this constant use for define
 * SocialMedia
 * ---------------------------------------------------- *
 */
export const TIKTOK = 'tiktok';
export const FACEBOOK = 'facebook';

/**
 * ---------------------------------------------------- *
 * @const {array}
 * @summary this constant use for define
 * sort list
 * ---------------------------------------------------- *
 */
export const sort = {
  items: [
    {label: 'Best Match', value: {relevance: 'DESC'}},
    {label: 'Position', value: {position: 'ASC'}},
    {label: 'Price: Low to High', value: {price: 'ASC'}},
    {label: 'Price: High to Low', value: {price: 'DESC'}},
    // {label: 'New Arrival', value: {new_arrivals: 'DESC'}},
    // {label: 'Newest First', value: {new_old: 'ASC'}},
    // {label: 'Oldest First', value: {new_old: 'DESC'}},
    // {label: 'Best Seller', value: {bestseller: 'DESC'}},
    // {label: 'On Sale', value: {onsale: 'DESC'}},
    // {label: 'Most Viewed', value: {mostviewed: 'DESC'}},
    // {label: 'Wishlist Top', value: {wishlisttop: 'DESC'}},
    // {label: 'Top Rated', value: {top_rated: 'DESC'}},
    // {label: 'Featured', value: {featured: 'DESC'}},
    // {label: 'Free', value: {free: 'DESC'}},
  ],
};

export const sortBySearch = {
  items: [
    // "Default" (value: null) resets to the defaultSort branch
    {label: 'Default', value: null},
    {label: 'Best Match', value: {relevance: 'DESC'}},
    {label: 'Position', value: {position: 'ASC'}},
    {label: 'Price: Low to High', value: {price: 'ASC'}},
    {label: 'Price: High to Low', value: {price: 'DESC'}},
    {label: 'Highest Discount', value: {discount_percentage: 'DESC'}},
  ],
};

export const sortByPLP = {
  items: [
    // "Default" (value: null) resets to the page's initial
    // ordering — selectSort maps it to the defaultSort branch
    {label: 'Default', value: null},
    {label: 'Position', value: {position: 'ASC'}},
    {label: 'Best Match', value: {relevance: 'DESC'}},
    {label: 'Price: Low to High', value: {price: 'ASC'}},
    {label: 'Price: High to Low', value: {price: 'DESC'}},
    {label: 'Highest Discount', value: {discount_percentage: 'DESC'}},
  ],
};

export const sortByOffline = {
  items: [
    {label: 'Purchased', value: {position: 'NORMAL'}},
    {label: 'Refund', value: {position: 'REFUND'}},
  ],
};

export const sortByVoucherStatus = {
  items: [
    {label: 'Valid', value: {position: 'valid'}},
    {label: 'Used', value: {position: 'used'}},
    // {label: 'Expired', value: {position: 'expired'}},
  ],
};

/**
 * ---------------------------------------------------- *
 * @const {alertType}
 * @summary this constant use for define
 * alert component type
 * ---------------------------------------------------- *
 */
export const TYPE_SUCCESS = 'success';
export const TYPE_FAILED = 'failed';

/**
 * ---------------------------------------------------- *
 * @const {cmsType}
 * @summary this constant use for define cms type
 * cms component type
 * ---------------------------------------------------- *
 */
export const TYPE_PAGE = 'page';
export const TYPE_BLOCK = 'block';
export const TYPE_URL = 'url';
export const TYPE_BLOG = 'blog';
export const TYPE_BRANDS = 'brands';
export const TYPE_PLP = 'plp';
export const TYPE_CONTACT = 'contact';
export const TYPE_BLANK = '_blank';

/**
 * ---------------------------------------------------- *
 * @const {FOOTER_TYPE}
 * @summary this constant use for define data type
 * cms component type
 * ---------------------------------------------------- *
 */
export const FOOTER_TYPE = [
  {identifier: 'guardian-about-us', dataType: TYPE_PAGE},
  {identifier: 'how-to-shop', dataType: TYPE_PAGE},
  {identifier: 'faqs', dataType: TYPE_PAGE},
  {identifier: 'contact', dataType: TYPE_CONTACT},
  {identifier: 'blog', dataType: TYPE_BLOG},
  {identifier: 'brands', dataType: TYPE_BRANDS},
  {identifier: 'privacy-policy', dataType: TYPE_PAGE},
  {identifier: 'terms-conditions', dataType: TYPE_PAGE},
  {identifier: 'return-refund', dataType: TYPE_PAGE},
  {identifier: 'pembatasan-tanggung-jawab', dataType: TYPE_PAGE},
  {identifier: 'account-deletion', dataType: TYPE_PAGE},
];

/**
 * ---------------------------------------------------- *
 * @const {orserStatus}
 * @summary this constant use for define order status
 * ---------------------------------------------------- *
 */
export const PENDING = 'pending';
export const PROCESSING = 'processing';
export const CANCELED = 'canceled';
export const COMPLETE = 'complete';

/**
 * ---------------------------------------------------- *
 * @const {shimmer}
 * @summary this constant use for define shimmer type
 * ---------------------------------------------------- *
 */
export const TYPE_SHIMMER_CART_ITEMS = 'shimmer-cart-item';
export const TYPE_SHIMMER_CART_LIST = 'shimmer-cart-list';
export const TYPE_SHIMMER_ACCOUNT_NAME = 'shimmer-account-name';
export const TYPE_SHIMMER_ACCOUNT_MYPOINT = 'shimmer-account-mypoint';
export const TYPE_SHIMMER_ITEM_QTY = 'shimmer-item-qty';
export const TYPE_SHIMMER_ITEM_DISCOUNT = 'shimmer-item-discount';
export const TYPE_SHIMMER_FEATURED_BRAND = 'shimmer-featured-brand';
export const TYPE_SHIMMER_CMS_HOME = 'shimmer-cms-home';
export const TYPE_SHIMMER_CUSTOMER_CARE = 'shimmer-customer-care';
export const TYPE_SHIMMER_REWARD_POINT = 'shimmer-reward-point';
export const TYPE_SHIMMER_STORE_CREDIT = 'shimmer-store-credit';
export const TYPE_SHIMMER_PURCHASES = 'shimmer-purchases';
export const TYPE_SHIMMER_SETTINGS = 'shimmer-settings';
export const TYPE_SHIMMER_PRODUCT_REVIEW = 'shimmer-product-review';
export const TYPE_SHIMMER_PRODUCT = 'shimmer-product';
export const TYPE_SHIMMER_PRODUCTS = 'shimmer-products';
export const TYPE_SHIMMER_CATEGORY_LIST = 'shimmer-category-list';
export const TYPE_SHIMMER_PLP = 'shimmer-plp';
export const TYPE_SHIMMER_FOOTER = 'shimmer-footer';
export const TYPE_SHIMMER_BLOG_DETAIL = 'shimmer-blog-detail';
export const TYPE_SHIMMER_CMS_PAGE = 'shimmer-cms-page';
export const TYPE_SHIMMER_MEDICAL_TEST = 'shimmer-medical-test';
export const TYPE_SHIMMER_MILESTONE = 'shimmer-milestone';

/**
 * ---------------------------------------------------- *
 * @const {modal}
 * @summary this constant use for define modal type
 * ---------------------------------------------------- *
 */
export const TYPE_MODAL_AUTH_SIGNIN = 'modal-auth-signin';
export const TYPE_MODAL_SHIPPING_ADDRESS_FORM = 'modal-shipping-address-form';
export const TYPE_MODAL_SHIPPING_ADDRESS_LIST = 'modal-shipping-address-list';
export const TYPE_MODAL_PAYMENT_SNAP = 'modal-payment-snap';
export const TYPE_MODAL_SORT = 'modal-sort';
export const TYPE_MODAL_SUBTOTAL_HELP = 'modal-subtotal-help';
export const TYPE_ADDRESS_FORM_COUNTRY = 'country';
export const TYPE_ADDRESS_FORM_REGION = 'region';
export const TYPE_ADDRESS_FORM_CITY = 'city';
export const TYPE_ADDRESS_FORM_DISTRICT = 'district';
export const TYPE_ADDRESS_FORM_DISTRICT_SUB = 'subdistrict';
export const TYPE_ADDRESS_FORM_URBAN = 'urbanVillage';
export const TYPE_ADDRESS_FORM_POSTAL = 'postalCode';

/**
 * ---------------------------------------------------- *
 * @const {paymentMethod}
 * @summary this constant use for define payment others
 * ---------------------------------------------------- *
 */
export const IS_FREE = 'free';

/**
 * ---------------------------------------------------- *
 * @const {paymentOthers}
 * @summary this constant use for define payment others
 * ---------------------------------------------------- *
 */
export const TYPE_COUPON_CODE = 'coupon-code';
export const TYPE_GIFT_CARD = 'gift-card';
export const TYPE_MY_POINT = 'my-point';

/**
 * ---------------------------------------------------- *
 * @const {snapCondition}
 * @summary this constant use for condition of snap
 * ---------------------------------------------------- *
 */
export const CONTAIN_SNAP = 'snap';
export const PREFIX_AIRPAY = '//wsa.wallet.airpay.co.id';
export const PREFIX_GOJEK = 'gojek';
export const PREFIX_GOJEK_LINK = 'https://gojek.link/';
export const PREFIX_GOJEK_GOPAY = 'gopay';
export const PREFIX_GOPAY = 'https://gopay.co.id';
export const PREFIX_SHOPEE = 'https://shopee.co.id/';
export const PREFIX_SHOPEEID = 'shopeeid://';
export const PREFIX_SHOPEEPAY = 'https://pay.airpay.co.id';

/**
 * ---------------------------------------------------- *
 * @const {paymentOthers}
 * @summary this constant use for define payment others
 * ---------------------------------------------------- *
 */
export const TYPE_LIST_ADDRESS_ACCOUNT = 'list-address-account';
export const TYPE_LIST_ADDRESS_CHECKOUT = 'list-address-checkout';

/**
 * ---------------------------------------------------- *
 * @const {filterBrands}
 * @summary this constant use for define
 * sort Brands list
 * ---------------------------------------------------- *
 */
export const filterBrands = [
  'All',
  'A',
  'B',
  'C',
  'D',
  'E',
  'F',
  'G',
  'H',
  'I',
  'J',
  'K',
  'L',
  'M',
  'N',
  'O',
  'P',
  'Q',
  'R',
  'S',
  'T',
  'U',
  'V',
  'W',
  'X',
  'Y',
  'Z',
];

/**
 * ---------------------------------------------------- *
 * @const {linkingURL}
 * @summary this constant use for linking stuff
 * ---------------------------------------------------- *
 */
export const PREFIX_API_WHATSAPP = 'https://api.whatsapp.com/';
export const CHAT_WHATSAPP_URL = `${PREFIX_API_WHATSAPP}send?phone=628111082108&text=*Konsultasi%20Mengenai%20Obat%20dan%20kesehatan%20lainnya*%0APertanyaan%20saya:%20`;
export const ASK_PHARMACIST_WHATSAPP_URL = `${PREFIX_API_WHATSAPP}send?phone=6281398782826&text=*Konsultasi%20Mengenai%20Obat%20dan%20kesehatan%20lainnya*%0APertanyaan%20saya:%20`;

/**
 * ---------------------------------------------------- *
 * @const {Bypass Error Source}
 * @summary this constant use for define bypass error source
 * ---------------------------------------------------- *
 */

export const BYPASS_ERROR_ACCOUNT = 'Account Controller';
export const BYPASS_ERROR_APP_INITIAL_CUSTOMER =
  'useNavAppInitialize (Customer) funct';
export const BYPASS_ERROR_APP_INITIAL_CART_ITEM =
  'useNavAppInitialize (Cart Item) funct';
export const BYPASS_ERROR_APP_INITIAL_CART_PRICE =
  'useNavAppInitialize (Cart Price) funct';
export const BYPASS_ERROR_TOGGLE_WISHLIST = 'Toggle Wishlist Component';
export const BYPASS_ERROR_REFETCH_CART = 'useRefetchCart hook';
export const BYPASS_ERROR_SELECT_SHIPPING_ADDRESS_SHIPPING =
  'useSelectShippingAddress (Shipping) hook';
export const BYPASS_ERROR_SELECT_SHIPPING_ADDRESS_BILLING =
  'useSelectShippingAddress (Billing) hook';
export const BYPASS_ERROR_MESSAGE_CART_ID =
  'Variable "$cartID" got invalid value null';
export const BYPASS_ERROR_MAIN_HOME_CART_ITEM =
  'Main Home Controller (Cart Item)';

/**
 * ---------------------------------------------------- *
 * @const {CTA Action}
 * @summary this constant use for event booking
 * ---------------------------------------------------- *
 */
export const CTA_ACTION = {
  REDIRECT_LOGIN: 'REDIRECT_LOGIN',
  CLAIM_GUARDIAN_RUN: 'CLAIM_GUARDIAN_RUN',
  OPEN_REGISTRATION_FORM: 'OPEN_REGISTRATION_FORM',
  SHOW_EXISTING_GUARDIAN_RUN_CODE: 'SHOW_EXISTING_GUARDIAN_RUN_CODE',
};
export const CTA_ACTION_POPUP = {
  SHOW_SOLD_OUT_POPUP: 'SHOW_SOLD_OUT_POPUP',
  SHOW_NOT_QUALIFIED_POPUP: 'SHOW_NOT_QUALIFIED_POPUP',
  SHOW_CLAIM_PERIOD_ENDED_POPUP: 'SHOW_CLAIM_PERIOD_ENDED_POPUP',
  SHOW_ALREADY_HAS_TICKET_POPUP: 'SHOW_ALREADY_HAS_TICKET_POPUP',
};

/**
 * ---------------------------------------------------- *
 * @const {Cart Action}
 * @summary this constant use for cart action button trigger
 * ---------------------------------------------------- *
 */
export const CART_ACTIONS = {
  CHANGE: 'CHANGE',
  ADD_TO_CART: 'ADD_TO_CART',
  BUY_NOW: 'BUY_NOW',
};

export const ORDER_STATUS = {
  PENDING_PAYMENT: 'PENDING_PAYMENT',
  PAID: 'PAID',
  PICKING: 'PICKING',
  IN_TRANSIT: 'IN_TRANSIT',
  COMPLETED: 'COMPLETED',
  CANCELED: 'CANCELED',
  RETURN_REFUND: 'RETURN_REFUND',
};

export const REFUND_STYLE = {
  pending: {color: '#FF8200', label: 'Pending Approval', type: 'pending'},
  approved: {color: '#46A147', label: 'Approved', type: 'approved'},
  rejected: {color: '#CC2B1E', label: 'Rejected', type: 'rejected'},
  unknown: {color: '#9E9E9E', label: 'Unknown', type: 'unknown'},
};

/**
 * ---------------------------------------------------- *
 * @constant {RETURN_DISPLAY_STATUS}
 * @summary 退货单 display_status 的 7 个取值（Cancel & Return
 *          API 文档 §5），用于退款详情 / 退款卡片的展示兜底：
 *          label 与颜色优先取后端 dfi_timeline / dfi_display_status，
 *          本表仅用于本地映射与缺省展示。
 * ---------------------------------------------------- *
 */
export const RETURN_DISPLAY_STATUS = {
  PENDING_APPROVAL: {color: '#FF8200', label: 'Pending Approval'},
  APPROVED: {color: '#46A147', label: 'Approved'},
  REJECTED: {color: '#CC2B1E', label: 'Rejected'},
  IN_RETURN_TRANSIT: {color: '#2F80ED', label: 'In Return Transit'},
  GOODS_RETURNED: {color: '#2F80ED', label: 'Goods Returned'},
  PROCESSING: {color: '#FF8200', label: 'Processing'},
  REFUNDED: {color: '#46A147', label: 'Refunded'},
  unknown: {color: '#9E9E9E', label: 'Unknown'},
};
