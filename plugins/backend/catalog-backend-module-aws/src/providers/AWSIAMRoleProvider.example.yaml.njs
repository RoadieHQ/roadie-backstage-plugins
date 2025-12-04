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
  name: {{ data.RoleName | to_entity_name }}
  annotations:
    amazon.com/iam-role-arn: {{ data.Arn }}
  title: {{ data.RoleName }}
  labels:
    {% if data.Tags %}
    {% for tag in data.Tags %}
    {{ tag.Key }}: {{ tag.Value | replace(":", "-") | replace("/", "-") }}
    {% endfor %}
    {% endif %}
spec:
  type: aws-role
  owner: "{{ accountId }}"
`;
