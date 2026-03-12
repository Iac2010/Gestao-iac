import React, { useState } from 'react';
import { useStore, TicketStatus, Ticket } from '../store';
import { Link } from 'react-router-dom';
import { Clock, Wrench, CheckCircle, AlertCircle, Calendar, User, Edit, Plus, ArrowLeft, MoreVertical, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const COLUMNS: { id: TicketStatus; title: string; icon: any; color: string; glowColor: string }[] = [
  { id: 'APROVADO', title: 'Aprovado', icon: CheckCircle, color: 'text-blue-400', glowColor: 'shadow-blue-500/20' },
  { id: 'AGUARDANDO_MATERIAL', title: 'Aguardando Material', icon: AlertCircle, color: 'text-orange-400', glowColor: 'shadow-orange-500/20' },
  { id: 'REALIZANDO', title: 'Realizando', icon: Wrench, color: 'text-purple-400', glowColor: 'shadow-purple-500/20' },
  { id: 'CONCLUIDO', title: 'Concluído', icon: CheckCircle, color: 'text-emerald-400', glowColor: 'shadow-emerald-500/20' },
];

export default function KanbanBoard() {
  const { tickets, clients, updateTicket } = useStore();
  const [draggedTicketId, setDraggedTicketId] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, ticketId: string) => {
    setDraggedTicketId(ticketId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', ticketId);
    
    // Create a ghost image or handle opacity
    setTimeout(() => {
      const el = document.getElementById(`ticket-${ticketId}`);
      if (el) el.classList.add('opacity-40', 'scale-95');
    }, 0);
  };

  const handleDragEnd = (e: React.DragEvent, ticketId: string) => {
    setDraggedTicketId(null);
    const el = document.getElementById(`ticket-${ticketId}`);
    if (el) el.classList.remove('opacity-40', 'scale-95');
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
    <div className="min-h-screen bg-[#004a7c] text-white -m-8 p-8 md:p-12 overflow-x-hidden relative flex flex-col">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 opacity-20 pointer-events-none overflow-hidden">
        <svg className="w-full h-full" viewBox="0 0 1000 1000" xmlns="http://www.w3.org/2000/svg">
          <path d="M0,1000 C300,800 400,900 1000,600 L1000,1000 L0,1000 Z" fill="white" fillOpacity="0.1" />
          <path d="M0,800 C200,600 500,700 1000,400 L1000,800 L0,800 Z" fill="white" fillOpacity="0.05" />
        </svg>
      </div>

      <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10 shrink-0">
        <div className="flex items-center gap-4">
          <Link to="/" className="p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors md:hidden text-white border border-white/10 backdrop-blur-md">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="text-6xl font-light tracking-tight">Kanban</h1>
            <p className="text-xl opacity-60 mt-2 font-light">Arraste os cards para atualizar o status</p>
          </div>
        </div>
        
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Link 
            to="/tickets/new"
            className="bg-white/10 hover:bg-white/20 text-white px-8 py-4 flex items-center gap-3 border border-white/20 backdrop-blur-md transition-all rounded-xl"
          >
            <Plus className="w-6 h-6" />
            <span className="text-lg font-medium">Nova Tarefa</span>
          </Link>
        </motion.div>
      </header>

      <div className="flex-1 flex gap-8 overflow-x-auto pb-8 snap-x relative z-10 custom-scrollbar">
        {COLUMNS.map((column, colIndex) => {
          const columnTickets = tickets.filter(t => (t.status || 'APROVADO') === column.id);
          const Icon = column.icon;

          return (
            <motion.div 
              key={column.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: colIndex * 0.1 }}
              className="flex-1 min-w-[350px] max-w-[450px] flex flex-col rounded-3xl bg-white/5 backdrop-blur-md border border-white/10 snap-center shadow-2xl overflow-hidden"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, column.id)}
            >
              <div className="p-6 flex items-center justify-between border-b border-white/10 bg-white/5">
                <div className={`flex items-center gap-3 font-bold text-lg tracking-tight ${column.color}`}>
                  <div className={`p-2 rounded-lg bg-white/10 border border-white/10 ${column.glowColor} shadow-lg`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  {column.title}
                </div>
                <span className="px-4 py-1 rounded-full text-sm font-black bg-white/10 border border-white/10 text-white/60">
                  {columnTickets.length}
                </span>
              </div>

              <div className="flex-1 p-6 overflow-y-auto space-y-4 custom-scrollbar min-h-[200px]">
                <AnimatePresence mode="popLayout">
                  {columnTickets.map(ticket => {
                    const client = clients.find(c => c.id === ticket.clientId);
                    return (
                      <motion.div
                        layout
                        key={ticket.id}
                        id={`ticket-${ticket.id}`}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        draggable
                        onDragStart={(e: any) => handleDragStart(e, ticket.id)}
                        onDragEnd={(e: any) => handleDragEnd(e, ticket.id)}
                        className="bg-white/10 hover:bg-white/15 p-6 rounded-2xl border border-white/10 cursor-grab active:cursor-grabbing transition-all group relative shadow-lg backdrop-blur-sm"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <span className="bg-white/10 text-white/60 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-widest border border-white/5">
                            {ticket.type}
                          </span>
                          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Link 
                              to={`/tickets/${ticket.id}/edit`}
                              className="p-2 text-white/40 hover:text-white hover:bg-white/10 rounded-xl transition-all"
                              title="Editar"
                            >
                              <Edit className="w-5 h-5" />
                            </Link>
                          </div>
                        </div>
                        
                        <h3 className="text-xl font-bold text-white mb-2 line-clamp-2 leading-tight group-hover:text-blue-300 transition-colors">
                          {ticket.title || client?.name || 'Cliente Desconhecido'}
                        </h3>
                        {ticket.title && (
                          <p className="text-sm text-white/40 font-medium mb-4">{client?.name}</p>
                        )}
                        
                        <div className="space-y-3 mt-6 pt-6 border-t border-white/5">
                          <div className="flex items-center gap-3 text-sm text-white/50 font-medium">
                            <Calendar className="w-4 h-4 shrink-0 opacity-40" />
                            {new Date(ticket.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                          </div>
                          <div className="flex items-center gap-3 text-sm text-white/50 font-medium">
                            <User className="w-4 h-4 shrink-0 opacity-40" />
                            <span className="truncate">{ticket.technician}</span>
                          </div>
                        </div>

                        <div className="mt-6 flex justify-end">
                          <Link 
                            to={`/tickets/${ticket.id}`}
                            className="flex items-center gap-2 text-sm font-bold text-white/40 hover:text-white transition-colors group/link"
                          >
                            <span>Ver Detalhes</span>
                            <ExternalLink className="w-4 h-4 transition-transform group-hover/link:translate-x-1" />
                          </Link>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
                
                {columnTickets.length === 0 && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="h-40 flex flex-col items-center justify-center text-white/20 border-2 border-dashed border-white/5 rounded-3xl p-8 text-center"
                  >
                    <AlertCircle className="w-8 h-8 mb-2 opacity-20" />
                    <p className="text-sm font-bold uppercase tracking-widest">Vazio</p>
                  </motion.div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
