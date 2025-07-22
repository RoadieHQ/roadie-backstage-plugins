kind: Resource
apiVersion: backstage.io/v1beta1
metadata:
  name: {{ data.TableArn | to_entity_name }}
  annotations:
    amazon.com/dynamo-db-table-arn: {{ data.TableArn }}
  title: {{ data.TableName }}
  labels:
    something: {{ tags['something'] | replace("/", "-") | replace("/", "-") | replace(":", "-") }}
spec:
  type: dynamo-db-table