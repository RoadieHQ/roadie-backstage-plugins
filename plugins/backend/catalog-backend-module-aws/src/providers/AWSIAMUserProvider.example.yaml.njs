kind: User
apiVersion: backstage.io/v1beta1
metadata:
  name: {{ user.UserId | to_entity_name }}
  annotations:
    amazon.com/eks-cluster-arn: {{ user.Arn }}
    kubernetes.io/auth-provider: aws
    kubernetes.io/x-k8s-aws-id: {{ user.UserName }}
  title: {{ user.UserName }}