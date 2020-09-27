process.env.NODE_ENV = 'development';

const ProjectsManager = require('./structures/managers/ProjectManager');
const manager = new ProjectsManager();

manager
  .load()
  .then(() => process.exit(0))
  .catch(console.error);
