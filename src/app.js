const { createLogger } = require('./structures/Logger');
const log = createLogger('Master', { depth: 2 });

log.write(
  'info', 
  'none', 
  'Hello, world!'
);

log.write(
  'warn', 
  'none', 
  'Oops!'
);

log.write(
  'error',
  'error',
  'Uh oh, an exception occured!'
);

log.write(
  'debug',
  'none',
  'UwU\'d at 00:00:00'
);

log.write(
  'request',
  'none',
  'Made a request to GET /'
);

log.write(
  'unknown',
  'error',
  'Unknown level!'
);
