import {shouldUseSystemShareSheet} from './shareStrategy';

describe('shouldUseSystemShareSheet', () => {
  it.each(['facebook', 'twitter'])(
    'uses the supported iOS share sheet for %s',
    type => {
      expect(shouldUseSystemShareSheet('ios', type)).toBe(true);
    },
  );

  it.each(['instagram', 'whatsapp', 'email', null])(
    'keeps the existing iOS share path for %s',
    type => {
      expect(shouldUseSystemShareSheet('ios', type)).toBe(false);
    },
  );

  it.each(['facebook', 'twitter'])(
    'does not change the Android share path for %s',
    type => {
      expect(shouldUseSystemShareSheet('android', type)).toBe(false);
    },
  );
});
