kind: Resource
apiVersion: backstage.io/v1beta1
metadata:
  name: {{ lambdaFunction.FunctionArn | to_entity_name }}
  annotations:
    amazon.com/lambda-function-arn: {{ lambdaFunction.FunctionArn }}
    backstage.io/view-url: "https://{{ region }}.console.aws.amazon.com/lambda/home?region={{ region }}#/functions/{{ lambdaFunction.FunctionName }}"
  title: {{ lambdaFunction.FunctionName }}