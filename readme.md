# useEnvironment

A React Hook to load runtime environment variables from a JSON link.

# Why?

See [issue #578](https://github.com/facebook/create-react-app/issues/578) for some background.

# Usage

Install

```sh
npm install @gency/react-use-environment
# or
npm install htttps://try.gency.com.au/npm/gency-react-use-environment-latest.tgz
```

Create an `environment.json` file in the public/ folder

```json
# public/environment.json
{
  "EXAMPLE_VAR": "Test value",
  "ANOTHER": "Another value"
}
```

Add a `<link>` tag to `public/index.html`

```html
# public/index.html
<html>
  <head>
    ...
    <!--
      environment.json provides runtime environment variables.
    -->
    <link
      id="environment"
      rel="preload"
      as="script"
      href="%PUBLIC_URL%/environment.json"
    />
    ...
  </head>
  <body>
    ...
  </body>
</html>
```

The environment can be loaded in any React component. For example, in
`src/index.js` load an API_URL to pass to an ApolloClient instance.

```js
// src/index.js
import React, { Suspense } from "react";
import ApolloClient from "apollo-boost";
import { ApolloProvider } from "react-apollo-hooks";
import useEnvironment from "@gency/react-use-environment";

import App from "./App";
import Loading from "./Loading";

const Root = () => {
  const { API_URL } = useEnvironment();
  const client = new ApolloClient({ uri: API_URL });
  return (
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>
  );
};
ReactDOM.render(
  <React.Suspense fallback={<Loading />}>
    <Root />
  </React.Suspense>,
  document.getElementById("root")
);
```

A React Suspense component must be used as `useEnvironment` will
throw a promise while loading the JSON file.

# API

The `useEnvironment` function accepts an `options` argument containing the
following entries:

- `linkId` -- (default: "environment"). Use this to identify the id of the <link> tag
- suspense -- (default: true). Whether to use React Suspense for a fallback.

If `suspense: false` is used the return value contains three elements: [env, loading, error]

```js
const [env, loading, error] = useEnvironment({ suspense: false });
if (loading) return "Loading...";
if (error) return "Error";
const { API_URL } = env;
// ... etc
```

# Creating environment.json

## Development

If possible, structure development environments so that each developer can use
the same configuration. This way the environment.json file can simply be committed
to the Git repository.

If that's not possible, creating a public/environment.json file from the "start"
script would normally be sufficient.

## Staging and Production

As part of the build step have the public/environment.json file replaced with
a template file. This can be done in the `build` script in package.json

```json
# src/environment.json
{
  "API_URL": "$API_URL"
}
```

```json
# package.json
{
  "scripts": {
    "build": "react-scripts build && cp src/environment.json build/environment.json",
  }
}
```

When deploying the app replace the template file with one with the environment
variables replaced.

For example, if creating a Docker image, something like the following can be
used to do the environment variables substitution when the container starts.

```sh
# Dockerfile
FROM nginx:alpine
COPY build /usr/share/nginx/html
COPY build/environment.json /environment.json
RUN chown -R nginx:nginx /usr/share/nginx/html
CMD ["/bin/sh", "-c", "envsubst </environment.json >/usr/share/nginx/html/environment.json && nginx -g 'daemon off;'"]
```
