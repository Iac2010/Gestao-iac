import React, { useState } from 'react';
import { useStore } from '../store';
import { Plus, Edit2, Trash2, X, CheckSquare } from 'lucide-react';
import { Modal } from '../components/Modal';

export default function ChecklistManager() {
  const { checklistItems, addChecklistItem, updateChecklistItem, deleteChecklistItem, clients } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<{
    task: string;
    category: string;
    clientIds: string[];
  }>({
    task: '',
    category: '',
    clientIds: []
  });

  const categories = Array.from(new Set(checklistItems.map(item => item.category))).filter(Boolean);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const dataToSave = {
      task: formData.task,
      category: formData.category,
      clientIds: formData.clientIds
    };
    
    if (editingId) {
      updateChecklistItem(editingId, dataToSave);
    } else {
      addChecklistItem(dataToSave);
    }
    closeModal();
  };

  const openModal = (item?: typeof checklistItems[0]) => {
    if (item) {
      // Handle legacy clientId as well
      const initialClientIds = item.clientIds || (item.clientId ? [item.clientId] : []);
      setFormData({ task: item.task, category: item.category, clientIds: initialClientIds });
      setEditingId(item.id);
    } else {
      setFormData({ task: '', category: categories[0] || '', clientIds: [] });
      setEditingId(null);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({ task: '', category: '', clientIds: [] });
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Checklist</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Configuração de tarefas preventivas</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> 
          Nova Tarefa
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {checklistItems.map(item => {
          const itemClientIds = item.clientIds || (item.clientId ? [item.clientId] : []);
          const assignedClients = clients.filter(c => itemClientIds.includes(c.id));
          
          return (
            <div key={item.id} className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800 p-6 flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="inline-block bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-400 px-2.5 py-1 rounded-md text-xs font-medium mb-2">
                    {item.category}
                  </span>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-2">{item.task}</h3>
                </div>
                <div className="flex gap-2 shrink-0 ml-4">
                  <button 
                    onClick={() => openModal(item)}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                    title="Editar"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => setItemToDelete(item.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    title="Excluir"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="mt-auto pt-4 border-t border-gray-100 dark:border-zinc-800">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  <span className="font-medium text-gray-700 dark:text-gray-300">Atribuído a: </span>
                  {assignedClients.length > 0 
                    ? assignedClients.map(c => c.name).join(', ') 
                    : 'Todos (Global)'}
                </p>
              </div>
            </div>
          );
        })}

        {checklistItems.length === 0 && (
          <div className="col-span-full py-12 text-center text-gray-500 dark:text-gray-400 bg-white dark:bg-zinc-900 rounded-xl border border-dashed border-gray-200 dark:border-zinc-800">
            Nenhuma tarefa configurada. Clique em "Nova Tarefa" para começar.
          </div>
        )}
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={closeModal} 
        title={editingId ? 'Editar Tarefa' : 'Nova Tarefa'}
        maxWidth="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">Descrição da Tarefa *</label>
            <input 
              required
              type="text" 
              value={formData.task}
              onChange={e => setFormData({...formData, task: e.target.value})}
              className="w-full border border-gray-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-red-500 outline-none"
              placeholder="Ex: Verificar iluminação de emergência"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">Categoria *</label>
            <input 
              required
              type="text" 
              list="categories"
              value={formData.category}
              onChange={e => setFormData({...formData, category: e.target.value})}
              className="w-full border border-gray-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-red-500 outline-none"
              placeholder="Ex: Elétrica, Hidráulica, Segurança..."
            />
            <datalist id="categories">
              {categories.map(cat => (
                <option key={cat} value={cat} />
              ))}
            </datalist>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-2">Atribuir a Clientes (Opcional)</label>
            <div className="max-h-48 overflow-y-auto border border-gray-200 dark:border-zinc-700 rounded-lg p-2 space-y-1 bg-gray-50 dark:bg-zinc-800/50">
              <label className="flex items-center gap-3 p-2 hover:bg-gray-100 dark:hover:bg-zinc-700 rounded-md cursor-pointer transition-colors">
                <input 
                  type="checkbox"
                  checked={formData.clientIds.length === 0}
                  onChange={() => setFormData({...formData, clientIds: []})}
                  className="w-4 h-4 text-red-600 rounded border-gray-300 focus:ring-red-500"
                />
                <span className="text-sm font-medium text-gray-900 dark:text-white">Todos (Checklist Global)</span>
              </label>
              
              {clients.map(client => (
                <label key={client.id} className="flex items-center gap-3 p-2 hover:bg-gray-100 dark:hover:bg-zinc-700 rounded-md cursor-pointer transition-colors">
                  <input 
                    type="checkbox"
                    checked={formData.clientIds.includes(client.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData({...formData, clientIds: [...formData.clientIds, client.id]});
                      } else {
                        setFormData({...formData, clientIds: formData.clientIds.filter(id => id !== client.id)});
                      }
                    }}
                    className="w-4 h-4 text-red-600 rounded border-gray-300 focus:ring-red-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-zinc-300">{client.name}</span>
                </label>
              ))}
            </div>
            <p className="text-xs text-gray-500 dark:text-zinc-400 mt-2">
              Se nenhum for selecionado, a tarefa aparecerá para todos.
            </p>
          </div>
          <div className="pt-4 flex justify-end gap-2">
            <button 
              type="button"
              onClick={closeModal}
              className="px-4 py-2 text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button 
              type="submit"
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Salvar
            </button>
          </div>
        </form>
      </Modal>

      <Modal 
        isOpen={!!itemToDelete} 
        onClose={() => setItemToDelete(null)} 
        title="Confirmar Exclusão"
        maxWidth="sm"
      >
        <div className="space-y-6">
          <p className="text-gray-600 dark:text-gray-400">Tem certeza que deseja excluir esta tarefa? Esta ação não pode ser desfeita.</p>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-zinc-800">
            <button 
              onClick={() => setItemToDelete(null)}
              className="px-4 py-2 text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button 
              onClick={() => {
                if (itemToDelete) deleteChecklistItem(itemToDelete);
                setItemToDelete(null);
              }}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Excluir
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
