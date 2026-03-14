import { useState } from 'react';
import { useStore, TicketStatus } from '../store';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Trash2, Eye, Edit, Hammer, Clock, ShieldAlert, Bell, ArrowLeft, Wrench, ExternalLink, Filter, Search } from 'lucide-react';
import { Modal } from '../components/Modal';
import { motion, AnimatePresence } from 'motion/react';

export default function Tickets() {
  const navigate = useNavigate();
  const { tickets, clients, deleteTicket, updateTicket } = useStore();
  const [ticketToDelete, setTicketToDelete] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTickets = tickets.filter(ticket => {
    const client = clients.find(c => c.id === ticket.clientId);
    const searchStr = `${ticket.title} ${client?.name} ${ticket.technician} ${ticket.type}`.toLowerCase();
    return searchStr.includes(searchTerm.toLowerCase());
  });

  const preventivas = tickets.filter(t => t.type === 'PREVENTIVA').length;
  const corretivas = tickets.filter(t => t.type === 'CORRETIVA').length;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-white text-zinc-900 -m-8 p-8 md:p-12 overflow-x-hidden relative flex flex-col">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 opacity-10 pointer-events-none overflow-hidden">
        <svg className="w-full h-full" viewBox="0 0 1000 1000" xmlns="http://www.w3.org/2000/svg">
          <path d="M0,1000 C300,800 400,900 1000,600 L1000,1000 L0,1000 Z" fill="currentColor" className="text-zinc-200" fillOpacity="0.5" />
          <path d="M0,800 C200,600 500,700 1000,400 L1000,800 L0,800 Z" fill="currentColor" className="text-zinc-100" fillOpacity="0.5" />
        </svg>
      </div>

      <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10 shrink-0">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => navigate(-1)}
            className="p-4 bg-zinc-100 hover:bg-zinc-200 rounded-2xl transition-all text-zinc-600 border border-zinc-200 shadow-sm active:scale-95"
          >
            <ArrowLeft className="w-8 h-8" />
          </button>
          <div>
            <h1 className="text-6xl font-light tracking-tight text-zinc-900">Ordens de Serviço</h1>
            <p className="text-xl text-zinc-500 mt-2 font-light">Gerencie as manutenções e atendimentos</p>
          </div>
        </div>
        
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Link 
            to="/tickets/new"
            className="bg-zinc-900 hover:bg-black text-white px-10 py-5 flex items-center gap-3 border border-zinc-800 transition-all rounded-2xl shadow-xl font-bold tracking-widest uppercase text-sm"
          >
            <Plus className="w-6 h-6" />
            Nova Ordem
          </Link>
        </motion.div>
      </header>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 space-y-10"
      >
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <motion.div variants={itemVariants} className="bg-zinc-50 rounded-3xl border border-zinc-200 p-8 flex items-center justify-between shadow-sm group hover:bg-zinc-100 transition-all">
            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-zinc-400 mb-2">Corretivas</p>
              <p className="text-5xl font-black text-zinc-900">{corretivas}</p>
            </div>
            <div className="w-20 h-20 bg-red-50 rounded-2xl flex items-center justify-center text-red-500 border border-red-100 shadow-sm group-hover:scale-110 transition-transform">
              <ShieldAlert className="w-10 h-10" />
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="bg-zinc-50 rounded-3xl border border-zinc-200 p-8 flex items-center justify-between shadow-sm group hover:bg-zinc-100 transition-all">
            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-zinc-400 mb-2">Preventivas</p>
              <p className="text-5xl font-black text-zinc-900">{preventivas}</p>
            </div>
            <div className="w-20 h-20 bg-zinc-100 rounded-2xl flex items-center justify-center text-zinc-600 border border-zinc-200 shadow-sm group-hover:scale-110 transition-transform">
              <Clock className="w-10 h-10" />
            </div>
          </motion.div>
        </div>

        {/* Search and List Section */}
        <motion.div variants={itemVariants} className="bg-white rounded-[2.5rem] border border-zinc-200 shadow-xl overflow-hidden flex flex-col">
          <div className="p-8 border-b border-zinc-100 bg-zinc-50/50 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <h2 className="text-2xl font-bold tracking-tight text-zinc-900">Atividade Recente</h2>
            
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
              <input 
                type="text"
                placeholder="Buscar ordens..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white border border-zinc-200 rounded-2xl py-3 pl-12 pr-4 text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-900 transition-all"
              />
            </div>
          </div>

          <div className="divide-y divide-zinc-100">
            <AnimatePresence mode="popLayout">
              {filteredTickets.slice().reverse().map((ticket, index) => {
                const client = clients.find(c => c.id === ticket.clientId);
                const isCorretiva = ticket.type === 'CORRETIVA';

                return (
                  <motion.div 
                    layout
                    key={ticket.id} 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="p-8 hover:bg-zinc-50 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-6 group"
                  >
                    <div className="flex items-start gap-6">
                      <div className={`mt-1 p-4 rounded-2xl shadow-sm ${isCorretiva ? 'bg-red-50 text-red-500 border border-red-100' : 'bg-zinc-100 text-zinc-600 border border-zinc-200'}`}>
                        <Wrench className="w-7 h-7" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-zinc-900 group-hover:text-zinc-600 transition-colors leading-tight mb-1">
                          {ticket.title || `Manutenção ${ticket.type}`}
                        </h3>
                        <p className="text-lg text-zinc-500 font-medium mb-3">{client?.name || 'Local não especificado'}</p>
                        <div className="flex flex-wrap items-center gap-4">
                          <span className="flex items-center gap-2 text-zinc-400 font-bold text-sm uppercase tracking-wider">
                            <Clock className="w-4 h-4" />
                            {new Date(ticket.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                          </span>
                          <span className={`px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest border ${
                            ticket.status === 'CONCLUIDO' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                            ticket.status === 'REALIZANDO' ? 'bg-zinc-100 text-zinc-600 border-zinc-200' :
                            'bg-amber-50 text-amber-600 border-amber-100'
                          }`}>
                            {ticket.status}
                          </span>
                          <span className="text-zinc-400 text-sm font-medium">Técnico: {ticket.technician}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 sm:self-center self-end">
                      <Link 
                        to={`/tickets/${ticket.id}`}
                        className="p-3 bg-zinc-50 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-2xl transition-all border border-zinc-100"
                        title="Visualizar"
                      >
                        <Eye className="w-6 h-6" />
                      </Link>
                      <Link 
                        to={`/tickets/${ticket.id}/edit`}
                        className="p-3 bg-zinc-50 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-2xl transition-all border border-zinc-100"
                        title="Editar"
                      >
                        <Edit className="w-6 h-6" />
                      </Link>
                      <button 
                        onClick={() => setTicketToDelete(ticket.id)}
                        className="p-3 bg-zinc-50 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all border border-zinc-100"
                        title="Excluir"
                      >
                        <Trash2 className="w-6 h-6" />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
            
            {filteredTickets.length === 0 && (
              <div className="p-20 text-center flex flex-col items-center justify-center space-y-4">
                <Search className="w-16 h-16 text-zinc-100" />
                <div className="space-y-2">
                  <p className="text-2xl font-bold text-zinc-300">Nenhuma ordem encontrada</p>
                  <p className="text-zinc-200">Tente ajustar sua busca ou crie uma nova ordem.</p>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>

      <Modal 
        isOpen={!!ticketToDelete} 
        onClose={() => setTicketToDelete(null)} 
        title="Confirmar Exclusão"
        maxWidth="sm"
      >
        <div className="space-y-8 p-2">
          <div className="flex items-center gap-4 text-amber-400 bg-amber-400/10 p-4 rounded-2xl border border-amber-400/20">
            <ShieldAlert className="w-8 h-8 shrink-0" />
            <p className="font-medium leading-relaxed">Tem certeza que deseja excluir este atendimento? Esta ação não pode ser desfeita.</p>
          </div>
          
          <div className="flex justify-end gap-4 pt-6 border-t border-white/10">
            <button 
              onClick={() => setTicketToDelete(null)}
              className="px-8 py-4 text-white/60 hover:text-white font-bold transition-colors"
            >
              CANCELAR
            </button>
            <button 
              onClick={() => {
                if (ticketToDelete) deleteTicket(ticketToDelete);
                setTicketToDelete(null);
              }}
              className="bg-red-500 hover:bg-red-600 text-white px-8 py-4 rounded-2xl font-black tracking-widest shadow-lg shadow-red-500/20 transition-all active:scale-95"
            >
              EXCLUIR
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
