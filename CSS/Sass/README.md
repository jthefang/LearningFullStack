- Based off this video: (https://www.youtube.com/watch?v=BDOzg4lXcSg)
- CSS with superpowers

# Compiling Sass
- Browser can't read Sass => has to be compiled into plain CSS
- **Node.js** can run a compiler that watches Sass files for changes => automatically compiles them in CSS for us
- **Gulp** can do the same thing
- **Live Sass Compiler** in VSCode also does the same thing
    - use this with **Live Server** to have all your files update in browser
    - VSCode settings > Live Sass Compiler > Add this setting to the save location to put compiled CSS into a `dist/` folder
```json
"liveSassCompile.settings.formats": [
    {
        "format": "expanded",
        "extensionName": ".css",
        "savePath": "/dist/css"
    }
]
```
- NOTE: that the compiled CSS files are put in a `dist/` directory in the root folder that you have open in VSCode
- on your .SCSS file, just click `Watch Sass` at the bottom bar of the VSCode editor
    - this will automatically create a `dist/css` folder where your compiled CSS files will be saved
    - NEVER MODIFY THE CSS FILES. Anytime the live compiler runs, it will overwrite the CSS files with the compilation of the SCSS/SASS files

# Two syntaxes/flavors of Sass
- .scss (superset of CSS) and .sass (indented syntax, SCSS + indentation and curly brackets)
- this note explores .scss syntax

# Sass variables
- Normal CSS variables are like this:
```css
:root {
    --primary-color: #272727;
    --accent-color: #ff652f;
    --text-color: #fff;
}

body {
    background: var(--primary-color);
}
```
- Sass variables actually get compiled into the actual values in CSS => 100% compatibility across browsers 
    - prefix with $
```css
/*SCSS*/
$primary-color: #272727;
$accent-color: #ff652f;
$text-color: #fff;

body {
    background: $primary-color;
}

/* Gets compiled into: */
body {
    background: #272727;
}
```

# Maps
```css
$font-weights: (
    "regular": 400,
    "medium": 500,
    "bold": 700
);

...
    font-weight: map-get($font-weights, bold);
...
```

# Nesting
- `&` means prefix with parent tag
- `#{&}` means select parent tag => prefix with parent tag 
```css
.main {
    width: 80%;
    margin: 0 auto;

    &_paragraph {
        font-weight: map-get($font-weights, bold);
    }
}
/*compiles into*/
.main {
  width: 80%;
  margin: 0 auto;
}

.main_paragraph {
  font-weight: 700;
}
```
```css
.main {
    #{&}_paragraph {
        font-weight: map-get($font-weights, bold);
    }
}
/*compiles into*/
.main .main_paragraph {
  font-weight: 700;
}
```
- This is useful for `hover`s
```css
.main {
    #{&}_paragraph {
        font-weight: map-get($font-weights, bold);

        &:hover {
            color: pink;
        }
    }
}
/*compiles into*/
.main .main_paragraph {
  font-weight: 700;
}

.main .main_paragraph:hover {
  color: pink;
}
```

# Separating SCSS files (partials)
- Can modularize SCSS files
- A partial is a SCSS file named with leading `_` => compiler does not compile it into a separate CSS file (its only use is to be included in other SCSS files)
```css
/* In _resets.scss */
* {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
}

/* In main.scss */
@import './resets'; 
```
- Useful for defining variables in partials and then including them in multiple SCSS files

# Functions
```css
@function weight($weight-name) {
    @return map-get($font-weights, $weight-name);
}

...
    font-weight: weight(regular);
...
```

# Mixins
- Similar to functions, but *functions are used to compute values* whereas *mixins define whole styles*
- Notice that the Sass compiler automatically handles browser compatibility for CSS (i.e. vendor prefixes)
```css
@mixin flexCenter($direction) {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: $direction;
}
.main {
    @include flexCenter(row); 
    /*or @include flexCenter(column);*/
}
/* compiles into */
.main {
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    -webkit-box-pack: center;
        -ms-flex-pack: center;
            justify-content: center;
    -webkit-box-align: center;
        -ms-flex-align: center;
            align-items: center;
    -webkit-box-orient: horizontal;
    -webkit-box-direction: normal;
        -ms-flex-direction: row;
            flex-direction: row;
}
```
- Using if statements:
```css
@mixin flexCenter($direction) {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: $direction;
}
.light {
    @include theme($light-theme: true); /*or just theme(true); OR just theme();*/
}
```
- Using `mixin` as media queries:
```css
@mixin mobile {
    @media (max-width: $mobile) {
        @content; /*this content is passed when the mixin is called below*/
    }
}
.main {
    ...
    @include mobile {
        /*this is the @content passed to the mobile mixin*/
        flex-direction: column;
    }
}
```

# Style extensions
- Basically you can have one selectors rules inherit all the rules of another
```css
#{&}_paragraph1 {
    font-weight: weight(regular);

    &:hover {
        color: pink;
    }
}
#{&}_paragraph2 {
    @extend .main_paragraph1; /*inherits all the rules of .main_paragraph1*/

    &:hover {
        color: $accent-color;
    }
}
/*compiles into*/
.main .main_paragraph1, .main .main_paragraph2 {
  font-weight: 400;
}

.main .main_paragraph1:hover, .main .main_paragraph2:hover {
  color: pink;
}

.main .main_paragraph2:hover {
  color: #ff652f;
}
```

# Operations
- Basically does everything you can do with basic CSS's `calc()` syntax
```css
width: 90% - 40%; /*equivalent to calc(90% - 40%)*/
/*compiles into*/
width: 50%;
```