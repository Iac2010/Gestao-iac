import { useStore } from '../store';
import { Link } from 'react-router-dom';
import { 
  Users, FileText, Plus, Hammer, 
  DollarSign, TrendingUp, Package, Database, 
  Calendar as CalendarIcon, CloudSun, Image as ImageIcon,
  Settings, Moon, Sun, UserPlus
} from 'lucide-react';
import { demoClients, demoProducts, demoChecklistItems, demoTickets, demoQuotes, demoReceipts, demoCosts, demoAppointments } from '../demoData';

export default function Dashboard() {
  const { clients, tickets, products, receipts, costs, appointments, companyLogo, restoreData, theme, toggleTheme } = useStore();
  
  const openTickets = tickets.filter(t => t.status !== 'CONCLUIDO').length;
  const latestTicket = tickets[tickets.length - 1];
  
  const totalReceitas = receipts.reduce((acc, curr) => acc + curr.value, 0);
  const totalDespesas = costs.reduce((acc, curr) => acc + curr.value, 0);
  const saldo = totalReceitas - totalDespesas;

  const nextAppointment = appointments.find(a => new Date(a.start) > new Date()) || appointments[0];

  const handleLoadDemoData = () => {
    if (window.confirm('Isso irá substituir seus dados atuais por dados de demonstração. Deseja continuar?')) {
      restoreData({
        clients: demoClients,
        products: demoProducts,
        checklistItems: demoChecklistItems,
        tickets: demoTickets,
        quotes: demoQuotes,
        receipts: demoReceipts,
        costs: demoCosts,
        appointments: demoAppointments,
      });
    }
  };

  return (
    <div className="min-h-screen -m-6 md:-m-8 p-8 md:p-12 bg-[#004a7c] text-white overflow-x-hidden relative">
      {/* Fundo com linhas abstratas estilo Win8 */}
      <div className="absolute inset-0 opacity-20 pointer-events-none overflow-hidden">
        <svg className="w-full h-full" viewBox="0 0 1000 1000" xmlns="http://www.w3.org/2000/svg">
          <path d="M0,1000 C300,800 400,900 1000,600 L1000,1000 L0,1000 Z" fill="white" fillOpacity="0.1" />
          <path d="M0,800 C200,600 500,700 1000,400 L1000,800 L0,800 Z" fill="white" fillOpacity="0.05" />
        </svg>
      </div>

      <header className="mb-12 flex justify-between items-start relative z-10">
        <h1 className="text-6xl font-light tracking-tight">Iniciar</h1>
        <div className="flex items-center gap-6">
          <button 
            onClick={toggleTheme}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            {theme === 'dark' ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
          </button>
          <div className="text-right">
            <p className="text-xl font-medium">Administrador</p>
            <p className="text-sm opacity-60">IA COMPANY TEC</p>
          </div>
          {companyLogo ? (
            <img src={companyLogo} alt="Logo" className="w-12 h-12 rounded-full object-cover border-2 border-white/20" />
          ) : (
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
          )}
        </div>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 md:gap-3 relative z-10 max-w-[1400px] perspective-1000">
        
        {/* OS Abertas - Wide Tile */}
        <Link to="/tickets" className="col-span-2 row-span-1 bg-gradient-to-br from-[#00aba9] to-[#008a88] hover:brightness-110 transition-all p-4 flex flex-col justify-between aspect-[2/1] group relative overflow-hidden border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)] active:scale-95 hover:-translate-y-1 hover:shadow-xl">
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/20 pointer-events-none" />
          <div className="flex justify-center items-center h-full relative z-10">
            <Hammer className="w-16 h-16 text-white drop-shadow-lg group-hover:scale-110 transition-transform duration-500" />
          </div>
          <div className="flex justify-between items-end relative z-10">
            <span className="text-[11px] font-bold uppercase tracking-wider drop-shadow-md">Ordens de Serviço</span>
            <span className="text-5xl font-light drop-shadow-lg">{openTickets}</span>
          </div>
        </Link>

        {/* Clientes - Square Tile */}
        <Link to="/clients" className="col-span-1 bg-gradient-to-br from-[#da532c] to-[#b94322] hover:brightness-110 transition-all p-4 flex flex-col justify-between aspect-square group relative overflow-hidden border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)] active:scale-95 hover:-translate-y-1 hover:shadow-xl">
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/20 pointer-events-none" />
          <div className="flex justify-center items-center h-full relative z-10">
            <Users className="w-12 h-12 text-white drop-shadow-lg group-hover:scale-110 transition-transform duration-500" />
          </div>
          <div className="flex justify-between items-end relative z-10">
            <span className="text-[10px] font-bold uppercase tracking-wider drop-shadow-md">Clientes</span>
            <span className="text-2xl font-light drop-shadow-lg">{clients.length}</span>
          </div>
        </Link>

        {/* Produtos - Square Tile */}
        <Link to="/products" className="col-span-1 bg-gradient-to-br from-[#7e3878] to-[#632c5e] hover:brightness-110 transition-all p-4 flex flex-col justify-between aspect-square group relative overflow-hidden border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)] active:scale-95 hover:-translate-y-1 hover:shadow-xl">
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/20 pointer-events-none" />
          <div className="flex justify-center items-center h-full relative z-10">
            <Package className="w-12 h-12 text-white drop-shadow-lg group-hover:scale-110 transition-transform duration-500" />
          </div>
          <div className="flex justify-between items-end relative z-10">
            <span className="text-[10px] font-bold uppercase tracking-wider drop-shadow-md">Produtos</span>
            <span className="text-2xl font-light drop-shadow-lg">{products.length}</span>
          </div>
        </Link>

        {/* Financeiro - Wide Tile */}
        <Link to="/financial" className="col-span-2 bg-gradient-to-br from-[#00a300] to-[#008000] hover:brightness-110 transition-all p-4 flex flex-col justify-between aspect-[2/1] group relative overflow-hidden border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)] active:scale-95 hover:-translate-y-1 hover:shadow-xl">
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/20 pointer-events-none" />
          <div className="flex flex-col justify-center items-center h-full relative z-10">
            <TrendingUp className="w-14 h-14 text-white mb-2 drop-shadow-lg group-hover:translate-y-[-4px] transition-transform duration-500" />
            <span className="text-3xl font-light drop-shadow-lg">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(saldo)}
            </span>
          </div>
          <span className="text-[11px] font-bold uppercase tracking-wider relative z-10 drop-shadow-md">Financeiro</span>
        </Link>

        {/* Agenda - Wide Tile */}
        <Link to="/calendar" className="col-span-2 bg-gradient-to-br from-[#2d89ef] to-[#1e71cd] hover:brightness-110 transition-all p-4 flex flex-col justify-between aspect-[2/1] group relative overflow-hidden border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)] active:scale-95 hover:-translate-y-1 hover:shadow-xl">
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/20 pointer-events-none" />
          <div className="flex items-start gap-4 h-full relative z-10">
            <CalendarIcon className="w-12 h-12 text-white shrink-0 drop-shadow-lg group-hover:rotate-3 transition-transform" />
            <div className="overflow-hidden">
              <p className="text-[10px] font-bold uppercase opacity-70 mb-1 tracking-widest drop-shadow-md">Próximo Compromisso</p>
              {nextAppointment ? (
                <>
                  <p className="font-bold text-lg truncate drop-shadow-md">{nextAppointment.title}</p>
                  <p className="text-sm opacity-90 drop-shadow-sm">{new Date(nextAppointment.start).toLocaleDateString('pt-BR')}</p>
                </>
              ) : (
                <p className="text-sm italic opacity-60">Sem compromissos</p>
              )}
            </div>
          </div>
          <span className="text-[11px] font-bold uppercase tracking-wider relative z-10 drop-shadow-md">Agenda</span>
        </Link>

        {/* Clima - Wide Tile */}
        <div className="col-span-2 bg-gradient-to-br from-[#0078d7] to-[#005a9e] hover:brightness-110 transition-all p-4 flex flex-col justify-between aspect-[2/1] group relative overflow-hidden border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)] active:scale-95 hover:-translate-y-1 hover:shadow-xl cursor-default">
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/20 pointer-events-none" />
          <div className="flex items-center gap-6 h-full relative z-10">
            <div className="relative group-hover:scale-110 transition-transform duration-500">
              <Sun className="w-16 h-16 text-yellow-300 drop-shadow-[0_0_15px_rgba(253,224,71,0.5)]" />
              <CloudSun className="w-10 h-10 text-white absolute -bottom-1 -right-1 drop-shadow-lg" />
            </div>
            <div>
              <span className="text-5xl font-light drop-shadow-lg">26°</span>
              <div className="mt-1">
                <p className="text-sm font-bold uppercase tracking-wider drop-shadow-md">São Paulo</p>
                <p className="text-xs opacity-80 drop-shadow-sm">Ensolarado (claro)</p>
                <p className="text-[10px] opacity-60">26° / 13°</p>
              </div>
            </div>
          </div>
          <span className="text-[11px] font-bold uppercase tracking-wider relative z-10 drop-shadow-md">Clima</span>
        </div>

        {/* Ações Rápidas - Square Tile with 4 inside */}
        <div className="col-span-1 aspect-square grid grid-cols-2 grid-rows-2 gap-1 perspective-1000">
          <Link to="/tickets/new" title="Nova OS" className="bg-gradient-to-br from-[#ee1111] to-[#cc0000] hover:brightness-110 transition-all flex items-center justify-center relative overflow-hidden border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)] active:scale-90 group">
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 pointer-events-none" />
            <Plus className="w-6 h-6 text-white drop-shadow-lg group-hover:rotate-90 transition-transform" />
            <span className="absolute bottom-0.5 left-1 text-[7px] font-bold uppercase opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">OS</span>
          </Link>
          <Link to="/quotes" title="Novo Orçamento" className="bg-gradient-to-br from-[#ff0097] to-[#d4007d] hover:brightness-110 transition-all flex items-center justify-center relative overflow-hidden border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)] active:scale-90 group">
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 pointer-events-none" />
            <FileText className="w-6 h-6 text-white drop-shadow-lg group-hover:scale-110 transition-transform" />
            <span className="absolute bottom-0.5 left-1 text-[7px] font-bold uppercase opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">Orc.</span>
          </Link>
          <Link to="/clients" title="Novo Cliente" className="bg-gradient-to-br from-[#da532c] to-[#b94322] hover:brightness-110 transition-all flex items-center justify-center relative overflow-hidden border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)] active:scale-90 group">
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 pointer-events-none" />
            <UserPlus className="w-6 h-6 text-white drop-shadow-lg group-hover:scale-110 transition-transform" />
            <span className="absolute bottom-0.5 left-1 text-[7px] font-bold uppercase opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">Cli.</span>
          </Link>
          <Link to="/financial" title="Novo Gasto" className="bg-gradient-to-br from-[#00a300] to-[#008000] hover:brightness-110 transition-all flex items-center justify-center relative overflow-hidden border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)] active:scale-90 group">
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 pointer-events-none" />
            <DollarSign className="w-6 h-6 text-white drop-shadow-lg group-hover:scale-110 transition-transform" />
            <span className="absolute bottom-0.5 left-1 text-[7px] font-bold uppercase opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">Gasto</span>
          </Link>
        </div>

        {/* Configurações - Square Tile */}
        <Link to="/settings" className="col-span-1 bg-gradient-to-br from-[#52525b] to-[#3f3f46] hover:brightness-110 transition-all p-4 flex flex-col justify-between aspect-square group relative overflow-hidden border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)] active:scale-95 hover:-translate-y-1 hover:shadow-xl">
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/20 pointer-events-none" />
          <div className="flex justify-center items-center h-full relative z-10">
            <Settings className="w-12 h-12 text-white drop-shadow-lg group-hover:rotate-45 transition-transform duration-500" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider relative z-10 drop-shadow-md">Ajustes</span>
        </Link>

        {/* Demo Data - Square Tile */}
        <button onClick={handleLoadDemoData} className="col-span-1 bg-gradient-to-br from-[#1e293b] to-[#0f172a] hover:brightness-110 transition-all p-4 flex flex-col justify-between aspect-square group relative overflow-hidden border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)] active:scale-95 hover:-translate-y-1 hover:shadow-xl text-left">
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/20 pointer-events-none" />
          <div className="flex justify-center items-center h-full relative z-10">
            <Database className="w-12 h-12 text-white drop-shadow-lg group-hover:scale-110 transition-transform duration-500" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider relative z-10 drop-shadow-md">Demo Data</span>
        </button>

      </div>
    </div>
  );
}
