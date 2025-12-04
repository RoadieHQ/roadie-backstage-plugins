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
  name: {{ data.TableArn | arn_to_name }}
  annotations:
    amazon.com/dynamo-db-table-arn: {{ data.TableArn }}
  title: {{ data.TableName }}
  labels:
    something: {{ tags['something'] | replace("/", "-") | replace("/", "-") | replace(":", "-") }}
spec:
  type: dynamo-db-table
`;
