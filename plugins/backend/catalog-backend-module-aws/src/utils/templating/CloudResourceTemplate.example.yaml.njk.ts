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
kind: Resource
apiVersion: backstage.io/v1beta1
metadata:
  name: {{ data.arn | arn_to_name if data.arn else (data.name | default('test')) }}
  {% if data.namespace is defined %}namespace: {{ data.namespace }}{% endif %}
  {% if data.title is defined %}title: {{ data.title }}{% endif %}
  {% if accountId or region %}
  annotations:
    {% if accountId %}"aws-account-id": "{{ accountId }}"{% endif %}
    {% if region %}"aws-region": "{{ region }}"{% endif %}
  {% endif %}
  {% if tags | labels_from_tags | length > 0 %}
  labels:
    {% for key, value in tags | labels_from_tags %}
    {{ key }}: {{ value }}
    {% endfor %}
  {% endif %}
spec:
  type: test
  owner: {{ tags | owner_from_tags }}
  {% if tags | relationships_from_tags | length > 0 %}
  {% for relationType, relationRefs in tags | relationships_from_tags %}
  {{ relationType }}:
    {% for ref in relationRefs %}
    - {{ ref }}
    {% endfor %}
    {% block additionalRelationships %}{% endblock %}
  {% endfor %}
  {% endif %}
`;
