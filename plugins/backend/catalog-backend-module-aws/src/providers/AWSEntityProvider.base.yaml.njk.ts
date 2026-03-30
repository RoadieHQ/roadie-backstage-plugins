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

/**
 * // Pretty much always use these
{% extends 'AWSEntityProvider.base.yaml' %}

{% set entityName =  %}
{% set entityTitle =  %}
{% set entityType =  %}

// end always

// Maybe use these
{% set apiVersion =  %}
{% set entityKind =  %}

// Include these if you want to add properties to the base template
{% block additionalMetadata %}{% endblock %}
{% block additionalAnnotations %}{% endblock %}
{% block additionalLabels %}{% endblock %}
{% block additionalRelationships %}{% endblock %}
{% block additionalBlocks %}{% endblock %}

// These are usually just to wrap in conditionals or exclude them entirely
{% block title %}{% endblock %}
{% block labels %}{% endblock %}
{% block owner %}{% endblock %}
{% block type %}{% endblock %}
{% block relationships %}{% endblock %}
{% block additionalSpec %}{% endblock %}
 */

export default `
kind: {{ entityKind or 'Resource' }}
apiVersion: {{ apiVersion or 'backstage.io/v1beta1' }}
metadata:
  {% block name %}
  name: "{{ entityName | sanitize_name | lower }}"
  {% endblock %}
  {% block title %}
  {% if entityTitle %}
  title: "{{ entityTitle }}"
  {% endif %}
  {% endblock %}
  annotations:
    {% for key, value in mergedAnnotations %}
    "{{ key }}": "{{ value }}"
    {% endfor %}
    {% block additionalAnnotations %}{% endblock %}
  {% block labels %}
  {% if tags | labels_from_tags | length == 0 %}
  labels: {% block allLabels %}{}{% endblock %}
  {% else %}
  labels:
    {% for key, value in tags | labels_from_tags %}
    {{ key }}: {{ value }}
    {% endfor %}
    {% block additionalLabels %}{% endblock %}
  {% endif %}
  {% endblock %}
  {% block additionalMetadata %}{% endblock %}
spec:
  {% block owner %}
  owner: "{{ tags | owner_from_tags | sanitize_name_as_ref }}"
  {% endblock %}
  {% block relationships %}
  {% if tags | relationships_from_tags | length > 0 %}
  {% for relationType, relationRefs in tags | relationships_from_tags %}
  {{ relationType }}:
    {% for ref in relationRefs %}
    - {{ ref | sanitize_name_as_ref }}
    {% endfor %}
    {% block additionalRelationships %}{% endblock %}
  {% endfor %}
  {% endif %}
  {% endblock %}
  {% block type %}
  {% if entityType %}
  type: "{{ entityType }}"
  {% endif %}
  {% endblock %}
  {% block additionalSpec %}{% endblock %}
{% block additionalBlocks %}{% endblock %}
`;
