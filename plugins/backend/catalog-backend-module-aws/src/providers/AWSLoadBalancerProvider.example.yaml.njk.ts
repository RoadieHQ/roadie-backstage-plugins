/*
 * Copyright 2025 Larder Software Limited
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
export default `
kind: Resource
apiVersion: backstage.io/v1beta1
metadata:
  annotations:
    amazonaws.com/load-balancer-arn: {{ data.LoadBalancerArn }}
    amazonaws.com/load-balancer-dns-name: {{ data.DNSName }}
    backstage.io/view-url: https://{{ region }}.console.aws.amazon.com/ec2/home?region={{ region }}#LoadBalancers:loadBalancerId={{ data.LoadBalancerId }};sort=loadBalancerName
    custom/template-marker: custom-value
  title: {{ data.LoadBalancerName }}
  name: {{ data.LoadBalancerName }}
  dnsName: {{ data.DNSName }}
  scheme: {{ data.Scheme }}
  type: {{ data.Type }}
  state: {{ data.State.Code }}
  vpcId: {{ data.VpcId }}
spec:
  type: load-balancer
`;
