kind: Resource
apiVersion: backstage.io/v1beta1
metadata:
  name: {{ data.DBInstanceIdentifier }}
  annotations:
    amazon.com/rds-instance-arn: {{ data.DBInstanceArn }}
    backstage.io/view-url: https://console.aws.amazon.com/rds/home?region={{ region }}#database:id={{ data.DBInstanceIdentifier }}
  title: {{ data.DBInstanceIdentifier }}
  dbInstanceClass: {{ data.DBInstanceClass }}
spec:
  type: rds-instance
