{% extends 'AwsEntityProvider.base.yaml.njs' %}

{% set entityName = data.VpcId %}
{% set entityTitle = tags.Name or data.VpcId %}
{% set entityType = "vpc" %}

{% block additionalMetadata %}
  {% if data.CidrBlockAssociationSet %}
  cidrBlocks: "{% for cidr in data.CidrBlockAssociationSet %}{{ cidr.CidrBlock }}{% if not loop.last %}, {% endif %}{% endfor %}"
  {% endif %}
  dhcpOptions: "{{ data | get_dhcp_options(additionalData) }}"
  isDefault: {% if data.IsDefault %}'Yes'{% else %}'No'{% endif %}
  {% if data.State %}
  state: "{{ data.State }}"
  {% endif %}
  {% if data.InstanceTenancy %}
  instanceTenancy: "{{ data.InstanceTenancy }}"
  {% endif %}
{% endblock %}
