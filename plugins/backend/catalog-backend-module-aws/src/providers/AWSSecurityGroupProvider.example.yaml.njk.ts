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
  name: {{ data.GroupId }}
  title: {{ data.GroupName }}
  description: {{ data.Description }}
  vpcId: {{ data.VpcId }}
  groupName: {{ data.GroupName }}
  ingressRules: tcp:80 from 0.0.0.0/0; tcp:443 from sg-87654321
  egressRules: All:All to 0.0.0.0/0
  labels:
    Environment: production--staging
  annotations:
    amazonaws.com/security-group-id: {{ data.GroupId }}
    backstage.io/view-url: https://eu-west-1.console.aws.amazon.com/ec2/v2/home?region=eu-west-1#SecurityGroup:groupId={{ data.GroupId }}
spec:
  owner: hardcoded-unknown
  type: security-group
`;
