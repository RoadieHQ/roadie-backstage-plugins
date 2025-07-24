apiVersion: backstage.io/v1beta1
kind: Resource
metadata:
  namespace: default
  annotations:
    amazon.com/account-id: {{ accountId }}
    amazon.com/eks-cluster-version: {{ data.version }}
    amazon.com/eks-cluster-arn: {{ data.arn }}
    amazon.com/iam-role-arn: {{ data.roleArn }}
    kubernetes.io/api-server: {{ data.endpoint }}
    kubernetes.io/x-k8s-aws-id: {{ data.name }}
    kubernetes.io/auth-provider: aws
  name: {{ data.name | to_entity_name }}
  title: {{ accountId }}:{{ region }}:{{ data.name }}
  labels:
    multi_tenant_eks_cluster_name: {{ data.name }}
    Name: {{ data.name }}
    some_url: {{ data.tags.some_url | replace(":", "-") | replace("/", "-") }}
spec:
  owner: unknown
  type: kube-c