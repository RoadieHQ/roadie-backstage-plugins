# Roadie Backstage entity validator

This is a library package used to validate entity files.

It exports two methods:

```typescript
export const validateFromFile: (
  filepath: string,
  verbose: boolean,
  customAnnotationSchemaLocation: string,
) => Promise<void>;
export const validate: (
  fileContents: string,
  verbose: boolean,
  customAnnotationSchemaLocation: string,
) => Promise<void>;
```

---

Roadie gives you a hassle-free, fully customisable SaaS Backstage. Find out more here: [https://roadie.io](https://roadie.io).
