import rowConfigAggregator from './ContentTypes/Row/configAggregator';
import Row from './ContentTypes/Row';
import columnConfigAggregator from './ContentTypes/Column/configAggregator';
import Column from './ContentTypes/Column';
import columnGroupConfigAggregator from './ContentTypes/ColumnGroup/configAggregator';
import ColumnGroup from './ContentTypes/ColumnGroup';
import columnLineConfigAggregator from './ContentTypes/ColumnLine/configAggregator';
import ColumnLine from './ContentTypes/ColumnLine';
import Image from './ContentTypes/Image';
import imageConfigAggregator from './ContentTypes/Image/configAggregator';
import Heading from './ContentTypes/Heading';
import headingConfigAggregator from './ContentTypes/Heading/configAggregator';
import Text from './ContentTypes/Text';
import textConfigAggregator from './ContentTypes/Text/configAggregator';
import Tabs from './ContentTypes/Tabs';
import tabsConfigAggregator from './ContentTypes/Tabs/configAggregator';
import TabItem from './ContentTypes/TabItem';
import tabItemConfigAggregator from './ContentTypes/TabItem/configAggregator';
// import Buttons from './ContentTypes/Buttons';
// import buttonsConfigAggregator from './ContentTypes/Buttons/configAggregator';
// import ButtonItem from './ContentTypes/ButtonItem';
// import buttonItemConfigAggregator from './ContentTypes/ButtonItem/configAggregator';
import blockConfigAggregator from './ContentTypes/Block/configAggregator';
import Block from './ContentTypes/Block';
import Products from './ContentTypes/Products';
import productsConfigAggregator from './ContentTypes/Products/configAggregator';
import Html from './ContentTypes/Html';
import SmallIcon from './ContentTypes/SmallIcon';
import smallIconConfigAggregator from './ContentTypes/SmallIcon/configAggregator';
import popUpConfigAggregator from './ContentTypes/PopUp/configAggregator';
import PopUp from './ContentTypes/PopUp';
import Brands from './ContentTypes/Brands';
import htmlConfigAggregator from './ContentTypes/Html/configAggregator';
import PLPSmallIcon from './ContentTypes/PLPSmallIcon';
import plpSmallIconConfigAggregator from './ContentTypes/PLPSmallIcon/configAggregator';
import PLPBrands from './ContentTypes/PLPBrands';
import plpBrandsConfigAggregator from './ContentTypes/PLPBrands/configAggregator';
import Divider from './ContentTypes/Divider';
import dividerConfigAggregator from './ContentTypes/Divider/configAggregator';
import Banner from './ContentTypes/Banner';
import bannerConfigAggregator from './ContentTypes/Banner/configAggregator';
import Slider from './ContentTypes/Slider';
import sliderConfigAggregator from './ContentTypes/Slider/configAggregator';
import ButtonToWebView from './ContentTypes/ButtonToWebView';
import buttonToWebViewConfigAggregator from './ContentTypes/ButtonToWebView/configAggregator';
import VoucherSlider from './ContentTypes/VoucherSlider';
import voucherSliderConfigAggregator from './ContentTypes/VoucherSlider/configAggregator';
import FlashSale from './ContentTypes/FlashSale';
import flashSaleConfigAggregator from './ContentTypes/FlashSale/configAggregator';

const contentTypesConfig = {
  row: {
    configAggregator: rowConfigAggregator,
    component: Row,
  },
  column: {
    configAggregator: columnConfigAggregator,
    component: Column,
  },
  'column-group': {
    configAggregator: columnGroupConfigAggregator,
    component: ColumnGroup,
  },
  'column-line': {
    configAggregator: columnLineConfigAggregator,
    component: ColumnLine,
  },
  image: {
    configAggregator: imageConfigAggregator,
    component: Image,
  },
  heading: {
    configAggregator: headingConfigAggregator,
    component: Heading,
  },
  text: {
    configAggregator: textConfigAggregator,
    component: Text,
  },
  tabs: {
    configAggregator: tabsConfigAggregator,
    component: Tabs,
  },
  'tab-item': {
    configAggregator: tabItemConfigAggregator,
    component: TabItem,
  },
  // buttons: {
  //   configAggregator: buttonsConfigAggregator,
  //   component: Buttons,
  // },
  // 'button-item': {
  //   configAggregator: buttonItemConfigAggregator,
  //   component: ButtonItem,
  // },
  block: {
    configAggregator: blockConfigAggregator,
    component: Block,
  },
  products: {
    configAggregator: productsConfigAggregator,
    component: Products,
  },
  html: {
    configAggregator: htmlConfigAggregator,
    component: Html,
  },
  smallIcon: {
    configAggregator: smallIconConfigAggregator,
    component: SmallIcon,
  },
  brands: {
    component: Brands,
  },
  divider: {
    configAggregator: dividerConfigAggregator,
    component: Divider,
  },
  banner: {
    configAggregator: bannerConfigAggregator,
    component: Banner,
  },
  slider: {
    configAggregator: sliderConfigAggregator,
    component: Slider,
  },
  slide: {
    configAggregator: bannerConfigAggregator,
    component: Banner,
  },
  popUp: {
    configAggregator: popUpConfigAggregator,
    component: PopUp,
  },
  buttonToWebView: {
    configAggregator: buttonToWebViewConfigAggregator,
    component: ButtonToWebView,
  },
  voucherSlider: {
    configAggregator: voucherSliderConfigAggregator,
    component: VoucherSlider,
  },
  flashSale: {
    configAggregator: flashSaleConfigAggregator,
    component: FlashSale,
  },
  'flash-sale': {
    configAggregator: flashSaleConfigAggregator,
    component: FlashSale,
  },
  plpSmallIcon: {
    configAggregator: plpSmallIconConfigAggregator,
    component: PLPSmallIcon,
  },
  plpBrands: {
    configAggregator: plpBrandsConfigAggregator,
    component: PLPBrands,
  },
};

export function getContentTypeConfig(contentType) {
  return contentTypesConfig[contentType];
}
