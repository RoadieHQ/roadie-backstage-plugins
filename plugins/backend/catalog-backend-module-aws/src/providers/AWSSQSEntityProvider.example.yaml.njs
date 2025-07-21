kind: Resource
apiVersion: backstage.io/v1beta1
metadata:
  name: {{ queueAttributes.Attributes.QueueArn | split(":") | last }}
  title: {{ queueAttributes.Attributes.QueueArn | split(":") | last }}
  queueArn: {{ queueAttributes.Attributes.QueueArn }}
  annotations:
    amazon.com/sqs-queue-arn: {{ queueAttributes.Attributes.QueueArn }}
  labels:
    aws-sqs-region: {{ region }}
spec:
  type: 'sqs-queue'