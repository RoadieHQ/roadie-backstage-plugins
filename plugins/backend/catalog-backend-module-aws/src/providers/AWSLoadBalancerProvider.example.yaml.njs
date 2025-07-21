kind: Resource
apiVersion: backstage.io/v1beta1
metadata:
  annotations:
    amazonaws.com/load-balancer-arn: {{ loadBalancer.LoadBalancerArn }}
    amazonaws.com/load-balancer-dns-name: {{ loadBalancer.DNSName }}
    backstage.io/view-url: https://{{ region }}.console.aws.amazon.com/ec2/home?region={{ region }}#LoadBalancers:loadBalancerId={{ loadBalancer.LoadBalancerId }};sort=loadBalancerName
  title: {{ loadBalancer.LoadBalancerName }}
  name: {{ loadBalancer.LoadBalancerName }}
  dnsName: {{ loadBalancer.DNSName }}
  scheme: {{ loadBalancer.Scheme }}
  type: {{ loadBalancer.Type }}
  state: {{ loadBalancer.State.Code }}
  vpcId: {{ loadBalancer.VpcId }}
spec:
  type: load-balancer