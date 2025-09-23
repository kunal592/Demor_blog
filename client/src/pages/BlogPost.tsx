import React from 'react';
import CommentList from '../components/CommentList';

const BlogPost = () => {
  return (
    <div style={{ padding: '2rem' }}>
      <h1>Blog Post Title</h1>
      <p>This is the content of the blog post.</p>
      <hr />
      <h2>Comments</h2>
      <CommentList />
    </div>
  );
};

export default BlogPost;
