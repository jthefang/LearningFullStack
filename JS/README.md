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
## Posts
- Fetching posts (from database)
```html
<body>
    <h1>My Blog Posts</h1>
    <section id="posts"></section>

    <template id ="post-template">
        <div class="post">
            <img src="" alt="" class="post_img">
            <h4 class="post_title"></h4>
            <p class="post_body"></p>
        </div>
    </template>
    <script src="main.js"></script>
</body>
```
```JS
//main.js
const postSection = documents.querySelector("#posts");
const postTemplate = document.querySelector("post-template");

getData()
    .catch(err => console.error(err)); //won't catch errors from fetch within forEach

async function getData() {
    const postStream = await fetch("https://jsonplaceholder.typicode.com/posts"); //gets 100 placedholder json
    const posts = await postStream.json(); //array of json data
    let i = 0;

    posts.forEach(post => {
        i++; 
        if (i < 10) { //get first 9 posts
            const title = post.title;
            const body = post.body;

            fetch("https://unspash.it/300/200")
                .then(res => res.blob())
                .then(blob => {
                    const newPost = document.importNode(postTemplate.content, true); //deep copies postTemplate node (i.e. the template element + all it's descendants [the img, h4, p])
                    const postTitle = newPost.querySelector(".post_title");
                    const postBody = newPost.querySelector(".post_body");
                    const postImg = newPost.querySelector(".post_img");

                    postTitle.innerText = title;
                    postBody.innerText = body;
                    postImg.src = URL.createObjectURL(blob);
                    postSection.appendChild(newPost);
                })
                .catch(err => console.error(err));
        }
    })
}
```
- Saving posts (pushing to database)
```JS
const newPost = {
    title: "New Post Title",
    body: "Awesome post paragraph",
    userId: 1
}

const createNewPost = post => {
    const options = { //fetch options
        method: "POST", //default is GET
        body: JSON.stringify(post),
        headers: new Headers({
            'Content-Type': 'application/json'
        })
    }

    return fetch("https://jsonplaceholder.typicode.com/posts", options)
        .then(res => res.json())
        .then(posts => console.log(posts)) //returns the post we just POST'd 
        .catch(err => console.error(err))
}

createNewPost(newPost);
```