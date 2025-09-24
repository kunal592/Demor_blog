import apiClient from './apiClient';
import { Blog, BlogFormData, BlogFilters, ApiResponse, PaginationData, UserInteractions } from '../types';

class BlogService {
  async getBlogs(filters: BlogFilters = {}) {
    const res = await apiClient.get<ApiResponse<{ blogs: Blog[]; pagination: PaginationData }>>('/blogs', { params: filters });
    if (res.data.success && res.data.data) return res.data.data;
    throw new Error(res.data.message || 'Failed to fetch blogs');
  }

  async getBlogBySlug(slug: string) {
    const res = await apiClient.get<ApiResponse<{ blog: Blog; userInteractions: UserInteractions | null }>>(`/blogs/${slug}`);
    if (res.data.success && res.data.data) return res.data.data;
    throw new Error(res.data.message || 'Blog not found');
  }

  async getBlogById(id: string) {
    const res = await apiClient.get<ApiResponse<{ blog: Blog }>>(`/blogs/${id}`);
    if (res.data.success && res.data.data) return res.data.data;
    throw new Error(res.data.message || 'Blog not found');
  }

  async createBlog(blogData: BlogFormData) {
    const res = await apiClient.post<ApiResponse<{ blog: Blog }>>('/blogs', blogData);
    if (res.data.success && res.data.data) return res.data.data.blog;
    throw new Error(res.data.message || 'Failed to create blog');
  }

  async updateBlog(id: string, blogData: Partial<BlogFormData>) {
    const res = await apiClient.put<ApiResponse<{ blog: Blog }>>(`/blogs/${id}`, blogData);
    if (res.data.success && res.data.data) return res.data.data.blog;
    throw new Error(res.data.message || 'Failed to update blog');
  }

  async deleteBlog(id: string) {
    const res = await apiClient.delete<ApiResponse<null>>(`/blogs/${id}`);
    if (!res.data.success) throw new Error(res.data.message || 'Failed to delete blog');
  }

  async toggleLike(blogId: string) {
    const res = await apiClient.post<ApiResponse<{ liked: boolean; likeCount: number }>>(`/blogs/${blogId}/like`);
    if (res.data.success && res.data.data) return res.data.data;
    throw new Error(res.data.message || 'Failed to toggle like');
  }

  async toggleBookmark(blogId: string) {
    const res = await apiClient.post<ApiResponse<{ bookmarked: boolean }>>(`/blogs/${blogId}/bookmark`);
    if (res.data.success && res.data.data) return res.data.data;
    throw new Error(res.data.message || 'Failed to toggle bookmark');
  }

  async getUserBlogs(filters: { page?: number; limit?: number; status?: string } = {}) {
    const res = await apiClient.get<ApiResponse<{ blogs: Blog[]; pagination: PaginationData }>>('/blogs/me/posts', { params: filters });
    if (res.data.success && res.data.data) return res.data.data;
    throw new Error(res.data.message || 'Failed to fetch user blogs');
  }

  getShareData(blog: Blog) {
    const url = `${window.location.origin}/blog/${blog.slug}`;
    const title = blog.title;
    const text = blog.excerpt || blog.summary || `Check out this post by ${blog.author.name}`;
    return {
      url,
      title,
      text,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      reddit: `https://www.reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(title + ' ' + url)}`,
      email: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(text + '\n\n' + url)}`,
    };
  }
}

export const blogService = new BlogService();