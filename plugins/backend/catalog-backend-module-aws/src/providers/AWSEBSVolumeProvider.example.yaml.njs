kind: Resource
apiVersion: backstage.io/v1beta1
metadata:
  name: {{ data.VolumeId | sanitize_name }}
  annotations:
    amazonaws.com/ebs-volume-id: {{ data.VolumeId }}
    backstage.io/view-url: https://eu-west-1.console.aws.amazon.com/ec2/home?region=eu-west-1#VolumeDetails:volumeId={{ data.VolumeId }}
  title: {{ data.VolumeId }}
  labels:
    {% for tag in data.Tags %}
    {{ tag.Key }}: {{ tag.Value | replace(":", "-") | replace("/", "-") }}
    {% endfor %}
spec:
  owner: hardcoded-unknown
  type: ebs-volume
