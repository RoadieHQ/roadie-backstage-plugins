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

{% set entityName = data.DomainName | sanitize_name_dashes_only %}
{% set entityTitle = data.DomainName %}
{% set entityType = "opensearch-domain" %}

{% block labels %}
  labels:
    aws-opensearch-region: "{{ region }}"
{% endblock %}

{% block additionalMetadata %}
  {% if data.Endpoint %}
  endpoint: "{{ data.Endpoint }}"
  {% endif %}
  {% if data.EngineVersion %}
  engineVersion: "{{ data.EngineVersion }}"
  {% endif %}
  {% if data.EBSOptions and data.EBSOptions.EBSEnabled %}
  storageType: "EBS-{{ data.EBSOptions.VolumeType | default('unknown') }}"
  {% else %}
  storageType: "Instance Storage"
  {% endif %}
{% endblock %}
`;
