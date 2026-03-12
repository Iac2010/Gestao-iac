import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useStore, TicketType, TicketStatus } from '../store';
import { ArrowLeft, Save, X, ClipboardList, Info, Wrench, ShieldAlert, Clock, CheckCircle2, AlertCircle, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function TicketForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { clients, checklistItems, addTicket, updateTicket, tickets } = useStore();
  
  const [title, setTitle] = useState('');
  const [type, setType] = useState<TicketType>('CORRETIVA');
  const [status, setStatus] = useState<TicketStatus>('APROVADO');
  const [clientId, setClientId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [technician, setTechnician] = useState('');
  const [observations, setObservations] = useState('');
  
  // Corretiva
  const [reportedProblem, setReportedProblem] = useState('');
  const [productsForQuote, setProductsForQuote] = useState('');
  const [serviceReport, setServiceReport] = useState('');
  
  // Preventiva
  const [checklistResults, setChecklistResults] = useState<Record<string, { status: 'OK' | 'NOK' | 'NA', notes: string }>>(
    checklistItems.reduce((acc, item) => ({
      ...acc,
      [item.id]: { status: 'OK', notes: '' }
    }), {})
  );

  useEffect(() => {
    if (id) {
      const ticket = tickets.find(t => t.id === id);
      if (ticket) {
        setTitle(ticket.title || '');
        setType(ticket.type);
        setStatus(ticket.status || 'APROVADO');
        setClientId(ticket.clientId);
        setDate(ticket.date);
        setTechnician(ticket.technician);
        setObservations(ticket.observations);
        
        if (ticket.type === 'CORRETIVA') {
          setReportedProblem(ticket.reportedProblem || '');
          setProductsForQuote(ticket.productsForQuote || '');
          setServiceReport(ticket.serviceReport || '');
        } else if (ticket.type === 'PREVENTIVA' && ticket.checklistResults) {
          const results = ticket.checklistResults.reduce((acc, result) => ({
            ...acc,
            [result.taskId]: { status: result.status, notes: result.notes }
          }), {});
          // Merge with default items in case new items were added
          setChecklistResults(prev => ({ ...prev, ...results }));
        }
      }
    }
  }, [id, tickets]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const ticketData = {
      title,
      type,
      status,
      clientId,
      date,
      technician,
      observations,
      ...(type === 'CORRETIVA' ? {
        reportedProblem,
        productsForQuote,
        serviceReport
      } : {
        checklistResults: Object.entries(checklistResults).map(([taskId, data]: [string, any]) => ({
          taskId,
          status: data.status,
          notes: data.notes
        }))
      })
    };

    if (id) {
      updateTicket(id, ticketData);
    } else {
      addTicket(ticketData);
    }
    navigate('/tickets');
  };

  // Filter checklist items based on selected client
  const filteredChecklistItems = checklistItems.filter(item => {
    const itemClientIds = item.clientIds || (item.clientId ? [item.clientId] : []);
    return itemClientIds.length === 0 || itemClientIds.includes(clientId);
  });

  const categories = Array.from(new Set(filteredChecklistItems.map(item => item.category)));

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5, staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
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
        <div className="flex items-center gap-6">
          <Link to="/tickets" className="p-4 bg-white/10 hover:bg-white/20 rounded-2xl transition-all text-white border border-white/10 backdrop-blur-md shadow-xl active:scale-95">
            <ArrowLeft className="w-8 h-8" />
          </Link>
          <div>
            <h1 className="text-6xl font-light tracking-tight">
              {id ? 'Editar OS' : 'Nova OS'}
            </h1>
            <p className="text-xl opacity-60 mt-2 font-light">Preencha os dados da Ordem de Serviço</p>
          </div>
        </div>
      </header>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-5xl mx-auto w-full relative z-10 pb-20"
      >
        <form onSubmit={handleSubmit} className="space-y-10">
          {/* Informações Básicas */}
          <motion.div variants={itemVariants} className="bg-white/5 backdrop-blur-md rounded-[2.5rem] border border-white/10 p-10 shadow-2xl">
            <h2 className="text-2xl font-bold mb-10 flex items-center gap-3">
              <Info className="w-6 h-6 text-blue-400" />
              Informações Básicas
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="md:col-span-2 space-y-3">
                <label className="block text-sm font-bold uppercase tracking-widest text-white/40 ml-1">Título da Tarefa</label>
                <input 
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 focus:border-white/30 rounded-2xl px-6 py-5 outline-none transition-all text-white text-xl placeholder:text-white/10"
                  placeholder="Ex: Manutenção do Ar Condicionado"
                />
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-bold uppercase tracking-widest text-white/40 ml-1">Tipo de Ordem</label>
                <select 
                  value={type}
                  onChange={(e) => setType(e.target.value as TicketType)}
                  className="w-full bg-white/5 border border-white/10 focus:border-white/30 rounded-2xl px-6 py-5 outline-none transition-all text-white text-xl appearance-none cursor-pointer"
                >
                  <option value="CORRETIVA" className="bg-[#004a7c]">Manutenção Corretiva</option>
                  <option value="PREVENTIVA" className="bg-[#004a7c]">Manutenção Preventiva</option>
                </select>
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-bold uppercase tracking-widest text-white/40 ml-1">Status</label>
                <select 
                  value={status}
                  onChange={(e) => setStatus(e.target.value as TicketStatus)}
                  className="w-full bg-white/5 border border-white/10 focus:border-white/30 rounded-2xl px-6 py-5 outline-none transition-all text-white text-xl appearance-none cursor-pointer"
                >
                  <option value="APROVADO" className="bg-[#004a7c]">Aprovado</option>
                  <option value="AGUARDANDO_MATERIAL" className="bg-[#004a7c]">Aguardando Material</option>
                  <option value="REALIZANDO" className="bg-[#004a7c]">Realizando</option>
                  <option value="CONCLUIDO" className="bg-[#004a7c]">Concluído</option>
                </select>
              </div>
              
              <div className="space-y-3">
                <label className="block text-sm font-bold uppercase tracking-widest text-white/40 ml-1">Cliente / Condomínio</label>
                <select 
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 focus:border-white/30 rounded-2xl px-6 py-5 outline-none transition-all text-white text-xl appearance-none cursor-pointer"
                  required
                >
                  <option value="" className="bg-[#004a7c]">Selecione um cliente...</option>
                  {clients.map(client => (
                    <option key={client.id} value={client.id} className="bg-[#004a7c]">{client.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-bold uppercase tracking-widest text-white/40 ml-1">Data</label>
                <input 
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 focus:border-white/30 rounded-2xl px-6 py-5 outline-none transition-all text-white text-xl"
                />
              </div>

              <div className="md:col-span-2 space-y-3">
                <label className="block text-sm font-bold uppercase tracking-widest text-white/40 ml-1">Técnico Responsável</label>
                <input 
                  type="text"
                  value={technician}
                  onChange={(e) => setTechnician(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 focus:border-white/30 rounded-2xl px-6 py-5 outline-none transition-all text-white text-xl placeholder:text-white/10"
                  placeholder="Nome do técnico"
                />
              </div>
            </div>
          </motion.div>

          {/* Campos Específicos */}
          <AnimatePresence mode="wait">
            {type === 'CORRETIVA' ? (
              <motion.div 
                key="corretiva"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="bg-white/5 backdrop-blur-md rounded-[2.5rem] border border-white/10 p-10 shadow-2xl space-y-10"
              >
                <h2 className="text-2xl font-bold mb-10 flex items-center gap-3">
                  <Wrench className="w-6 h-6 text-red-400" />
                  Detalhes da Corretiva
                </h2>
                
                <div className="space-y-8">
                  <div className="space-y-3">
                    <label className="block text-sm font-bold uppercase tracking-widest text-white/40 ml-1">Problema Relatado</label>
                    <textarea 
                      value={reportedProblem}
                      onChange={(e) => setReportedProblem(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 focus:border-white/30 rounded-2xl px-6 py-5 outline-none transition-all text-white text-lg min-h-[120px] resize-none"
                      placeholder="Descreva o problema relatado pelo cliente..."
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="block text-sm font-bold uppercase tracking-widest text-white/40 ml-1">Produtos para Orçamento</label>
                    <textarea 
                      value={productsForQuote}
                      onChange={(e) => setProductsForQuote(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 focus:border-white/30 rounded-2xl px-6 py-5 outline-none transition-all text-white text-lg min-h-[120px] resize-none"
                      placeholder="Liste os produtos necessários, se houver..."
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="block text-sm font-bold uppercase tracking-widest text-white/40 ml-1">Relato da Ordem de Serviço</label>
                    <textarea 
                      value={serviceReport}
                      onChange={(e) => setServiceReport(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 focus:border-white/30 rounded-2xl px-6 py-5 outline-none transition-all text-white text-lg min-h-[120px] resize-none"
                      placeholder="Descreva o serviço realizado..."
                    />
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="preventiva"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-white/5 backdrop-blur-md rounded-[2.5rem] border border-white/10 p-10 shadow-2xl space-y-10"
              >
                <h2 className="text-2xl font-bold mb-10 flex items-center gap-3">
                  <ClipboardList className="w-6 h-6 text-emerald-400" />
                  Checklist do Prédio
                </h2>
                
                <div className="space-y-12">
                  {categories.map(category => (
                    <div key={category} className="space-y-6">
                      <h3 className="text-sm font-black uppercase tracking-[0.3em] text-white/20 border-b border-white/5 pb-4">{category}</h3>
                      <div className="space-y-4">
                        {filteredChecklistItems.filter(item => item.category === category).map(item => (
                          <div key={item.id} className="flex flex-col lg:flex-row lg:items-center gap-6 p-6 bg-white/5 rounded-3xl border border-white/5 hover:bg-white/10 transition-all group">
                            <div className="flex-1 font-bold text-lg text-white/80 group-hover:text-white transition-colors">{item.task}</div>
                            <div className="flex flex-col sm:flex-row items-center gap-4">
                              <select 
                                value={checklistResults[item.id]?.status || 'OK'}
                                onChange={(e) => setChecklistResults(prev => ({
                                  ...prev,
                                  [item.id]: { ...prev[item.id], status: e.target.value as any }
                                }))}
                                className={`w-full sm:w-32 border rounded-xl px-4 py-3 text-sm font-black uppercase tracking-widest outline-none transition-all appearance-none text-center cursor-pointer ${
                                  checklistResults[item.id]?.status === 'OK' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                                  checklistResults[item.id]?.status === 'NOK' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                                  'bg-white/5 text-white/40 border-white/10'
                                }`}
                              >
                                <option value="OK" className="bg-[#004a7c]">OK</option>
                                <option value="NOK" className="bg-[#004a7c]">Não OK</option>
                                <option value="NA" className="bg-[#004a7c]">N/A</option>
                              </select>
                              <div className="relative w-full sm:w-64">
                                <input 
                                  type="text"
                                  placeholder="Observações..."
                                  value={checklistResults[item.id]?.notes || ''}
                                  onChange={(e) => setChecklistResults(prev => ({
                                    ...prev,
                                    [item.id]: { ...prev[item.id], notes: e.target.value }
                                  }))}
                                  className="w-full bg-white/5 border border-white/10 focus:border-white/30 rounded-xl px-4 py-3 text-sm outline-none transition-all text-white placeholder:text-white/10"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div variants={itemVariants} className="bg-white/5 backdrop-blur-md rounded-[2.5rem] border border-white/10 p-10 shadow-2xl">
            <label className="block text-sm font-bold uppercase tracking-widest text-white/40 ml-1 mb-4">Observações Gerais</label>
            <textarea 
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              className="w-full bg-white/5 border border-white/10 focus:border-white/30 rounded-2xl px-6 py-5 outline-none transition-all text-white text-lg min-h-[120px] resize-none"
              placeholder="Alguma observação adicional importante?"
            />
          </motion.div>

          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row justify-end gap-6 pt-6">
            <button 
              type="button"
              onClick={() => navigate(-1)}
              className="px-10 py-5 text-white/40 hover:text-white font-black tracking-widest transition-all uppercase text-sm"
            >
              CANCELAR
            </button>
            <button 
              type="submit"
              className="bg-white/10 hover:bg-white/20 text-white px-12 py-5 rounded-2xl font-black tracking-widest border border-white/30 backdrop-blur-md transition-all active:scale-95 shadow-2xl flex items-center justify-center gap-3"
            >
              <Save className="w-6 h-6" /> SALVAR ORDEM DE SERVIÇO
            </button>
          </motion.div>
        </form>
      </motion.div>
    </div>
  );
}
