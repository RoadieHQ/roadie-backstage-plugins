kind: Resource
apiVersion: backstage.io/v1beta1
metadata:
  name: {{ subnet.SubnetId }}
  annotations:
    amazonaws.com/subnet-id: {{ subnet.SubnetId }}
    backstage.io/view-url: https://{{ region }}.console.aws.amazon.com/vpc/home?region={{ region }}#SubnetDetails:subnetId={{ subnet.SubnetId }}
  vpcId: {{ subnet.VpcId }}
  state: {{ subnet.State }}
  defaultForAz: {{ subnet.DefaultForAz }}
  cidrBlock: {{ subnet.CidrBlock }}
  availableIpAddressCount: {{ subnet.AvailableIpAddressCount }}
  availabilityZone: {{ subnet.AvailabilityZone }}
  mapPublicIpOnLaunch: {{ subnet.MapPublicIpOnLaunch }}
  labels:
    Environment: production--staging