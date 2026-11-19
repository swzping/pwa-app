import React from 'react';

import CheckBox from '@app/components/CheckBox';
import {Colors} from '@app/styles';

const BOOLEAN_TRUE_VALUE = '1';

/**
 * ---------------------------------------------------- *
 * Boolean control: a checkmark box shown in place of the
 * chevron in the section header — boolean groups never
 * expand. Tapping the header row toggles filter eq '1'
 * (the header owns the press, this is display-only).
 * ---------------------------------------------------- *
 */
const BooleanSection = ({draftValues}) => {
  const selected = (draftValues ?? []).includes(BOOLEAN_TRUE_VALUE);
  return (
    <CheckBox
      selected={selected}
      size={20}
      checkedColor={Colors.PRIMARY}
      uncheckedColor={Colors.GRAY_SMOOTH5}
    />
  );
};

export default BooleanSection;
