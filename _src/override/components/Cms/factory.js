import React from 'react';
import {getContentTypeConfig} from './config';

/**
 * Render content type
 */
const renderContentType = (Component, data) => {
  const children = data.children?.map((child, index) => {
    const element = createContentTypeElement(child);
    return element && React.cloneElement(element, {key: child.id || child.position || index});
  });

  return (
    <Component key={data.id || data.position} {...data}>
      {children}
    </Component>
  );
};

/**
 * Create content type element
 */
export const createContentTypeElement = data => {
  if (!data || data.isHidden) {
    return null;
  }

  const {contentType, ...props} = data;
  const contentTypeConfig = getContentTypeConfig(contentType);

  if (!contentTypeConfig?.component) {
    return null;
  }

  return renderContentType(contentTypeConfig.component, {
    ...props,
    contentType,
  });
};
