process.env.NODE_ENV = 'development';

const TypedocManager = require('./structures/managers/TypedocManager');
const typedoc = new TypedocManager({
  projects: {
    toArray: () => [{ name: require('path').join(__dirname, '..', 'node_modules', '@augu', 'immutable') }],
    initialised: false
  }
});

setTimeout(() => typedoc.app.projects.initialised = true, 6000);
typedoc.load();
