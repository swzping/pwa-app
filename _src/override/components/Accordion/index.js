import React, {useState} from 'react';
import Text from '@app/components/Text';
import Icon from 'react-native-vector-icons/AntDesign';
import RenderIf from '@app/components/RenderIf';

import CustomView from '@app/components/CustomView';
import _ from 'lodash';

const Accordion = ({item, children}) => {
  /**
   * ----------------------------------------- *
   * @constant
   * @summary list of constant local state
   * ----------------------------------------- *
   */
  const [expand, setExpand] = useState(false);

  /**
   * ----------------------------------------- *
   * @function onPressExpand
   * @summary set accordion expand or hide
   * ----------------------------------------- *
   */
  const onPressExpand = () => {
    setExpand(!expand);
  };

  return (
    <CustomView>
      <CustomView paddingVertical={5} onPress={() => onPressExpand()}>
        <CustomView row spaceBetween horizontalCenter verticalCenter>
          <Text large bold>
            {_.startCase(item.label)}
          </Text>
          <Icon name={expand === true ? 'up' : 'down'} />
        </CustomView>
      </CustomView>
      <RenderIf condition={expand}>
        <CustomView>{children}</CustomView>
      </RenderIf>
    </CustomView>
  );
};

export default Accordion;
