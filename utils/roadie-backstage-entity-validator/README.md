# Roadie Backstage entity validator

This is a library package used to validate entity files.

It exports two methods:
``` typescript
export const validateFromFile: (filepath: string, verbose: boolean) => Promise<void>;
export const validate:  (fileContents: string, verbose: boolean) => Promise<void>;
```

