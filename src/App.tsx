import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { initDb, getAllPosts, fetchPostByTitle } from './db';

interface Post {
  id: string;
  title: string;
  content: string;
}

const fetchAllPosts = async (): Promise<Post[]> => {
  await initDb();
  const posts = await getAllPosts();
  if (!posts || posts.length === 0) {
    console.error('No posts found');
    throw new Error('No posts found');
  }
  console.log('Fetched posts in fetchAllPosts:', posts);
  return posts;
};

const App: React.FC = () => {
  const { data: posts, isLoading: isLoadingPosts, error: postsError } = useQuery<Post[]>({
    queryKey: ['posts'],
    queryFn: fetchAllPosts,
  });

  const { data: post, isLoading: isLoadingPost, error: postError } = useQuery<Post>({
    queryKey: ['postByTitle', 'Hello from SurrealDB'],
    queryFn: () => fetchPostByTitle('Hello from SurrealDB'),
  });

  if (isLoadingPosts || isLoadingPost) return <div>Loading...</div>;
  if (postsError) return <div>Error loading posts: {postsError.message}</div>;
  if (postError) return <div>Error loading post: {postError.message}</div>;

  console.log('Rendering posts:', posts);
  console.log('Rendering post by title:', post);

  return (
    <div>
      <h1>All Posts</h1>
      <ul>
        {posts?.map(post => (
          <li key={post.id}>
            <h2>{post.title}</h2>
            <p>{post.content}</p>
          </li>
        ))}
      </ul>

      <h1>Post by Title</h1>
      {post && (
        <div>
          <h2>{post.title}</h2>
          <p>{post.content}</p>
        </div>
      )}
    </div>
  );
};

export default App;
