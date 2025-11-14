{% extends 'AwsEntityProvider.base.yaml.njs' %}

{% set entityName = ('arn:aws:s3:::' + data.Name) | arn_to_name %}
{% set entityTitle = data.Name %}
{% set entityType = "s3-bucket" %}
