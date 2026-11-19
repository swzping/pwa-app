import React, { useMemo } from 'react';
import { useWindowDimensions } from 'react-native';
import RenderHtml from 'react-native-render-html';
import { Colors } from '@app/styles';
import styles from '@app/components/WebViewContent/styles';
import NodeImage from '@app/components/WebViewContent/atoms/NodeImage';
import { NODE_IMG } from '@app/helpers/Constants';

const ImageRenderer = ({ tnode }) => {
  const src = tnode.attributes.src;
  return <NodeImage uri={src} />;
};

const renderers = {
  [NODE_IMG]: ImageRenderer,
};

const WebViewContent = ({
  htmlBlock,
  title = null,
  contentBackgroundColor = Colors.PRIMARY,
  contentTextColor = Colors.BLACK,
  contentFontSize = 30,
  styleProp = {},
}) => {
  const { width } = useWindowDimensions();
  const tagsStyles = useMemo(
    () => ({
      ...styles,
      p: { ...styles.p, fontSize: contentFontSize },
      li: { ...styles.li, fontSize: contentFontSize },
      ul: { ...styles.ul, fontSize: contentFontSize },
    }),
    [contentFontSize],
  );
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

  return (
    <RenderHtml
      contentWidth={width}
      source={{ html: finalHtmlBlock }}
      tagsStyles={tagsStyles}
      renderers={renderers}
    />
  );
};

export default WebViewContent;
