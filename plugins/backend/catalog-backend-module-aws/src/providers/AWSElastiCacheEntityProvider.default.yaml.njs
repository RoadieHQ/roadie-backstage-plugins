{% extends 'AwsEntityProvider.base.yaml.njs' %}

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
