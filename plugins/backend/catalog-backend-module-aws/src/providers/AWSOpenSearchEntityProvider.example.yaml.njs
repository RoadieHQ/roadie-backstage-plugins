kind: Resource
apiVersion: backstage.io/v1beta1
metadata:
  name: {{ data.DomainStatus.DomainName }}
  annotations:
    amazon.com/open-search-domain-arn: {{ data.DomainStatus.ARN }}
  title: {{ data.DomainStatus.DomainName }}
  storageType: EBS-{{ data.DomainStatus.EBSOptions.VolumeType }}
  endpoint: {{ data.DomainStatus.Endpoint }}
  engineVersion: {{ data.DomainStatus.EngineVersion }}
spec:
  type: opensearch-domain