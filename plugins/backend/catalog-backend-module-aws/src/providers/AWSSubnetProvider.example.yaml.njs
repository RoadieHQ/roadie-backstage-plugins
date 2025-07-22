kind: Resource
apiVersion: backstage.io/v1beta1
metadata:
  name: {{ data.SubnetId }}
  annotations:
    amazonaws.com/subnet-id: {{ data.SubnetId }}
    backstage.io/view-url: https://{{ region }}.console.aws.amazon.com/vpc/home?region={{ region }}#SubnetDetails:subnetId={{ data.SubnetId }}
  vpcId: {{ data.VpcId }}
  state: {{ data.State }}
  defaultForAz: {{ data.DefaultForAz }}
  cidrBlock: {{ data.CidrBlock }}
  availableIpAddressCount: {{ data.AvailableIpAddressCount }}
  availabilityZone: {{ data.AvailabilityZone }}
  mapPublicIpOnLaunch: {{ data.MapPublicIpOnLaunch }}
  labels:
    Environment: production--staging