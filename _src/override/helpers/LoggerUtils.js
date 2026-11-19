import {consoleTransport, logger} from 'react-native-logs';

const defaultConfig = {
  levels: {
    debug: 0,
    debugNet: 0,
    info: 1,
    warn: 2,
    error: 3,
  },
  severity: 'debug',
  transport: consoleTransport,
  transportOptions: {
    colors: {
      debugNet: 'greenBright',
      info: 'blueBright',
      warn: 'yellowBright',
      error: 'redBright',
    },
  },
  async: true,
  dateFormat: 'time',
  printLevel: true,
  printDate: true,
  fixedExtLvlLength: false,
  enabled: __DEV__,
};

export const LogUtils = logger.createLogger(defaultConfig);
