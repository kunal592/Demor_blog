import React from 'react';
import { useParams } from 'react-router-dom';
import CommentList from '../components/CommentList';

const BlogPostPage = () => {
  const { slug } = useParams<{ slug: string }>();

  return (
    <div>
      <h2>Blog Post Title</h2>
      <p>This is the content of the blog post. The slug for this post is: <strong>{slug}</strong></p>
      {slug && <CommentList slug={slug} />}
    </div>
  );
};

export default BlogPostPage;
