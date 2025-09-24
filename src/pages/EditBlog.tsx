import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, Eye, FileText, Tag, Image, ArrowLeft, AlertCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import toast from 'react-hot-toast';
import { blogService } from '../services/blogService';
import { BlogFormData, Blog } from '../types';
import Loading from '../components/Loading';
import { useAuth } from '../contexts/AuthContext';

const EditBlog: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [blog, setBlog] = useState<Blog | null>(null);
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
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const navigate = useNavigate();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { user } = useAuth();

  const loadBlog = useCallback(async () => {
    if (!id) return;

    try {
      setLoading(true);
      const response = await blogService.getBlogById(id);
      const blogData = response.blog;
      
      if (!user || (user.id !== blogData.author.id && user.role !== 'ADMIN')) {
        toast.error('You are not authorized to edit this blog');
        navigate('/dashboard');
        return;
      }

      setBlog(blogData);
      setFormData({
        title: blogData.title,
        content: blogData.content,
        excerpt: blogData.excerpt || '',
        coverImage: blogData.coverImage || '',
        tags: blogData.tags.map(t => typeof t === 'string' ? t : (t as any).name), // handle tags as objects
        isPublished: blogData.isPublished,
        isFeatured: blogData.isFeatured
      });
    } catch (error: any) {
      toast.error(error.message || 'Failed to load blog');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  }, [id, user, navigate]);

  useEffect(() => {
    loadBlog();
  }, [loadBlog]);

  const handleInputChange = (field: keyof BlogFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const addTag = () => {
    const tag = currentTag.trim().toLowerCase();
    if (tag && !formData.tags.includes(tag)) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, tag] }));
      setCurrentTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({ ...prev, tags: prev.tags.filter(tag => tag !== tagToRemove) }));
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
    if (syntax === 'link') newContent = `[${replacement || 'Link text'}](url)`;
    else if (syntax === 'image') newContent = `![${replacement || 'Alt text'}](image-url)`;
    else if (syntax === 'code') newContent = `\`${replacement || 'code'}\``;
    else if (syntax === 'codeblock') newContent = `\`\`\`javascript\n${replacement || 'Your code here'}\n\`\`\``;
    else newContent = `${syntax}${replacement}${syntax}`;

    const newContentFull = formData.content.substring(0, start) + newContent + formData.content.substring(end);
    handleInputChange('content', newContentFull);
    
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + newContent.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    else if (formData.title.trim().length < 5) newErrors.title = 'Title must be at least 5 characters long';
    if (!formData.content.trim()) newErrors.content = 'Content is required';
    else if (formData.content.trim().length < 50) newErrors.content = 'Content must be at least 50 characters long';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (published: boolean) => {
    if (!validateForm() || !blog) {
      toast.error('Please fix the errors before submitting');
      return;
    }

    setSaving(true);
    try {
      const blogData: Partial<BlogFormData> = { ...formData, isPublished: published };
      const updatedBlog = await blogService.updateBlog(blog.id, blogData);
      toast.success(published ? 'Blog updated and published! 🎉' : 'Blog updated and saved as draft 📝');
      navigate(`/blog/${updatedBlog.slug}`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update blog');
    } finally {
      setSaving(false);
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

  if (loading) return <Loading fullScreen />;

  if (!blog) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Blog not found</h2>
          <button
            onClick={() => navigate('/dashboard')}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            ← Back to dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to dashboard
            </button>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Blog</h1>
          <p className="text-gray-600">
            Update your blog content and settings.
          </p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FileText className="inline h-4 w-4 mr-1" />
                Blog Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Enter an engaging title..."
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg ${errors.title ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.title && <p className="mt-2 text-sm text-red-600 flex items-center"><AlertCircle className="h-4 w-4 mr-1" />{errors.title}</p>}
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="border-b border-gray-200 p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Content Editor</h3>
                  <button
                    type="button"
                    onClick={() => setShowPreview(!showPreview)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${showPreview ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                  >
                    <Eye className="h-4 w-4 mr-1 inline" />
                    Preview
                  </button>
                </div>
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
              <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[400px]">
                <div className={showPreview ? 'hidden lg:block' : ''}>
                  <textarea
                    ref={textareaRef}
                    value={formData.content}
                    onChange={(e) => handleInputChange('content', e.target.value)}
                    placeholder="Write your blog content here..."
                    className={`w-full h-full p-4 border-0 focus:ring-0 resize-none ${errors.content ? 'border-red-500' : ''}`}
                  />
                </div>
                <div className={`border-l border-gray-200 ${showPreview ? '' : 'hidden lg:block'}`}>
                  <div className="p-4 h-full overflow-y-auto prose prose-sm max-w-none">
                    {formData.content ? <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>{formData.content}</ReactMarkdown> : <p className="text-gray-500 italic">Preview appears here</p>}
                  </div>
                </div>
              </div>
              {errors.content && <div className="p-4 border-t border-red-200 bg-red-50"><p className="text-sm text-red-600 flex items-center"><AlertCircle className="h-4 w-4 mr-1" />{errors.content}</p></div>}
            </div>
          </div>
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Blog Settings</h3>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2"><Image className="inline h-4 w-4 mr-1" />Cover Image URL</label>
                <input
                  type="url"
                  value={formData.coverImage}
                  onChange={(e) => handleInputChange('coverImage', e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Excerpt</label>
                <textarea
                  value={formData.excerpt}
                  onChange={(e) => handleInputChange('excerpt', e.target.value)}
                  placeholder="Brief description..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2"><Tag className="inline h-4 w-4 mr-1" />Tags</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.tags.map(tag => (
                    <span key={tag} className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      {tag}
                      <button type="button" onClick={() => removeTag(tag)} className="ml-1 text-blue-600 hover:text-blue-800">×</button>
                    </span>
                  ))}
                </div>
                <div className="flex">
                  <input
                    type="text"
                    value={currentTag}
                    onChange={(e) => setCurrentTag(e.target.value)}
                    onKeyPress={handleTagKeyPress}
                    placeholder="Add a tag..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button type="button" onClick={addTag} className="px-3 py-2 bg-gray-100 hover:bg-gray-200 border border-l-0 border-gray-300 rounded-r-lg">Add</button>
                </div>
              </div>
              {user?.role === 'ADMIN' && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <label className="flex items-center">
                    <input type="checkbox" checked={formData.isFeatured} onChange={(e) => handleInputChange('isFeatured', e.target.checked)} className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                    <span className="ml-2 text-sm text-gray-700">Featured Blog</span>
                  </label>
                </div>
              )}
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="space-y-3">
                <button onClick={() => handleSubmit(true)} disabled={saving} className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium rounded-lg">
                  {saving ? <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div> : <Save className="h-4 w-4 mr-2" />} Update & Publish
                </button>
                <button onClick={() => handleSubmit(false)} disabled={saving} className="w-full flex items-center justify-center px-4 py-3 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 text-gray-700 font-medium rounded-lg">
                  <FileText className="h-4 w-4 mr-2" /> Save as Draft
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditBlog;