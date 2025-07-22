kind: Resource
apiVersion: backstage.io/v1beta1
metadata:
  name: {{ data.DomainName }}
  annotations:
    amazon.com/open-search-domain-arn: {{ data.ARN }}
  title: {{ data.DomainName }}
  storageType: EBS-{{ data.EBSOptions.VolumeType }}
  endpoint: {{ data.Endpoint }}
  engineVersion: {{ data.EngineVersion }}
spec:
  type: opensearch-domain