/*
 * Copyright 2021 Larder Software Limited
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

import type { Config } from '@backstage/config';
import type { IFrameSrcTransform } from './components/types';

/**
 * Builds an iframe `src` by wrapping the annotation value with a fixed prefix
 * and (optionally) a suffix.
 *
 * @example Prefix only — `https://host/prefix/${annotation_value}`
 * ```tsx
 * <EntityIFrameCard
 *   srcFromAnnotation="my-org/dashboard-id"
 *   transform={wrapAnnotation('https://grafana.example.com/d/')}
 * />
 * ```
 *
 * @example Prefix + suffix — `https://host/foo/${annotation_value}/extra`
 * ```tsx
 * <EntityIFrameCard
 *   srcFromAnnotation="my-org/dashboard-id"
 *   transform={wrapAnnotation('https://example.com/foo/', '/extra')}
 * />
 * ```
 *
 * @public
 */
export const wrapAnnotation =
  (prefix: string, suffix: string = ''): IFrameSrcTransform =>
  value =>
    `${prefix}${value}${suffix}`;

/**
 * Builds an iframe `src` by substituting the annotation value into the literal
 * token `${value}` anywhere in a template string. Use single quotes so the
 * token is not interpreted as a JavaScript template literal.
 *
 * @example
 * ```tsx
 * <EntityIFrameCard
 *   srcFromAnnotation="my-org/dashboard-id"
 *   transform={intoTemplate('https://example.com/foo/${value}/extra')}
 * />
 * ```
 *
 * @public
 */
export const intoTemplate =
  (template: string): IFrameSrcTransform =>
  value =>
    template.replace(/\$\{value\}/g, value);

/**
 * Factory variant of {@link wrapAnnotation} that reads the prefix (and an
 * optional fixed suffix) from a frontend-visible configuration value at the
 * time the factory is called.
 *
 * Use this when the URL should differ between environments (dev, staging,
 * prod) without recompiling the app: put the host in `app-config.yaml` under
 * a key marked `@visibility: frontend`, then call the factory from a
 * component that has access to `configApiRef`.
 *
 * @example app-config.yaml — the key must be frontend-visible to reach the browser
 * ```yaml
 * iframe:
 *   grafana:
 *     baseUrl: https://grafana.example.com/d/   # @visibility: frontend
 * ```
 *
 * @example component code — `useMemo` keeps the transform identity stable
 * ```tsx
 * import { configApiRef, useApi } from '@backstage/core-plugin-api';
 * import {
 *   EntityIFrameCard,
 *   wrapAnnotationFromConfig,
 * } from '@roadiehq/backstage-plugin-iframe';
 * import { useMemo } from 'react';
 *
 * export const GrafanaDashboardCard = () => {
 *   const config = useApi(configApiRef);
 *   const transform = useMemo(
 *     () => wrapAnnotationFromConfig(config, 'iframe.grafana.baseUrl'),
 *     [config],
 *   );
 *   return (
 *     <EntityIFrameCard
 *       srcFromAnnotation="grafana/dashboard-id"
 *       transform={transform}
 *     />
 *   );
 * };
 * ```
 *
 * Reads the key with `config.getString`, so a missing or non-string value
 * fails fast at factory-call time rather than rendering a broken iframe.
 *
 * @public
 */
export const wrapAnnotationFromConfig = (
  config: Config,
  configKey: string,
  suffix: string = '',
): IFrameSrcTransform => {
  const prefix = config.getString(configKey);
  return value => `${prefix}${value}${suffix}`;
};
