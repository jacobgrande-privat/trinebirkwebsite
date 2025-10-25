import React, { useState } from 'react';
import { User } from '../../types';
import { useData } from '../../contexts/DataContext';
import { Plus, CreditCard as Edit, Trash2, Shield, User as UserIcon } from 'lucide-react';

const UserManager: React.FC = () => {
  const { users, addUser, updateUser, deleteUser } = useData();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'editor' as User['role'],
    password: ''
  });

  const openModal = (user?: User) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        name: user.name,
        email: user.email,
        role: user.role,
        password: ''
      });
    } else {
      setEditingUser(null);
      setFormData({
        name: '',
        email: '',
        role: 'editor',
        password: ''
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const userData: User = {
      id: editingUser?.id || Date.now().toString(),
      name: formData.name,
      email: formData.email,
      role: formData.role,
      createdAt: editingUser?.createdAt || new Date(),
      lastLogin: editingUser?.lastLogin
    };

    if (editingUser) {
      updateUser(editingUser.id, userData);
    } else {
      addUser(userData);
    }

    closeModal();
  };

  const handleDeleteUser = (id: string) => {
    if (confirm('Er du sikker på, at du vil slette denne bruger?')) {
      deleteUser(id);
    }
  };

  const getRoleInfo = (role: string) => {
    switch (role) {
      case 'admin':
        return { label: 'Administrator', color: 'bg-red-100 text-red-800', icon: Shield };
      case 'editor':
        return { label: 'Redaktør', color: 'bg-blue-100 text-blue-800', icon: UserIcon };
      default:
        return { label: 'Bruger', color: 'bg-gray-100 text-gray-800', icon: UserIcon };
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Bruger Administration</h2>
        <button
          onClick={() => openModal()}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
        >
          <Plus size={20} />
          Ny Bruger
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bruger
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rolle
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Oprettet
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sidste Login
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Handlinger
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => {
                const roleInfo = getRoleInfo(user.role);
                const RoleIcon = roleInfo.icon;
                return (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full ${roleInfo.color}`}>
                        <RoleIcon size={12} />
                        {roleInfo.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.createdAt.toLocaleDateString('da-DK')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.lastLogin ? user.lastLogin.toLocaleDateString('da-DK') : 'Aldrig'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openModal(user)}
                          className="text-blue-600 hover:text-blue-900 p-1"
                          title="Rediger"
                        >
                          <Edit size={16} />
                        </button>
                        {user.id !== '1' && ( // Don't allow deleting the main admin
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="text-red-600 hover:text-red-900 p-1"
                            title="Slet"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">
                {editingUser ? 'Rediger Bruger' : 'Ny Bruger'}
              </h3>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Navn *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rolle *
                  </label>
                  <select
                    required
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as User['role'] })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="editor">Redaktør</option>
                    <option value="admin">Administrator</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Redaktører kan redigere indhold. Administratorer har fuld adgang.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {editingUser ? 'Ny adgangskode (lad stå tom for at beholde nuværende)' : 'Adgangskode *'}
                  </label>
                  <input
                    type="password"
                    required={!editingUser}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div className="flex justify-end gap-4 pt-6 border-t">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Annuller
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                  >
                    {editingUser ? 'Opdater' : 'Opret'} Bruger
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManager;