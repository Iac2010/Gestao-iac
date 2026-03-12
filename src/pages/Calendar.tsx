import React, { useState } from 'react';
import { useStore, Appointment } from '../store';
import { Calendar as BigCalendar, dateFnsLocalizer } from 'react-big-calendar';
import { format } from 'date-fns/format';
import { parse } from 'date-fns/parse';
import { startOfWeek } from 'date-fns/startOfWeek';
import { getDay } from 'date-fns/getDay';
import { ptBR } from 'date-fns/locale/pt-BR';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Plus, Calendar as CalendarIcon, Clock, AlignLeft, X, ArrowLeft, Info } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { Modal } from '../components/Modal';

const locales = {
  'pt-BR': ptBR,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

export default function Calendar() {
  const { appointments, tickets, clients, addAppointment, deleteAppointment } = useStore();
  
  const [isAdding, setIsAdding] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  
  const [title, setTitle] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0] + 'T09:00');
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0] + 'T10:00');
  const [type, setType] = useState<'MEETING' | 'OTHER'>('MEETING');
  const [notes, setNotes] = useState('');

  // Map tickets to calendar events
  const ticketEvents = tickets.map(t => {
    const client = clients.find(c => c.id === t.clientId);
    return {
      id: `ticket-${t.id}`,
      title: `OS: ${client?.name || 'Desconhecido'}`,
      start: new Date(t.date + 'T08:00:00'),
      end: new Date(t.date + 'T18:00:00'),
      allDay: true,
      resource: { type: 'TICKET', originalId: t.id }
    };
  });

  // Map appointments to calendar events
  const appointmentEvents = appointments.map(a => ({
    id: a.id,
    title: a.title,
    start: new Date(a.start),
    end: new Date(a.end),
    allDay: false,
    resource: { type: a.type, notes: a.notes }
  }));

  const allEvents = [...ticketEvents, ...appointmentEvents];

  const handleSelectSlot = ({ start, end }: { start: Date, end: Date }) => {
    setStartDate(format(start, "yyyy-MM-dd'T'HH:mm"));
    setEndDate(format(end, "yyyy-MM-dd'T'HH:mm"));
    setIsAdding(true);
    setSelectedEvent(null);
  };

  const handleSelectEvent = (event: any) => {
    setSelectedEvent(event);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    addAppointment({
      title,
      start: new Date(startDate).toISOString(),
      end: new Date(endDate).toISOString(),
      type,
      notes
    });

    setIsAdding(false);
    setTitle('');
    setNotes('');
  };

  const handleDelete = () => {
    if (selectedEvent && selectedEvent.resource.type !== 'TICKET') {
      deleteAppointment(selectedEvent.id);
      setSelectedEvent(null);
    }
  };

  const eventStyleGetter = (event: any) => {
    let backgroundColor = 'rgba(59, 130, 246, 0.8)'; // blue for meetings
    let border = '1px solid rgba(59, 130, 246, 0.5)';
    
    if (event.resource.type === 'TICKET') {
      backgroundColor = 'rgba(239, 68, 68, 0.8)'; // red for tickets
      border = '1px solid rgba(239, 68, 68, 0.5)';
    } else if (event.resource.type === 'OTHER') {
      backgroundColor = 'rgba(139, 92, 246, 0.8)'; // purple for other
      border = '1px solid rgba(139, 92, 246, 0.5)';
    }

    return {
      style: {
        backgroundColor,
        borderRadius: '8px',
        opacity: 1,
        color: 'white',
        border,
        display: 'block',
        fontWeight: '600',
        padding: '4px 8px',
        fontSize: '0.75rem',
        backdropFilter: 'blur(4px)',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
      }
    };
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
            <h1 className="text-6xl font-light tracking-tight">Agenda</h1>
            <p className="text-xl opacity-60 mt-2 font-light">Compromissos e Ordens de Serviço</p>
          </div>
        </div>
        
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            setStartDate(new Date().toISOString().split('T')[0] + 'T09:00');
            setEndDate(new Date().toISOString().split('T')[0] + 'T10:00');
            setIsAdding(true);
            setSelectedEvent(null);
          }}
          className="bg-white/10 hover:bg-white/20 text-white px-8 py-4 flex items-center gap-3 border border-white/20 backdrop-blur-md transition-all rounded-xl"
        >
          <Plus className="w-6 h-6" /> 
          <span className="text-lg font-medium">Novo Compromisso</span>
        </motion.button>
      </header>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex-1 bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 p-8 shadow-2xl relative z-10 overflow-hidden flex flex-col"
      >
        <style>{`
          .rbc-calendar { font-family: 'Inter', system-ui, sans-serif; border: none; color: white; }
          .rbc-month-view, .rbc-time-view, .rbc-header { border-color: rgba(255,255,255,0.1) !important; }
          .rbc-day-bg + .rbc-day-bg, .rbc-month-row + .rbc-month-row { border-color: rgba(255,255,255,0.1) !important; }
          .rbc-time-content > * + * > * { border-color: rgba(255,255,255,0.1) !important; }
          .rbc-timeslot-group { border-color: rgba(255,255,255,0.1) !important; min-height: 80px; }
          .rbc-day-slot .rbc-time-slot { border-color: rgba(255,255,255,0.05) !important; }
          .rbc-off-range-bg { background-color: rgba(0,0,0,0.1) !important; }
          .rbc-today { background-color: rgba(255,255,255,0.05) !important; }
          .rbc-header { 
            padding: 16px 8px !important; 
            font-size: 0.75rem !important; 
            font-weight: 800 !important; 
            color: rgba(255,255,255,0.4) !important;
            background: transparent !important;
            border-bottom: 1px solid rgba(255,255,255,0.1) !important;
            text-transform: uppercase;
            letter-spacing: 0.1em;
          }
          .rbc-button-link { font-weight: 600 !important; color: inherit !important; }
          .rbc-toolbar { margin-bottom: 32px !important; }
          .rbc-toolbar button { 
            border: 1px solid rgba(255,255,255,0.1) !important; 
            border-radius: 12px !important; 
            padding: 10px 20px !important; 
            font-weight: 600 !important; 
            font-size: 0.875rem !important; 
            color: white !important;
            background: rgba(255,255,255,0.05) !important;
            transition: all 0.2s !important;
            margin-right: 8px !important;
            backdrop-filter: blur(4px);
          }
          .rbc-toolbar button:hover { background-color: rgba(255,255,255,0.1) !important; }
          .rbc-toolbar button.rbc-active { background-color: white !important; color: #004a7c !important; border-color: white !important; }
          .rbc-event { transition: all 0.2s !important; }
          .rbc-event:hover { transform: translateY(-2px) scale(1.02) !important; z-index: 10 !important; }
          .rbc-show-more { font-weight: 700 !important; font-size: 0.75rem !important; color: white !important; opacity: 0.6; }
          .rbc-time-view { border-radius: 20px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1); }
          .rbc-month-view { border-radius: 20px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1); }
          .rbc-time-header-content { border-left: 1px solid rgba(255,255,255,0.1) !important; }
          .rbc-time-content { border-top: 1px solid rgba(255,255,255,0.1) !important; }
          .rbc-label { color: rgba(255,255,255,0.4) !important; font-size: 0.75rem !important; font-weight: 600 !important; }
        `}</style>
        <BigCalendar
          localizer={localizer}
          events={allEvents}
          startAccessor="start"
          endAccessor="end"
          style={{ height: '100%' }}
          culture="pt-BR"
          messages={{
            next: "Próximo",
            previous: "Anterior",
            today: "Hoje",
            month: "Mês",
            week: "Semana",
            day: "Dia",
            agenda: "Agenda",
            date: "Data",
            time: "Hora",
            event: "Evento",
            noEventsInRange: "Não há eventos neste período."
          }}
          selectable
          onSelectSlot={handleSelectSlot}
          onSelectEvent={handleSelectEvent}
          eventPropGetter={eventStyleGetter}
        />
      </motion.div>

      {/* Add Appointment Modal */}
      <Modal 
        isOpen={isAdding} 
        onClose={() => setIsAdding(false)} 
        title="Novo Compromisso"
        maxWidth="sm"
        glass
      >
        <form onSubmit={handleSave} className="space-y-6 p-2">
          <div>
            <label className="block text-sm font-bold uppercase tracking-wider text-white/50 mb-2">Título *</label>
            <input 
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-white/5 border border-white/10 focus:border-white/30 rounded-xl px-4 py-3 outline-none transition-all text-white placeholder:text-white/30"
              placeholder="Ex: Reunião com fornecedor"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold uppercase tracking-wider text-white/50 mb-2">Início *</label>
              <input 
                type="datetime-local" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-white/5 border border-white/10 focus:border-white/30 rounded-xl px-4 py-3 outline-none transition-all text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold uppercase tracking-wider text-white/50 mb-2">Fim *</label>
              <input 
                type="datetime-local" 
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-white/5 border border-white/10 focus:border-white/30 rounded-xl px-4 py-3 outline-none transition-all text-white"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold uppercase tracking-wider text-white/50 mb-2">Tipo</label>
            <select 
              value={type}
              onChange={(e) => setType(e.target.value as any)}
              className="w-full bg-white/5 border border-white/10 focus:border-white/30 rounded-xl px-4 py-3 outline-none transition-all text-white appearance-none cursor-pointer"
            >
              <option value="MEETING" className="bg-[#004a7c]">Reunião</option>
              <option value="OTHER" className="bg-[#004a7c]">Outro</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold uppercase tracking-wider text-white/50 mb-2">Observações</label>
            <textarea 
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-white/5 border border-white/10 focus:border-white/30 rounded-xl px-4 py-3 outline-none transition-all text-white min-h-[120px] resize-none placeholder:text-white/30"
              placeholder="Detalhes adicionais sobre o compromisso..."
            />
          </div>

          <div className="pt-6 flex justify-end gap-3">
            <button 
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-6 py-3 text-white/60 hover:text-white transition-colors font-medium"
            >
              Cancelar
            </button>
            <button 
              type="submit"
              className="bg-white/10 hover:bg-white/20 text-white px-10 py-3 rounded-xl font-bold backdrop-blur-md border border-white/30 transition-all active:scale-95"
            >
              SALVAR
            </button>
          </div>
        </form>
      </Modal>

      {/* View Event Modal */}
      <Modal 
        isOpen={!!selectedEvent} 
        onClose={() => setSelectedEvent(null)} 
        title="Detalhes do Evento"
        maxWidth="sm"
        glass
      >
        {selectedEvent && (
          <div className="space-y-8 p-2">
            <div className="flex items-start gap-5">
              <div className={`p-4 rounded-2xl shrink-0 ${
                selectedEvent.resource.type === 'TICKET' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                selectedEvent.resource.type === 'MEETING' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                'bg-purple-500/20 text-purple-400 border border-purple-500/30'
              }`}>
                <CalendarIcon className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-white tracking-tight leading-tight">{selectedEvent.title}</h3>
                <p className="text-sm font-bold uppercase tracking-widest text-white/40 mt-2">
                  {selectedEvent.resource.type === 'TICKET' ? 'Ordem de Serviço' : 
                   selectedEvent.resource.type === 'MEETING' ? 'Reunião' : 'Outro'}
                </p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-4 text-white/70 bg-white/5 p-5 rounded-2xl border border-white/10">
                <Clock className="w-6 h-6 text-white/30 shrink-0" />
                <div className="text-lg font-medium">
                  {selectedEvent.allDay ? 'Dia Inteiro' : (
                    <>
                      {format(selectedEvent.start, "dd/MM/yyyy 'às' HH:mm")} <br/>
                      <span className="text-white/30 text-sm font-bold uppercase tracking-widest">até</span> {format(selectedEvent.end, "dd/MM/yyyy 'às' HH:mm")}
                    </>
                  )}
                </div>
              </div>

              {selectedEvent.resource.notes && (
                <div className="flex items-start gap-4 text-white/70 bg-white/5 p-5 rounded-2xl border border-white/10">
                  <AlignLeft className="w-6 h-6 text-white/30 mt-1 shrink-0" />
                  <p className="text-lg leading-relaxed whitespace-pre-wrap">{selectedEvent.resource.notes}</p>
                </div>
              )}
            </div>

            <div className="pt-6 flex justify-end gap-3">
              {selectedEvent.resource.type !== 'TICKET' && (
                <button 
                  onClick={handleDelete}
                  className="px-6 py-3 bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 rounded-xl font-bold border border-rose-500/30 transition-all"
                >
                  Excluir
                </button>
              )}
              <button 
                onClick={() => setSelectedEvent(null)}
                className="px-10 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold border border-white/30 transition-all"
              >
                Fechar
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
