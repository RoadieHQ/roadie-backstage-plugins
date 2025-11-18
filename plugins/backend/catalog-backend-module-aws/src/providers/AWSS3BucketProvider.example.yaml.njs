kind: Resource
apiVersion: backstage.io/v1beta1
metadata:
  name: {{ data.Name | to_entity_name }}
  annotations:
    amazonaws.com/s3-bucket-arn: arn:aws:s3:::{{ data.Name }}
  title: {{ data.Name }}
  labels:
    region: {{ region }}
    accountId: {{ accountId }}
spec:
  type: s3-bucket
  owner: hardcoded-unknown
