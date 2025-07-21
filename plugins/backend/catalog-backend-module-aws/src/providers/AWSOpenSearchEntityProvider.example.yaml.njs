kind: Resource
apiVersion: backstage.io/v1beta1
metadata:
  name: {{ domain.DomainStatus.DomainName }}
  annotations:
    amazon.com/open-search-domain-arn: {{ domain.DomainStatus.ARN }}
  title: {{ domain.DomainStatus.DomainName }}
  storageType: EBS-{{ domain.DomainStatus.EBSOptions.VolumeType }}
  endpoint: {{ domain.DomainStatus.Endpoint }}
  engineVersion: {{ domain.DomainStatus.EngineVersion }}
spec:
  type: opensearch-domain