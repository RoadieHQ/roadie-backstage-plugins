/*
 * Copyright 2025 Larder Software Limited
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
export default `
{% extends 'AWSEntityProvider.base.yaml' %}

{% set entityName = data.CacheClusterId | lower | replace('_', '-') | replace('.', '-') %}
{% set entityTitle = data.CacheClusterId %}
{% set entityType = 'elasticache-cluster' %}

{% block additionalMetadata %}
  {% if data.CacheClusterStatus %}
  status: {{ data.CacheClusterStatus }}
  {% endif %}
  {% if data.Engine %}
  engine: {{ data.Engine }}
  {% endif %}
  {% if data.EngineVersion %}
  engineVersion: {{ data.EngineVersion }}
  {% endif %}
  {% if data.CacheNodeType %}
  nodeType: {{ data.CacheNodeType }}
  {% endif %}
  {% set endpoint = "" %}
  {% if data.CacheNodes[0].Endpoint %}
  {% set endpoint = data.CacheNodes[0].Endpoint.Address + ":" + data.CacheNodes[0].Endpoint.Port %}
  {% endif %}
  endpoint: "{{ endpoint }}"
{% endblock %}

{% block labels %}
  labels:
    aws-elasticache-region: {{ region }}
{% endblock %}
`;
