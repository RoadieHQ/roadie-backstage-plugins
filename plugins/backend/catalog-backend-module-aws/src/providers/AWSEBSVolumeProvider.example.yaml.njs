kind: Resource
apiVersion: backstage.io/v1beta1
metadata:
  name: {{ volume.VolumeId | to_entity_name }}
  annotations:
    amazonaws.com/ebs-volume-id: {{ volume.VolumeId }}
    backstage.io/managed-by-location: aws-ebs-volume-provider-0:arn:aws:iam::123456789012:role/role1
    backstage.io/managed-by-origin-location: aws-ebs-volume-provider-0:arn:aws:iam::123456789012:role/role1
    backstage.io/view-url: https://eu-west-1.console.aws.amazon.com/ec2/home?region=eu-west-1#VolumeDetails:volumeId=undefined
  title: {{ volume.VolumeId }}
  labels:
    {% for tag in volume.Tags %}
    {{ tag.Key }}: {{ tag.Value | replace(":", "-") | replace("/", "-") }}
    {% endfor %}
spec:
  owner: unknown
  type: ebs-volume