import { join } from 'path';
import Parser from './typedoc/Parser';

(async() => {
  const parser = new Parser(
    join(process.cwd(), '..', '.camellia', 'orchid'),
    'Orchid'
  );

  parser.render();
})();
