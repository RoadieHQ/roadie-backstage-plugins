kind: Resource
apiVersion: backstage.io/v1beta1
metadata:
  name: {{ data.name | to_entity_name }}
  annotations:
    amazon.com/eks-cluster-arn: {{ data.arn }}
    amazon.com/iam-role-arn: {{ data.roleArn }}
    kubernetes.io/auth-provider: aws
    kubernetes.io/x-k8s-aws-id: {{ data.name }}
  title: {{ accountId }}:{{ region }}:{{ data.name }}
  labels:
    some_url: {{ data.tags.some_url | replace(":", "-") | replace("/", "-") }}