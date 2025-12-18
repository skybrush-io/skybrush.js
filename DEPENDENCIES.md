# Dependency notes

This document lists the reasons why specific dependencies are pinned down to
exact versions. Make sure to consider these points before updating dependencies
to their latest versions.

## `@apidevtools/json-schema-ref-parser`

Version 9.1.2 is ancient but this is the latest version where all our unit tests
pass. Newer versions start having problems with the `zip:` URL scheme trickery
that we use to resolve JSON files from the `.skyc` ZIP bundle. Also, version 15
switches to ESM, which in turn breaks the Jest test setup that we currently have.
So it is best to stick with version 9.1.2 unless we start having problems.

## `chart.js`

We only use types from Chart.js so there is no urgent need to upgrade this
dependency. On the other hand, we should aim to use the same Chart.js version
as the one we are committed to in projects that use `@skybrush`.

## `meshline`

I am not exactly sure about the reason, but it is curiosly pinned down to
3.1.0 in `cb8116bf`, which was added on Aug 26, 2024. On that date, newer
versions of `meshline` were already available on Github so there is probably a
reason. Proceed with caution if you try to update.

## `react-dom`, `react` and `@types/react`

We are not fully ready for React 19 yet but React 18 is okay.

## `@types/node`

`@types/node` is pinned at 24.8.1 because Electron also ships its own typing
for some of the objects defined in the Node.js typings and the two need to
agree with each other. See:

<https://github.com/electron/electron/issues/49213>

The pin can be removed if the issue above is resolved.
