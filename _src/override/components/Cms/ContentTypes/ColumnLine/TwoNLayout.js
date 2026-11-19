import React from 'react';
import {View, StyleSheet, Text, Image} from 'react-native';

function stripHtml(html) {
  if (!html) {
    return '';
  }
  return html
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .trim();
}

function extractImageUrl(child) {
  if (!child || !child.props || !child.props.content) {
    return null;
  }
  const imgMatch = child.props.content.match(/<img[^>]+src="([^"]+)"/);
  return imgMatch && imgMatch[1] ? imgMatch[1] : null;
}

function extractText(child) {
  if (!child || !child.props || !child.props.content) {
    return '';
  }
  return stripHtml(child.props.content);
}

const TwoBLayout = ({items}) => {
  return (
    <View style={styles.container}>
      <View style={[styles.col, {paddingTop: 8, paddingBottom: 5}]}>
        <Text style={styles.title}>{extractText(items[0]?.children[0])}</Text>
        <Text style={styles.time}>{extractText(items[0]?.children[1])}</Text>
        <View style={styles.row}>
          {extractImageUrl(items[0].children[2]) && (
            <Image
              source={{uri: extractImageUrl(items[0]?.children[2])}}
              style={styles.icon}
              resizeMode="contain"
            />
          )}
          <Text style={styles.desc}>{extractText(items[0]?.children[2])}</Text>
        </View>
      </View>
      <View style={styles.divider} />
      <View style={[styles.col, {paddingTop: 8, paddingBottom: 5}]}>
        <Text style={styles.title}>{extractText(items[1]?.children[0])}</Text>
        <Text style={styles.time}>{extractText(items[1]?.children[1])}</Text>
        <View style={styles.row}>
          {extractImageUrl(items[1]?.children[2]) && (
            <Image
              source={{uri: extractImageUrl(items[1]?.children[2])}}
              style={styles.icon}
              resizeMode="contain"
            />
          )}
          <Text style={styles.desc}>{extractText(items[1]?.children[2])}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 0,
    marginVertical: 8,
    marginBottom: 25,
  },
  col: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: {
    width: 1,
    height: 60,
    backgroundColor: '#C0C0C0',
    marginHorizontal: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  icon: {
    width: 17,
    height: 17,
    marginRight: 4,
  },
  desc: {
    fontSize: 12,
    color: '#222',
  },
  time: {
    fontSize: 12,
    color: '#222',
    marginBottom: 2,
  },
});

export default TwoBLayout;
