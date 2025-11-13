kind: Resource
apiVersion: backstage.io/v1beta1
metadata:
  name: {{ data.InstanceId }}
  title: {{ data.InstanceId }}
  annotations:
    amazon.com/ec2-instance-id: {{ data.InstanceId }}
    backstage.io/view-url: https://eu-west-1.console.aws.amazon.com/ec2/v2/home
spec:
  type: ec2-instance
