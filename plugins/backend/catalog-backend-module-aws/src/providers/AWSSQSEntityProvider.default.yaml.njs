{% extends 'AwsEntityProvider.base.yaml.njs' %}

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
