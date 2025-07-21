kind: Resource
apiVersion: backstage.io/v1beta1
metadata:
  name: {{ instance.InstanceId }}
  title: {{ instance.InstanceId }}
  annotations:
    amazon.com/ec2-instance-id: {{ instance.InstanceId }}
    backstage.io/view-url: https://eu-west-1.console.aws.amazon.com/ec2/v2/home
spec:
  type: ec2-instance