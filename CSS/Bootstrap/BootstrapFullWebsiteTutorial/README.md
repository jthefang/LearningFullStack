# Bootstrap 4 demo

- Following this tutorial [video](https://www.youtube.com/watch?v=9cKsq14Kfsw)

- [Bootstrap 4 demo](#bootstrap-4-demo)
  - [Navbar](#navbar)
    - [Anchors](#anchors)
  - [Carousel](#carousel)
  - [Jumbotron](#jumbotron)
  - [Welcome](#welcome)
  - [Two column section](#two-column-section)
  - [Cards](#cards)

## Navbar

- `fixed-top` so that navbar sticks to top
- `container-fluid` so it takes up full width

### Anchors

```html
<li class="nav-item"><a class="nav-link" href="#about">About</a></li>
...
<a name="about" class="anchor"></a>
```
- Since we have a sticky navbar, we want to offset the anchor by the height of the navbar (else we'll cut off our content with the navbar everytime we jump to the anchor)
```css
a.anchor { /* for offset after jump to section from nav-link */
  display: block;
  position: relative;
  top: -100px;
  visibility: hidden;
}

html {
  scroll-behavior: smooth; /* to scroll to anchor */
}
```

## Carousel

- Pretty cool sliding carousel!
- `display-2` for heading gives it a large font size and weight
```css
.carousel-inner img {
  width: 100%;
  height: 100%;
}
.carousel-caption {
  position: absolute;
  top: 50%;
  transform: translateY(-50%); /* centers caption in slide */
}
.carousel-caption h1 {
  font-size: 500%;
  text-transform: uppercase;
  text-shadow: 1px 1px 15px #000;
}
.carousel-caption h3 {
  font-size: 200%; 
  font-weight: 500;
  text-shadow: 1px 1px 10px #000;
  padding-bottom: 1rem;
}
```

## Jumbotron

- `jumbotron` on div has it be like a full-width banner
- `<p class="lead">` gives lightweight text

## Welcome

- `text-center` to center any text in descendant elements

## Two column section

- `img-fluid` on `img` element to have it automatically take up full cell width

## Cards

- Cool cards with image, body (title and text) and button
```html
<div class="card">
  <img src="img/team1.png" class="card-img-top" />
  <div class="card-body">
    <h4 class="card-title">John Doe</h4>
    <p class="card-text">John is an Internet entrepreneur with almost 20 years of experience.</p>
    <a href="#" class="btn btn-outline-secondary">See profile</a>
  </div>
</div>
```
