kind: Resource
apiVersion: backstage.io/v1beta1
metadata:
  name: {{ account.Arn | to_entity_name }}
  annotations: {}
  title: {{ account.Name }}
  joinedMethod: {{ account.JoinedMethod}}
  status: {{ account.Status}}
spec:
  type: "aws-account"