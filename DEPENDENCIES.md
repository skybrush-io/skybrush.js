# Dependency notes

This document lists the reasons why specific dependencies are pinned down to
exact versions. Make sure to consider these points before updating dependencies
to their latest versions.

## `@types/node`

`@types/node` is pinned at 24.8.1 because Electron also ships its own typing
for some of the objects defined in the Node.js typings and the two need to
agree with each other. See:

<https://github.com/electron/electron/issues/49213>

The pin can be removed if the issue above is resolved.
