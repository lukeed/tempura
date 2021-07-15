# Example: Worker + Bundler(s)

This example demonstrates how to incorporate `tempura` within a Cloudflare Worker. However, this could be _any_ application and/or environemnt so long as a build step is required.

Put differently, this example illustrates how tempura's esbuild and/or Rollup plugins can be used within a project, transforming your `*.hbs` template files into JavaScript functions that your built output can use. This means that **no `tempura` runtime code** appears in your built code – except the `tempura.esc` (189 bytes), but only if you use HTML-escaped sequences.

## Build Commands

***Setup***

```sh
$ npm install
```

All build configurations rely on the same `src/index.js` and `src/todos.hbs` source files.

All builds will send their built output to the `output` directory. You may inspect the files' contents to see _what_ the tempura plugins do to the `todos.hbs` template. If you'd like to deploy to a live Cloudflare Worker, please follow the [Wrangler CLI](https://developers.cloudflare.com/workers/get-started/guide#7-configure-your-project-for-deployment) guide(s).


***Rollup** ([Live Demo](https://cloudflareworkers.com/#b77bd0114ed198f3601bf5650111e9bf:https://tutorial.cloudflareworkers.com))*

The Rollup build is configured through the `rollup.config.js` file & can be run via:

```sh
$ npm run rollup
```

***esbuild** ([Live Demo](https://cloudflareworkers.com/#0910ad305f1fa9082b2ef8f2d7c50809:https://tutorial.cloudflareworkers.com))*

An `esbuild` configuration is available in the `esbuild.js` file. In order to attach esbuild plugins, the programmatic approach must be used. It can be run via:

```sh
$ npm run esbuild
# or
$ node esbuild.js
```
