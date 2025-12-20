# @skybrush.js

This is a monorepo containing multiple JavaScript libraries that are commonly
used in desktop applications of the Skybrush suite.

Each library has its own licensing terms; most of the libraries are MIT
licensed, but there are a few that are licensed under the GNU General Public
License. Refer to the individual `LICENSE` files within the packages to
understand the licensing of an individual library.

Join our [Discord server](https://skybrush.io/r/discord) for announcements and
community support.

## Running unit tests

We use `jest` for unit tests. `jest` can be executed from the _root_ of the
monorepo to test all projects, or from an individual package to run the
unit test of that package only.

Packages need to be _built_ (with `npm build` on a per-package basis, or
`lerna build` for all packages) before the tests can be run. This is because
the tests run against the transpiled code, not the source code.
