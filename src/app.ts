import * as generator from './lib/generator';

async function owo() {
  const gen = new generator.Generator(process.cwd());
  await gen.generate();
}

owo()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
