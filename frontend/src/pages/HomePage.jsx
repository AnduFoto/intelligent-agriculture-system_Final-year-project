import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import communityService from '../api/communityService';
import CreatePostBox from '../components/community/CreatePostBox';
import CreatePostModal from '../components/community/CreatePostModal';
import PostCard from '../components/community/PostCard';
import FeedFilters from '../components/community/FeedFilters';
import RightCommunitySidebar from '../components/community/RightCommunitySidebar';
import CommunitySkeleton from '../components/community/CommunitySkeleton';
import CommunityEmptyState from '../components/community/CommunityEmptyState';
import { Sprout, MapPin, User, Shield, ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { message } from 'antd';

export const HomePage = () => {
  const { t } = useTranslation();
  const { user } = useAuth();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const [filters, setFilters] = useState({
    sort: 'latest',
    role: '',
    crop: null,
    region: null,
    zone: null,
    woreda: null,
    special_woreda: null,
    kebele: null,
  });

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [createModalInitialMode, setCreateModalInitialMode] = useState(null);
  const [createModalInitialFiles, setCreateModalInitialFiles] = useState([]);

  const handleOpenCreateModal = (mode = null, selectedFiles = []) => {
    setEditingPost(null);
    setCreateModalInitialMode(mode);
    setCreateModalInitialFiles(selectedFiles);
    setIsCreateModalOpen(true);
  };

  const fetchPosts = useCallback(async (pageNum = 1, append = false) => {
    if (pageNum === 1) setLoading(true);
    else setLoadingMore(true);

    try {
      const params = {
        page: pageNum,
        sort: filters.sort,
      };
      if (filters.role) params.role = filters.role;
      if (filters.crop) params.crop = filters.crop;
      if (filters.region) params.region = filters.region;
      if (filters.zone) params.zone = filters.zone;
      if (filters.woreda) params.woreda = filters.woreda;
      if (filters.special_woreda) params.special_woreda = filters.special_woreda;
      if (filters.kebele) params.kebele = filters.kebele;

      const data = await communityService.getPosts(params);
      const newPosts = data.results || data || [];

      if (append) {
        setPosts(prev => [...prev, ...newPosts]);
      } else {
        setPosts(newPosts);
      }

      setHasMore(Boolean(data.next));
      setPage(pageNum);
    } catch (err) {
      console.error('Failed to load posts:', err);
      message.error(t('community.loadError', 'Failed to load community feed.'));
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [filters, t]);

  useEffect(() => {
    fetchPosts(1, false);
  }, [fetchPosts]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleResetFilters = () => {
    setFilters({
      sort: 'latest',
      role: '',
      crop: null,
      region: null,
      zone: null,
      woreda: null,
      special_woreda: null,
      kebele: null,
    });
  };

  const handlePostCreated = async (formData) => {
    await communityService.createPost(formData);
    fetchPosts(1, false);
  };

  const handlePostUpdated = async (postId, payload) => {
    await communityService.updatePost(postId, payload);
    fetchPosts(1, false);
  };

  const handlePostDeleted = (deletedPostId) => {
    setPosts(prev => prev.filter(p => p.id !== deletedPostId));
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Actor Profile Summary & Navigation (Desktop 3-cols) */}
          <div className="hidden lg:block lg:col-span-3 space-y-5">
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-xs border border-slate-200/80 dark:border-slate-700/80 sticky top-20 text-center">
              <div className="relative inline-block mb-3">
                {user?.profile_image ? (
                  <img
                    src={user.profile_image}
                    alt=""
                    className="w-20 h-20 rounded-full object-cover ring-4 ring-emerald-500/20 shadow-md mx-auto"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-bold text-2xl flex items-center justify-center shadow-md mx-auto">
                    {user?.first_name ? user.first_name[0].toUpperCase() : 'U'}
                  </div>
                )}
              </div>

              <h2 className="font-bold text-slate-900 dark:text-white text-base">
                {user?.first_name} {user?.last_name}
              </h2>

              <div className="inline-block mt-1 px-3 py-1 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-semibold text-xs rounded-full border border-emerald-200 dark:border-emerald-800">
                {user?.role}
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700/60 text-xs text-slate-500 dark:text-slate-400 space-y-2">
                <div className="flex items-center justify-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                  <span>
                    {user?.kebele_name
                      ? `Kebele: ${user.kebele_name}`
                      : typeof user?.kebele === 'object' && user?.kebele?.name
                      ? `Kebele: ${user.kebele.name}`
                      : user?.special_woreda_name
                      ? `Special Woreda: ${user.special_woreda_name}`
                      : typeof user?.special_woreda === 'object' && user?.special_woreda?.name
                      ? `Special Woreda: ${user.special_woreda.name}`
                      : user?.woreda_name
                      ? `Woreda: ${user.woreda_name}`
                      : typeof user?.woreda === 'object' && user?.woreda?.name
                      ? `Woreda: ${user.woreda.name}`
                      : user?.region_name
                      ? `Region: ${user.region_name}`
                      : typeof user?.region === 'object' && user?.region?.name
                      ? `Region: ${user.region.name}`
                      : 'Ethiopia'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Center Column: Main Community Feed (7 cols desktop, 8 cols tablet, 12 cols mobile) */}
          <div className="col-span-1 lg:col-span-6 space-y-4">
            {/* Create Post Box */}
            <CreatePostBox user={user} onClick={handleOpenCreateModal} />

            {/* Feed Filter Component */}
            <FeedFilters
              filters={filters}
              onFilterChange={handleFilterChange}
              onResetFilters={handleResetFilters}
            />

            {/* Feed Stream */}
            {loading ? (
              <CommunitySkeleton />
            ) : posts.length === 0 ? (
              <CommunityEmptyState onCreatePostClick={() => setIsCreateModalOpen(true)} />
            ) : (
              <div className="space-y-4">
                {posts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    user={user}
                    onPostUpdated={() => fetchPosts(1, false)}
                    onPostDeleted={handlePostDeleted}
                    onEditPostRequested={(p) => {
                      setEditingPost(p);
                      setIsCreateModalOpen(true);
                    }}
                  />
                ))}

                {hasMore && (
                  <div className="text-center pt-4 pb-8">
                    <button
                      onClick={() => fetchPosts(page + 1, true)}
                      disabled={loadingMore}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-semibold text-xs rounded-xl shadow-xs transition-colors"
                    >
                      {loadingMore ? (
                        <span>Loading...</span>
                      ) : (
                        <>
                          <span>{t('community.loadMore', 'Load More Posts')}</span>
                          <ChevronDown className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column: Trending Insights & Educational Guides (Desktop 3-cols) */}
          <div className="hidden lg:block lg:col-span-3">
            <RightCommunitySidebar />
          </div>

        </div>
      </div>

      {/* Modal to Create / Edit Post */}
      <CreatePostModal
        isOpen={isCreateModalOpen}
        initialMode={createModalInitialMode}
        initialFiles={createModalInitialFiles}
        onClose={() => {
          setIsCreateModalOpen(false);
          setEditingPost(null);
          setCreateModalInitialMode(null);
          setCreateModalInitialFiles([]);
        }}
        onPostCreated={handlePostCreated}
        onPostUpdated={handlePostUpdated}
        editingPost={editingPost}
        user={user}
      />
    </div>
  );
};

export default HomePage;
