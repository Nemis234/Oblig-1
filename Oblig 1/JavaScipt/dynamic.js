
const checkAtBottom = () => {
    let documentHeight = document.body.scrollHeight;
    let currentScroll = window.scrollY + window.innerHeight;
    // When the user is [modifier]px from the bottom, fire the event.
    let modifier = 1; 
    if(currentScroll + modifier > documentHeight) {
        return true;
    }
}

const getPosts = async(id) => {
    // Fetches a post with the given id
    let response = await fetch('https://jsonplaceholder.typicode.com/posts/'+ id)
        .then(async response => {
            if (!response.ok) {
                throw Error("HTTP error, status: " + response.status);
            }
            return response.json();
        })
        .then(json => {
            /* console.log(json) */
            return json
        })
    return response;
}

const makePostHTMl = (posts,id) => {
    // Creates the HTML for a post and returns the header and
    // body elements to be filled with content later.
    /* Layout:
    <div class="post" id="post_${id}">
        <div class="postHeader">
            <h3></h3>
        </div>
        <div class="postBody">
            <p>Loading...</p>
        </div>
    </div>
    */

    //<div class="post" id="post_${id}"></div>
    let post = document.createElement('div');
    post.classList.add('post');
    post.id = `post_${id}`;
    posts.appendChild(post);

    //<div class="postHeader"> <h3></h3> </div>
    let postHeader = document.createElement('div');
    postHeader.classList.add('postHeader');
    post.appendChild(postHeader);
    let postHeaderText = document.createElement('h3');
    postHeader.appendChild(postHeaderText);

    //<div class="postBody"> <p>Loading...</p> </div>
    let postBody = document.createElement('div');
    postBody.classList.add('postBody');
    post.appendChild(postBody);
    let postBodyText = document.createElement('p');
    postBody.appendChild(postBodyText);
    postBodyText.innerText = 'Loading...';
    console.log(postBodyText);

    return [postHeaderText,postBodyText];
}


let rendered_posts = 1; // Number of posts rendered, used to keep track of which posts to fetch
let addMoreContent = true; // Stops adding empty content if an error occurs


const addContent = async() =>{
    // Adds 3 posts to the page. If an error occurs, it stops adding content.
    // Prevent multiple calls to this function at the same time
    if (!addMoreContent) {
        return;
    } 
    addMoreContent = false;
    let wrap = document.getElementById('wrap');
    let posts = document.createElement('div');
    posts.classList.add('posts');
    wrap.appendChild(posts);

    let post_ids = [];
    for (let i = rendered_posts; i < rendered_posts+3; i++) {
        post_ids.push(i);
    }
    rendered_posts += 3;

    await Promise.all(
        post_ids.map(async id => {
            let [postHeaderText,postBodyText] = makePostHTMl(posts,id);
            getPosts(id).then(data => {
                postHeaderText.innerText = data.title;
                postBodyText.innerText = data.body;
            }).catch(error => {console.log(error); addMoreContent = false;});
        })
    ).then(addMoreContent = true).catch(error => console.log(error));
    
    console.log('Posts rendered: ' + (rendered_posts-1));
}

// Add content until the user is not at the bottom
// Needed for the user to be able to scroll

const startingContent = () => {
    let safeguard = 0;
    while (checkAtBottom() && safeguard < 5) {
        safeguard++;
        console.log('You are at the bottom!');
        // No await, as we want to add content so the user can scroll
        addContent();
    }
}

startingContent();

document.addEventListener('DOMContentLoaded', async function(e) {
    document.addEventListener('scroll', async function(e) {
        if(checkAtBottom()) {
            console.log('You are at the bottom!');
            // Await stops the function until the content is added
            await addContent();
        }
    })
})
