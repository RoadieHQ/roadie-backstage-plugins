kind: Resource
apiVersion: backstage.io/v1beta1
metadata:
  name: {{ role.RoleName | to_entity_name }}
  annotations:
    amazon.com/iam-role-arn: {{ role.Arn }}
  title: {{ role.RoleName }}
  labels:
    {% if role.Tags %}
    {% for tag in role.Tags %}
    {{ tag.Key }}: {{ tag.Value | replace(":", "-") | replace("/", "-") }}
    {% endfor %}
    {% endif %}
spec:
  type: aws-role
  owner: {{ accountId }}