import React, {useContext} from 'react';
import RenderHTML from '@app/components/RenderHTML';
import HtmlStylesContext from '../../HtmlStylesContext';

const HtmlWidget = ({content, children}) => {
  const {tagsStyles, classesStyles} = useContext(HtmlStylesContext);

  if (content) {
    return (
      <RenderHTML
        htmlBlock={content}
        tagsStyles={tagsStyles}
        classesStyles={classesStyles}
      />
    );
  }

  return <>{children}</>;
};

export default HtmlWidget;
