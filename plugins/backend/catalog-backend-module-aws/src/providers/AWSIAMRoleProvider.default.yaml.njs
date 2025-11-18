{% extends 'AwsEntityProvider.base.yaml.njs' %}

{% set entityName = data.Arn | arn_to_name %}
{% set entityTitle = data.RoleName %}
{% set entityType = 'aws-role' %}
{% set apiVersion = 'backstage.io/v1alpha1' %}
