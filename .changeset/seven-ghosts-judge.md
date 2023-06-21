---
'@roadiehq/backstage-plugin-security-insights': patch
---

Remove superfluous `Router` in `EntitySecurityInsightsContent` component. This fixes a bug where the Security Insights tab would not get rendered when a recent version of `react-router` is used.
