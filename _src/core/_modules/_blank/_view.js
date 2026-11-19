import React from 'react';
import {Text} from 'react-native';
import {PropTypes} from 'prop-types';

import {modules} from '@root/swift.config';
/**
 * ---------------------------------------------------- *
 * @components Views
 * @summary this is expample views
 * ---------------------------------------------------- *
 */
const Views = ({t}) => {
  if (!modules.blank.enable) {
    return null;
  }
  return <Text>{t('_blank.view.blank')}</Text>;
};

Views.propTypes = {
  name: PropTypes.function /* @summary use for translation */,
};

export default Views;
