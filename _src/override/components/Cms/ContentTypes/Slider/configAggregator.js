import {getAdvanced, resolveBannerAspectRatio} from '../../utils';

export default node => {
  const {cssClasses} = getAdvanced(node);
  const isBrandBannerSlider = cssClasses?.includes('banner-highlight-slider');
  const bannerAspectRatio = isBrandBannerSlider
    ? resolveBannerAspectRatio(node)
    : null;

  return {
    autoplay: node.autoplay,
    fade: node.fade,
    autoplaySpeed: node.autoplaySpeed,
    infinite: node.infiniteLoop,
    showSmallBanner: node.showSmallBanner,
    mode: node.responsiveLayout,
    behavior: node.responsiveBehavior,
    bleeding: node.bleeding ?? true,
    breakpoints: node.breakpoints ?? {
      0: {slidesPerView: 1, spaceBetween: 8},
      1: {slidesPerView: 1.25, spaceBetween: 8},
      2: {slidesPerView: 1.33, spaceBetween: 8},
      3: {slidesPerView: 2.05, spaceBetween: 8},
      4: {slidesPerView: 2.05, spaceBetween: 8},
    },
    isActiveDotStyle: cssClasses?.includes('guardian-run-slider')
      ? {backgroundColor: 'white'}
      : {},
    isNeedPaddingBottom: cssClasses?.includes('guardian-run-slider') ?? true,
    cssClasses: cssClasses || [],
    ...(bannerAspectRatio ? {bannerAspectRatio} : {}),
  };
};
