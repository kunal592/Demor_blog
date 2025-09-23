import { useState } from 'react';
import { apiClient } from '../services/apiClient';

const ContactUs = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    if (!name || !email || !message) {
      setError('All fields are required.');
      return;
    }

    try {
      await apiClient.post('/contact', { name, email, message });
      setIsSubmitted(true);
      setName('');
      setEmail('');
      setMessage('');
    } catch (error) {
      setError('An error occurred while submitting your request. Please try again.');
      console.error('Error submitting contact form:', error);
    }
  };

  return (
    <div>
      <h1>Contact Us</h1>
      {isSubmitted ? (
        <div>
          <h3>Thank you for your message!</h3>
          <p>We will get back to you as soon as possible.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="name">Name</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="message">Message</label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>
          {error && <p style={{ color: 'red' }}>{error}</p>}
          <button type="submit">Send</button>
        </form>
      )}
    </div>
  );
};

export default ContactUs;
