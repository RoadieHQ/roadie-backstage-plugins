apiVersion: backstage.io/v1beta1
kind: Resource
metadata:
  namespace: custom-namespace
  annotations:
    amazon.com/account-id: "{{ accountId }}"
    amazon.com/eks-cluster-version: "{{ data.version }}"
    amazon.com/eks-cluster-arn: "{{ data.arn }}"
    amazon.com/iam-role-arn: "{{ data.roleArn }}"
    kubernetes.io/api-server: "{{ data.endpoint }}"
    kubernetes.io/x-k8s-aws-id: "{{ data.name }}"
    kubernetes.io/auth-provider: "aws"
    custom-annotation: "custom-value"
  name: custom-{{ data.name | sanitize_name }}
  title: CUSTOM-{{ accountId }}:{{ region }}:{{ data.name }}
  labels:
    custom-label: custom-label-value
    eks-cluster: {{ data.name }}
    some_url: {{ data.tags.some_url | replace(":", "-") | replace("/", "-") }}
spec:
  owner: custom-team
  type: custom-eks-cluster
