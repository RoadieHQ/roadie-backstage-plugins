kind: Resource
apiVersion: backstage.io/v1beta1
metadata:
  name: {{ cluster.CacheClusterId }}
  title: {{ cluster.CacheClusterId }}
  engineVersion: {{ cluster.EngineVersion }}
  engine: {{ cluster.Engine }}
  annotations:
    "amazon.com/elasticache-cluster-arn": {{ cluster.ARN }}
spec:
  type: elasticache-cluster