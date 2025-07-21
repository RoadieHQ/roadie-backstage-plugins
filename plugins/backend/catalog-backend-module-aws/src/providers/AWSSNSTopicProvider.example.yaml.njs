kind: Resource
apiVersion: backstage.io/v1beta1
metadata:
  name: {{ topic.TopicArn | split(":") | last }}
  annotations:
    backstage.io/view-url: "https://console.aws.amazon.com/sns/v3/home?region={{ region }}#/topic/{{ topic.TopicArn }}"
  title: {{ topic.TopicArn | split(":") | last }}