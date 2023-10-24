import { Entity } from '@backstage/catalog-model';

export const validateFromFile: (
  filepath: string,
  verbose: boolean,
) => Promise<Entity[]>;
export const validate: (
  fileContents: string,
  verbose: boolean,
) => Promise<Entity[]>;
