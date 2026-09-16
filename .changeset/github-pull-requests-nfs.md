---
'@roadiehq/backstage-plugin-github-pull-requests': minor
---

Add new frontend system support via a new `/alpha` entry point, keeping the old frontend system exports untouched.

The alpha plugin provides the GitHub Pull Requests client as an `ApiBlueprint` extension, the entity cards as `EntityCardBlueprint` extensions (`entity-card:github-pull-requests/overview`, `entity-card:github-pull-requests/table`, `entity-card:github-pull-requests/group`), and a ready-made `/github-pull-requests` tab as an `EntityContentBlueprint` extension (`entity-content:github-pull-requests`). Cards carry the annotation filters that previously had to be wired up in the app with `EntitySwitch`.

`PullRequestsPage`, `HomePageRequestedReviewsCard`, and `HomePageYourOpenPullRequestsCard` are not part of the alpha entry point yet: the standalone page needs `PageBlueprint` which is not yet available in Backstage 1.44.2, and the home page cards need `HomePageWidgetBlueprint` which requires Backstage 1.48 or above.

Includes comprehensive test coverage using modern `@backstage/frontend-test-utils` testing APIs with proper MSW v2 setup and authentication mocking.
