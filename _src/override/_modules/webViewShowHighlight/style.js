import {StyleSheet,Platform} from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  webview: {
    flex: 1,
    marginVertical:Platform.OS === "ios" ? -103 : -120
  },
});

export default styles;
