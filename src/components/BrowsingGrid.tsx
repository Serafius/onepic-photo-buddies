
import { Card } from "@/components/ui/card";
import { Heart, MessageCircle, Share2, Send } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useParams } from "react-router-dom";
import { getOrCreateVisitorId } from "@/utils/visitor";
interface Photo {
  id: string;
  image_url: string;
  title: string | null;
  description: string | null;
  category_name: string | null;
  photographer_id: string | null;
  photographer_int_id: number | null;
  photographer_name: string | null;
  photographer_profile_url: string | null;
  created_at: string;
}

interface ImageComment {
  id: string;
  image_id: string;
  author_user_id: string | null;
  author_name: string;
  author_avatar_url: string | null;
  text: string;
  created_at: string;
}

const categoryOrder = ["events", "portraits", "food", "weddings"];

export const BrowsingGrid = ({ photographerId }: { photographerId?: string }) => {
  const { category } = useParams();
  const { toast } = useToast();
  const [likedPhotos, setLikedPhotos] = useState<string[]>([]);
  const [likesCountByPhoto, setLikesCountByPhoto] = useState<Record<string, number>>({});
  const [photoData, setPhotoData] = useState<Photo[]>([]);
  const [activeCommentId, setActiveCommentId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [visitorId, setVisitorId] = useState<string | null>(null);
  const [commentsByPhoto, setCommentsByPhoto] = useState<Record<string, ImageComment[]>>({});
  const [commentLikesCount, setCommentLikesCount] = useState<Record<string, number>>({});
  const [commentLikedByVisitor, setCommentLikedByVisitor] = useState<string[]>([]);
  const [commentCountByPhoto, setCommentCountByPhoto] = useState<Record<string, number>>({});

  useEffect(() => {
    const id = getOrCreateVisitorId();
    setVisitorId(id);
    fetchPhotos();
    console.log("Current category:", category);
  }, [category, photographerId]);

  useEffect(() => {
    if (!visitorId) return;
    fetchUserLikes();
  }, [visitorId]);

  useEffect(() => {
    if (photoData.length === 0) return;
    const ids = photoData.map((p) => p.id);
    fetchLikesCounts(ids);
  }, [photoData]);
  const fetchUserLikes = async () => {
    if (!visitorId) return;

    try {
      const { data, error } = await supabase
        .from('user_likes')
        .select('image_id')
        .eq('user_id', visitorId);

      if (error) throw error;

      setLikedPhotos((data || []).map((like) => like.image_id));
    } catch (error) {
      console.error('Error fetching user likes:', error);
    }
  };

  const fetchLikesCounts = async (imageIds: string[]) => {
    try {
      if (imageIds.length === 0) return;

      const likeMap: Record<string, number> = {};
      const commentMap: Record<string, number> = {};
      const chunkSize = 40; // prevent long URLs with large IN clauses

      for (let i = 0; i < imageIds.length; i += chunkSize) {
        const chunk = imageIds.slice(i, i + chunkSize);
        const { data, error } = await supabase
          .from('portfolio_images')
          .select('id, likes_count, comments_count')
          .in('id', chunk);

        if (error) throw error;

        (data || []).forEach((row: any) => {
          likeMap[row.id] = row.likes_count || 0;
          commentMap[row.id] = row.comments_count || 0;
        });
      }

      setLikesCountByPhoto(likeMap);
      setCommentCountByPhoto(commentMap);
    } catch (err) {
      console.error('Error fetching persisted counts:', err);
    }
  };

  const fetchCommentCounts = async (imageIds: string[]) => {
    try {
      if (imageIds.length === 0) return;
      const { data, error } = await supabase
        .from('image_comments')
        .select('image_id')
        .in('image_id', imageIds);

      if (error) throw error;

      const counts: Record<string, number> = {};
      (data || []).forEach((row: any) => {
        counts[row.image_id] = (counts[row.image_id] || 0) + 1;
      });
      setCommentCountByPhoto(counts);
    } catch (err) {
      console.error('Error fetching comment counts:', err);
    }
  };

  const fetchPhotos = async () => {
    try {
      setIsLoading(true);
      let query = supabase
        .from('v_portfolio_images')
        .select(`
          id,
          image_url,
          title,
          description,
          category_name,
          photographer_id,
          photographer_int_id,
          photographer_name,
          photographer_profile_url,
          created_at
        `)
        .order('created_at', { ascending: false });

      if (category) {
        query = query.ilike('category_name', `%${category}%`);
      }
      if (photographerId) {
        const isUuid = photographerId.includes('-');
        query = isUuid
          ? query.eq('photographer_id', photographerId)
          : query.eq('photographer_int_id', Number(photographerId));
      }

      const { data, error } = await query;

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      if (data) {
        console.log('Fetched data:', data);
        
        // Group photos by category
        // Safely group photos by known categories (ignore null/unknown)
        const photosByCategory: { [key: string]: Photo[] } = {};
        const categorized: Photo[] = data.filter(photo => {
          const cat = (photo.category_name || '').toLowerCase();
          return categoryOrder.includes(cat);
        });
        const uncategorized: Photo[] = data.filter(photo => {
          const cat = (photo.category_name || '').toLowerCase();
          return !categoryOrder.includes(cat);
        });
        categoryOrder.forEach(cat => {
          photosByCategory[cat] = categorized.filter(photo => (photo.category_name || '').toLowerCase() === cat);
        });

        // Interleave photos from different categories, then append the rest
        const interleaved: Photo[] = [];
        const maxLength = Math.max(0, ...Object.values(photosByCategory).map(arr => arr.length));
        for (let i = 0; i < maxLength; i++) {
          for (const cat of categoryOrder) {
            if (photosByCategory[cat][i]) {
              interleaved.push(photosByCategory[cat][i]);
            }
          }
        }

        const finalData = interleaved.length ? [...interleaved, ...uncategorized] : (data as Photo[]);
        setPhotoData(finalData);
        fetchLikesCounts(finalData.map((p) => p.id));
      }
      } catch (error) {
      console.error('Error fetching photos:', error);
      toast({
        title: "Error",
        description: "Failed to load photos",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const syncCountsForImage = async (photoId: string) => {
    try {
      const { data, error } = await supabase
        .from('portfolio_images')
        .select('likes_count, comments_count')
        .eq('id', photoId)
        .maybeSingle();
      if (!error && data) {
        setLikesCountByPhoto((prev) => ({ ...prev, [photoId]: (data as any).likes_count || 0 }));
        setCommentCountByPhoto((prev) => ({ ...prev, [photoId]: (data as any).comments_count || 0 }));
      }
    } catch (e) {
      console.warn('Failed to sync counts for image', photoId, e);
    }
  };

  const handleLike = async (photoId: string) => {
    if (!visitorId) return;

    try {
      const alreadyLiked = likedPhotos.includes(photoId);

      // Optimistic updates
      setLikedPhotos((prev) =>
        alreadyLiked ? prev.filter((id) => id !== photoId) : [...prev, photoId]
      );
      setLikesCountByPhoto((prev) => ({
        ...prev,
        [photoId]: Math.max(0, (prev[photoId] || 0) + (alreadyLiked ? -1 : 1)),
      }));

      if (alreadyLiked) {
        await supabase
          .from('user_likes')
          .delete()
          .eq('user_id', visitorId)
          .eq('image_id', photoId);
      } else {
        await supabase
          .from('user_likes')
          .insert({
            user_id: visitorId,
            image_id: photoId,
          });
      }
      await syncCountsForImage(photoId);
    } catch (error) {
      console.error('Error handling like:', error);
      toast({
        title: "Error",
        description: "Failed to update like status",
        variant: "destructive",
      });
      // Re-sync to ensure consistency
      fetchUserLikes();
      syncCountsForImage(photoId);
    }
  };

  const handleCommentClick = (photoId: string) => {
    const opening = activeCommentId !== photoId;
    setActiveCommentId(opening ? photoId : null);
    setCommentText("");
    if (opening && !commentsByPhoto[photoId]) {
      loadCommentsForPhoto(photoId);
    }
  };

  const handleSubmitComment = async (photoId: string) => {
    const text = commentText.trim();
    if (!text) {
      toast({
        title: "Error",
        description: "Please enter a comment",
        variant: "destructive",
      });
      return;
    }

    const uid = visitorId || getOrCreateVisitorId();
    let name = "Guest";
    let avatar = `https://api.dicebear.com/7.x/thumbs/svg?seed=${uid}`;
    try {
      const authRaw = localStorage.getItem('authUser');
      if (authRaw) {
        const a = JSON.parse(authRaw);
        if (a.displayName) name = a.displayName;
        if (a.avatarUrl) avatar = a.avatarUrl;

        // Fallback: fetch from legacy tables if values are missing
        if ((!a.displayName || !a.avatarUrl) && a.userId) {
          try {
            if (a.isPhotographer) {
              const { data: p } = await supabase
                .from('Photographers')
                .select('name, profile_picture_url')
                .eq('id', parseInt(a.userId))
                .maybeSingle();
              if (p) {
                if ((p as any).name) name = (p as any).name;
                if ((p as any).profile_picture_url) avatar = (p as any).profile_picture_url;
              }
            } else {
              const { data: c } = await supabase
                .from('Clients')
                .select('name, id')
                .eq('id', parseInt(a.userId))
                .maybeSingle();
              if (c) {
                if ((c as any).name) name = (c as any).name;
                avatar = `https://i.pravatar.cc/150?u=${(c as any).id}`;
              }
            }
          } catch (e) {
            console.warn('Profile fallback fetch failed:', e);
          }
        }
      }
    } catch {}

    try {
      const { data, error } = await supabase
        .from('image_comments')
        .insert({
          image_id: photoId,
          author_user_id: uid,
          author_name: name,
          author_avatar_url: avatar,
          text,
        })
        .select()
        .single();

      if (error) throw error;

      setCommentsByPhoto((prev) => ({
        ...prev,
        [photoId]: [...(prev[photoId] || []), data as unknown as ImageComment],
      }));
      setCommentCountByPhoto((prev) => ({
        ...prev,
        [photoId]: (prev[photoId] || 0) + 1,
      }));
      setCommentText("");
      toast({
        title: "Success",
        description: "Comment added successfully",
      });
      syncCountsForImage(photoId);
    } catch (err) {
      console.error('Error adding comment:', err);
      toast({
        title: "Error",
        description: "Failed to add comment",
        variant: "destructive",
      });
    }
  };

  const loadCommentsForPhoto = async (photoId: string) => {
    try {
      const { data, error } = await supabase
        .from('image_comments')
        .select('*')
        .eq('image_id', photoId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const comments = (data || []) as unknown as ImageComment[];
      setCommentsByPhoto((prev) => ({ ...prev, [photoId]: comments }));

      const ids = comments.map((c) => c.id);
      if (ids.length > 0) {
        const { data: likesData, error: likesError } = await supabase
          .from('comment_likes')
          .select('comment_id, user_id')
          .in('comment_id', ids);

        if (likesError) throw likesError;

        const counts: Record<string, number> = {};
        const likedByVisitor: string[] = [];
        (likesData || []).forEach((row: any) => {
          counts[row.comment_id] = (counts[row.comment_id] || 0) + 1;
          if (row.user_id === visitorId) likedByVisitor.push(row.comment_id);
        });
        setCommentLikesCount((prev) => ({ ...prev, ...counts }));
        setCommentLikedByVisitor((prev) => Array.from(new Set([...prev, ...likedByVisitor])));
      }
    } catch (err) {
      console.error('Error loading comments:', err);
    }
  };

  const toggleCommentLike = async (commentId: string) => {
    const uid = visitorId || getOrCreateVisitorId();
    const already = commentLikedByVisitor.includes(commentId);

    setCommentLikedByVisitor((prev) =>
      already ? prev.filter((id) => id !== commentId) : [...prev, commentId]
    );
    setCommentLikesCount((prev) => ({
      ...prev,
      [commentId]: Math.max(0, (prev[commentId] || 0) + (already ? -1 : 1)),
    }));

    try {
      if (already) {
        await supabase
          .from('comment_likes')
          .delete()
          .eq('comment_id', commentId)
          .eq('user_id', uid);
      } else {
        await supabase.from('comment_likes').insert({
          comment_id: commentId,
          user_id: uid,
        });
      }
    } catch (err) {
      console.error('Error toggling comment like:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isLoading && photoData.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <p className="text-gray-500">No photos found{category ? ` in ${category} category` : ''}.</p>
      </div>
    );
  }

  return (
    <section className="py-8">
      <div className="space-y-6">
        {photoData.map((photo) => (
          <Card 
            key={photo.id} 
            className="overflow-hidden hover:shadow-lg transition-all duration-300"
          >
{(photo.photographer_name || photo.photographer_profile_url) && (
              <div className="p-4">
                <div className="flex items-center space-x-3 mb-4">
                  {photo.photographer_profile_url && (
                    <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                      <img
                        src={photo.photographer_profile_url}
                        alt={photo.photographer_name || 'Photographer profile'}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  )}
                  <div>
                    {photo.photographer_name && (
                      <h3 className="font-medium">{photo.photographer_name}</h3>
                    )}
                    <span className="text-sm text-gray-500 capitalize">{(photo.category_name || 'uncategorized')}</span>
                  </div>
                </div>
              </div>
            )}
            <div className="aspect-square relative">
              <img
                src={photo.image_url}
                alt={photo.title || 'Portfolio image'}
                className="object-cover w-full h-full"
                loading="lazy"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = '/placeholder.svg';
                }}
              />
            </div>
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <button 
                    onClick={() => handleLike(photo.id)}
                    className={`flex items-center space-x-1 transition-colors ${
                      likedPhotos.includes(photo.id) 
                        ? "text-red-500 hover:text-red-600" 
                        : "text-gray-600 hover:text-red-500"
                    }`}
                  >
                    <Heart 
                      className={`w-6 h-6 ${likedPhotos.includes(photo.id) ? "fill-current" : ""}`} 
                    />
                    <span className="text-sm">{likesCountByPhoto[photo.id] || 0}</span>
                  </button>
                  <button 
                    onClick={() => handleCommentClick(photo.id)}
                    className="flex items-center space-x-1 text-gray-600 hover:text-primary transition-colors"
                  >
                    <MessageCircle className="w-6 h-6" />
                    <span className="text-sm">{commentCountByPhoto[photo.id] || 0}</span>
                  </button>
                </div>
                <button className="text-gray-600 hover:text-primary transition-colors">
                  <Share2 className="w-6 h-6" />
                </button>
              </div>
              <p className="text-gray-600">
                {photo.photographer_name && (
                  <>
                    <span className="font-medium text-gray-900">{photo.photographer_name}</span>{" "}
                  </>
                )}
                {!photo.photographer_name && photo.title && (
                  <>
                    <span className="font-medium text-gray-900">{photo.title}</span>{" "}
                  </>
                )}
                {photo.description}
              </p>
                {activeCommentId === photo.id && (
                  <div className="mt-2 space-y-3">
                    <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                      {(commentsByPhoto[photo.id] || []).map((c) => (
                        <div key={c.id} className="flex items-start gap-3">
                          <img
                            src={c.author_avatar_url || '/placeholder.svg'}
                            alt={`${c.author_name} avatar`}
                            className="w-8 h-8 rounded-full object-cover"
                            loading="lazy"
                          />
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span className="font-medium">{c.author_name}</span>
                              <button
                                onClick={() => toggleCommentLike(c.id)}
                                className={`flex items-center gap-1 text-xs ${
                                  commentLikedByVisitor.includes(c.id) ? "text-red-500" : "text-gray-500"
                                }`}
                                aria-label="Like comment"
                              >
                                <Heart className={`w-4 h-4 ${commentLikedByVisitor.includes(c.id) ? 'fill-current' : ''}`} />
                                <span>{commentLikesCount[c.id] || 0}</span>
                              </button>
                            </div>
                            <p className="text-sm text-gray-700">{c.text}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder="Add a comment..."
                        className="flex-1"
                      />
                      <Button 
                        onClick={() => handleSubmitComment(photo.id)}
                        size="sm"
                        className="flex items-center gap-1"
                      >
                        <Send className="w-4 h-4" />
                        Send
                      </Button>
                    </div>
                  </div>
                )}
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
};
