import React, {useState} from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Platform,
  PixelRatio,
} from 'react-native';
import RNFImage from '@app/components/Image';
import {navigateTo} from '@app/helpers/Navigation';
import {modules} from '@root/swift.config';

const thefontSize = PixelRatio.getFontScale() * 10;

function stripHtml(html) {
  if (!html) {return '';}
  return html
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .trim();
}

function extractImageUrl(item) {
  if (!item || !item.children) {return null;}

  for (let child of item.children) {
    if (
      child.type &&
      child.type.name === 'TextWidget' &&
      child.props &&
      child.props.content
    ) {
      const imgMatch = child.props.content.match(/<img[^>]+src="([^"]+)"/);
      if (imgMatch && imgMatch[1]) {
        return imgMatch[1]; // 确保返回的是字符串
      }
    }
  }
  return null;
}
function extractTextContent(item) {
  if (!item || !item.children) {return '';}

  for (let child of item.children) {
    if (
      child.type &&
      child.type.name === 'TextWidget' &&
      child.props &&
      child.props.content
    ) {
      const cleanText = stripHtml(child.props.content);
      if (cleanText) {
        return cleanText;
      }
    }
  }
  return '';
}

function extractLinkUrl(item) {
  if (!item || !item.children) {return null;}

  for (let child of item.children) {
    if (
      child.type &&
      child.type.name === 'TextWidget' &&
      child.props &&
      child.props.content
    ) {
      const linkMatch = child.props.content.match(/<a[^>]+href="([^"]+)"/);
      if (linkMatch && linkMatch[1]) {
        return linkMatch[1];
      }
    }
  }
  return null;
}

const FourNLayout = ({items, setEventTrackParamsByClick}) => {
  const [rightItemHeight, setRightItemHeight] = useState(0);

  const handleLeftLayout = event => {
    const {height} = event.nativeEvent.layout;
    setRightItemHeight((height - 8) / 2);
  };

  const handlePress = (link, index) => {
    if (link) {
      navigateTo(
        modules.hignlight_Web_View.enable,
        modules.hignlight_Web_View.name,
        {url: link},
      );
    }
    setEventTrackParamsByClick({index, name: extractTextContent(items[index])});
  };

  return (
    <View style={styles.container}>
      <RNFImage
        source={items[0]?.backgroundImage || null}
        style={styles.backgroundImageLayer}
        resizeMode="cover"
      />
      <View style={styles.contentLayer}>
        {/* 顶部横跨 */}
        <View style={styles.topContainer}>
          <Text style={styles.title}>{extractTextContent(items[0])}</Text>
        </View>
        {/* 下方三宫格 */}
        <View style={styles.bottomRow}>
          {/* 左侧大图 */}
          <View style={styles.leftContainer} onLayout={handleLeftLayout}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => handlePress(extractLinkUrl(items[1]), 1)}
              disabled={!extractLinkUrl(items[1])}
              style={styles.fullSize}>
              <RNFImage
                source={items[1]?.mobileImage || items[1]?.desktopImage}
                style={styles.fullSize}
                resizeMode="cover"
              />
              <RNFImage
                source={extractImageUrl(items[1])}
                style={styles.linkImgSize}
                resizeMode="contain"
              />
              <View style={styles.captionContainer}>
                <Text style={styles.caption}>
                  {extractTextContent(items[1])}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
          {/* 右侧上下两个 */}
          <View style={styles.rightContainer}>
            {[2, 3].map(index => (
              <TouchableOpacity
                key={index}
                activeOpacity={0.8}
                onPress={() => handlePress(extractLinkUrl(items[index]), index)}
                disabled={!extractLinkUrl(items[index])}
                style={[styles.rightItem, {height: rightItemHeight}]}>
                <RNFImage
                  source={
                    items[index]?.mobileImage || items[index]?.desktopImage
                  }
                  style={styles.fullSizeRight}
                  resizeMode={Platform.OS === 'ios' ? 'cover' : 'contain'}
                />
                <RNFImage
                  source={extractImageUrl(items[index])}
                  style={styles.linkImgSizeSecond}
                  resizeMode="contain"
                />
                <View style={styles.captionContainerSecond}>
                  <Text style={styles.caption}>
                    {extractTextContent(items[index])}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingLeft: 20,
    paddingRight: 8,
    paddingVertical: 10,
    minHeight: 300,
  },
  topContainer: {
    paddingVertical: 12,
    fontSize: 28,
    width: '100%',
    height: '20%',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'left',
  },
  bottomRow: {
    flexDirection: 'row',
    height: 188,
  },
  leftContainer: {
    flex: 1,
    borderRadius: 8,
    marginRight: 8,
  },
  rightContainer: {
    flex: 1,
    height: 200,
    justifyContent: 'space-between',
  },
  rightItem: {
    height: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fullSize: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
  },
  fullSizeRight: {
    width: '80%',
    height: '85%',
    borderRadius: 16,
  },
  linkImgSize: {
    width: '35%',
    height: '18%',
    marginTop: -40,
    marginLeft: Platform.OS === 'ios' ? 105 : 95,
  },
  linkImgSizeSecond: {
    width: '45%',
    height: '28%',
    marginTop: -50,
    marginLeft: Platform.OS === 'ios' ? 75 : 60,
  },
  captionContainerSecond: {
    width: '70%',
    height: 7,
  },
  captionContainer: {
    marginTop: 15,
    width: '100%',
  },
  caption: {
    position: 'absolute',
    color: '#fff',
    fontSize: thefontSize,
    fontWeight: 'bold',
    overflow: 'hidden',
    lineHeight: thefontSize + 4,
  },
  backgroundImageLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  contentLayer: {
    flex: 1,
  },
});

export default FourNLayout;
