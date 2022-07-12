# Welcome to SWR Vue docs contributing guide

Thank you for investing time in contributing to this project!

In this guide you will get an overview of the contribution workflow from opening an issue, creating a PR, reviewing, and merging the PR.

## New contributor guide

To get an overview of the project, read the [README](./README.md). Here are some resources to help you get started with open source contributions:

- [Finding ways to contribute to open source on GitHub](https://docs.github.com/en/get-started/exploring-projects-on-github/finding-ways-to-contribute-to-open-source-on-github)
- [Set up Git](https://docs.github.com/en/get-started/quickstart/set-up-git)
- [GitHub flow](https://docs.github.com/en/get-started/quickstart/github-flow)
- [Collaborating with pull requests](https://docs.github.com/en/github/collaborating-with-pull-requests)

## Getting started

### Issues

#### Create a new issue

If you spot a problem with the docs, a bug in the package search if an issue already exists. If a related issue doesn't exist, you can open a new issue.

#### Solve an issue

Scan through our existing issues to find one that interests you. You can narrow down the search using labels as filters. As a general rule, we don’t assign issues. If you find an issue to work on, you are welcome to open a PR with a fix. But please reference the issue in the PR description with `closes #<issue number>` to link the PR to the issue and automatically resolves the issue when the PR were merged

### Make Changes

#### Make changes in the docs

In the end of all docs page, has a button with the text `Edit this page on GitHub`, you can click on this button to go directlty to the respective .md file and open a PR to fix or improve the page

#### Make changes locally

1. Fork the repository
2. Clone your fork in your workspace
3. Install or update to Node v16.
4. Install pnpm or use [nodejs corepack](https://nodejs.org/docs/latest-v16.x/api/corepack.html)
5. Install the dependencies with `pnpm i`

### Commit your update
Commit the changes once you are happy with them, and push them to your forked repository

Once your changes are ready, don't forget to self-review to speed up the review process.

### Pull Request
When you're finished with the changes, create a pull request from your forked repository to this repository's main branch.

- Describe the changes that you made in the PR description, this way the reviewr can understand better the PR.
- Don't forget to link PR to issue if you are solving one.
- Enable the checkbox to allow maintainer edits so the branch can be updated for a merge. We may ask questions or request for additional information.
- We may ask for changes to be made before a PR can be merged, either using suggested changes or pull request comments. You can make any other changes in your fork, then commit them to your branch.
- As you update your PR and apply changes, mark each conversation as resolved.

### Your PR is merged!

Congratulations 🎉🎉 The GitHub team thanks you ✨.

Once your PR is merged, your contributions will be published in the next version of the package.
