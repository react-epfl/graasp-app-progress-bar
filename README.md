# Progress Bar Application #

This tool allows students to state their overall progresses across phases in a given inquiry learning activity (between 0 and 100%). The self-assessment indicator can be adjusted at anytime using the cursor. The teacher view shows the self-assessments of all the students in a single view. It is recommended to add this tool at the top level of an Inquiry Learning Space to make it accessible in all phases (through the button toolbar).

## Development ##

To facilitate development, you can use `webpack-dev-server`, which will automatically rebuild the page and serve it to you on a local server.

By default, the server will run on port `8080`, but you can change this.

```
yarn start
```

Visit `localhost:8080`.

## Production Build ##

In order to produce a production build, you need to package the app with webpack.

```
yarn build
```

This will create a `bundle.js` file and an `index.html` file inside the `build` directory. You may ignore the `bundle.js` file, as the `index.html` file is self-contained.



