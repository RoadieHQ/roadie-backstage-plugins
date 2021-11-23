# Contributing to the Roadie plugins for Backstage

We want to create strong community of contributors -- all working together to create the kind of delightful experience that Backstage deserves.

Contributions are welcome, and they are greatly appreciated! Every little bit helps, and credit will always be given. ❤️

In general, we aim to stick as closely as possible to the [contribution guidelines which apply to the Backstage project](https://github.com/backstage/backstage/blob/master/CONTRIBUTING.md). If something is not covered in this document, please assume that the appropriate Backstage guideline will apply. 

## Types of Contributions

This repository will gather the plugins we have worked on, so contribution is more than welcome both in this repository in general, and in a scope of a particular plugin.

### Report bugs

No one likes bugs. Report bugs as an issue [here](https://github.com/RoadieHQ/roadie-backstage-plugins/issues/new?assignees=&labels=bug&template=bug_template.md).

### Fix bugs or build new features

Look through the GitHub issues for bugs or problems that other users are having. If you're having a problem yourself, feel free to contribute a fix for us to review.

### Submit feedback

The best way to send feedback is to file [an issue](https://github.com/RoadieHQ/roadie-backstage-plugins/issues/new).

If you are proposing a feature:

- Explain in detail how it would work.
- Explain the wider context about what you are trying to achieve.
- Keep the scope as narrow as possible, to make it easier to implement.
- Remember that this is a volunteer-driven project, and that contributions are welcome :)

### Write E2E tests

As the number of plugins included in this repository increases, so does importance of good E2E tests which will make sure everything runs as it is expected. In order to contribute to this, very important aspect, of this repository, we urge you to follow guidelines below: 

E2E tests are integrated under `/packages/app/cypress` folder where you will find specific E2E test for every plugin under `/packages/app/cypress/integrations`. This means you should follow that pattern and add tests in appropriate plugin test files. We would also encourage you to add more fixtures under  `/packages/app/cypress/fixtures`. For testing purposes you can use `test-entity.yaml` file which can be found under `/packages/entities`, which we have created especially for this purpose.

### Add your company to ADOPTERS

Have you started using any/some/all of our plugins? Adding your company to [ADOPTERS](https://github.com/RoadieHQ/roadie-backstage-plugins/blob/main/ADOPTERS.md) really helps the project.

## Get Started!

So...feel ready to jump in? Let's do this. 💯 👏

Start by reading repository README to get set up for local development. If you need help, just jump into [our Discord chatroom](https://discord.gg/3S4xrW7B).

## Coding Guidelines

We use the backstage-cli to build, serve, lint, test and package all the plugins.

As such, the [same coding guidelines as in Backstage repository mostly apply](https://github.com/backstage/backstage/blob/master/CONTRIBUTING.md#coding-guidelines).

## Creating Changesets

We use [changesets](https://github.com/atlassian/changesets) in order to prepare releases. To make the process of generating releases easy, please include changesets with your pull request. This will result in a every package affected by a change getting a proper version number and an entry in its `CHANGELOG.md.
### When to use a changeset?
Any time a patch, minor, or major change aligning to [Semantic Versioning](https://semver.org) is made to any published package in `plugins/`, a changeset should be used. 
In general, changesets are not needed for the documentation, build utilities or similar.
### How to create a changeset
1. Run `yarn changeset`
2. Select which packages you want to include a changeset for
3. Select impact of change that you're introducing, using `minor` for breaking changes and `patch` otherwise. 
4. Explain your changes in the generated changeset. See [examples of well written changesets](https://backstage.io/docs/getting-started/contributors#writing-changesets).
5. Add generated changeset to Git
6. Push the commit with your changeset to the branch associated with your PR

For more information, checkout [adding a changeset](https://github.com/atlassian/changesets/blob/master/docs/adding-a-changeset.md) documentation in the changesets repository.


## Merging to main

Plugins are automatically published when a version bump is merged to the `main` branch. Please include version bumps with your pull requests if you would like them to be released.

## Code of Conduct

We subscribe to the [Spotify FOSS code of conduct](https://github.com/backstage/backstage/blob/master/CODE_OF_CONDUCT.md) which is used by the Backstage project.

If you experience or witness unacceptable behavior—or have any other concerns—please report it by contacting us via [foss@roadie.io](mailto:foss@roadie.io).

## Security Issues?

See [SECURITY.md](https://github.com/RoadieHQ/roadie-backstage-plugins/blob/main/SECURITY.md)
