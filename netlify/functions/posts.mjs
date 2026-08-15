import { getStore } from "@netlify/blobs";

export default async (req, context) => {
    // This creates a secure database box called "blog-data"
    const store = getStore("blog-data");
    
    // SCENARIO 1: Someone visits the page and wants to SEE the posts (GET request)
    if (req.method === "GET") {
        const posts = await store.get("posts", { type: "json" }) || [];
        return new Response(JSON.stringify(posts));
    }

    // SCENARIO 2: Someone is trying to PUBLISH a new post (POST request)
    if (req.method === "POST") {
        const data = await req.json();
        
        // 1. Check the password securely!
        if (data.password !== "fullstop") {
            return new Response("Wrong password", { status: 401 });
        }

        // 2. Get the old posts
        const posts = await store.get("posts", { type: "json" }) || [];
        
        // 3. Add the new post to the top of the list
        posts.unshift({
            name: data.name,
            text: data.text,
            date: new Date().toLocaleString()
        });

        // 4. Save the updated list back to the database
        await store.setJSON("posts", posts);
        
        // 5. Send the updated list back to the website
        return new Response(JSON.stringify(posts));
    }
};

// This tells Netlify to create a URL for this server script
export const config = {
    path: "/api/posts"
};