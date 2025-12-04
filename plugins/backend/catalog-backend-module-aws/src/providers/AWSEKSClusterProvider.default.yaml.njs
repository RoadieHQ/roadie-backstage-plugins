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

{% set entityName = additionalData.clusterName | arn_to_name %}
{% set entityType = additionalData.clusterTypeValue or "eks-cluster" %}
{% set entityTitle = accountId + ":" + region + ":" + data.name | sanitize_name_dashes_only %}

{% block title %}
{% if data.name %}
{{ super() }}
{% endif %}
{% endblock %}

{% block additionalAnnotations %}
    {% if data.name %}
    "kubernetes.io/x-k8s-aws-id": "{{ data.name }}"
    {% endif %}
    "kubernetes.io/auth-provider": "aws"
{% endblock %}
`;
