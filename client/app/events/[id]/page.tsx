'use client';

import { useQuery, useMutation } from '@apollo/client';
import { useParams, useRouter } from 'next/navigation';
import { EVENT, COMMENTS } from '@/lib/graphql/queries';
import { CREATE_REGISTRATION, CREATE_COMMENT, CANCEL_REGISTRATION } from '@/lib/graphql/mutations';
import { COMMENT_ADDED, REGISTRATION_CREATED } from '@/lib/graphql/subscriptions';
import { Header } from '@/components/Header';
import { useAuthStore } from '@/store/auth-store';
import { useState, useEffect } from 'react';
import { format } from 'date-fns';

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const [commentText, setCommentText] = useState('');
  const [rating, setRating] = useState(5);

  // Get event ID from params (handle both string and array)
  const eventId = Array.isArray(params.id) ? params.id[0] : params.id;

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  const { data, loading, error } = useQuery(EVENT, {
    variables: { id: eventId },
    skip: !isAuthenticated || !eventId,
  });

  const { data: commentsData } = useQuery(COMMENTS, {
    variables: { eventId: eventId },
    skip: !isAuthenticated || !eventId,
  });

  const [createRegistration, { loading: registering }] = useMutation(CREATE_REGISTRATION, {
    refetchQueries: [{ query: EVENT, variables: { id: eventId } }],
  });

  const [cancelRegistration] = useMutation(CANCEL_REGISTRATION, {
    refetchQueries: [{ query: EVENT, variables: { id: eventId } }],
  });

  const [createComment] = useMutation(CREATE_COMMENT, {
    refetchQueries: [{ query: COMMENTS, variables: { eventId: eventId } }],
  });

  // Real-time subscriptions are handled via Apollo Client subscriptions
  // Comments will be refetched automatically when new ones are added

  if (!isAuthenticated || !eventId) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto px-4 py-12">Loading...</main>
      </div>
    );
  }

  if (error || !data?.event) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto px-4 py-12">
          <div className="text-red-600">Error loading event</div>
        </main>
      </div>
    );
  }

  const event = data.event;
  const comments = commentsData?.comments || [];

  const handleRegister = async () => {
    try {
      await createRegistration({
        variables: { input: { eventId: eventId } },
      });
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleComment = async () => {
    if (!commentText.trim()) return;
    try {
      await createComment({
        variables: {
          input: {
            eventId: eventId,
            content: commentText,
            rating,
          },
        },
      });
      setCommentText('');
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-8 mb-6">
            <h1 className="text-4xl font-bold mb-4">{event.title}</h1>
            <p className="text-gray-600 mb-6">{event.description}</p>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <span className="font-semibold">Date:</span>{' '}
                {format(new Date(event.date), 'PPP p')}
              </div>
              <div>
                <span className="font-semibold">Location:</span> {event.location}
              </div>
              <div>
                <span className="font-semibold">Category:</span> {event.category}
              </div>
              <div>
                <span className="font-semibold">Capacity:</span>{' '}
                {event.registrationsCount} / {event.capacity}
              </div>
            </div>
            {event.status === 'PUBLISHED' && (
              <button
                onClick={handleRegister}
                disabled={registering}
                className="px-6 py-3 bg-primary-600 text-white rounded hover:bg-primary-700 disabled:opacity-50"
              >
                {registering ? 'Registering...' : 'Register for Event'}
              </button>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-md p-8 mb-6">
            <h2 className="text-2xl font-bold mb-4">Comments</h2>
            <div className="space-y-4 mb-6">
              {comments.map((comment: any) => (
                <div key={comment.id} className="border-b pb-4">
                  <div className="flex justify-between mb-2">
                    <span className="font-semibold">{comment.user.name}</span>
                    {comment.rating && (
                      <span className="text-yellow-500">
                        {'⭐'.repeat(comment.rating)}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-700">{comment.content}</p>
                  <p className="text-sm text-gray-500 mt-2">
                    {format(new Date(comment.createdAt), 'PPP')}
                  </p>
                </div>
              ))}
            </div>
            <div className="space-y-4">
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Add a comment..."
                className="w-full px-4 py-2 border border-gray-300 rounded-md"
                rows={3}
              />
              <div className="flex items-center gap-4">
                <label>
                  Rating:
                  <select
                    value={rating}
                    onChange={(e) => setRating(Number(e.target.value))}
                    className="ml-2 px-2 py-1 border rounded"
                  >
                    {[1, 2, 3, 4, 5].map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </label>
                <button
                  onClick={handleComment}
                  className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700"
                >
                  Post Comment
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

