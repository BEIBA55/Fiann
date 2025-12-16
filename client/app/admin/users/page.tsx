'use client';

import { useQuery, useMutation } from '@apollo/client';
import { USERS } from '@/lib/graphql/queries';
import { UPDATE_USER, DELETE_USER } from '@/lib/graphql/mutations';
import { Header } from '@/components/Header';
import { useAuthStore } from '@/store/auth-store';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';

export default function AdminUsersPage() {
  const { isAuthenticated, hasHydrated, token, user } = useAuthStore();
  const router = useRouter();
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editRole, setEditRole] = useState<string>('');

  const { data, loading, refetch } = useQuery(USERS, {
    skip: !hasHydrated || !isAuthenticated,
  });

  const [updateUser, { loading: updating }] = useMutation(UPDATE_USER, {
    refetchQueries: [{ query: USERS }],
    awaitRefetchQueries: true,
    onCompleted: () => {
      setEditingUserId(null);
      alert('Роль пользователя обновлена!');
    },
    onError: (error) => {
      alert(`Ошибка: ${error.message}`);
    },
  });

  const [deleteUser, { loading: deleting }] = useMutation(DELETE_USER, {
    refetchQueries: [{ query: USERS }],
    awaitRefetchQueries: true,
    onCompleted: () => {
      alert('Пользователь удален!');
    },
    onError: (error) => {
      alert(`Ошибка: ${error.message}`);
    },
  });

  useEffect(() => {
    if (hasHydrated) {
      if (!isAuthenticated && !token) {
        router.push('/login');
      } else if (isAuthenticated && user?.role !== 'ADMIN') {
        router.push('/events');
      }
    }
  }, [hasHydrated, isAuthenticated, token, user, router]);

  const handleEditRole = (userId: string, currentRole: string) => {
    setEditingUserId(userId);
    setEditRole(currentRole);
  };

  const handleSaveRole = (userId: string) => {
    if (editRole && editRole !== '') {
      updateUser({
        variables: {
          id: userId,
          input: { role: editRole },
        },
      });
    }
  };

  const handleCancelEdit = () => {
    setEditingUserId(null);
    setEditRole('');
  };

  const handleDeleteUser = (userId: string, userName: string) => {
    if (confirm(`Вы уверены, что хотите удалить пользователя "${userName}"?`)) {
      deleteUser({
        variables: { id: userId },
      });
    }
  };

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
              <p className="text-lg text-gray-600 font-medium">Загрузка пользователей...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const users = data?.users || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Header />
      <main className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-5xl font-extrabold text-gray-900 mb-3 bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
            Управление пользователями
          </h1>
          <p className="text-xl text-gray-600">Администрирование пользователей системы</p>
        </div>

        {users.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">👥</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Пользователи не найдены</h2>
            <p className="text-gray-600">В системе пока нет пользователей</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Имя
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Роль
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Дата регистрации
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Действия
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((userItem: any) => (
                    <tr key={userItem.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                            <span className="text-primary-600 font-semibold">
                              {userItem.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{userItem.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-700">{userItem.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingUserId === userItem.id ? (
                          <div className="flex items-center gap-2">
                            <select
                              value={editRole}
                              onChange={(e) => setEditRole(e.target.value)}
                              className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-primary-500 focus:border-primary-500"
                            >
                              <option value="USER">USER</option>
                              <option value="ORGANIZER">ORGANIZER</option>
                              <option value="ADMIN">ADMIN</option>
                            </select>
                            <button
                              onClick={() => handleSaveRole(userItem.id)}
                              disabled={updating}
                              className="px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 text-sm"
                            >
                              {updating ? '...' : '✓'}
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="px-3 py-1 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                userItem.role === 'ADMIN'
                                  ? 'bg-purple-100 text-purple-700 border border-purple-200'
                                  : userItem.role === 'ORGANIZER'
                                  ? 'bg-blue-100 text-blue-700 border border-blue-200'
                                  : 'bg-gray-100 text-gray-700 border border-gray-200'
                              }`}
                            >
                              {userItem.role}
                            </span>
                            {userItem.id !== user?.id && (
                              <button
                                onClick={() => handleEditRole(userItem.id, userItem.role)}
                                className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                              >
                                Изменить
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-700">
                          {format(new Date(userItem.createdAt), 'PPP')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {userItem.id !== user?.id ? (
                          <button
                            onClick={() => handleDeleteUser(userItem.id, userItem.name)}
                            disabled={deleting}
                            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium shadow-md"
                          >
                            {deleting ? 'Удаление...' : 'Удалить'}
                          </button>
                        ) : (
                          <span className="text-gray-400 text-sm">Текущий пользователь</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

