import React, { useEffect, useState } from 'react';
import { blogService } from '../services/blogService';
import { Blog } from '../types';
import Loading from '../components/Loading';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Link, useSearchParams } from 'react-router-dom';
import { handleApiError } from '../utils/errorHandler';
import toast from 'react-hot-toast';

const BlogList: React.FC = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<any>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState<string>(searchParams.get('search') || '');
  const [tag, setTag] = useState<string | undefined>(searchParams.get('tag') || undefined);
  const [page, setPage] = useState<number>(Number(searchParams.get('page') || 1));
  const limit = 10;

  useEffect(() => {
    const q = Object.fromEntries(searchParams.entries());
    setSearch(q.search || '');
    setTag(q.tag || undefined);
    setPage(Number(q.page || 1));
  }, [searchParams]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await blogService.getBlogs({ page, limit, search, tag });
        setBlogs(res.blogs || []);
        setPagination(res.pagination);
      } catch (err) {
        const { userMessage } = handleApiError(err, 'loading blogs');
        toast.error(userMessage);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [page, search, tag]);

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params: any = {};
    if (search) params.search = search;
    if (tag) params.tag = tag;
    params.page = 1;
    setSearchParams(params);
  };

  const gotoPage = (p: number) => {
    const params: any = {};
    if (search) params.search = search;
    if (tag) params.tag = tag;
    params.page = p;
    setSearchParams(params);
  };

  if (loading) return <Loading fullScreen />;

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <form onSubmit={onSearch} className="flex gap-2 items-center">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search blogs..."
            className="px-3 py-2 border rounded-md"
          />
          <Button type="submit">Search</Button>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {blogs.map((b) => (
          <Card key={b.id}>
            <CardContent>
              <h3 className="text-lg font-semibold">
                <Link to={`/blog/${b.slug}`}>{b.title}</Link>
              </h3>
              <p className="text-sm text-gray-600 mt-2">{b.excerpt || b.summary}</p>
              <div className="mt-4 flex items-center justify-between">
                <div className="text-xs text-gray-500">
                  {b.author?.name} · {b.readTime ?? 0} min
                </div>
                <Link to={`/blog/${b.slug}`}>
                  <Button>Read</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {pagination && pagination.pages > 1 && (
        <div className="mt-6 flex items-center justify-center space-x-2">
          <Button onClick={() => gotoPage(Math.max(1, page - 1))} disabled={page <= 1}>
            Prev
          </Button>
          <span className="px-3 py-2 border rounded">{page} / {pagination.pages}</span>
          <Button onClick={() => gotoPage(Math.min(pagination.pages, page + 1))} disabled={page >= pagination.pages}>
            Next
          </Button>
        </div>
      )}
    </div>
  );
};

export default BlogList;
