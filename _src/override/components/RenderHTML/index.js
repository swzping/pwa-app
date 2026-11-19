/* eslint-disable max-len */
import React from 'react';
import {useWindowDimensions} from 'react-native';
import {WebView} from 'react-native-webview';
import CustomView from '@app/components/CustomView';
import RenderHtml from 'react-native-render-html';
import {Mixins} from '@app/styles/index';

const RenderHTML = ({
  webViewKey,
  htmlBlock,
  renderers = {},
  enableCSSInlineProcessing = true,
  tagsStyles = {},
  classesStyles = {},
  onWebviewNavigationStateChange,
  useWebview = false,
}) => {
  const {width} = useWindowDimensions();
  let finalHtmlBlock = htmlBlock;
  finalHtmlBlock = encodeURIComponent(finalHtmlBlock);
  finalHtmlBlock = decodeURIComponent(finalHtmlBlock);
  finalHtmlBlock = finalHtmlBlock
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');
  const source = {
    html: `${finalHtmlBlock}`,
  };

  let classesStylesFinal = {
    ...classesStyles,
    'pagebuilder-mobile-hidden': {
      display: 'none',
    },
  };

  if (finalHtmlBlock.includes('<iframe') || useWebview) {
    return (
      <CustomView style={{flex: 1, margin: 20}}>
        <WebView
          key={webViewKey}
          style={{flex: 1, height: Mixins.MAX_HEIGHT}}
          onNavigationStateChange={onWebviewNavigationStateChange}
          originWhitelist={['*']}
          javaScriptEnabled={true}
          scalesPageToFit={false}
          injectedJavaScript={
            "const meta = document.createElement('meta'); meta.setAttribute('content', 'width=device-width, initial-scale=1.0'); meta.setAttribute('name', 'viewport'); document.getElementsByTagName('head')[0].appendChild(meta); "
          }
          source={source}
        />
      </CustomView>
    );
  }

  return (
    <RenderHtml
      contentWidth={width}
      source={source}
      renderers={renderers}
      enableCSSInlineProcessing={enableCSSInlineProcessing}
      tagsStyles={tagsStyles}
      classesStyles={classesStylesFinal}
    />
  );
};

export default RenderHTML;
