{% extends 'AwsEntityProvider.base.yaml.njs' %}

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
