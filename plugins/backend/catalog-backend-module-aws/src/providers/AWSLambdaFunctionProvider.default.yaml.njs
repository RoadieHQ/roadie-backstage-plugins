{% extends 'AwsEntityProvider.base.yaml.njs' %}

{% set entityName = data.FunctionArn | arn_to_name %}
{% set entityTitle = data.FunctionName %}
{% set entityType = "lambda-function" %}

{% block additionalMetadata %}
  description: "{{ data.Description }}"
  runtime: {{ data.Runtime }}
  memorySize: {{ data.MemorySize }}
  ephemeralStorage: {{ data.EphemeralStorage.Size }}
  timeout: {{ data.Timeout }}
  {% if data.Architectures | length > 0 %}
  architectures:
    {% for arch in data.Architectures %}
    - {{ arch }}
    {% endfor %}
  {% endif %}
{% endblock %}
