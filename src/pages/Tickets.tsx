import { useState } from 'react';
import { useStore, TicketStatus } from '../store';
import { Link } from 'react-router-dom';
import { Plus, Trash2, Eye, Edit, Hammer, Clock, ShieldAlert, Bell, ArrowLeft, Wrench } from 'lucide-react';
import { Modal } from '../components/Modal';

export default function Tickets() {
  const { tickets, clients, deleteTicket, updateTicket } = useStore();
  const [ticketToDelete, setTicketToDelete] = useState<string | null>(null);

  const handleStatusChange = (ticketId: string, newStatus: TicketStatus) => {
    const ticket = tickets.find(t => t.id === ticketId);
    if (ticket) {
      updateTicket(ticketId, { ...ticket, status: newStatus });
    }
  };

  const preventivas = tickets.filter(t => t.type === 'PREVENTIVA').length;
  const corretivas = tickets.filter(t => t.type === 'CORRETIVA').length;

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Ordens de Serviço</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Gerencie as manutenções e atendimentos</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to="/tickets/new" className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
            <Plus className="w-4 h-4" /> 
            Nova Ordem
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800 p-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Corretivas</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{corretivas}</p>
          </div>
          <div className="w-12 h-12 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center text-red-600">
            <ShieldAlert className="w-6 h-6" />
          </div>
        </div>
        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800 p-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Preventivas</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{preventivas}</p>
          </div>
          <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center text-blue-600">
            <Clock className="w-6 h-6" />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800 overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-zinc-800">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Atividade Recente</h2>
        </div>
        <div className="divide-y divide-gray-100 dark:divide-zinc-800">
          {tickets.slice().reverse().map(ticket => {
            const client = clients.find(c => c.id === ticket.clientId);
            const isCorretiva = ticket.type === 'CORRETIVA';

            return (
              <div key={ticket.id} className="p-6 hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className={`mt-1 p-2 rounded-lg ${isCorretiva ? 'bg-red-50 text-red-600 dark:bg-red-900/20' : 'bg-blue-50 text-blue-600 dark:bg-blue-900/20'}`}>
                    <Wrench className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">{ticket.title || `Manutenção ${ticket.type}`}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{client?.name || 'Local não especificado'}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(ticket.date).toLocaleDateString('pt-BR')}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full font-medium ${
                        ticket.status === 'CONCLUIDO' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                        ticket.status === 'REALIZANDO' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                        'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                      }`}>
                        {ticket.status}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 sm:self-center self-end">
                  <Link 
                    to={`/tickets/${ticket.id}`}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                    title="Visualizar"
                  >
                    <Eye className="w-4 h-4" />
                  </Link>
                  <Link 
                    to={`/tickets/${ticket.id}/edit`}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                    title="Editar"
                  >
                    <Edit className="w-4 h-4" />
                  </Link>
                  <button 
                    onClick={() => setTicketToDelete(ticket.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    title="Excluir"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
          
          {tickets.length === 0 && (
            <div className="p-12 text-center text-gray-500 dark:text-gray-400">
              Nenhum atendimento registrado. Clique em "Nova Ordem" para começar.
            </div>
          )}
        </div>
      </div>

      <Modal 
        isOpen={!!ticketToDelete} 
        onClose={() => setTicketToDelete(null)} 
        title="Confirmar Exclusão"
        maxWidth="sm"
      >
        <div className="space-y-6">
          <p className="text-gray-600 dark:text-gray-400">Tem certeza que deseja excluir este atendimento? Esta ação não pode ser desfeita.</p>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-zinc-800">
            <button 
              onClick={() => setTicketToDelete(null)}
              className="px-4 py-2 text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button 
              onClick={() => {
                if (ticketToDelete) deleteTicket(ticketToDelete);
                setTicketToDelete(null);
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
