import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';

const fileExists = filePath => {
  let flag = true;
  try {
    fs.accessSync(filePath, fs.constants.F_OK);
  } catch {
    flag = false;
  }
  return flag;
};

const validateTechDocs = async (data, filePath) => {
  if (
    !data?.metadata?.annotations ||
    !data?.metadata?.annotations['backstage.io/techdocs-ref']
  ) {
    return;
  }
  const techDocsAnnotation =
    data.metadata.annotations['backstage.io/techdocs-ref'];
  if (
    !techDocsAnnotation.includes('dir') ||
    techDocsAnnotation.match(/^dir:.$/gm)
  ) {
    return;
  }

  const mkdocsYamlPath = path.join(
    path.dirname(filePath),
    techDocsAnnotation.split(':')[1],
    'mkdocs.yaml',
  );
  const mkdocsYmlPath = path.join(
    path.dirname(filePath),
    techDocsAnnotation.split(':')[1],
    'mkdocs.yml',
  );

  if (!fileExists(mkdocsYamlPath) & !fileExists(mkdocsYmlPath)) {
    throw new Error(
      `Techdocs annotation specifies "dir" but file under ${mkdocsYamlPath}|${mkdocsYmlPath} not found`,
    );
  }
  return;
};

export const relativeSpaceValidation = async (
  fileContents,
  filePath,
  verbose,
) => {
  try {
    const data = yaml.loadAll(fileContents, { schema: yaml.CORE_SCHEMA });
    if (verbose) {
      console.log('Validating locally dependant catalog contents');
    }
    await Promise.all(
      data.map(async it => {
        await validateTechDocs(it, filePath);
      }),
    );
  } catch (e) {
    throw new Error(e);
  }
};
