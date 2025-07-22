kind: Resource
apiVersion: backstage.io/v1beta1
metadata:
  name: {{ data.FunctionArn | to_entity_name }}
  annotations:
    amazon.com/lambda-function-arn: {{ data.FunctionArn }}
    backstage.io/view-url: "https://{{ region }}.console.aws.amazon.com/lambda/home?region={{ region }}#/functions/{{ data.FunctionName }}"
  title: {{ data.FunctionName }}