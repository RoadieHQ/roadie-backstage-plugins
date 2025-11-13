{% extends 'AwsEntityProvider.base.yaml.njs' %}

{% set entityName = data.TableArn | arn_to_name %}
{% set entityTitle = data.TableName %}
{% set entityType = 'dynamo-db-table' %}
