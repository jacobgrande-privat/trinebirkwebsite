import React, { useState } from 'react';
import { Plus, CreditCard as Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import RichTextEditor from '../RichTextEditor';
import { useData } from '../../contexts/DataContext';

const PageManager: React.FC = () => {
  const { pages, addPage, updatePage, deletePage } = useData();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPage, setEditingPage] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: '',
    metaDescription: '',
    published: true
  });

  const openModal = (page?: any) => {
    if (page) {
      setEditingPage(page);
      setFormData({
        title: page.title,
        slug: page.slug,
        content: page.content,
        metaDescription: page.metaDescription || '',
        published: page.published
      });
    } else {
      setEditingPage(null);
      setFormData({
        title: '',
        slug: '',
        content: '',
        metaDescription: '',
        published: true
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingPage(null);
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[æ]/g, 'ae')
      .replace(/[ø]/g, 'oe')
      .replace(/[å]/g, 'aa')
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const handleTitleChange = (title: string) => {
    setFormData({
      ...formData,
      title,
      slug: editingPage ? formData.slug : generateSlug(title)
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const pageData = {
      title: formData.title,
      slug: formData.slug,
      content: formData.content,
      metaDescription: formData.metaDescription,
      published: formData.published,
      createdBy: "1"
    };

    if (editingPage) {
      updatePage(editingPage.id, pageData);
    } else {
      addPage(pageData);
    }

    closeModal();
  };

  const handleDeletePage = (id: string) => {
    if (confirm('Er du sikker på, at du vil slette denne side?')) {
      deletePage(id);
    }
  };

  const togglePublished = (id: string) => {
    const page = pages.find(p => p.id === id);
    if (page) {
      updatePage(id, { published: !page.published });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Side Administration</h2>
        <button
          onClick={() => openModal()}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
        >
          <Plus size={20} />
          Ny Side
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Side
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  URL
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Opdateret
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Handlinger
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {pages.map((page) => (
                <tr key={page.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{page.title}</div>
                      <div className="text-sm text-gray-500 truncate max-w-xs">
                        {page.metaDescription || 'Ingen beskrivelse'}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <code className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
                      /{page.slug}
                    </code>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => togglePublished(page.id)}
                      className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full ${
                        page.published
                          ? 'bg-green-100 text-green-800 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                      } transition-colors`}
                    >
                      {page.published ? <Eye size={12} /> : <EyeOff size={12} />}
                      {page.published ? 'Publiceret' : 'Kladde'}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {page.updatedAt.toLocaleDateString('da-DK')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openModal(page)}
                        className="text-blue-600 hover:text-blue-900 p-1"
                        title="Rediger"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDeletePage(page.id)}
                        className="text-red-600 hover:text-red-900 p-1"
                        title="Slet"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">
                {editingPage ? 'Rediger Side' : 'Ny Side'}
              </h3>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Titel *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => handleTitleChange(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      URL Slug *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="url-venlig-titel"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Siden vil være tilgængelig på: /{formData.slug}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Meta beskrivelse
                  </label>
                  <textarea
                    rows={2}
                    value={formData.metaDescription}
                    onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="En kort beskrivelse til søgemaskiner (maks 160 tegn)"
                    maxLength={160}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.metaDescription.length}/160 tegn
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Indhold *
                  </label>
                  <RichTextEditor
                    content={formData.content}
                    onChange={(content) => setFormData({ ...formData, content })}
                    placeholder="Skriv sidens indhold..."
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="published"
                    checked={formData.published}
                    onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                    className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                  />
                  <label htmlFor="published" className="ml-2 block text-sm text-gray-900">
                    Publicer siden med det samme
                  </label>
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
                    {editingPage ? 'Opdater' : 'Opret'} Side
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

export default PageManager;