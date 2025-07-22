kind: Resource
apiVersion: backstage.io/v1beta1
metadata:
  name: {{ data.Attributes.QueueArn | split(":") | last }}
  title: {{ data.Attributes.QueueArn | split(":") | last }}
  queueArn: {{ data.Attributes.QueueArn }}
  annotations:
    amazon.com/sqs-queue-arn: {{ data.Attributes.QueueArn }}
  labels:
    aws-sqs-region: {{ region }}
spec:
  type: 'sqs-queue'