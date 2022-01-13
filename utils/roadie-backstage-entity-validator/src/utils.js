import glob from 'glob';
import yaml from 'js-yaml';
import fs from 'fs';

const isBackstageCatalogFile = obj => {
  return 'apiVersion' in obj && obj.apiVersion.includes('backstage.io');
};

export const getCatalogFiles = (context = '.') => {
  const potentialCatalogFiles = glob.sync(`${context}/**/*.yaml`, {
    dot: true,
  });

  const catalogFiles = potentialCatalogFiles.filter(filePath => {
    const content = yaml.load(fs.readFileSync(filePath, 'utf-8'));
    return isBackstageCatalogFile(content);
  });

  return catalogFiles;
};
