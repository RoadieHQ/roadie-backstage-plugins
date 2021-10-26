# How to release

This plugin uses the [npm-publish-action](https://github.com/marketplace/actions/publish-to-npm) GutHub Action to automate releases. It expects commits to be titled in a very specific way.

To publish a new version, 

 1. Manually bump the version in the `package.json` file.
 2. Commit the version bump the exact title: "Release 1.2.3".

Do **not** use `yarn version --new-version [version]`. Doing so will automatically add a commit
and tag which will then clash with the commit and tag that the automation creates.
