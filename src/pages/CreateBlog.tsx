/**
 * Create blog page component with markdown editor and AI integration
 * Features: Rich markdown editor, live preview, AI summary generation, and form validation
 */

import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, Eye, FileText, Tag, Image, Sparkles, AlertCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import toast from 'react-hot-toast';
import { blogService } from '../services/blogService';
import { BlogFormData } from '../types';
import Loading from '../components/Loading';
import { useAuth } from '../contexts/AuthContext';

const CreateBlog: React.FC = () => {
  const [formData, setFormData] = useState<BlogFormData>({
    title: '',
    content: '',
    excerpt: '',
    coverImage: '',
    tags: [],
    isPublished: false,
    isFeatured: false
  });
  const [currentTag, setCurrentTag] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const navigate = useNavigate();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { user } = useAuth();

  const handleInputChange = (field: keyof BlogFormData, value: any) => {
    setFormData((prev: BlogFormData) => ({
      ...prev,
      [field]: value
    }));
    
    if (errors[field]) {
      setErrors((prev: Record<string, string>) => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const addTag = () => {
    const tag = currentTag.trim().toLowerCase();
    if (tag && !formData.tags.includes(tag)) {
      setFormData((prev: BlogFormData) => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
      setCurrentTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData((prev: BlogFormData) => ({
      ...prev,
      tags: prev.tags.filter((tag: string) => tag !== tagToRemove)
    }));
  };

  const handleTagKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag();
    }
  };

  const insertMarkdown = (syntax: string, placeholder: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = formData.content.substring(start, end);
    const replacement = selectedText || placeholder;
    
    let newContent;
    
    if (syntax === 'link') {
      newContent = `[${replacement || 'Link text'}](url)`;
    } else if (syntax === 'image') {
      newContent = `![${replacement || 'Alt text'}](image-url)`;
    } else if (syntax === 'code') {
      newContent = `\`${replacement || 'code'}\``;
    } else if (syntax === 'codeblock') {
      newContent = `\`\`\`javascript\n${replacement || 'Your code here'}\n\`\`\``;
    } else {
      newContent = `${syntax}${replacement}${syntax}`;
    }

    const newContentFull = 
      formData.content.substring(0, start) + 
      newContent + 
      formData.content.substring(end);
    
    handleInputChange('content', newContentFull);
    
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + newContent.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.trim().length < 5) {
      newErrors.title = 'Title must be at least 5 characters long';
    }
    
    if (!formData.content.trim()) {
      newErrors.content = 'Content is required';
    } else if (formData.content.trim().length < 50) {
      newErrors.content = 'Content must be at least 50 characters long';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (published: boolean) => {
    if (!validateForm()) {
      toast.error('Please fix the errors before submitting');
      return;
    }

    try {
      setLoading(true);
      
      const blogData: BlogFormData = {
        ...formData,
        isPublished: published
      };
      
      const createdBlog = await blogService.createBlog(blogData);
      
      toast.success(
        published 
          ? 'Blog published successfully! 🎉' 
          : 'Blog saved as draft 📝'
      );
      
      navigate(`/blog/${createdBlog.slug}`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to create blog');
    } finally {
      setLoading(false);
    }
  };

  const markdownToolbar = [
    { label: 'Bold', action: () => insertMarkdown('**', 'Bold text'), icon: 'B' },
    { label: 'Italic', action: () => insertMarkdown('*', 'Italic text'), icon: 'I' },
    { label: 'Heading', action: () => insertMarkdown('## ', 'Heading'), icon: 'H' },
    { label: 'Link', action: () => insertMarkdown('link'), icon: '🔗' },
    { label: 'Image', action: () => insertMarkdown('image'), icon: '🖼️' },
    { label: 'Code', action: () => insertMarkdown('code'), icon: '</>' },
    { label: 'Code Block', action: () => insertMarkdown('codeblock'), icon: '{}' },
  ];

  if (loading) {
    return <Loading fullScreen />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Blog</h1>
          <p className="text-gray-600">
            Share your story with the world. Use markdown for rich formatting and get AI-powered summaries.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Editor */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title Input */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FileText className="inline h-4 w-4 mr-1" />
                Blog Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Enter an engaging title for your blog..."
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg ${
                  errors.title ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.title && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.title}
                </p>
              )}
            </div>

            {/* Content Editor */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="border-b border-gray-200 p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Content Editor</h3>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => setShowPreview(!showPreview)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        showPreview
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <Eye className="h-4 w-4 mr-1 inline" />
                      Preview
                    </button>
                  </div>
                </div>
                
                {/* Markdown Toolbar */}
                <div className="flex flex-wrap gap-2">
                  {markdownToolbar.map((tool, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={tool.action}
                      className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-sm font-medium transition-colors"
                      title={tool.label}
                    >
                      {tool.icon}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 min-h-96">
                {/* Editor */}
                <div className={`${showPreview ? 'hidden lg:block' : ''}`}>
                  <textarea
                    ref={textareaRef}
                    value={formData.content}
                    onChange={(e) => handleInputChange('content', e.target.value)}
                    placeholder="Start writing your blog content here... You can use markdown syntax for formatting."
                    className={`w-full h-96 p-4 border-0 focus:ring-0 focus:outline-none resize-none ${
                      errors.content ? 'border-red-500' : ''
                    }`}
                  />
                </div>

                {/* Preview */}
                {showPreview && (
                  <div className="border-l border-gray-200">
                    <div className="p-4 h-96 overflow-y-auto prose prose-sm max-w-none">
                      {formData.content ? (
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          rehypePlugins={[rehypeHighlight]}
                        >
                          {formData.content}
                        </ReactMarkdown>
                      ) : (
                        <p className="text-gray-500 italic">Preview will appear here as you type...</p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {errors.content && (
                <div className="p-4 border-t border-red-200 bg-red-50">
                  <p className="text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.content}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Blog Settings */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Blog Settings</h3>
              
              {/* Cover Image */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Image className="inline h-4 w-4 mr-1" />
                  Cover Image URL
                </label>
                <input
                  type="url"
                  value={formData.coverImage}
                  onChange={(e) => handleInputChange('coverImage', e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Excerpt */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Excerpt (Optional)
                </label>
                <textarea
                  value={formData.excerpt}
                  onChange={(e) => handleInputChange('excerpt', e.target.value)}
                  placeholder="Brief description of your blog..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Leave empty to use AI-generated summary
                </p>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Tag className="inline h-4 w-4 mr-1" />
                  Tags
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.tags.map((tag: string) => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-1 text-blue-600 hover:text-blue-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex">
                  <input
                    type="text"
                    value={currentTag}
                    onChange={(e) => setCurrentTag(e.target.value)}
                    onKeyPress={handleTagKeyPress}
                    placeholder="Add tags..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    className="px-3 py-2 bg-gray-100 hover:bg-gray-200 border border-l-0 border-gray-300 rounded-r-lg transition-colors"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>

            {/* AI Features */}
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border border-purple-200 p-6">
              <div className="flex items-center mb-3">
                <Sparkles className="h-5 w-5 text-purple-600 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">AI Features</h3>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                When you publish your blog, our AI will automatically generate a summary to help readers quickly understand your content.
              </p>
              <div className="bg-white rounded-lg p-3 border border-purple-200">
                <p className="text-xs text-purple-700 font-medium">✨ Powered by Gemini AI</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="space-y-3">
                <button
                  onClick={() => handleSubmit(true)}
                  disabled={loading}
                  className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium rounded-lg transition-colors"
                >
                  {loading ? (
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Publish Blog
                </button>
                
                <button
                  onClick={() => handleSubmit(false)}
                  disabled={loading}
                  className="w-full flex items-center justify-center px-4 py-3 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 text-gray-700 font-medium rounded-lg transition-colors"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Save as Draft
                </button>
              </div>
              
              <p className="text-xs text-gray-500 mt-3 text-center">
                You can always edit your blog after creating it
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateBlog;
