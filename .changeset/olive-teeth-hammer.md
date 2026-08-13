---
'@roadiehq/backstage-plugin-argo-cd-node': minor
---

New feature: Added warning logs when the Argo Session API returns an unexpected HTML response.

Reasoning: Depending on the deployment environment, traffic to the Argo API may pass through edge security, web application firewall (WAF), or content delivery network (CDN) services such as Akamai, F5, or Cloudflare. When routing failures occur, these services may return an HTML response instead of the expected API response.

Previously, these responses were truncated in logs, making it difficult to access diagnostic information — such as reference IDs — that can help identify the source of the failure. This change improves observability by logging unexpected HTML responses, providing additional context for troubleshooting and root-cause analysis.

Behavior: No functional behavior has changed. This change only adds additional warning-level logging for unexpected HTML responses to the session endpoint. Does not log when content type includes application/json
