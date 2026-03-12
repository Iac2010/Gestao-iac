import React, { useState } from 'react';
import { useStore, Appointment } from '../store';
import { Calendar as BigCalendar, dateFnsLocalizer } from 'react-big-calendar';
import { format } from 'date-fns/format';
import { parse } from 'date-fns/parse';
import { startOfWeek } from 'date-fns/startOfWeek';
import { getDay } from 'date-fns/getDay';
import { ptBR } from 'date-fns/locale/pt-BR';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Plus, Calendar as CalendarIcon, Clock, AlignLeft, X } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

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
      let backgroundColor = '#3b82f6'; // blue for meetings
      
      if (event.resource.type === 'TICKET') {
        backgroundColor = '#ef4444'; // red for tickets
      } else if (event.resource.type === 'OTHER') {
        backgroundColor = '#8b5cf6'; // purple for other
      }
  
      return {
        style: {
          backgroundColor,
          borderRadius: '4px',
          opacity: 0.9,
          color: 'white',
          border: 'none',
          display: 'block',
          fontWeight: '500',
          padding: '2px 6px',
          fontSize: '0.75rem'
        }
      };
    };

  return (
    <div className="max-w-7xl mx-auto h-[calc(100vh-8rem)] flex flex-col">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 shrink-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Agenda</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Compromissos e Ordens de Serviço</p>
        </div>
        <button 
          onClick={() => {
            setStartDate(new Date().toISOString().split('T')[0] + 'T09:00');
            setEndDate(new Date().toISOString().split('T')[0] + 'T10:00');
            setIsAdding(true);
            setSelectedEvent(null);
          }}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> 
          <span>Novo Compromisso</span>
        </button>
      </div>

      <div className="flex-1 bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800 p-6 overflow-hidden flex flex-col">
        <style>{`
          .rbc-calendar { font-family: 'Inter', system-ui, sans-serif; border: none; }
          .rbc-month-view, .rbc-time-view, .rbc-header { border-color: #f3f4f6 !important; }
          .dark .rbc-month-view, .dark .rbc-time-view, .dark .rbc-header { border-color: #27272a !important; }
          .rbc-day-bg + .rbc-day-bg, .rbc-month-row + .rbc-month-row { border-color: #f3f4f6 !important; }
          .dark .rbc-day-bg + .rbc-day-bg, .dark .rbc-month-row + .rbc-month-row { border-color: #27272a !important; }
          .rbc-time-content > * + * > * { border-color: #f3f4f6 !important; }
          .dark .rbc-time-content > * + * > * { border-color: #27272a !important; }
          .rbc-timeslot-group { border-color: #f3f4f6 !important; min-height: 60px; }
          .dark .rbc-timeslot-group { border-color: #27272a !important; }
          .rbc-day-slot .rbc-time-slot { border-color: #f3f4f6 !important; }
          .dark .rbc-day-slot .rbc-time-slot { border-color: #27272a !important; }
          .rbc-off-range-bg { background-color: #f9fafb !important; }
          .dark .rbc-off-range-bg { background-color: #18181b !important; }
          .rbc-today { background-color: #eff6ff !important; }
          .dark .rbc-today { background-color: #1e3a8a20 !important; }
          .rbc-header { 
            padding: 12px 8px !important; 
            font-size: 0.875rem !important; 
            font-weight: 600 !important; 
            color: #4b5563 !important;
            background: #f9fafb !important;
            border-bottom: 1px solid #f3f4f6 !important;
          }
          .dark .rbc-header {
            color: #d1d5db !important;
            background: #18181b !important;
            border-bottom: 1px solid #27272a !important;
          }
          .rbc-button-link { font-weight: 500 !important; color: inherit !important; }
          .rbc-toolbar { margin-bottom: 24px !important; }
          .rbc-toolbar button { 
            border: 1px solid #e5e7eb !important; 
            border-radius: 6px !important; 
            padding: 8px 16px !important; 
            font-weight: 500 !important; 
            font-size: 0.875rem !important; 
            color: #374151 !important;
            background: white !important;
            transition: all 0.2s !important;
            margin-right: 8px !important;
          }
          .dark .rbc-toolbar button {
            border-color: #3f3f46 !important;
            color: #e4e4e7 !important;
            background: #27272a !important;
          }
          .rbc-toolbar button:hover { background-color: #f3f4f6 !important; }
          .dark .rbc-toolbar button:hover { background-color: #3f3f46 !important; }
          .rbc-toolbar button.rbc-active { background-color: #dc2626 !important; color: white !important; border-color: #dc2626 !important; }
          .dark .rbc-toolbar button.rbc-active { background-color: #dc2626 !important; color: white !important; border-color: #dc2626 !important; }
          .rbc-event { transition: transform 0.1s !important; border-radius: 4px !important; }
          .rbc-event:hover { transform: scale(1.02) !important; z-index: 10 !important; }
          .rbc-show-more { font-weight: 500 !important; font-size: 0.875rem !important; color: #dc2626 !important; }
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
      </div>

      {/* Add Appointment Modal */}
      {isAdding && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-zinc-800">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Novo Compromisso</h2>
              <button onClick={() => setIsAdding(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">Título *</label>
                <input 
                  type="text" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full border border-gray-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-red-500 outline-none"
                  placeholder="Ex: Reunião com fornecedor"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">Início *</label>
                  <input 
                    type="datetime-local" 
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full border border-gray-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-red-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">Fim *</label>
                  <input 
                    type="datetime-local" 
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full border border-gray-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-red-500 outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">Tipo</label>
                <select 
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="w-full border border-gray-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-red-500 outline-none"
                >
                  <option value="MEETING">Reunião</option>
                  <option value="OTHER">Outro</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">Observações</label>
                <textarea 
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full border border-gray-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-red-500 outline-none min-h-[100px] resize-none"
                />
              </div>

              <div className="pt-4 flex justify-end gap-2">
                <button 
                  type="button"
                  onClick={() => setIsAdding(false)}
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
          </div>
        </div>
      )}

      {/* View Event Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-zinc-800">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Detalhes</h2>
              <button onClick={() => setSelectedEvent(null)} className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-lg ${
                  selectedEvent.resource.type === 'TICKET' ? 'bg-red-50 text-red-600 dark:bg-red-900/20' :
                  selectedEvent.resource.type === 'MEETING' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20' :
                  'bg-purple-50 text-purple-600 dark:bg-purple-900/20'
                }`}>
                  <CalendarIcon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white">{selectedEvent.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {selectedEvent.resource.type === 'TICKET' ? 'Ordem de Serviço' : 
                     selectedEvent.resource.type === 'MEETING' ? 'Reunião' : 'Outro'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-zinc-800/50 p-4 rounded-lg">
                <Clock className="w-5 h-5 text-gray-400" />
                <div className="text-sm">
                  {selectedEvent.allDay ? 'Dia Inteiro' : (
                    <>
                      {format(selectedEvent.start, "dd/MM/yyyy 'às' HH:mm")} <br/>
                      <span className="text-gray-400">até</span> {format(selectedEvent.end, "dd/MM/yyyy 'às' HH:mm")}
                    </>
                  )}
                </div>
              </div>

              {selectedEvent.resource.notes && (
                <div className="flex items-start gap-3 text-gray-600 dark:text-gray-300 p-4 bg-gray-50 dark:bg-zinc-800/50 rounded-lg">
                  <AlignLeft className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" />
                  <p className="text-sm whitespace-pre-wrap">{selectedEvent.resource.notes}</p>
                </div>
              )}

              <div className="pt-4 flex justify-end gap-2">
                {selectedEvent.resource.type !== 'TICKET' && (
                  <button 
                    onClick={handleDelete}
                    className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg font-medium transition-colors"
                  >
                    Excluir
                  </button>
                )}
                <button 
                  onClick={() => setSelectedEvent(null)}
                  className="px-4 py-2 text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
