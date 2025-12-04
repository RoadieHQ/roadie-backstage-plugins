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
apiVersion: backstage.io/v1beta1
kind: Resource
metadata:
  namespace: custom-namespace
  annotations:
    amazon.com/account-id: "{{ accountId }}"
    amazon.com/eks-cluster-version: "{{ data.version }}"
    amazon.com/eks-cluster-arn: "{{ data.arn }}"
    amazon.com/iam-role-arn: "{{ data.roleArn }}"
    kubernetes.io/api-server: "{{ data.endpoint }}"
    kubernetes.io/x-k8s-aws-id: "{{ data.name }}"
    kubernetes.io/auth-provider: "aws"
    custom-annotation: "custom-value"
  name: custom-{{ data.name | sanitize_name }}
  title: CUSTOM-{{ accountId }}:{{ region }}:{{ data.name }}
  labels:
    custom-label: custom-label-value
    eks-cluster: {{ data.name }}
    some_url: {{ data.tags.some_url | replace(":", "-") | replace("/", "-") }}
spec:
  owner: custom-team
  type: custom-eks-cluster
`;
