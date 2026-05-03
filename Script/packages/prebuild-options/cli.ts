import { DOCS_CONFIG, type DocsConfig, getPackageName } from "@devtools/helpers";
import { consola } from 'consola';
import { generateOptionsDocs } from './tasks/generate-docs.ts';
import { generateOptionsModels } from './tasks/generate-models.ts';

main();

async function main() {
  const docsConfig: DocsConfig = DOCS_CONFIG["typedoc-vitepress-theme"];

  if (docsConfig.declarations) {
    await generateOptionsModels(docsConfig);
    await generateOptionsDocs(docsConfig);
  }

  consola.success(`[${getPackageName()}] Prebuild options complete`);
}
