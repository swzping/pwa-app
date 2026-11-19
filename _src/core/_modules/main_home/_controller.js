import React, {useEffect, useState, useRef} from 'react';
import useCustomQuery from '@app/hooks/useCustomQuery';
import {GET_BANNER_SLIDER} from '@app/services/queries/banner';
import {NAME, setMetricStart, setMetricEnd} from '@app/helpers/Performance';
import {modules} from '@root/swift.config';

import Views from '@app/_modules/main_home/_view';

const MainHomeController = props => {
  if (!modules.main_home.enable) {
    return null;
  }

  /**
   * ---------------------------------------------------- *
   * @var hooks
   * @return {object}
   * ---------------------------------------------------- *
   */
  const refFirebaseSlider = useRef();
  const [bannerSlider, setBannerSlider] = useState([]);
  const {data: bannerSliderData} = useCustomQuery({
    schema: GET_BANNER_SLIDER,
    useInitData: true,
  });

  /**
   * ---------------------------------------------------- *
   * @function {lifecycle}
   * ---------------------------------------------------- *
   */
  useEffect(() => {
    const getBannerSliderData = async () => {
      if (bannerSliderData === undefined || bannerSliderData.length === 0) {
        await setMetricStart({
          name: NAME.HOMEPAGE_SLIDER,
          refFirebase: refFirebaseSlider,
        });
      } else {
        setBannerSlider(bannerSliderData?.data.getHomepageSlider.images);
        await setMetricEnd({refFirebase: refFirebaseSlider});
      }
    };
    getBannerSliderData();
  }, [bannerSliderData]);

  /**
   * ---------------------------------------------------- *
   * @constant controllerProps
   * @return {object}
   * ---------------------------------------------------- *
   */
  const controllerProps = {
    bannerSlider,
  };

  return <Views {...props} {...controllerProps} />;
};

export default MainHomeController;
