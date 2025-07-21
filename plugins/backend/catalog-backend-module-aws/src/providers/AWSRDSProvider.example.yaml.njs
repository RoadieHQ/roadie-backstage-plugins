kind: Resource
apiVersion: backstage.io/v1beta1
metadata:
  name: {{ dbInstance.DBInstanceIdentifier }}
  annotations:
    amazon.com/rds-instance-arn: {{ dbInstance.DBInstanceArn }}
    backstage.io/view-url: https://console.aws.amazon.com/rds/home?region={{ region }}#database:id={{ dbInstance.DBInstanceIdentifier }}
  title: {{ dbInstance.DBInstanceIdentifier }}
  dbInstanceClass: {{ dbInstance.DBInstanceClass }}
spec:
  type: rds-instance