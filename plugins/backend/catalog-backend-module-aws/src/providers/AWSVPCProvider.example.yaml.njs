kind: Resource
apiVersion: backstage.io/v1beta1
metadata:
  name: {{ data.VpcId }}
  annotations:
    amazonaws.com/vpc-id: {{ data.VpcId }}
  title: {{ data.VpcId }}
  state: {{ data.State }}
spec:
  type: vpc
