import type { DocsConfig } from '@devtools/helpers';
import * as fs from 'fs';
import * as path from 'path';
import { pathToFileURL } from "url";

export async function generateOptionsPresets(docsConfig: DocsConfig) {
  const presetsConfig: any = await import(pathToFileURL(docsConfig.presetsPath as string).href);

  const presetsJson = JSON.stringify(presetsConfig.default, null, 2);

  const output = `
# Presets

These are the preset \`typedoc-plugin-markdown\` options passed to TypeDoc.

\`\`\`json
${presetsJson}
\`\`\`
`;

  const presetsDocPath = path.join(
    getPagesPath(docsConfig.optionsPath),
    'presets.mdx',
  );

  fs.writeFileSync(presetsDocPath, output);
}

function getPagesPath(docsPath: string) {
  const pagesPath = path.join(
    __dirname,
    '..',
    '..',
    '..',
    '..',
    'docs',
    'pages',
  );
  return path.join(pagesPath, docsPath);
}
