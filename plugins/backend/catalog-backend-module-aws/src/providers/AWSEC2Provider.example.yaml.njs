kind: Resource
apiVersion: backstage.io/v1beta1
metadata:
  name: {{ table.TableArn | to_entity_name }}
  annotations:
    amazon.com/dynamo-db-table-arn: {{ table.TableArn }}
  title: {{ table.TableName }}
  labels:
    {% for tag in tags %}
    {{ tag.Key }}: {{ tag.Value | replace(":", "-") | replace("/", "-") }}
    {% endfor %}
spec:
  type: dynamo-db-table