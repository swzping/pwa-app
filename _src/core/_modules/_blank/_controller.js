import React from 'react';
import {useTranslation} from 'react-i18next';

import Views from '@app/_modules/_blank/_view';

const Controller = props => {
  const {t} = useTranslation();
  /**
   * ---------------------------------------------------- *
   * @constant controllerProps
   * @return {object}
   * ---------------------------------------------------- *
   */
  const controllerProps = {t};

  return <Views {...props} {...controllerProps} />;
};

export default Controller;
