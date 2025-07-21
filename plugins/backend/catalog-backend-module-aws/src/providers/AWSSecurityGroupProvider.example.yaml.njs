kind: Resource
apiVersion: backstage.io/v1beta1
metadata:
  name: {{ securityGroup.GroupId }}
  title: {{ securityGroup.GroupName }}
  description: {{ securityGroup.Description }}
  vpcId: {{ securityGroup.VpcId }}
  groupName: {{ securityGroup.GroupName }}
  ingressRules: tcp:80 from 0.0.0.0/0; tcp:443 from sg-87654321
  egressRules: All:All to 0.0.0.0/0
  labels:
    Environment: production--staging
  annotations:
    amazonaws.com/security-group-id: {{ securityGroup.GroupId }}
    backstage.io/view-url: https://eu-west-1.console.aws.amazon.com/ec2/v2/home?region=eu-west-1#SecurityGroup:groupId={{ securityGroup.GroupId }}
spec:
  owner: unknown
  type: security-group