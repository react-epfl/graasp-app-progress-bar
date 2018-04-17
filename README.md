# Graasp App: Progress Bar #

---

[![Codeship Status for react-epfl/progress-bar](https://app.codeship.com/projects/3334dc50-1a50-0136-2bf1-661b27e1a613/status?branch=master)](https://app.codeship.com/projects/284263)
[![Coverage Status](https://coveralls.io/repos/github/react-epfl/graasp-app-progress-bar/badge.svg?branch=master)](https://coveralls.io/github/react-epfl/graasp-app-progress-bar?branch=master)

This tool allows students to state their overall progresses across phases in a given inquiry learning activity (between 0 and 100%). The self-assessment indicator can be adjusted at anytime using the cursor. The teacher view shows the self-assessments of all the students in a single view. It is recommended to add this tool at the top level of an Inquiry Learning Space to make it accessible in all phases (through the button toolbar).

## Development ##

To facilitate development, you can use `webpack-dev-server`, which will automatically rebuild the page and serve it to you on a local server.

By default, the server will run on port `8080`, but you can change this.

```
yarn start
```

Visit `localhost:8080`.

## Integration ##

We use git hooks to ensure code quality. Before each commit, `husky` will lint the code and the commit message.

Before a push, `husky` will run the tests. Tests are run using `cypress` within Codeship's Jet CLI. Make sure you have `jet` installed before contributing.

On macOS using Homebrew run the following command.

```
brew cask install codeship/taps/jet
```    

For help installing Jet, visit [this page](https://documentation.codeship.com/pro/jet-cli/installation/).

## Production ##

In order to produce a production build, you need to package the app with webpack.

```
yarn build
```

This will create a `bundle.js` file and an `index.html` file inside the `build` directory. You may ignore the `bundle.js` file, as the `index.html` file is self-contained.

## Deployment ##

The progress bar is a self-contained web page. Opening `index.html` with a browser should be enough to test the app on its own.

In order to deploy this application for use with a learning platform such as Graasp, you can use services such as Amazon S3.

Please note that you will need the following appropriate keys:

```
GRAASP_DEVELOPER_ID
GRAASP_APP_ID
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
AWS_REGION
```
