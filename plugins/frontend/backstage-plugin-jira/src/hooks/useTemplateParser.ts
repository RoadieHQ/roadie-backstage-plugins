export const useTemplateParser = () => {
  return (template: string, data: Record<string, string>) =>
    template.replace(/{{\s*(\w+)\s*}}/g, (match, key) => {
      return key in data ? data[key] : match;
    });
};
