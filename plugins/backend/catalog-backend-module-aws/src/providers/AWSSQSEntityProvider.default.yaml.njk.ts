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

{% set queueArn = data.QueueArn %}
{% set queueName = queueArn | split(':') | last %}
{% set entityName = queueName | sanitize_name_dashes_only %}
{% set entityTitle = queueName %}
{% set entityType = "sqs-queue" %}

{% block labels %}
  labels:
    aws-sqs-region: {{ region }}
{% endblock %}

{% block additionalMetadata %}
  {% if data.QueueArn %}
  queueArn: "{{ data.QueueArn }}"
  {% endif %}
  {% if data.VisibilityTimeout %}
  visibilityTimeout: "{{ data.VisibilityTimeout }}"
  {% endif %}
  {% if data.DelaySeconds %}
  delaySeconds: "{{ data.DelaySeconds }}"
  {% endif %}
  {% if data.MaximumMessageSize %}
  maximumMessageSize: "{{ data.MaximumMessageSize }}"
  {% endif %}
  {% if data.MessageRetentionPeriod %}
  retentionPeriod: "{{ data.MessageRetentionPeriod }}"
  {% endif %}
  {% if data.ApproximateNumberOfMessages %}
  approximateNumberOfMessages: "{{ data.ApproximateNumberOfMessages }}"
  {% endif %}
{% endblock %}
`;
