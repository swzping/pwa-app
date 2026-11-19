import React from 'react';

import {NavigatorContext} from '@app/helpers/Context';
import {trackHomepageModuleClick} from '@app/track';

import InlineLayout from '../../InlineLayout';

import FourNLayout from './FourNLayout';
import FourNLayoutBecon from './FourNLayoutBecon';
import TreeNLayout from './TreeNLayout';
import TwoNLayout from './TwoNLayout';

const ColumnLineWidget = ({
  isInline,
  is3NLayout,
  is2NLayout,
  children,
  is4NLayout,
  healthCheckLayout,
  contentType,
  position,
  cssClasses,
}) => {
  const {routeName} = React.useContext(NavigatorContext);
  const parseTreeNItems = () => {
    const childrenArray = React.Children.toArray(children);
    return childrenArray.slice(0, 4).map(child => {
      if (React.isValidElement(child)) {
        return {
          backgroundImage: child?.props?.desktop_image,
          mobileImage: child?.props?.children[0]?.props?.mobileImage,
          desktopImage: child?.props?.children[0]?.props?.desktopImage,
          link: child?.props?.children[0]?.props?.link,
          children: child?.props?.children,
        };
      }
      return {mobileImage: undefined, desktopImage: undefined};
    });
  };

  const setEventTrackParamsByClick = params => {
    trackHomepageModuleClick({
      routeName,
      module_rank: position + '-' + params.index,
      module_content: cssClasses,
      location_name: params.name,
      resource_type: contentType,
    });
  };

  if (is2NLayout) {
    return <TwoNLayout items={parseTreeNItems()} />;
  }
  if (is3NLayout) {
    return <TreeNLayout items={parseTreeNItems()} />;
  }

  if (is4NLayout) {
    return (
      <FourNLayout
        items={parseTreeNItems()}
        setEventTrackParamsByClick={setEventTrackParamsByClick}
      />
    );
  }

  if (healthCheckLayout) {
    return (
      <FourNLayoutBecon
        items={parseTreeNItems()}
        setEventTrackParamsByClick={setEventTrackParamsByClick}
      />
    );
  }

  if (isInline) {
    return <InlineLayout>{children}</InlineLayout>;
  }

  return <>{children}</>;
};

export default ColumnLineWidget;
