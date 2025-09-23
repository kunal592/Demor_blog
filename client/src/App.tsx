import React from 'react';
import { BrowserRouter as Router, Route, Routes, useParams } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import CommentList from './components/CommentList';

const Home = () => <h2>Home</h2>;
const Contact = () => <h2>Contact</h2>;

const BlogPostPage = () => {
  const { slug } = useParams();

  return (
    <div>
      <h2>Blog Post Title</h2>
      <p>This is the content of the blog post. The slug for this post is: <strong>{slug}</strong></p>
      <CommentList slug={slug} />
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <Navbar />
      <div style={{ padding: '1rem' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/blog/:slug" element={<BlogPostPage />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
