kind: Resource
apiVersion: backstage.io/v1beta1
metadata:
  name: {{ data.CacheClusterId }}
  title: {{ data.CacheClusterId }}
  engineVersion: {{ data.EngineVersion }}
  engine: {{ data.Engine }}
  annotations:
    "amazon.com/elasticache-cluster-arn": {{ data.ARN }}
spec:
  type: elasticache-cluster