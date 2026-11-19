// eslint-disable-next-line simple-import-sort/imports
import React from 'react';
import {modules, tabsApp} from '@root/swift.config';
import {Stack} from '@app/navigations';

import AuthSignin from '@app/_modules/auth_signin';
import AccountMedicalTest from '@app/_modules/account_medical_test';
import AccountAboutUs from '@app/_modules/account_about_us';
import AccountCategories from '@app/_modules/account_categories';
import AccountHealthReport from '@app/_modules/account_health_report';
import AccountHealthReportDetail from '@app/_modules/account_health_report_detail';
import AccountMilestone from '@app/_modules/account_milestone';
import AccountChangePassword from '@app/_modules/account_change_password';
import AccountStoreCredit from '@app/_modules/account_storecredit';
import AccountConfirmPayment from '@app/_modules/account_confirm_payment';
import AccountContactUs from '@app/_modules/account_contact_us';
import AccountGiftCard from '@app/_modules/account_gift_card';
import AccountHelp from '@app/_modules/account_help';
import AccountLanguages from '@app/_modules/account_languages';
import AccountMyAddress from '@app/_modules/account_myaddress/index';
import AccountAddAddress from '@app/_modules/account_add_address';
import AccountEditAddress from '@app/components/UpdateAddress';
import AccountMyReturn from '@app/_modules/account_myreturn';
import AccountMyReturnDetail from '@app/_modules/account_myreturn_detail';
import AccountNewsletter from '@app/_modules/account_newsletter';
import AccountNotification from '@app/_modules/account_notification';
import AccountNotificationDetail from '@app/_modules/account_notification_detail';
import AccountPurchases from '@app/_modules/account_purchases';
import AccountPurchasesDetail from '@app/_modules/account_purchases_detail';
import AccountReferFriend from '@app/_modules/account_refer_friend';
import AccountProductReview from '@app/_modules/account_product_review';
import AccountReturns from '@app/_modules/account_returns';
import AccountRewardPoint from '@app/_modules/account_rewardpoint';
import AccountSettings from '@app/_modules/account_settings';
import AccountTrackOrder from '@app/_modules/account_trackorder';
import AccountUpdateInformation from '@app/_modules/account_update_information';
import AccountWishlist from '@app/_modules/account_wishlist';
import AccountMyCoupon from '@app/_modules/account_mycoupon';
import VoucherDetailScreen from '@app/_modules/account_mycoupon/VoucherDetailScreen';
import AccountMyPointHistory from '@app/_modules/account_mypointhistory';
import AccountDeletion from '@app/_modules/account_deletion';
import AccountEventBooking from '@app/_modules/account_eventbooking';
import EventBookingDetail from '@app/_modules/account_eventbooking/EventDetailScreen';
import ReturnedProdct from '@app/_modules/account_purchases_detail/ReturnedProductScreen';
import ReturnOrRefund from '@app/_modules/account_purchases_detail/ReturnOrRefundScreen';
import RefundDetailScreen from '@root/_src/override/_modules/account_purchases_detail/RefundDetailScreen';
import EventConfig from '@app/_modules/account_eventbooking/EventConfigScreen';
import BrandPage from '@app/_modules/brand_page';
import Cart from '@app/_modules/cart';
import CartCheckoutOneStep from '@app/_modules/cart_checkout_onestep';
import CartCheckoutPwa from '@app/_modules/cart_checkout_pwa';
import CartEdit from '@app/_modules/cart_edit';
import CartPayment from '@app/_modules/cart_payment';
import CartCheckout from '@app/_modules/cart_checkout';

import CartThankYou from '@app/_modules/cart_thankyou';
import CmsPage from '@app/_modules/cms_page';
import NewCms from '@app/_modules/new_cms';
import CustomerCare from '@app/_modules/customer_care';
import BlogDetail from '@app/_modules/blog_detail';
import BlogList from '@app/_modules/blog_list';
import DetailCategories from '@app/_modules/detail_categories';
import MainSearch from '@app/_modules/main_search';
import ProductDetail from '@app/_modules/product_detail';
import ProductList from '@app/_modules/product_list';
import TabStackApp from '@app/navigations/_stack-app-tab';
import ProductReviewsPage from '@app/_modules/product_detail/atoms/ProductReviewsPage/productReviewPage';
import Scanner from '@app/_modules/scanner';
import SubCMSPage from '@app/_modules/cms_page/atoms/SubCMSPage';
import GuardianRunRegister from '@app/_modules/guardian_run_register';
import GuardianRun from '@app/_modules/guardian_run';
import WebViewShowHighlight from '@app/_modules/webViewShowHighlight';
import WebViewFullScreen from '@app/_modules/webViewFullScreen';
import WebviewBeconScreen from '@app/_modules/webviewBeconScreen';
import DetailedRules from '@app/_modules/detailed_rules';
import GwpList from '@app/_modules/gwp_list';
import CouponList from '@app/_modules/coupon_list';

export const StackApp = () => {
  return [
    <Stack.Screen
      key={tabsApp.name}
      name={tabsApp.name}
      component={TabStackApp}
    />,
    <Stack.Screen
      key={modules.account_medical_test.name}
      name={modules.account_medical_test.name}
      component={AccountMedicalTest}
    />,
    <Stack.Screen
      key={modules.account_about_us.name}
      name={modules.account_about_us.name}
      component={AccountAboutUs}
    />,
    <Stack.Screen
      key={modules.account_categories.name}
      name={modules.account_categories.name}
      component={AccountCategories}
    />,
    <Stack.Screen
      key={modules.account_health_report.name}
      name={modules.account_health_report.name}
      component={AccountHealthReport}
    />,
    <Stack.Screen
      key={modules.account_health_report_detail.name}
      name={modules.account_health_report_detail.name}
      component={AccountHealthReportDetail}
    />,
    <Stack.Screen
      key={modules.account_milestone.name}
      name={modules.account_milestone.name}
      component={AccountMilestone}
      options={{headerShown: false}}
    />,
    <Stack.Screen
      key={modules.account_change_password.name}
      name={modules.account_change_password.name}
      component={AccountChangePassword}
    />,
    <Stack.Screen
      key={modules.account_confirm_payment.name}
      name={modules.account_confirm_payment.name}
      component={AccountConfirmPayment}
    />,
    <Stack.Screen
      key={modules.account_contact_us.name}
      name={modules.account_contact_us.name}
      component={AccountContactUs}
    />,
    <Stack.Screen
      key={modules.account_gift_card.name}
      name={modules.account_gift_card.name}
      component={AccountGiftCard}
    />,
    <Stack.Screen
      key={modules.account_help.name}
      name={modules.account_help.name}
      component={AccountHelp}
    />,
    <Stack.Screen
      key={modules.account_languages.name}
      name={modules.account_languages.name}
      component={AccountLanguages}
    />,
    <Stack.Screen
      key={modules.account_myaddress.name}
      name={modules.account_myaddress.name}
      component={AccountMyAddress}
    />,
    <Stack.Screen
      key={modules.account_address_add.name}
      name={modules.account_address_add.name}
      component={AccountAddAddress}
    />,
    <Stack.Screen
      key={modules.account_address_edit.name}
      name={modules.account_address_edit.name}
      component={AccountEditAddress}
    />,
    <Stack.Screen
      key={modules.brand_page.name}
      name={modules.brand_page.name}
      component={BrandPage}
    />,
    <Stack.Screen
      key={modules.account_storecredit.name}
      name={modules.account_storecredit.name}
      component={AccountStoreCredit}
    />,
    <Stack.Screen
      key={modules.account_myreturn.name}
      name={modules.account_myreturn.name}
      component={AccountMyReturn}
    />,
    <Stack.Screen
      key={modules.account_myreturn_detail.name}
      name={modules.account_myreturn_detail.name}
      component={AccountMyReturnDetail}
    />,
    <Stack.Screen
      key={modules.account_newsletter.name}
      name={modules.account_newsletter.name}
      component={AccountNewsletter}
    />,
    <Stack.Screen
      key={modules.account_notification.name}
      name={modules.account_notification.name}
      component={AccountNotification}
    />,
    <Stack.Screen
      key={modules.account_notification_detail.name}
      name={modules.account_notification_detail.name}
      component={AccountNotificationDetail}
    />,
    <Stack.Screen
      key={modules.account_purchases.name}
      name={modules.account_purchases.name}
      component={AccountPurchases}
    />,
    <Stack.Screen
      key={modules.account_purchases_detail.name}
      name={modules.account_purchases_detail.name}
      component={AccountPurchasesDetail}
    />,
    <Stack.Screen
      key={modules.returned_product.name}
      name={modules.returned_product.name}
      component={ReturnedProdct}
    />,
    <Stack.Screen
      key={modules.return_or_refund.name}
      name={modules.return_or_refund.name}
      component={ReturnOrRefund}
    />,
    <Stack.Screen
      key={modules.refund_detail.name}
      name={modules.refund_detail.name}
      component={RefundDetailScreen}
    />,
    <Stack.Screen
      key={modules.account_refer_friend.name}
      name={modules.account_refer_friend.name}
      component={AccountReferFriend}
    />,
    <Stack.Screen
      key={modules.account_product_review.name}
      name={modules.account_product_review.name}
      component={AccountProductReview}
    />,
    <Stack.Screen
      key={modules.account_returns.name}
      name={modules.account_returns.name}
      component={AccountReturns}
    />,
    <Stack.Screen
      key={modules.account_rewardpoint.name}
      name={modules.account_rewardpoint.name}
      component={AccountRewardPoint}
    />,
    <Stack.Screen
      key={modules.account_settings.name}
      name={modules.account_settings.name}
      component={AccountSettings}
    />,
    <Stack.Screen
      key={modules.account_trackorder.name}
      name={modules.account_trackorder.name}
      component={AccountTrackOrder}
    />,
    <Stack.Screen
      key={modules.account_update_information.name}
      name={modules.account_update_information.name}
      component={AccountUpdateInformation}
    />,
    <Stack.Screen
      key={modules.account_wishlist.name}
      name={modules.account_wishlist.name}
      component={AccountWishlist}
    />,
    <Stack.Screen
      key={modules.account_mycoupon.name}
      name={modules.account_mycoupon.name}
      component={AccountMyCoupon}
    />,
    <Stack.Screen
      key={modules.account_mycoupon_detail.name}
      name={modules.account_mycoupon_detail.name}
      component={VoucherDetailScreen}
    />,
    <Stack.Screen
      key={modules.account_mypointhistory.name}
      name={modules.account_mypointhistory.name}
      component={AccountMyPointHistory}
    />,
    <Stack.Screen
      key={modules.account_deletion.name}
      name={modules.account_deletion.name}
      component={AccountDeletion}
    />,
    <Stack.Screen
      key={modules.account_eventbooking.name}
      name={modules.account_eventbooking.name}
      component={AccountEventBooking}
    />,
    <Stack.Screen
      key={modules.event_detail.name}
      name={modules.event_detail.name}
      component={EventBookingDetail}
    />,
    <Stack.Screen
      key={modules.event_config.name}
      name={modules.event_config.name}
      component={EventConfig}
    />,
    <Stack.Screen
      key={modules.cart.name}
      name={modules.cart.name}
      component={Cart}
    />,
    <Stack.Screen
      key={modules.cart_edit.name}
      name={modules.cart_edit.name}
      component={CartEdit}
    />,
    <Stack.Screen
      key={modules.cart_checkout_onestep.name}
      name={modules.cart_checkout_onestep.name}
      component={CartCheckoutOneStep}
    />,
    <Stack.Screen
      key={modules.cart_checkout_pwa.name}
      name={modules.cart_checkout_pwa.name}
      component={CartCheckoutPwa}
    />,
    <Stack.Screen
      key={modules.cart_payment.name}
      name={modules.cart_payment.name}
      component={CartPayment}
    />,
    <Stack.Screen
      key={modules.cart_checkout.name}
      name={modules.cart_checkout.name}
      component={CartCheckout}
    />,

    <Stack.Screen
      key={modules.cart_thankyou.name}
      name={modules.cart_thankyou.name}
      component={CartThankYou}
    />,
    <Stack.Screen
      key={modules.customer_care.name}
      name={modules.customer_care.name}
      component={CustomerCare}
    />,
    <Stack.Screen
      key={modules.blog_detail.name}
      name={modules.blog_detail.name}
      component={BlogDetail}
    />,
    <Stack.Screen
      key={modules.blog_list.name}
      name={modules.blog_list.name}
      component={BlogList}
    />,
    <Stack.Screen
      key={modules.cms_page.name}
      name={modules.cms_page.name}
      component={CmsPage}
    />,
    <Stack.Screen
      key={modules.new_cms.name}
      name={modules.new_cms.name}
      component={NewCms}
    />,
    <Stack.Screen
      key={modules.sub_cms_page.name}
      name={modules.sub_cms_page.name}
      component={SubCMSPage}
    />,
    <Stack.Screen
      key={modules.detail_categories.name}
      name={modules.detail_categories.name}
      component={DetailCategories}
    />,
    <Stack.Screen
      key={modules.main_search.name}
      name={modules.main_search.name}
      component={MainSearch}
    />,
    <Stack.Screen
      key={modules.product_detail.name}
      name={modules.product_detail.name}
      component={ProductDetail}
    />,
    <Stack.Screen
      key={modules.product_review.name}
      name={modules.product_review.name}
      component={ProductReviewsPage}
    />,
    <Stack.Screen
      key={modules.product_list.name}
      name={modules.product_list.name}
      component={ProductList}
    />,
    <Stack.Screen
      key={modules.auth_signin.name}
      name={modules.auth_signin.name}
      component={AuthSignin}
    />,
    <Stack.Screen
      key={modules.scanner.name}
      name={modules.scanner.name}
      component={Scanner}
    />,
    <Stack.Screen
      key={modules.guardian_run.name}
      name={modules.guardian_run.name}
      component={GuardianRun}
    />,
    <Stack.Screen
      key={modules.guardian_run_register.name}
      name={modules.guardian_run_register.name}
      component={GuardianRunRegister}
    />,
    <Stack.Screen
      key={modules.hignlight_Web_View.name}
      name={modules.hignlight_Web_View.name}
      component={WebViewShowHighlight}
    />,
    <Stack.Screen
      key={modules.full_screen_web_view.name}
      name={modules.full_screen_web_view.name}
      component={WebViewFullScreen}
    />,
    <Stack.Screen
      key={modules.webview_becon_screen.name}
      name={modules.webview_becon_screen.name}
      component={WebviewBeconScreen}
    />,
    <Stack.Screen
      key={modules.detailed_rules.name}
      name={modules.detailed_rules.name}
      component={DetailedRules}
    />,
    <Stack.Screen
      key={modules.gwp_list.name}
      name={modules.gwp_list.name}
      component={GwpList}
    />,
    <Stack.Screen
      key={modules.coupon_list.name}
      name={modules.coupon_list.name}
      component={CouponList}
    />,
  ];
};
