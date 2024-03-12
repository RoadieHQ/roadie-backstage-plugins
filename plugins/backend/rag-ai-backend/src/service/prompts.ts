/*
 * Copyright 2024 Larder Software Limited
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const prefixPrompt = (promptPrefixText?: string) => (embedding: string) =>
  promptPrefixText
    ? `${promptPrefixText}  ${embedding}`
    : `You are an agent designed to answer questions from documents, Backstage catalog-info files, OpenAPI specs and Tech Insights Data data provided to you.

If the question does not seem related to the aforementioned items, return I don't know. Do not make up an answer.
Only use information provided by the embedded documentation to construct your response. ` +
      `
The embedded input document you should use to answer this query is the following:  
${embedding}
`;
const suffixPrompt = (promptSuffixText?: string) => (input: string) =>
  promptSuffixText
    ? `${promptSuffixText} ${input}`
    : `Begin!"

Question: ${input}
`;

export const createPromptTemplates = (prompts?: {
  prefix?: string;
  suffix?: string;
}) => {
  return {
    prefixPrompt: prefixPrompt(prompts?.prefix),
    suffixPrompt: suffixPrompt(prompts?.suffix),
  };
};
