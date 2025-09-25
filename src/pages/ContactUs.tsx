import React, { useState } from "react";
import { Card, CardContent } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Textarea } from "../components/ui/Textarea";
import apiClient from "../services/apiClient";
import { handleApiError } from "../utils/errorHandler";
import toast from "react-hot-toast";

const ContactUs: React.FC = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await apiClient.post("/contact", { name, email, message });
      setIsSubmitted(true);
      toast.success('Your message has been sent successfully!');
      setName("");
      setEmail("");
      setMessage("");
    } catch (err) {
      const { userMessage } = handleApiError(err, 'submitting your message');
      setError(userMessage);
      toast.error(userMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 p-6">
      <Card className="w-full max-w-lg shadow-lg rounded-2xl">
        <CardContent className="p-6">
          <h1 className="text-3xl font-bold text-center mb-6">
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Contact Us
            </span>
          </h1>

          {isSubmitted ? (
            <div className="text-center">
              <p className="text-green-600 font-medium mb-4">
                ✅ Thank you! Your query has been submitted.
              </p>
              <Button onClick={() => setIsSubmitted(false)} className="w-full">
                Send Another Message
              </Button>
            </div>
          ) : error ? (
            <div className="text-center">
              <p className="text-red-600 text-sm mb-4">{error}</p>
              <Button onClick={handleSubmit} disabled={isSubmitting} className="w-full">
                {isSubmitting ? 'Retrying...' : 'Try Again'}
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-gray-700 font-medium mb-1">Name</label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-gray-700 font-medium mb-1">Email</label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-gray-700 font-medium mb-1">Message</label>
                <Textarea
                  id="message"
                  placeholder="Write your query or request here..."
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div className="flex justify-center">
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:opacity-90"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit'}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ContactUs;
