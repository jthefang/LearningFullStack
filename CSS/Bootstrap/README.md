# Bootstrap CSS

## Table of Contents

- [Bootstrap CSS](#bootstrap-css)
  - [Table of Contents](#table-of-contents)
  - [Installing/using Bootstrap](#installingusing-bootstrap)
  - [Bootstrap 4 Grid](#bootstrap-4-grid)
  - [Navbar](#navbar)
  - [Alerts](#alerts)
  - [Modals](#modals)
  - [Forms](#forms)
    - [Form validation styles](#form-validation-styles)
    - [Form validation (JS)](#form-validation-js)
  - [Bootstrap theme customization](#bootstrap-theme-customization)

- Bootstrap is a CSS framework
- Provides **general default styles** + **pre-defined CSS classes** which you can add to your HTML elements to get certain looks
- Uses a grid layout
- **General styles**
  - Package Reboot has set cross-browser style defaults (looks same across browsers)
  - Typography/default styles (default font family and font sizes/weights)
  - Tables, images, figures (default responsive styles)
  - These are set by default in bootstrap
- Grid layout 
  - container div
  - defined by rows and cols in container (children elements belong in a cell in this grid)
  - Row uses vanilla CSS flexbox
- **Pre-defined CSS classes/components**
  - ships with JS to provide certain element behaviors (e.g. modals)
  - alerts, buttons, cards, forms, navbars (with search bars)
- Bootstrap 4 is built in a **mobile first** way

## Installing/using Bootstrap

- Can just include the CSS and JS from CDNs ([see links](https://getbootstrap.com/docs/4.0/getting-started/introduction/))
- Or install via `npm install bootstrap`

## Bootstrap 4 Grid

- Make `<div class="container">` so that Bootstrap knows where to put a grid (don't actually need this)
  - has children `<div class="row">` elements, which in turn have `<div class="col">` elements 
  - put your content in the `col` divs. These are the grid cells 
- By default each column takes up equal amount of space in its row 
  - if width gets too small => columns will break into separate rows 
  - Column sizes:
    - `col-4` and `col-8` will give one column 1/3 of the row space and the other 2/3 of the row space
    - note that a row has up to 12 units of columns (i.e. the numbers must add up to 12)
    - if the numbers are < 12 => you won't be using the full row width 
    - if the numbres are > 12 => the columns will overflow into another row
  - You can also have sizes dependent on the screen size:
    - `col-md-4` means this cell should have 4/12 of the row space on medium sized (or bigger) screens
    - also `lg` and `xl` for large screens, `sm` and `xs` for mobile
    - e.g. `<div class="col-md-4 col-sm-6">` will take up 4/12 of space on medium screens and 1/2 of row space on small screens
- `<div class="row justify-content-center">` to justify the cells horizontally within the row 
  - default is `justify-content-start`, `-end`, `-around`, `-between`
  - `align-items-start`, `-end`, `-center`, `-stretch` (default) to align the cols vertically within the row
  - `align-self-start`, `-end`, `-center`, `-stretch` on a `col div` to just align that single column vertically
- Can re-order columns within a row
  - `order-n` where `n` goes from 1 to 12 will specify the ascending order of the columns within the row
  - these numbers are relative
  - can also add the screen size modifiers (e.g. `order-md-4` will only apply the relative ordering on medium size or larger screens)
- Can offset columns within row
  - `offset-n` will offset the column n columns to the right (this will affect spacing with the columns after it)
  - can also add the screen size modifiers
- Most bootstrap class styles will modify the element to take up full width => they are meant to be used in conjuction with the bootstrap grid
- In fact use the grid everywhere help layout everything

## Navbar

- As with everything in bootstrap we have to add style classes to apply the default bootstrap styles
- The navbar will by default put all the items on the right 
  - add `mr-auto` to the `ul` element to have them align left
    - will fill up all the space to the right of the list elements with automatic margin (hence pushing all list elements to left)
- Bootstrap navbar uses flexbox to position its elements 
```html
<nav class="navbar navbar-light bg-light">
  <a href="#" class="navbar-brand">James</a> <!-- top left brand name -->
  <ul class="navbar-nav"> <!-- will hold navbar items -->
    <li class="nav-item"> <!-- nav items should have these classes-->
      <a href="#" class="nav-link">Users</a>
    </li>
    <li class="nav-item">
      <a href="#" class="nav-link">Products</a>
    </li>
  </ul>
</nav>
```
- By default the nav elements will be presented as a list of rows since Bootstrap 4 is mobile first
- If you want the navbar items to be collapsed for mobile versions:
```html
<nav class="navbar navbar-expand-md navbar-light bg-light"> <!-- screen size modifier to determine when it shows full width (collapses for smaller sizes) -->
  <a href="#" class="navbar-brand">James</a> 
  <button class="navbar-toggler" data-toggle="collapse" data-target="#navbarMenu"> <!-- reference nav div wrapper -->
    <!-- to toggle navbar for smaller screens -->
    <span class="navbar-toggler-icon"></span> <!-- hamburger icon -->
  </button>
  <div class="collapse navbar-collapse" id="navbarMenu"> <!-- collapsable navbar -->
    <ul class="navbar-nav">
      <li class="nav-item">
        <a href="#" class="nav-link">Users</a>
      </li>
      <li class="nav-item">
        <a href="#" class="nav-link">Products</a>
      </li>
    </ul>
  </div>
</nav>
```
- Add `collapse navbar-collapse` div wrapper around the `ul` 
  - the navbar items will only show up for screen sizes medium or larger (because of `md` modifier)
  - use `ml-auto` to align the navbar items to the right side
  - add a navbar toggler for smaller screens to display the navbar items as list of rows
- Changing the navbar color theme
  - simply change `navbar-light bg-light` to `navbar-dark bg-dark` to get the dark theme
- Check out the [docs](https://getbootstrap.com/docs/4.0/components/navbar/) to see how to:
  - add search bar to navbar
  - more color themes, text, buttons, etc.

## Alerts

- Alerts are conditional messages to give to the user (e.g. after form submission)
  - See [docs](https://getbootstrap.com/docs/4.0/components/alerts/)
- You can modify the style of alert (e.g. error alert, success alert, etc) with `alert-<type>`
  - `alert-primary` is full width, blue background (uses the Bootstrap primary theme)
  - `alert-secondary` is gray (neutral color)
  - `alert-success` is green
  - `alert-danger` is red
  - `alert-warning` is yellow
  - `alert-info` is lighter blue 
  - also `alert-light` and `alert-dark`
  - see docs for more
- Can also make the alert dismissable via `alert-dismissable`
  - `fade` make the alert fade away on dismissal
  - `show` to have the alert show automatically
  - also add `close` and `data-dismiss="alert"` on the button 
```html
<div class="container">
  <div class="row">
    <div class="col">
      <div class="alert alert-primary alert-dismissable fade show" role="alert">
        <!-- role is for accessibility readers -->
        <button type="button" class="close" data-dismiss="alert"><span aria-hidden="true">&times;</span></button> <!-- aria hidden indicates no content in this element -->

        <h2 class="alert-heading">This is an alert!</h2>
        <p>
          I'm an alert! <a href="#" class="alert-link">Click me!</a>
        </p>
      </div>
    </div>
  </div>
</div>
```

## Modals

- Modal = popup like window that renders on top of other content
  - shown conditionally (e.g. after some action occurs)
- Can only have 1 modal at a time (nested modals not supported)
```html
...
<button type="button" class="btn btn-primary" data-toggle="modal" data-target="#demoModal">Show Modal</button>

<div class="modal fade" id="demoModal">
  <div class="modal-dialog"> 
    <div class="modal-content"> <!-- contains modal contents -->
      <div class="modal-header">
        <h2 class="modal-title">Please confirm!</h2>
        <button type="button" class="close" data-dismiss="modal"><span>&times;</span></button>
      </div>
      <div class="modal-body"> <!-- core modal content -->
        <p>This is the modal body, do you like it?</p>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-dismiss="modal">Confirm</button>
      </div>
    </div>
  </div>
</div>
```
- `fade` will animate the modal on entry/dismissal
- See [docs](https://getbootstrap.com/docs/4.0/components/modal/) for more
  - what you can put inside a modal
  - alternative classes for different sized modals
  - can create modal with scrolling content
  - can vertically center modal

## Forms

- See [docs](https://getbootstrap.com/docs/4.0/components/forms/)
- Use grid to help layout the form
- Basic form:
```html
<form action="" style="width: 500px; margin: auto;">
  <div class="row"> <!-- grid layout! -->
    <div class="col">
      <div class="form-group">
        <label for="lastname">Last name</label>
        <input type="text" name="lastname" id="lastname" class="form-control">
      </div>
    </div>
    <div class="col">
      <div class="form-group">
        <label for="firstname">First name</label>
        <input type="text" name="firstname" id="firstname" class="form-control">
      </div>
    </div>
  </div>

  <div class="form-group">
    <label for="username">Username</label>
    <input type="text" name="username" id="username" class="form-control">
  </div>

  <div class="form-group">
    <label for="password">Password</label> <!-- for is for screen readers-->
    <input type="password" name="password" id="password" class="form-control">
  </div>

  <div class="form-group">
    <label for="gender">Gender</label>
    <select name="gender" id="gender" class="form-control">
      <option value="male">Male</option>
      <option value="female">Female</option>
    </select>
  </div>

  <div class="form-check">
    <input type="checkbox" name="" id="accept-terms" class="form-check-input">
    <label for="accept-terms" class="form-check-label">Accept Terms &amp; Conditions</label>
  </div>
</form>
```
- Styling buttons
  - `<button type="submit" class="btn btn-primary">Submit</button>`
    - you also have `btn-secondary`, `-success`, `-danger`, `-warning` basically all the ones from Alerts above
  - `btn-outline-primary` to have the button not be filled in with any color (but border has color)
  - `disabled` property can be added to button to gray it out

### Form validation styles

- Can add form validation styles (after validation on server side => send back form page with some extra bootstrap classes)
```html
<input type="text" name="lastname" id="lastname" class="form-control is-invalid">
<div class="invalid-feedback">Looks good!</div>

<input type="text" name="firstname" id="firstname" class="form-control is-valid">
<small class="form-text text-muted">
  This should be your last name.
</small>
```
- `is-invalid` and `invalid-feedback` will be red
  - `is-valid` will be green
  - NOTE: `valid-feedback` will only show up if it's under `is-valid` inputs!
- `form-text` will add helper text below the form input
  - `text-muted` just grays it out a little 

### Form validation (JS)

- Bootstrap can do automatic form validation via the browser's form validity check (browser dependent)
- `<input type="text" name="username" required>` will tell the browser to require the user to fill in the input 
  - other properties like `max-length`, etc.
- To take advantage of Bootstrap validation (which uses the browser validation):
```html
<form action="" class="main-form needs-validation" novalidate>
  <!-- disable browser check (allow bootstrap check) -->
  ...

  <div class="form-group">
    <label for="username">Username</label>
    <input type="text" name="username" id="username" class="form-control" required> <!-- tell bootstrap this is required -->
    <div class="invalid-feedback">Please enter a valid username.</div> <!-- will show this on error (i.e. if no username input, since it's required) -->
  </div>

  ...
  <button type="submit">Submit</button>
</form>

<script>
  var form = document.querySelector('.needs-validation');

  form.addEventListener('submit', function (event) {
    if (form.checkValidity() === false) {
      event.preventDefault();
      event.stopPropagation();
    }
    form.classList.add('was-validated');
  });
</script>
``` 

## Bootstrap theme customization

- 
