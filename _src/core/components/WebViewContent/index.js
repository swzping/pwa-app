import React from 'react';
import { ScrollView, useWindowDimensions } from 'react-native';
import RenderHtml from 'react-native-render-html';
import { Colors, Mixins } from '@app/styles';
import CustomView from '@app/components/CustomView';
import styles from '@app/components/WebViewContent/styles';
import NodeImage from '@app/components/WebViewContent/atoms/NodeImage';
import NavBar from '@app/components/NavBar';
import RenderIf from '@app/components/RenderIf';
import { NODE_IMG } from '@app/helpers/Constants';

const WebViewContent = ({
  htmlBlock,
  title = null,
  contentBackgroundColor = Colors.PRIMARY,
  contentTextColor = Colors.BLACK,
  contentFontSize = 30,
  styleProp = {},
}) => {
  const { width } = useWindowDimensions();
  let finalHtmlBlock =
    '<!DOCTYPE html><html lang="en"><body style="background-color: ' +
    contentBackgroundColor +
    ';color:' +
    contentTextColor +
    ';font-size: ' +
    contentFontSize.toString() +
    'px;">' +
    htmlBlock +
    '</body></html>';

  const renderers = {
    [NODE_IMG]: ({ tnode }) => {
      return <NodeImage uri={tnode.attributes.src} />;
    },
  };

  return (
    <>
      <RenderIf condition={title}>
        <NavBar title={title} />
      </RenderIf>
      <ScrollView style={[styles.mainContainer, styleProp]}>
        <CustomView style={{ width: Mixins.MAX_WIDTH }}>
          <RenderHtml
            contentWidth={width}
            source={{ html: finalHtmlBlock }}
            renderers={renderers}
            tagsStyles={styles}
          />
        </CustomView>
      </ScrollView>
    </>
  );
};

export default WebViewContent;
