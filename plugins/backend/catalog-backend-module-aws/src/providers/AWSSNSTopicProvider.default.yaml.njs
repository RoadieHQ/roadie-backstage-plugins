{% extends 'AwsEntityProvider.base.yaml.njs' %}

{% set apiVersion = "backstage.io/v1alpha1" %}
{% set topicName = data.TopicArn | split(':') | last %}
{% set entityName = topicName %}
{% set entityTitle = topicName %}
{% set entityType = 'aws-sns-topic' %}
