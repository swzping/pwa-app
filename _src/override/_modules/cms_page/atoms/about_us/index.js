import React from 'react';
import {FlatList, Image} from 'react-native';
import CustomView from '@app/components/CustomView';
import Text from '@app/components/Text';
import {Mixins} from '@root/_src/core/styles/index';

const AboutUs = ({aboutCMS}) => {
  const RenderItem = ({item}) => {
    if (item.name === 'img') {
      return (
        <Image
          source={{uri: item.attribs.src}}
          style={{
            marginVertical: 20,
            height: 300,
            aspectRatio: 1.2,
          }}
        />
      );
    } else if (item.name === 'h1') {
      return (
        <CustomView marginBottom={5} marginTop={10}>
          {item.children?.map(text => (
            <Text xlarge bold>
              {text.data}
            </Text>
          ))}
        </CustomView>
      );
    } else if (item.name === 'p') {
      return (
        <CustomView width={Mixins.MAX_WIDTH - 40}>
          {item.children?.map(text => (
            <Text>{text.data}</Text>
          ))}
        </CustomView>
      );
    } else {
      return (
        <CustomView>
          <Text>{item.name}</Text>
        </CustomView>
      );
    }
  };

  return (
    <CustomView paddingHorizontal={20}>
      <FlatList
        data={aboutCMS.children}
        keyExtractor={(item, index) => index}
        renderItem={RenderItem}
      />
    </CustomView>
  );
};

export default AboutUs;
