'use client';

import { useQuery, useMutation, useSubscription, useApolloClient } from '@apollo/client';
import { useParams, useRouter } from 'next/navigation';
import { EVENT, COMMENTS, MY_REGISTRATIONS } from '@/lib/graphql/queries';
import { CREATE_REGISTRATION, CREATE_COMMENT, CANCEL_REGISTRATION } from '@/lib/graphql/mutations';
import { COMMENT_ADDED, REGISTRATION_CREATED, REGISTRATION_UPDATED } from '@/lib/graphql/subscriptions';
import { Header } from '@/components/Header';
import { useAuthStore } from '@/store/auth-store';
import { useState, useEffect } from 'react';
import { format } from 'date-fns';

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, hasHydrated, token, user } = useAuthStore();
  const client = useApolloClient();
  const [commentText, setCommentText] = useState('');
  const [rating, setRating] = useState(5);

  // Get event ID from params (handle both string and array)
  const eventId = Array.isArray(params.id) ? params.id[0] : params.id;

  useEffect(() => {
    if (hasHydrated && !isAuthenticated && !token) {
      router.push('/login');
    }
  }, [hasHydrated, isAuthenticated, token, router]);

  const { data, loading, error, refetch: refetchEvent } = useQuery(EVENT, {
    variables: { id: eventId },
    skip: !hasHydrated || !isAuthenticated || !eventId,
  });

  const { data: commentsData, refetch: refetchComments } = useQuery(COMMENTS, {
    variables: { eventId: eventId },
    skip: !hasHydrated || !isAuthenticated || !eventId,
  });

  const { data: registrationsData } = useQuery(MY_REGISTRATIONS, {
    skip: !hasHydrated || !isAuthenticated,
  });

  // Реалтайм подписка на новые комментарии
  const { data: commentSubscriptionData, error: commentSubError } = useSubscription(COMMENT_ADDED, {
    variables: { eventId: eventId },
    skip: !hasHydrated || !isAuthenticated || !eventId,
    onData: ({ data: subData }) => {
      if (subData?.data?.commentAdded) {
        const newComment = subData.data.commentAdded;
        console.log('📨 Получен новый комментарий через subscription:', newComment);
        // Обновляем кэш Apollo напрямую
        try {
          const updateResult = client.cache.updateQuery(
            { query: COMMENTS, variables: { eventId: eventId } },
            (existingData: any) => {
              if (!existingData) {
                console.log('⚠️ Нет данных в кэше, делаем refetch');
                // Если данных нет, делаем refetch
                setTimeout(() => refetchComments(), 100);
                return existingData;
              }
              // Проверяем, нет ли уже такого комментария (чтобы избежать дубликатов)
              const commentExists = existingData.comments?.some((c: any) => c.id === newComment.id);
              if (commentExists) {
                console.log('⚠️ Комментарий уже существует в кэше');
                return existingData;
              }
              console.log('✅ Обновляем кэш комментариев');
              return {
                comments: [...(existingData.comments || []), newComment],
              };
            }
          );
          // Если updateQuery вернул undefined, делаем refetch
          if (!updateResult) {
            console.log('⚠️ updateQuery вернул undefined, делаем refetch');
            setTimeout(() => refetchComments(), 100);
          }
        } catch (error) {
          console.error('❌ Ошибка обновления кэша комментариев:', error);
          setTimeout(() => refetchComments(), 100);
        }
      }
    },
  });

  // Реалтайм подписка на новые регистрации
  const { data: registrationSubData, error: registrationSubError } = useSubscription(REGISTRATION_CREATED, {
    variables: { eventId: eventId },
    skip: !hasHydrated || !isAuthenticated || !eventId,
    onData: ({ data: subData }) => {
      if (subData?.data?.registrationCreated) {
        console.log('📨 Получена новая регистрация через subscription:', subData.data.registrationCreated);
        // Обновляем счетчик регистраций в кэше события
        try {
          const updateResult = client.cache.updateQuery(
            { query: EVENT, variables: { id: eventId } },
            (existingData: any) => {
              if (!existingData?.event) {
                console.log('⚠️ Нет данных события в кэше, делаем refetch');
                setTimeout(() => refetchEvent(), 100);
                return existingData;
              }
              const newCount = (existingData.event.registrationsCount || 0) + 1;
              console.log(`✅ Обновляем счетчик регистраций: ${existingData.event.registrationsCount} → ${newCount}`);
              return {
                event: {
                  ...existingData.event,
                  registrationsCount: newCount,
                },
              };
            }
          );
          // Если updateQuery вернул undefined, делаем refetch
          if (!updateResult) {
            console.log('⚠️ updateQuery вернул undefined, делаем refetch');
            setTimeout(() => refetchEvent(), 100);
          }
        } catch (error) {
          console.error('❌ Ошибка обновления кэша регистраций:', error);
          setTimeout(() => refetchEvent(), 100);
        }
      }
    },
  });

  // Реалтайм подписка на обновления регистраций
  const { data: registrationUpdatedSubData, error: registrationUpdatedSubError } = useSubscription(REGISTRATION_UPDATED, {
    variables: { eventId: eventId },
    skip: !hasHydrated || !isAuthenticated || !eventId,
    onData: ({ data: subData }) => {
      if (subData?.data?.registrationUpdated) {
        const updatedReg = subData.data.registrationUpdated;
        console.log('📨 Получено обновление регистрации через subscription:', updatedReg);
        // Если регистрация отменена, уменьшаем счетчик
        if (updatedReg.status === 'CANCELLED') {
          try {
            const updateResult = client.cache.updateQuery(
              { query: EVENT, variables: { id: eventId } },
              (existingData: any) => {
                if (!existingData?.event) {
                  console.log('⚠️ Нет данных события в кэше, делаем refetch');
                  setTimeout(() => refetchEvent(), 100);
                  return existingData;
                }
                const newCount = Math.max(0, (existingData.event.registrationsCount || 0) - 1);
                console.log(`✅ Обновляем счетчик регистраций (отмена): ${existingData.event.registrationsCount} → ${newCount}`);
                return {
                  event: {
                    ...existingData.event,
                    registrationsCount: newCount,
                  },
                };
              }
            );
            // Если updateQuery вернул undefined, делаем refetch
            if (!updateResult) {
              console.log('⚠️ updateQuery вернул undefined, делаем refetch');
              setTimeout(() => refetchEvent(), 100);
            }
          } catch (error) {
            console.error('❌ Ошибка обновления кэша при отмене регистрации:', error);
            setTimeout(() => refetchEvent(), 100);
          }
        } else {
          // Для других обновлений просто обновляем данные события
          console.log('🔄 Обновление регистрации (не отмена), делаем refetch');
          setTimeout(() => refetchEvent(), 100);
        }
      }
    },
  });

  const [createRegistration, { loading: registering }] = useMutation(CREATE_REGISTRATION, {
    // Убрали refetchQueries - подписки обновят кэш автоматически
  });

  const [cancelRegistration, { loading: canceling }] = useMutation(CANCEL_REGISTRATION, {
    // Убрали refetchQueries - подписки обновят кэш автоматически
  });

  const [createComment] = useMutation(CREATE_COMMENT, {
    // Убрали refetchQueries - подписки обновят кэш автоматически
  });


  if (!hasHydrated || !isAuthenticated || !eventId) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <Header />
        <main className="container mx-auto px-4 py-12">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <svg className="animate-spin h-12 w-12 text-primary-600 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="text-lg text-gray-600 font-medium">Загрузка события...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !data?.event) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <Header />
        <main className="container mx-auto px-4 py-12">
          <div className="max-w-md mx-auto bg-red-50 border-2 border-red-200 rounded-2xl p-6 text-center">
            <div className="text-4xl mb-4">⚠️</div>
            <h2 className="text-xl font-bold text-red-800 mb-2">Ошибка загрузки события</h2>
            <p className="text-red-600">{error?.message || 'Событие не найдено'}</p>
          </div>
        </main>
      </div>
    );
  }

  const event = data.event;
  const comments = commentsData?.comments || [];
  const registrations = registrationsData?.myRegistrations || [];
  
  // Find user's registration for this event
  const userRegistration = registrations.find(
    (reg: any) => {
      const regEventId = typeof reg.eventId === 'string' ? reg.eventId : reg.event?.id;
      return regEventId === eventId;
    }
  );

  const handleRegister = async () => {
    try {
      await createRegistration({
        variables: { input: { eventId: eventId } },
      });
      alert('Вы успешно зарегистрировались на событие!');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleCancelRegistration = async () => {
    if (!userRegistration) return;
    if (!confirm('Вы уверены, что хотите отменить регистрацию?')) return;
    
    try {
      await cancelRegistration({
        variables: { id: userRegistration.id },
      });
      alert('Регистрация успешно отменена!');
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
      alert('Комментарий успешно добавлен!');
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Header />
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-8 mb-6 border border-gray-100">
            <div className="mb-6">
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mb-4 ${
                event.status === 'PUBLISHED'
                  ? 'bg-green-100 text-green-700 border border-green-200'
                  : event.status === 'DRAFT'
                  ? 'bg-gray-100 text-gray-700 border border-gray-200'
                  : 'bg-red-100 text-red-700 border border-red-200'
              }`}>
                {event.status}
              </span>
              <h1 className="text-5xl font-extrabold text-gray-900 mb-4">{event.title}</h1>
              <p className="text-xl text-gray-600 leading-relaxed">{event.description}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 p-6 bg-gray-50 rounded-xl">
              <div className="flex items-start">
                <svg className="w-6 h-6 text-gray-500 mr-3 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Дата и время</p>
                  <p className="font-semibold text-gray-900">{format(new Date(event.date), 'PPP p')}</p>
                </div>
              </div>
              <div className="flex items-start">
                <svg className="w-6 h-6 text-gray-500 mr-3 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Место</p>
                  <p className="font-semibold text-gray-900">{event.location}</p>
                </div>
              </div>
              <div className="flex items-start">
                <svg className="w-6 h-6 text-gray-500 mr-3 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Категория</p>
                  <p className="font-semibold text-gray-900 capitalize">{event.category.toLowerCase()}</p>
                </div>
              </div>
              <div className="flex items-start">
                <svg className="w-6 h-6 text-gray-500 mr-3 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Вместимость</p>
                  <p className="font-semibold text-gray-900">
                    {event.registrationsCount} / {event.capacity} зарегистрировано
                  </p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        (event.registrationsCount / event.capacity) >= 0.9
                          ? 'bg-red-500'
                          : (event.registrationsCount / event.capacity) >= 0.7
                          ? 'bg-yellow-500'
                          : 'bg-green-500'
                      }`}
                      style={{ width: `${Math.min((event.registrationsCount / event.capacity) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
            {event.status === 'PUBLISHED' && (
              <div className="flex gap-4">
                {userRegistration ? (
                  <>
                    <div className="flex-1 px-4 py-3 bg-green-50 border-2 border-green-200 rounded-lg">
                      <p className="text-green-800 font-semibold mb-1">Вы зарегистрированы</p>
                      <p className="text-sm text-green-600">Статус: {userRegistration.status}</p>
                    </div>
                    {userRegistration.status !== 'CANCELLED' && (
                      <button
                        onClick={handleCancelRegistration}
                        disabled={canceling}
                        className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 transition-all transform hover:scale-105 font-semibold"
                      >
                        {canceling ? 'Отмена...' : 'Отменить регистрацию'}
                      </button>
                    )}
                  </>
                ) : (
                  <button
                    onClick={handleRegister}
                    disabled={registering}
                    className="px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg hover:from-primary-700 hover:to-primary-800 disabled:opacity-50 transition-all transform hover:scale-105 shadow-lg hover:shadow-xl font-semibold"
                  >
                    {registering ? 'Регистрация...' : 'Зарегистрироваться на событие'}
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-8 mb-6 border border-gray-100">
            <h2 className="text-3xl font-bold mb-6">Комментарии</h2>
            <div className="space-y-6 mb-8">
              {comments.length === 0 ? (
                <p className="text-center text-gray-500 py-8">Пока нет комментариев. Будьте первым!</p>
              ) : (
                comments.map((comment: any) => (
                  <div key={comment.id} className="border-2 border-gray-100 rounded-xl p-6 hover:shadow-md transition-all">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <span className="font-bold text-gray-900">{comment.user.name}</span>
                        <p className="text-sm text-gray-500 mt-1">
                          {format(new Date(comment.createdAt), 'PPP')}
                        </p>
                      </div>
                      {comment.rating && (
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <svg
                              key={star}
                              className={`w-5 h-5 ${
                                star <= comment.rating
                                  ? 'text-gray-700 fill-current'
                                  : 'text-gray-300'
                              }`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                      )}
                    </div>
                    <p className="text-gray-700 leading-relaxed">{comment.content}</p>
                  </div>
                ))
              )}
            </div>
            <div className="space-y-4 pt-6 border-t border-gray-200">
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Поделитесь своими мыслями об этом событии..."
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                rows={4}
              />
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-gray-700">Оценка:</span>
                  <select
                    value={rating}
                    onChange={(e) => setRating(Number(e.target.value))}
                    className="px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    {[1, 2, 3, 4, 5].map((r) => (
                      <option key={r} value={r}>
                        {r} {r === 1 ? 'звезда' : r < 5 ? 'звезды' : 'звезд'}
                      </option>
                    ))}
                  </select>
                </label>
                <button
                  onClick={handleComment}
                  className="px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all transform hover:scale-105 shadow-lg hover:shadow-xl font-semibold"
                >
                  Опубликовать комментарий
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

