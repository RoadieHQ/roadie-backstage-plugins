kind: Resource
apiVersion: backstage.io/v1beta1
metadata:
  name: {{ repository.repositoryName }}
  tagImmutability: {{ repository.imageTagMutability }}
  encryption: {{ repository.encryptionConfiguration.encryptionType }}
  createdAt: {{ repository.createdAt }}
  uri: {{ repository.repositoryUri }}
  annotations:
    amazonaws.com/ecr-repository-arn: {{ repository.repositoryArn }}
  title: {{ repository.repositoryName }}
spec:
  type: ecr-repository