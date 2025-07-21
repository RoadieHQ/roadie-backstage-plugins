kind: Resource
apiVersion: backstage.io/v1beta1
metadata:
  name: {{ topic.name | to_entity_name }}
  annotations:
    amazon.com/eks-cluster-arn: {{ topic.arn }}
    amazon.com/iam-role-arn: {{ topic.roleArn }}
    kubernetes.io/auth-provider: aws
    kubernetes.io/x-k8s-aws-id: {{ topic.name }}
  title: {{ accountId }}:{{ region }}:{{ topic.name }}
  labels:
    some_url: {{ cluster.tags.some_url | replace(":", "-") | replace("/", "-") }}