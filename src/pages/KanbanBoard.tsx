import React, { useState } from 'react';
import { useStore, TicketStatus, Ticket } from '../store';
import { Link } from 'react-router-dom';
import { Clock, Wrench, CheckCircle, AlertCircle, Calendar, User, Edit, Plus } from 'lucide-react';

const COLUMNS: { id: TicketStatus; title: string; icon: any; color: string; headerColor: string; bgColor: string }[] = [
  { id: 'APROVADO', title: 'Aprovado', icon: CheckCircle, color: 'text-blue-600 dark:text-blue-400', headerColor: 'bg-blue-50 dark:bg-blue-900/20', bgColor: 'bg-gray-50 dark:bg-zinc-900/50' },
  { id: 'AGUARDANDO_MATERIAL', title: 'Aguardando Material', icon: AlertCircle, color: 'text-orange-600 dark:text-orange-400', headerColor: 'bg-orange-50 dark:bg-orange-900/20', bgColor: 'bg-gray-50 dark:bg-zinc-900/50' },
  { id: 'REALIZANDO', title: 'Realizando', icon: Wrench, color: 'text-purple-600 dark:text-purple-400', headerColor: 'bg-purple-50 dark:bg-purple-900/20', bgColor: 'bg-gray-50 dark:bg-zinc-900/50' },
  { id: 'CONCLUIDO', title: 'Concluído', icon: CheckCircle, color: 'text-emerald-600 dark:text-emerald-400', headerColor: 'bg-emerald-50 dark:bg-emerald-900/20', bgColor: 'bg-gray-50 dark:bg-zinc-900/50' },
];

export default function KanbanBoard() {
  const { tickets, clients, updateTicket } = useStore();
  const [draggedTicketId, setDraggedTicketId] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, ticketId: string) => {
    setDraggedTicketId(ticketId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', ticketId);
    
    setTimeout(() => {
      const el = document.getElementById(`ticket-${ticketId}`);
      if (el) el.classList.add('opacity-50', 'scale-95');
    }, 0);
  };

  const handleDragEnd = (e: React.DragEvent, ticketId: string) => {
    setDraggedTicketId(null);
    const el = document.getElementById(`ticket-${ticketId}`);
    if (el) el.classList.remove('opacity-50', 'scale-95');
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, status: TicketStatus) => {
    e.preventDefault();
    if (!draggedTicketId) return;

    const ticket = tickets.find(t => t.id === draggedTicketId);
    if (ticket && (ticket.status || 'APROVADO') !== status) {
      updateTicket(ticket.id, { ...ticket, status });
    }
    setDraggedTicketId(null);
  };

  return (
    <div className="max-w-[1600px] mx-auto h-[calc(100vh-8rem)] flex flex-col">
      <div className="flex justify-between items-center mb-8 shrink-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Kanban</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Arraste os cards para atualizar o status</p>
        </div>
        <Link 
          to="/tickets/new"
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Nova Tarefa
        </Link>
      </div>

      <div className="flex-1 flex gap-6 overflow-x-auto pb-4 snap-x">
        {COLUMNS.map(column => {
          const columnTickets = tickets.filter(t => (t.status || 'APROVADO') === column.id);
          const Icon = column.icon;

          return (
            <div 
              key={column.id}
              className={`flex-1 min-w-[320px] max-w-[400px] flex flex-col rounded-xl border border-gray-200 dark:border-zinc-800 ${column.bgColor} snap-center`}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, column.id)}
            >
              <div className={`p-4 flex items-center justify-between rounded-t-xl border-b border-gray-200 dark:border-zinc-800 ${column.headerColor}`}>
                <div className={`flex items-center gap-2 font-semibold ${column.color}`}>
                  <Icon className="w-5 h-5" />
                  {column.title}
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold bg-white dark:bg-zinc-800 ${column.color} shadow-sm border border-gray-100 dark:border-zinc-700`}>
                  {columnTickets.length}
                </span>
              </div>

              <div className="flex-1 p-4 overflow-y-auto space-y-3 custom-scrollbar">
                {columnTickets.map(ticket => {
                  const client = clients.find(c => c.id === ticket.clientId);
                  return (
                    <div
                      key={ticket.id}
                      id={`ticket-${ticket.id}`}
                      draggable
                      onDragStart={(e) => handleDragStart(e, ticket.id)}
                      onDragEnd={(e) => handleDragEnd(e, ticket.id)}
                      className="bg-white dark:bg-zinc-900 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-zinc-800 cursor-grab active:cursor-grabbing hover:shadow-md transition-all group relative"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <span className="bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-400 px-2 py-1 rounded text-xs font-medium">
                          {ticket.type}
                        </span>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Link 
                            to={`/tickets/${ticket.id}/edit`}
                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors"
                            title="Editar"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                        </div>
                      </div>
                      
                      <h3 className="font-bold text-gray-900 dark:text-white mb-1 line-clamp-2">
                        {ticket.title || client?.name || 'Cliente Desconhecido'}
                      </h3>
                      {ticket.title && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{client?.name}</p>
                      )}
                      
                      <div className="space-y-2 mt-4 pt-4 border-t border-gray-100 dark:border-zinc-800">
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <Calendar className="w-4 h-4 shrink-0" />
                          {new Date(ticket.date).toLocaleDateString('pt-BR')}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <User className="w-4 h-4 shrink-0" />
                          <span className="truncate">{ticket.technician}</span>
                        </div>
                      </div>

                      <div className="mt-4 flex justify-end">
                        <Link 
                          to={`/tickets/${ticket.id}`}
                          className="text-sm font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                        >
                          Ver Detalhes &rarr;
                        </Link>
                      </div>
                    </div>
                  );
                })}
                
                {columnTickets.length === 0 && (
                  <div className="h-32 flex items-center justify-center text-gray-400 dark:text-gray-500 text-sm border-2 border-dashed border-gray-200 dark:border-zinc-800 rounded-lg p-8 text-center">
                    Nenhum ticket
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
