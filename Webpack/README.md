# Webpack

- Based off Colt Steele's tutorial series: https://www.youtube.com/watch?v=3On5Z0gjf4U&list=PLblA84xge2_zwxh3XJqy6UVxS60YdusY8

![webpack](images/webpack.png)
- Webpack takes files of different types (scripts, images, styles) and bundles them into just a few files 
- Also manages dependencies 
  - without webpack, you have to ensure files and dependencies are loaded in the correct order yourself (i.e. `script` tags are called in the right sequence)
- Webpack is responsible for bundling React apps into just a few build files (`npm run build`)
  - minifies CSS and JS files in production
  - it also does this in the development mode (`npm start`); bundles css into the JS files
- Reference this [repo](https://github.com/Colt/webpack-demo-app)
  
- [Webpack](#webpack)
  - [Installing/running webpack](#installingrunning-webpack)
  - [Imports, Exports & Webpack Modules](#imports-exports--webpack-modules)
  - [Configuring webpack](#configuring-webpack)
  - [Loaders, CSS & Sass](#loaders-css--sass)
  - [Cache busting and Plugins](#cache-busting-and-plugins)
  - [Splitting Dev and Production](#splitting-dev-and-production)
  - [HTML-Loader, File-Loader and Clean-webpack](#html-loader-file-loader-and-clean-webpack)
  - [Multiple entrypoint and Vendor.js](#multiple-entrypoint-and-vendorjs)
  - [Extract CSS and Minify HTML/CSS/JS](#extract-css-and-minify-htmlcssjs)

## Installing/running webpack

- `npm init -y`
- Add to `.gitignore` if you don't want to commit all the modules:
  - `npm install` will get all the node modules from the `package.json` file
  - `npm start` will build the `dist/` directory for you
```bash
node_modules
dist
```
- `npm install --save-dev webpack webpack-cli`
  - these dependencies should be seen in `package.json`
- Add script to start webpack:
```json
//package.json
...
"scripts": {
  "start": "webpack --config webpack.config.js" //only add the --config option if you have a webpack.config.js file (aren't using the webpack defaults)
}
```
- run `npm start` to run webpack
  - NOTE: webpack by default looks for a `index.js` file in the `/src/` folder as the entry point for your app
  - webpack will build everything it sees from that file onwards (i.e. all dependencies from `index.js` onwards) into a `dist/main.js` file => have to add this as a `script` import in your `index.html`

## Imports, Exports & Webpack Modules

- Use ES6 imports and exports to declare JS file dependencies 
- Each file should specify: 1) what code should be exported and 2) what dependencies need to be imported
```js
// inputs-are-valid.js
export const inputsAreValid = (...input) => {
  return input.every(num => typeof num === "number" && !isNaN(num));
};
```
```js
// alert.service.js 
import { inputsAreValid } from "./utils/inputs-are-valid";
...
```
- Need to have the `index.js` be the entry point of the app => has information about all the dependencies the app needs
  - `npm start` will sniff out the dependency tree from this file and build it all into a minified `dist/main.js`
```js
// index.js
import { run } from "./app/app";
import { AlertService } from "./app/alert.service";
import { ComponentService } from "./app/component.service";
const alertService = new AlertService();
const componentService = new ComponentService();
run(alertService, componentService); // this function needs all the other dependencies
```
- This is the end of the 4th commit in [repo](webpack-demo-app/)

## Configuring webpack

- Webpack default looks for entry point in `src/index.js`
  - It's also default puts build file in `dist/main.js`
- You can actually change this and a lot more in a `/webpack.config.js` file in your project root 
```js
const path = require("path"); 
module.exports = {
  mode: "development",
  //devtool: "none", 
  entry: "./src/index.js",
  output: {
    filename: "main.js",
    path: path.resolve(__dirname, "dist") 
  }
};
```
- Here we explicitly set entrypoint to `./src/index.js`
  - explicitly put output build file into `./dist/main.js`
  - `__dirname` = full path to current directory (which is the project root)
- Webpack defaults to `production` mode => minifies all the code
  - here we explicitly set it to `development` mode => no longer minifies the code!
  - `devtool: "none"` will get rid of the `eval` statements allowing you to see your exact code in the build file
- You can see webpack `export`ing and `require`ing dependencies in the build file `main.js`

## Loaders, CSS & Sass

- Webpack can bundle all kinds of files (CSS, Sass, images, etc.)
- Loaders = different packages we can install that specify how to package up files of a certain type
  - e.g. there's a `css-loader`, `json-loader`, etc.
- **Bundling CSS**
  - need `style-loader` and `css-loader`
    - `css-loader` turns imported CSS files into JS
    - `style-loader` then injects that JS-CSS into the DOM (via a `style` tag)
  - `npm install --save-dev style-loader css-loader`
  - In `webpack.config.js`:
```js
...
module.exports = {
  ...
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"] //order matters: css-loader => style-loader (this is listed in reverse order!)
      }
    ]
  }
};
```
  - where we use RegEx to select all files of type `.css` for bundling using `style-loader` and `css-loader`
  - To let Webpack know to bundle a CSS file, we have to `import "./main.css";` the file somewhere in one of our dependencies accessible from the entrypoint 
  - this is end of commit 6
- **Bundling Sass**
  - Uses `sass-loader` and `node-sass`
    - `npm install --save-dev sass-loader node-sass`
  - Update `webpack.config.js`:
```js
...
module.exports = {
  ...
  module: {
    rules: [
      {
        test: /\.scss$/,
        use: [
          "style-loader", //3. Inject styles into DOM
          "css-loader", //2. Turns css into commonjs
          "sass-loader" //1. Turns sass into css
        ]
      }
    ]
  }
};
```
  - Make your Sass file (here we just modify some Bootstrap defaults ):
    - `npm install --save-dev bootstrap` for this part in the tutorial repo
```css
/*main.scss*/
$primary: teal;
$danger: purple;
@import "~bootstrap/scss/bootstrap";
```
  - Make sure to include the Sass file somewhere in your files: `import "./main.scss";`
- Everything gets bundled into `main.js` for now!
  - Sass --> CSS --> JS --> injected into DOM via `style` tag
  
## Cache busting and Plugins

- Cache busting = prevent browser from caching certain assets (e.g. our CSS bundle)
- Caching
  - browser will remember filenames (e.g. for JS, HTML or CSS files) and retrieve versions it has cached under the same name 
  - can add a hash of your file content to the name => if the content stays the same, the browser can just use the cached version; but if any code changed the browser will load the whole new file (**cache busting**)
  - To do this, in `webpack.config.js`:
```js
...
module.exports = {
  ...
  output: {
    filename: "main.[contentHash].js",
    path: path.resolve(__dirname, "dist")
  },
  ..
};
```
- **Plugins** allow us to customize webpack build process in variety of ways
  - now we need webpack to automatically build our `index.html` and include the right `main.[contentHash].js` in a `script` tag
    - we'll use the `HtmlWebpackPlugin` for this
  - We'll use another plugin to clean our `dist/` folder (remove old/outdated build files with a different hash value)
- `HtmlWebpackPlugin` (see [docs](https://webpack.js.org/plugins/html-webpack-plugin/))
  - Update `webpack.config.js`:
```js
var HtmlWebpackPlugin = require("html-webpack-plugin");
...
module.exports = {
  ...
  plugins: [
    new HtmlWebpackPlugin({
      template: "./src/template.html"
    })
  ],
  ...
};
```
  - You don't have to pass in a template. If you don't, the default behavior will create a `index.html` file which includes a `main.[contentHash].js` file, both in the `dist/` folder
    - However the HTML will have no content!
  - => pass in template to tell plugin what content to load into the HTML
  - end of commit 8 

## Splitting Dev and Production

- Will have 3 separate config files
  - 1) `webpack.common.js`: shared stuff between dev and production 
  - 2) `webpack.dev.js`: one for dev
  - 3) `webpack.prod.js`: another for production
- Development (`npm start`)
  - will have a live "hot" development server (will automatically rebuild every time a change is detected)
  - `npm install --save-dev webpack-dev-server` for hot updates
    - NOTE: webpack-dev-server does not actually create a `dist/` folder. It does everything in memory!
  - Update the `package.json` file with `webpack-dev-server` and `--open` (see `start` script below)
- Production (`npm run build`)
  - will minify JS and export CSS into a different file
- Modify `package.json` script to start dev and production pipelines:
```js
...
  "scripts": {
    "start": "webpack-dev-server  --config webpack.dev.js --open",
    "build": "webpack --config webpack.prod.js"
  },
...
```
- Use webpack-merge package to merge webpack config files (`npm install--save-dev webpack-merge`):
```js
//webpack.common.js
const path = require("path");
var HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  entry: "./src/index.js",
  plugins: [
    new HtmlWebpackPlugin({
      template: "./src/template.html"
    })
  ],
  module: {
    rules: [
      {
        test: /\.scss$/,
        use: [
          "style-loader", //3. Inject styles into DOM
          "css-loader", //2. Turns css into commonjs
          "sass-loader" //1. Turns sass into css
        ]
      }
    ]
  }
};
```
```js
//webpack.dev.js
const path = require("path");
const common = require("./webpack.common");
const merge = require("webpack-merge");

module.exports = merge(common, {
  mode: "development",
  output: {
    filename: "main.js",
    path: path.resolve(__dirname, "dist")
  }
});
```
```js
//webpack.prod.js
const path = require("path");
const common = require("./webpack.common");
const merge = require("webpack-merge");

module.exports = merge(common, {
  mode: "production",
  output: {
    filename: "main.[contentHash].js",
    path: path.resolve(__dirname, "dist")
  }
});
```

## HTML-Loader, File-Loader and Clean-webpack

- We want all our source files (CSS, JS, images) to be in our `src/` folder
  - but we need some way to have the HTML produced in the `dist/` folder to be able to reference images using dynamically generated links
  - hence we need to use some loaders (`html-loader` and `file-loader`)
    - `npm install --save-dev html-loader`
    - `npm install --save-dev file-loader`
  - `html-loader` will require the source `require('./image.png)` (in JS) for every `img` tag in the HTML
  - File loader will actually load the image files
  - Update `webpack.common.js`:
```js
module.exports = {
  ...
  module: {
    rules: [
      ...
      {
        test: /\.html$/,
        use: ["html-loader"]
      },
      {
        test: /\.(svg|png|jpg|gif)$/,
        use: {
          loader: "file-loader",
          options: {
            name: "[name].[hash].[ext]", //move this file into the dist/ folder with this name structure
            outputPath: "imgs" //move under this directory (dist/imgs/)
          }
        }
      },
    ]
  }
};
```
- Clean-webpack plugin
  - `npm install --save-dev clean-webpack-plugin`
  - will delete the dist folder every time and rebuild a new version
  - only need to use this in production (`webpack.prod.js`) since `webpack-dev-server` doesn't use the `dist/` folder but does everything in memory
  - Update `webpack.prod.js`:
```js
const { CleanWebpackPlugin } = require("clean-webpack-plugin");

module.exports = merge(common, {
  mode: "production",
  output: {
    filename: "main.[contentHash].js",
    path: path.resolve(__dirname, "dist")
  },
  plugins: [new CleanWebpackPlugin()]
});
``` 
  - Every time you run `npm run build` the `dist/` folder will be recreated

## Multiple entrypoint and Vendor.js

- You can configure webpack to spit out multiple bundles (i.e. separate bundle for CSS files)
  - e.g. can separate out app code (specific app code) from vendor code (e.g. jQuery or Bootstrap code)
- To do this, we need webpack to run it's magic on multiple entry points
  - Setup new entry point (e.g. `src/vendor.js`)
```js
import "bootstrap";
```
  - Update `webpack.common.js` with new list of entry points:
```js
...
module.exports = {
  entry: {
    main: "./src/index.js",
    vendor: "./src/vendor.js"
  },
  ...
};
```
  - Also update configuration files for prod and dev to output the right filenames since now we have multiple bundles:
```js
//webpack.dev.js
...
module.exports = merge(common, {
  mode: "development",
  output: {
    filename: "[name].bundle.js", //<-----
    path: path.resolve(__dirname, "dist")
  }
});
```
```js
//webpack.prod.js
...
module.exports = merge(common, {
  mode: "production",
  output: {
    filename: "[name].[contentHash].bundle.js", //<-----
    path: path.resolve(__dirname, "dist")
  },
  plugins: [new CleanWebpackPlugin()]
});
```
  - now webpack will build 2 files `main.bundle.js` and `vendor.bundle.js` (or with hashes for production)
- Advantage of this is that the `vendor.[contentHash].js` file will probably change very rarely => browser can just cache those big files for your website 

## Extract CSS and Minify HTML/CSS/JS

- Extract CSS into it's own file(s) instead of bundling it with our JS
  - it's nice to have a separate CSS file => don't have to wait for JS to inject the styles
    - there will be a flash of un-styled content at beginning otherwise
  - this is a better user experience, but it takes more time to generate separate CSS files => *only need to this in production*
  - we'll use `mini-css-extract-plugin` to do this (`npm install --save-dev mini-css-extract-plugin`)
  - Update `webpack.prod.js`:
```js
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = merge(common, {
  mode: "production",
  ...
  plugins: [
    new MiniCssExtractPlugin({ filename: "[name].[contentHash].css" }), //extract CSS
    new CleanWebpackPlugin()
  ],
  module: {
    rules: [
      {
        test: /\.scss$/,
        use: [
          MiniCssExtractPlugin.loader, //3. Extract css into files
          "css-loader", //2. Turns css into commonjs
          "sass-loader" //1. Turns sass into css
        ]
      }
    ]
  }
});
```
  - Update `webpack.common.js` and `webpack.dev.js` so that common no longer packages CSS in JS (doesn't do `css-loader` and `sass-loader`) and dev does:
```js
//webpack.dev.js
module.exports = merge(common, {
  mode: "development",
  output: {
    filename: "[name].bundle.js",
    path: path.resolve(__dirname, "dist")
  },
  ...
  module: {
    rules: [
      {
        test: /\.scss$/,
        use: [
          "style-loader", //3. Inject styles into DOM
          "css-loader", //2. Turns css into commonjs
          "sass-loader" //1. Turns sass into css
        ]
      }
    ]
  }
});
```
- To minify the CSS, we use `optimize-css-assets-webpack-plugin`
  - `npm install --save-dev optimize-css-assets-webpack-plugin`
  - only minimize CSS in production (takes time and hard to debug in dev)
  - overriding the `optimization` setting in the webpack config will no longer minify the JS (even for `production` mode) => have to manually add JS minification back in with `terser-plugin` (don't have to install this)
- Can also minify the HTML with `HtmlWebpackPlugin`!
- Update `webpack.prod.js`:
```js
const OptimizeCssAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
var HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = merge(common, {
  mode: "production",
  output: {
    filename: "[name].[contentHash].bundle.js",
    path: path.resolve(__dirname, "dist")
  },
  optimization: {
    minimizer: [
      new OptimizeCssAssetsPlugin(), //minify CSS
      new TerserPlugin(), //reminify JS!
      new HtmlWebpackPlugin({ 
        template: "./src/template.html",
        minify: { //minify HTML
          removeAttributeQuotes: true,
          collapseWhitespace: true,
          removeComments: true
        }
      })
    ]
  },
  ...
});
```
- Don't minify for dev!
