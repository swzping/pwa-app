const RADIUS_CLASS_MAP = {
  'rounded-t-none': ['borderTopLeftRadius', 'borderTopRightRadius'],
  'rounded-b-none': ['borderBottomLeftRadius', 'borderBottomRightRadius'],
};

export function parseRoundedClasses(cssClasses = []) {
  const style = {};

  cssClasses.forEach(cls => {
    const keys = RADIUS_CLASS_MAP[cls];
    if (keys) {
      keys.forEach(key => {
        style[key] = 0;
      });
    }
  });

  return style;
}
