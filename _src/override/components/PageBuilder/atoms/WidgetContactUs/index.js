import React from 'react';
import CustomView from '@app/components/CustomView';
import CardSection from '@app/components/PageBuilder/atoms/WidgetContactUs/atoms/CardSection/index';
import {Mixins} from '@app/styles';

const WidgetContactUs = ({data}) => {
  return (
    <CustomView flex column width={Mixins.MAX_WIDTH - 40}>
      {data.map((section, index) => {
        return (
          <CardSection
            key={`widget-contact-us-${index}`}
            title={section.title}
            content={section.content}
          />
        );
      })}
    </CustomView>
  );
};

export default WidgetContactUs;
