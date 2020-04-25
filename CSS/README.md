# CSS

## Units of Measurement
- Absolute units
    - **px**, cm, mm, in, pt, pc
- Relative units
    - rem, em, vw, vh, %
- **%**
    - of available size of parent container (for width, height)
        - available size = space left over after padding and margin is applied
    - for font-size this is a percentage of the *default* font size (for most browsers this is 16px)
- **vw, vh** (viewport width/height)
    - for specifying width/height
    - in units of percent of full viewport width/height
        - does not consider padding or margin (i.e. size is applied before padding and margin)
    - e.g. 1vh = 1% of viewport height
- **rem** (most recommended for **font-size, padding and margins**)
    - relative to root (html) font-size (usually 16px)
    - = 1rem = 16px, 2rem = 32px
    - this is accessibility adaptable
    - change default font-size via:
    ```css
    html {
        font-size: 10px;
    }
    ```
- em
    - relative to `font-size` of parent element
