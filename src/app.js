process.env.NODE_ENV = 'development';

const SassManager = require('./structures/managers/SassManager');
const manager = new SassManager();

manager.load();

process.on('SIGINT', () => {
  manager.dispose();
  process.exit(0);
});
