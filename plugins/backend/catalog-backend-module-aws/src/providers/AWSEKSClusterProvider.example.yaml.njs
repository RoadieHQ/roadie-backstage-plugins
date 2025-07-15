kind: Resource
apiVersion: backstage.io/v1beta1
metadata:
  name: {{ name | to_entity_name }}
  annotations:
    amazon.com/eks-cluster-arn: {{ cluster.arn }}
    amazon.com/iam-role-arn: {{ cluster.roleArn }}
    kubernetes.io/auth-provider: aws
    kubernetes.io/x-k8s-aws-id: {{ clusterName }}
  title: {{ accountId }}:{{ region }}:{{ clusterName }}
  labels:
    some_url: {{ cluster.tags.some_url | replace(":", "-") | replace("/", "-") }}