import {StyleSheet} from 'react-native';
import {Colors} from '@app/styles';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  topBlackArea: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  contentWrapper: {
    flex: 1,
    // 内容区域保持米色，从下方开始，露出顶部黑色
    backgroundColor: '#FFF8F0',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: 80, // 留出顶部黑色区域
    overflow: 'hidden',
    position: 'relative',
  },
  scrollContainer: {
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 23,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 8,
    textAlign: 'left',
  },
  subtitle: {
    fontSize: 12.5,
    color: 'rgba(0, 0, 0, 1)',
    marginBottom: 30,
    textAlign: 'left',
    lineHeight: 20,
  },
  categoryContainer: {
    marginBottom: 30,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 16,
  },
  hobbyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  hobbyButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
    margin: 6,
    minWidth: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hobbyButtonSelected: {
    borderColor: Colors.PRIMARY || '#FF8200',
    borderWidth: 2,
    backgroundColor: '#FFFFFF',
  },
  hobbyButtonText: {
    fontSize: 14,
    color: '#333333',
    fontWeight: '500',
  },
  hobbyButtonTextSelected: {
    color: Colors.PRIMARY || '#FF8200',
    fontWeight: '600',
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    // 底部区域同样保持纯白背景
    backgroundColor: 'rgba(255, 255, 255, 1)',
    paddingHorizontal: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  confirmButton: {
    backgroundColor: Colors.PRIMARY || '#FF8200',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  skipButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  skipButtonText: {
    fontSize: 14,
    color: Colors.PRIMARY || '#FF8200',
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
});

export default styles;
