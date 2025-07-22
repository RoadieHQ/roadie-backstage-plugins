kind: Resource
apiVersion: backstage.io/v1beta1
metadata:
  name: {{ data.RoleName | to_entity_name }}
  annotations:
    amazon.com/iam-role-arn: {{ data.Arn }}
  title: {{ data.RoleName }}
  labels:
    {% if data.Tags %}
    {% for tag in data.Tags %}
    {{ tag.Key }}: {{ tag.Value | replace(":", "-") | replace("/", "-") }}
    {% endfor %}
    {% endif %}
spec:
  type: aws-role
  owner: {{ accountId }}