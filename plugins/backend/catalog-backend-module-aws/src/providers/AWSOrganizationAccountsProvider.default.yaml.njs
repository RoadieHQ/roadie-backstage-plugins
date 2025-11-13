{% extends 'AwsEntityProvider.base.yaml.njs' %}

{% set entityName = data.Arn | arn_to_name %}
{% set entityTitle = data.Name %}
{% set entityType = "aws-account" %}

{% block additionalMetadata %}
  {% if data.JoinedTimestamp %}
  joinedTimestamp: "{{ data.JoinedTimestamp | date_to_iso }}"
  {% endif %}
  joinedMethod: "{{ data.JoinedMethod or "UNKNOWN" }}"
  status: "{{ data.Status or "UNKNOWN" }}"
{% endblock %}
