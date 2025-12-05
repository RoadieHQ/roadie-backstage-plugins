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

{% set entityName = data.InstanceId %}
{% set entityTitle = data.Tags | find_name_tag %}
{% set entityType = 'ec2-instance' %}

{% block additionalMetadata %}
  {% if data.Platform %}
  instancePlatform: "{{ data.Platform }}"
  {% endif %}
  {% if data.InstanceType %}
  instanceType: "{{ data.InstanceType }}"
  {% endif %}
  {% if data.Monitoring.State %}
  monitoringState: "{{ data.Monitoring.State }}"
  {% endif %}
  {% if data.Placement.AvailabilityZone %}
  instancePlacement: "{{ data.Placement.AvailabilityZone }}"
  {% endif %}
  amountOfBlockDevices: {{ data.BlockDeviceMappings | length if data.BlockDeviceMappings else 0 }}
  {% if data.CpuOptions.CoreCount %}
  instanceCpuCores: {{ data.CpuOptions.CoreCount }}
  {% endif %}
  {% if data.CpuOptions.ThreadsPerCore %}
  instanceCpuThreadsPerCode: {{ data.CpuOptions.ThreadsPerCore }}
  {% endif %}
  {% if additionalData.reservation.ReservationId %}
  reservationId: "{{ additionalData.reservation.ReservationId }}"
  {% endif %}
{% endblock %}
`;
