import React from 'react';

import {modules, tabsApp} from '@root/swift.config';

import AccountAddAddress from '@app/_modules/account_add_address';
import AccountContactUs from '@app/_modules/account_contact_us';
import AccountNotification from '@app/_modules/account_notification';
import AccountNotificationDetail from '@app/_modules/account_notification_detail';
import AccountSettings from '@app/_modules/account_settings';
import AuthForgot from '@app/_modules/auth_forgot';
import AuthLogin from '@app/_modules/auth_signin';
import AuthRegister from '@app/_modules/auth_signup';
import BlogDetail from '@app/_modules/blog_detail';
import BlogList from '@app/_modules/blog_list';
import BrandPage from '@app/_modules/brand_page';
import Cart from '@app/_modules/cart';
import CartCheckout from '@app/_modules/cart_checkout';
import CartCheckoutOneStep from '@app/_modules/cart_checkout_onestep';
import CartEdit from '@app/_modules/cart_edit';
import CartPayment from '@app/_modules/cart_payment';
import CartThankYou from '@app/_modules/cart_thankyou';
import CmsPage from '@app/_modules/cms_page';
import SubCMSPage from '@app/_modules/cms_page/atoms/SubCMSPage';
import CouponList from '@app/_modules/coupon_list';
import CustomerCare from '@app/_modules/customer_care';
import DetailCategories from '@app/_modules/detail_categories';
import DetailedRules from '@app/_modules/detailed_rules';
import GuardianRun from '@app/_modules/guardian_run';
import GwpList from '@app/_modules/gwp_list';
import MainSearch from '@app/_modules/main_search';
import NewCms from '@app/_modules/new_cms';
import ProductDetail from '@app/_modules/product_detail';
import ProductReviewsPage from '@app/_modules/product_detail/atoms/ProductReviewsPage/productReviewPage';
import ProductList from '@app/_modules/product_list';
import Scanner from '@app/_modules/scanner';
import WebviewBeconScreen from '@app/_modules/webviewBeconScreen';
import WebViewFullScreen from '@app/_modules/webViewFullScreen';
import WebViewShowHighlight from '@app/_modules/webViewShowHighlight';
import {Stack} from '@app/navigations';
import TabStackApp from '@app/navigations/_stack-app-tab';
export const StackAuth = () => {
  return (
    <>
      <Stack.Screen
        key={tabsApp.name}
        name={tabsApp.name}
        component={TabStackApp}
      />
      <Stack.Screen
        key={modules.auth_signin.name}
        name={modules.auth_signin.name}
        component={AuthLogin}
      />
      <Stack.Screen
        key={modules.auth_signup.name}
        name={modules.auth_signup.name}
        component={AuthRegister}
      />
      <Stack.Screen
        key={modules.auth_forgot.name}
        name={modules.auth_forgot.name}
        component={AuthForgot}
      />
      <Stack.Screen
        key={modules.cart.name}
        name={modules.cart.name}
        component={Cart}
      />
      <Stack.Screen
        key={modules.cart_edit.name}
        name={modules.cart_edit.name}
        component={CartEdit}
      />
      <Stack.Screen
        key={modules.main_search.name}
        name={modules.main_search.name}
        component={MainSearch}
      />
      <Stack.Screen
        key={modules.blog_detail.name}
        name={modules.blog_detail.name}
        component={BlogDetail}
      />
      <Stack.Screen
        key={modules.blog_list.name}
        name={modules.blog_list.name}
        component={BlogList}
      />
      <Stack.Screen
        key={modules.brand_page.name}
        name={modules.brand_page.name}
        component={BrandPage}
      />
      <Stack.Screen
        key={modules.detail_categories.name}
        name={modules.detail_categories.name}
        component={DetailCategories}
      />
      <Stack.Screen
        key={modules.product_detail.name}
        name={modules.product_detail.name}
        component={ProductDetail}
      />
      <Stack.Screen
        key={modules.product_review.name}
        name={modules.product_review.name}
        component={ProductReviewsPage}
      />
      <Stack.Screen
        key={modules.product_list.name}
        name={modules.product_list.name}
        component={ProductList}
      />
      <Stack.Screen
        key={modules.cart_checkout_onestep.name}
        name={modules.cart_checkout_onestep.name}
        component={CartCheckoutOneStep}
      />
      <Stack.Screen
        key={modules.cart_payment.name}
        name={modules.cart_payment.name}
        component={CartPayment}
      />
      <Stack.Screen
        key={modules.cart_checkout.name}
        name={modules.cart_checkout.name}
        component={CartCheckout}
      />
      <Stack.Screen
        key={modules.cart_thankyou.name}
        name={modules.cart_thankyou.name}
        component={CartThankYou}
      />
      <Stack.Screen
        key={modules.customer_care.name}
        name={modules.customer_care.name}
        component={CustomerCare}
      />
      <Stack.Screen
        key={modules.account_contact_us.name}
        name={modules.account_contact_us.name}
        component={AccountContactUs}
      />
      <Stack.Screen
        key={modules.account_address_add.name}
        name={modules.account_address_add.name}
        component={AccountAddAddress}
      />
      <Stack.Screen
        key={modules.cms_page.name}
        name={modules.cms_page.name}
        component={CmsPage}
      />
      <Stack.Screen
        key={modules.new_cms.name}
        name={modules.new_cms.name}
        component={NewCms}
      />
      <Stack.Screen
        key={modules.sub_cms_page.name}
        name={modules.sub_cms_page.name}
        component={SubCMSPage}
      />
      <Stack.Screen
        key={modules.scanner.name}
        name={modules.scanner.name}
        component={Scanner}
      />
      <Stack.Screen
        key={modules.guardian_run.name}
        name={modules.guardian_run.name}
        component={GuardianRun}
      />
      <Stack.Screen
        key={modules.hignlight_Web_View.name}
        name={modules.hignlight_Web_View.name}
        component={WebViewShowHighlight}
      />
      <Stack.Screen
        key={modules.full_screen_web_view.name}
        name={modules.full_screen_web_view.name}
        component={WebViewFullScreen}
      />
      <Stack.Screen
        key={modules.webview_becon_screen.name}
        name={modules.webview_becon_screen.name}
        component={WebviewBeconScreen}
      />
      <Stack.Screen
        key={modules.detailed_rules.name}
        name={modules.detailed_rules.name}
        component={DetailedRules}
      />
      <Stack.Screen
        key={modules.gwp_list.name}
        name={modules.gwp_list.name}
        component={GwpList}
      />
      <Stack.Screen
        key={modules.account_notification.name}
        name={modules.account_notification.name}
        component={AccountNotification}
      />
      <Stack.Screen
        key={modules.account_notification_detail.name}
        name={modules.account_notification_detail.name}
        component={AccountNotificationDetail}
      />
      <Stack.Screen
        key={modules.coupon_list.name}
        name={modules.coupon_list.name}
        component={CouponList}
      />
      <Stack.Screen
        key={modules.account_settings.name}
        name={modules.account_settings.name}
        component={AccountSettings}
      />
    </>
  );
};
