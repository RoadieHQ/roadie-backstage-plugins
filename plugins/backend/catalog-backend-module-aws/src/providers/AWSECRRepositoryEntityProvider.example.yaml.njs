kind: Resource
apiVersion: backstage.io/v1beta1
metadata:
  name: {{ data.repositoryName }}
  tagImmutability: {{ data.imageTagMutability }}
  encryption: {{ data.encryptionConfiguration.encryptionType }}
  createdAt: {{ data.createdAt }}
  uri: {{ data.repositoryUri }}
  annotations:
    amazonaws.com/ecr-repository-arn: {{ data.repositoryArn }}
  title: {{ data.repositoryName }}
spec:
  type: ecr-repository