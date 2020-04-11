# Fetch API
- allows us to GET data from a local or remote file or database (via an API) or PUSH data to a database (via an API)
    - similar to http requests but better 
    - is promise based

```JS
fetch('demo.json')
    .then(res => {
        console.log(res);
        return res.json();
    })
    .then(json => console.log(json));
```
## Images
```JS
fetch('https://unsplash.it/600/400') //gets random image of size 600x400
    .then(res => res.blob())
    .then(blob => {
        let img = document.createElement('img');
        img.src = URL.createObjectURL(blob);
        document.querySelector('body').appendChild(img);
    });
```