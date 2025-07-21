kind: Resource
apiVersion: backstage.io/v1beta1
metadata:
  name: {{ vpc.VpcId }}
  annotations:
    amazonaws.com/vpc-id: {{ vpc.VpcId }}
  title: {{ vpc.VpcId }}
  state: {{ vpc.State }}
spec:
  type: vpc