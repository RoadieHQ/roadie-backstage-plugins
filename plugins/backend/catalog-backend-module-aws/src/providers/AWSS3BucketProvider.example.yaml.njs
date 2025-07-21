kind: Resource
apiVersion: backstage.io/v1beta1
metadata:
  name: {{ bucket.Name | to_entity_name }}
  annotations:
    amazonaws.com/s3-bucket-arn: arn:aws:s3:::{{ bucket.Name }}
  title: {{ bucket.Name }}
  labels:
    region: {{ region }}
    accountId: {{ accountId }}
spec:
  type: s3-bucket
  owner: unknown