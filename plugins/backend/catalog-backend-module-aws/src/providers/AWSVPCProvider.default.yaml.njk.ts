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
`;
