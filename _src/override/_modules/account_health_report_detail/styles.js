import {StyleSheet} from 'react-native';
import {Colors} from '@app/styles';
import {normalize} from '@app/styles/mixins';

export default StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.WHITE,
  },
  headerBackground: {
    paddingBottom: normalize(12),
    overflow: 'hidden',
  },
  safeArea: {
    paddingHorizontal: normalize(16),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: normalize(12),
  },
  backButton: {
    width: normalize(32),
    height: normalize(32),
    borderRadius: normalize(16),
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    color: Colors.WHITE,
    fontSize: normalize(16),
    fontWeight: '600',
  },
  hero: {
    paddingHorizontal: normalize(16),
    paddingBottom: normalize(24),
    height: normalize(120),
    justifyContent: 'flex-start',
  },
  headingContent: {
    marginTop: 0,
  },
  headerSpacer: {
    width: normalize(32),
  },
  reportTitle: {
    fontSize: normalize(28),
    lineHeight: normalize(40),
    fontWeight: '700',
    color: Colors.WHITE,
  },
  reportSubtitle: {
    fontSize: normalize(16),
    lineHeight: normalize(24),
    color: Colors.WHITE,
    marginTop: normalize(4),
  },
  metaBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: normalize(20),
    paddingVertical: normalize(8),
    backgroundColor: Colors.GRAY_SMOOTH2,
    marginHorizontal: -normalize(16),
    marginBottom: normalize(24),
  },
  metaItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaItemRight: {
    justifyContent: 'flex-end',
  },
  metaBarLabel: {
    fontSize: normalize(12),
    color: '#757575',
    marginRight: normalize(4),
  },
  metaBarValue: {
    fontSize: normalize(12),
    fontWeight: '600',
    color: '#757575',
  },
  scroll: {
    flex: 1,
    backgroundColor: Colors.TRANSPARENT,
  },
  scrollContent: {
    paddingBottom: normalize(30),
  },
  contentSurface: {
    backgroundColor: Colors.WHITE,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    paddingHorizontal: normalize(16),
    paddingBottom: normalize(32),
    marginTop: 0,
    minHeight: '100%',
  },
  sectionCard: {
    backgroundColor: Colors.WHITE,
    padding: normalize(16),
    paddingLeft:normalize(2),
    paddingTop:normalize(-10),
    marginBottom: normalize(16),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.GRAY_SMOOTH3,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: normalize(1),
  },
  sectionIcon: {
    marginRight: normalize(8),
  },
  sectionTitle: {
    fontSize: normalize(16),
    color: '#616161',
  },
  infoRow: {
    flexDirection: 'row',
    marginTop: normalize(12),
  },
  infoColumn: {
    flex: 1,
  },
  infoColumnSpacing: {
    marginRight: normalize(16),
  },
  infoValue: {
    fontSize: normalize(14),
    fontWeight: '600',
    color: Colors.BLACK,
    letterSpacing: 0.2,
  },
  infoLabel: {
    marginTop: normalize(4),
    fontSize: normalize(12),
    color: Colors.GRAY_DARK,
  },
  metricItem: {
    paddingVertical: normalize(16),
    paddingLeft: normalize(4),
  },
  metricItemDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.GRAY_SMOOTH3,
  },
  metricValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: normalize(4),
  },
  metricValue: {
    fontSize: normalize(22),
    fontWeight: '700',
    color: Colors.BLACK,
  },
  metricUnit: {
    marginLeft: normalize(8),
    fontSize: normalize(12),
    fontStyle: 'normal',
    fontWeight: '700',
    color: Colors.BLACK,
    transform: [{translateY: normalize(2)}],
  },
  metricLabel: {
    fontSize: normalize(13),
    color: Colors.GRAY_DARK,
  },
  metricLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metricIcon: {
    marginRight: normalize(6),
  },
  metricDescription: {
    marginTop: normalize(6),
    fontSize: normalize(12),
    lineHeight: normalize(16),
    color: Colors.GRAY_DARK,
  },
  storeLabel: {
    fontSize: normalize(12),
    color: Colors.GRAY_DARK,
  },
  storeValue: {
    fontSize: normalize(14),
    fontWeight: '600',
    color: Colors.BLACK,
  },
  storeSection: {
    alignItems: 'flex-start',
    paddingTop: normalize(20),
    paddingBottom: normalize(20),
    paddingLeft: normalize(4),
  },
  storeDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.GRAY_SMOOTH3,
    marginHorizontal: -normalize(16),
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: normalize(32),
    backgroundColor: Colors.WHITE,
    borderRadius: normalize(16),
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.GRAY_SMOOTH3,
  },
});

