function log(message: any, level: 'debug' | 'info' | 'warn' | 'error') {
    const logLevels = ['debug', 'info', 'warn', 'error'];
    const currentLevelIndex = logLevels.indexOf(process.env.NPM_CONFIG_LOGLEVEL || 'info');
    const messageLevelIndex = logLevels.indexOf(level);
  
    if (messageLevelIndex >= currentLevelIndex) {
      console.log(`${new Date().toISOString()} [${level.toUpperCase()}]: ${message}`);
    }
  }
  
  export default log;