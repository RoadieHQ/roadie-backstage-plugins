{% extends 'AwsEntityProvider.base.yaml.njs' %}

{% set entityName = data.SubnetId %}
{% set entityType = "subnet" %}

{% block title %}{% endblock %}

{% block additionalMetadata %}
  {% if data.CidrBlock %}
  cidrBlock: "{{ data.CidrBlock }}"
  {% endif %}
  {% if data.VpcId %}
  vpcId: "{{ data.VpcId }}"
  {% endif %}
  {% if data.AvailabilityZone %}
  availabilityZone: "{{ data.AvailabilityZone }}"
  {% endif %}
  {% if data.AvailableIpAddressCount is defined %}
  availableIpAddressCount: {{ data.AvailableIpAddressCount }}
  {% endif %}
  {% if data.DefaultForAz is defined %}
  defaultForAz: {% if data.DefaultForAz %}'Yes'{% else %}'No'{% endif %}
  {% endif %}
  {% if data.MapPublicIpOnLaunch is defined %}
  mapPublicIpOnLaunch: {% if data.MapPublicIpOnLaunch %}'Yes'{% else %}'No'{% endif %}
  {% endif %}
  {% if data.State %}
  state: "{{ data.State }}"
  {% endif %}
{% endblock %}
