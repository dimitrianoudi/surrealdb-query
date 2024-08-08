import Surreal from 'surrealdb.js';

let db: Surreal | undefined;

export async function initDb(): Promise<Surreal | undefined> {
    if (db) return db;
    db = new Surreal();
    try {
        await db.connect("http://127.0.0.1:8000/rpc");
        await db.use({ namespace: "test", database: "test" });

        console.log("Connected to SurrealDB");

        const creationResult = await db.query(`
            CREATE post CONTENT {
              title: 'Hello from SurrealDB',
              content: 'This is a hello from SurrealDB'
            };
            CREATE post CONTENT {
              title: 'SurrealDB is Awesome',
              content: 'This is a post about SurrealDB'
            };
        `);

        console.log("Database creation result:", creationResult);

        return db;
    } catch (err) {
        console.error("Failed to connect to SurrealDB:", err);
        throw err;
    }
}

interface Post {
  id: string;
  title: string;
  content: string;
}

interface SurrealResponse<T> {
  time: string;
  status: string;
  result: T;
}

export const getAllPosts = async (): Promise<Post[]> => {
    try {
        const response = await db?.query<SurrealResponse<Post[]>[]>('SELECT * FROM post');
        console.log("Raw posts data:", response);
        if (!response || response.length === 0 || !response[0].result) {
            console.error("No posts found.");
            return [];
        }

        const result = response[0].result.map((post: any) => ({
            id: post.id as string,
            title: post.title as string,
            content: post.content as string,
        })) as Post[];

        console.log("Fetched all posts:", result);

        return result;
    } catch (error) {
        console.error("Error fetching posts:", error);
        return [];
    }
};

export const fetchPostByTitle = async (title: string): Promise<Post> => {
    const posts = await getAllPosts();
    const post = posts.find(p => p.title === title);
    if (!post) {
        console.error(`No post found with title ${title}`);
        throw new Error(`No post found with title ${title}`);
    }
    console.log('Fetched post by title:', post);
    return post;
};
