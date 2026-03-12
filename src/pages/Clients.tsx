import { useState } from 'react';
import { useStore } from '../store';
import { Plus, Edit2, Trash2, Users } from 'lucide-react';
import { Modal } from '../components/Modal';

export default function Clients() {
  const { clients, addClient, updateClient, deleteClient } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [clientToDelete, setClientToDelete] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    document: '',
    contactPerson: '',
    phone: '',
    email: '',
    address: '',
    notes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateClient(editingId, formData);
    } else {
      addClient(formData);
    }
    closeModal();
  };

  const openModal = (client?: typeof clients[0]) => {
    if (client) {
      setFormData({ 
        name: client.name, 
        document: client.document || '',
        contactPerson: client.contactPerson || '',
        phone: client.phone, 
        email: client.email || '',
        address: client.address,
        notes: client.notes || ''
      });
      setEditingId(client.id);
    } else {
      setFormData({ name: '', document: '', contactPerson: '', phone: '', email: '', address: '', notes: '' });
      setEditingId(null);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({ name: '', document: '', contactPerson: '', phone: '', email: '', address: '', notes: '' });
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Clientes</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Gerencie sua carteira de clientes</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> 
          Novo Cliente
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {clients.map(client => (
          <div key={client.id} className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800 p-6 flex flex-col">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{client.name}</h3>
                {client.contactPerson && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">{client.contactPerson}</p>
                )}
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => openModal(client)}
                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                  title="Editar"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setClientToDelete(client.id)}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  title="Excluir"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="space-y-2 mt-auto pt-4 border-t border-gray-100 dark:border-zinc-800">
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <span className="font-medium mr-2">Telefone:</span> {client.phone}
              </div>
              {client.email && (
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-medium mr-2">E-mail:</span> {client.email}
                </div>
              )}
              {client.document && (
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-medium mr-2">Doc:</span> {client.document}
                </div>
              )}
            </div>
          </div>
        ))}

        {clients.length === 0 && (
          <div className="col-span-full py-12 text-center text-gray-500 dark:text-gray-400 bg-white dark:bg-zinc-900 rounded-xl border border-dashed border-gray-200 dark:border-zinc-800">
            Nenhum cliente cadastrado. Clique em "Novo Cliente" para começar.
          </div>
        )}
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={closeModal} 
        title={editingId ? 'Editar Cliente' : 'Novo Cliente'}
        maxWidth="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">Nome / Condomínio *</label>
            <input 
              required
              type="text" 
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              className="w-full border border-gray-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-red-500 outline-none"
              placeholder="Ex: Condomínio das Flores"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">CNPJ / CPF</label>
              <input 
                type="text" 
                value={formData.document}
                onChange={e => setFormData({...formData, document: e.target.value})}
                className="w-full border border-gray-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-red-500 outline-none"
                placeholder="00.000.000/0000-00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">Responsável</label>
              <input 
                type="text" 
                value={formData.contactPerson}
                onChange={e => setFormData({...formData, contactPerson: e.target.value})}
                className="w-full border border-gray-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-red-500 outline-none"
                placeholder="Nome do síndico"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">Telefone *</label>
              <input 
                required
                type="text" 
                value={formData.phone}
                onChange={e => setFormData({...formData, phone: e.target.value})}
                className="w-full border border-gray-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-red-500 outline-none"
                placeholder="(00) 00000-0000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">E-mail</label>
              <input 
                type="email" 
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
                className="w-full border border-gray-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-red-500 outline-none"
                placeholder="email@exemplo.com"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">Endereço *</label>
            <textarea 
              required
              value={formData.address}
              onChange={e => setFormData({...formData, address: e.target.value})}
              className="w-full border border-gray-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-red-500 outline-none min-h-[80px] resize-none"
              placeholder="Rua, Número, Bairro, Cidade"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">Observações</label>
            <textarea 
              value={formData.notes}
              onChange={e => setFormData({...formData, notes: e.target.value})}
              className="w-full border border-gray-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-red-500 outline-none min-h-[80px] resize-none"
              placeholder="Informações adicionais..."
            />
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
        isOpen={!!clientToDelete} 
        onClose={() => setClientToDelete(null)} 
        title="Confirmar Exclusão"
        maxWidth="sm"
      >
        <div className="space-y-6">
          <p className="text-gray-600 dark:text-gray-400">Tem certeza que deseja excluir este cliente? Esta ação não pode ser desfeita.</p>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-zinc-800">
            <button 
              onClick={() => setClientToDelete(null)}
              className="px-4 py-2 text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button 
              onClick={() => {
                if (clientToDelete) deleteClient(clientToDelete);
                setClientToDelete(null);
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
