import React, { useState, useMemo, useRef } from 'react';
import { useStore, Cost } from '../store';
import { DollarSign, TrendingUp, TrendingDown, Plus, Trash2, Wallet, FileSpreadsheet, BarChart3, Lightbulb, ArrowUpRight, ArrowDownRight, X, ArrowLeft } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { Modal } from '../components/Modal';
import Papa from 'papaparse';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Link } from 'react-router-dom';

export default function Financial() {
  const { receipts, costs, addCost, deleteCost, addReceipt, clients } = useStore();
  
  const [isAddingCost, setIsAddingCost] = useState(false);
  const [isAddingIncome, setIsAddingIncome] = useState(false);
  const [description, setDescription] = useState('');
  const [value, setValue] = useState(0);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState('Material');
  const [clientId, setClientId] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const totalIncome = receipts.reduce((sum, r) => sum + r.value, 0);
  const totalCosts = costs.reduce((sum, c) => sum + c.value, 0);
  const balance = totalIncome - totalCosts;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        let importedCosts = 0;
        let importedIncomes = 0;

        results.data.forEach((row: any) => {
          const dateKey = Object.keys(row).find(k => k.toLowerCase().includes('data') || k.toLowerCase().includes('date'));
          const descKey = Object.keys(row).find(k => k.toLowerCase().includes('desc') || k.toLowerCase().includes('histórico') || k.toLowerCase().includes('historico'));
          const valKey = Object.keys(row).find(k => k.toLowerCase().includes('valor') || k.toLowerCase().includes('value') || k.toLowerCase().includes('quantia'));
          
          if (!valKey) return;

          const description = descKey ? row[descKey] : 'Importado via CSV';
          let date = new Date().toISOString().split('T')[0];
          
          if (dateKey && row[dateKey]) {
            const dStr = row[dateKey];
            if (dStr.includes('/')) {
              const parts = dStr.split('/');
              if (parts.length === 3) {
                date = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
              }
            } else {
              date = dStr;
            }
          }

          const valStr = String(row[valKey]).replace(/[R$\s]/g, '').replace(/\./g, '').replace(',', '.');
          const value = parseFloat(valStr);

          if (isNaN(value) || value === 0) return;

          if (value < 0) {
            addCost({
              description,
              value: Math.abs(value),
              date,
              category: 'Importado'
            });
            importedCosts++;
          } else {
            const genericClientId = clients.length > 0 ? clients[0].id : '';
            if (genericClientId) {
              addReceipt({
                clientId: genericClientId,
                description,
                value,
                date
              });
              importedIncomes++;
            }
          }
        });

        alert(`Importação concluída: ${importedIncomes} receitas e ${importedCosts} despesas importadas.`);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    });
  };

  const handleAddCost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || value <= 0) {
      alert('Preencha descrição e valor válido.');
      return;
    }

    addCost({
      description,
      value,
      date,
      category
    });

    setDescription('');
    setValue(0);
    setIsAddingCost(false);
  };

  const handleAddIncome = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || value <= 0 || !clientId) {
      alert('Preencha cliente, descrição e valor válido.');
      return;
    }

    addReceipt({
      clientId,
      description,
      value,
      date
    });

    setDescription('');
    setValue(0);
    setClientId('');
    setIsAddingIncome(false);
  };

  const transactions = [
    ...receipts.map(r => ({ ...r, type: 'income' as const })),
    ...costs.map(c => ({ ...c, type: 'expense' as const }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const monthlyData = useMemo(() => {
    const dataByMonth: Record<string, { name: string, receitas: number, despesas: number, saldo: number }> = {};
    
    transactions.forEach(t => {
      const date = new Date(t.date);
      const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthName = date.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
      
      if (!dataByMonth[monthYear]) {
        dataByMonth[monthYear] = { name: monthName, receitas: 0, despesas: 0, saldo: 0 };
      }
      
      if (t.type === 'income') {
        dataByMonth[monthYear].receitas += t.value;
      } else {
        dataByMonth[monthYear].despesas += t.value;
      }
      dataByMonth[monthYear].saldo = dataByMonth[monthYear].receitas - dataByMonth[monthYear].despesas;
    });

    return Object.keys(dataByMonth)
      .sort()
      .map(key => dataByMonth[key]);
  }, [transactions]);

  const expensesByCategory = useMemo(() => {
    const data: Record<string, number> = {};
    costs.forEach(c => {
      data[c.category] = (data[c.category] || 0) + c.value;
    });
    return Object.entries(data)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [costs]);

  const insights = useMemo(() => {
    if (monthlyData.length === 0) return null;

    const bestMonth = [...monthlyData].sort((a, b) => b.saldo - a.saldo)[0];
    const worstMonth = [...monthlyData].sort((a, b) => b.despesas - a.despesas)[0];
    const topCategory = expensesByCategory.length > 0 ? expensesByCategory[0] : null;

    let growth = 0;
    if (monthlyData.length >= 2) {
      const currentMonth = monthlyData[monthlyData.length - 1];
      const previousMonth = monthlyData[monthlyData.length - 2];
      if (previousMonth.receitas > 0) {
        growth = ((currentMonth.receitas - previousMonth.receitas) / previousMonth.receitas) * 100;
      }
    }

    return {
      bestMonth,
      worstMonth,
      topCategory,
      growth
    };
  }, [monthlyData, expensesByCategory]);

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <Link to="/" className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors md:hidden text-gray-600 dark:text-gray-400">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Financeiro</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <input 
            type="file" 
            accept=".csv" 
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden" 
            id="csv-upload-financial"
          />
          <label 
            htmlFor="csv-upload-financial"
            className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors font-medium cursor-pointer shadow-sm"
          >
            <FileSpreadsheet className="w-4 h-4" /> Importar
          </label>
          <button 
            onClick={() => {
              setDescription('');
              setValue(0);
              setClientId('');
              setIsAddingIncome(true);
            }}
            className="bg-emerald-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-emerald-700 transition-colors font-medium shadow-sm"
          >
            <Plus className="w-4 h-4" /> Receita
          </button>
          <button 
            onClick={() => {
              setDescription('');
              setValue(0);
              setIsAddingCost(true);
            }}
            className="bg-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-red-700 transition-colors font-medium shadow-sm"
          >
            <Plus className="w-4 h-4" /> Custo
          </button>
        </div>
      </div>

      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-zinc-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 dark:text-gray-400 font-medium">Receitas</h3>
            <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-lg">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalIncome)}</p>
        </div>
        <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-zinc-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 dark:text-gray-400 font-medium">Despesas</h3>
            <div className="p-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg">
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalCosts)}</p>
        </div>
        <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-zinc-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 dark:text-gray-400 font-medium">Saldo</h3>
            <div className={`p-2 rounded-lg ${balance >= 0 ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400'}`}>
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <p className={`text-3xl font-bold ${balance >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-orange-600 dark:text-orange-400'}`}>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(balance)}</p>
        </div>
      </div>

      {/* Insights Section */}
      {insights && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-zinc-900 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-zinc-800 flex items-center gap-4">
            <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-lg shrink-0">
              <Lightbulb className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider mb-1">Melhor Mês</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">{insights.bestMonth.name}</p>
              <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(insights.bestMonth.saldo)}
              </p>
            </div>
          </div>
          <div className="bg-white dark:bg-zinc-900 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-zinc-800 flex items-center gap-4">
            <div className="p-3 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 rounded-lg shrink-0">
              <TrendingDown className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider mb-1">Pior Mês</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">{insights.worstMonth.name}</p>
              <p className="text-sm font-bold text-rose-600 dark:text-rose-400">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(insights.worstMonth.despesas)}
              </p>
            </div>
          </div>
          <div className="bg-white dark:bg-zinc-900 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-zinc-800 flex items-center gap-4">
            <div className="p-3 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-lg shrink-0">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider mb-1">Maior Categoria</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">{insights.topCategory?.name || 'N/A'}</p>
              <p className="text-sm font-bold text-amber-600 dark:text-amber-400">
                {insights.topCategory ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(insights.topCategory.value) : '-'}
              </p>
            </div>
          </div>
          <div className="bg-white dark:bg-zinc-900 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-zinc-800 flex items-center gap-4">
            <div className="p-3 bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400 rounded-lg shrink-0">
              {insights.growth > 0 ? (
                <ArrowUpRight className="w-6 h-6" />
              ) : insights.growth < 0 ? (
                <ArrowDownRight className="w-6 h-6" />
              ) : <TrendingUp className="w-6 h-6" />}
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider mb-1">Crescimento</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {Math.abs(insights.growth).toFixed(1)}%
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">vs mês anterior</p>
            </div>
          </div>
        </div>
      )}

      {/* Charts Section */}
      {monthlyData.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-zinc-800">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Evolução Mensal</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} tickFormatter={(value) => `R$ ${value}`} />
                  <Tooltip 
                    formatter={(value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)}
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '0.5rem' }}
                  />
                  <Legend />
                  <Bar dataKey="receitas" name="Receitas" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="despesas" name="Despesas" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-zinc-800">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Acompanhamento de Saldo</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} tickFormatter={(value) => `R$ ${value}`} />
                  <Tooltip 
                    formatter={(value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)}
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '0.5rem' }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="saldo" name="Saldo Mensal" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Transactions List */}
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Histórico</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {transactions.map(t => (
          <div key={t.id} className="bg-white dark:bg-zinc-900 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-zinc-800 flex flex-col relative group">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-gray-900 dark:text-white font-medium pr-8 line-clamp-2">{t.description}</h3>
              {t.type === 'expense' && (
                <button 
                  onClick={() => deleteCost(t.id)}
                  className="absolute top-4 right-4 p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                  title="Excluir"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
            <p className={`text-2xl font-bold mb-4 ${t.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
              {t.type === 'income' ? '+' : '-'} {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(t.value)}
            </p>
            <div className="mt-auto flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
              <span>{new Date(t.date).toLocaleDateString('pt-BR')}</span>
              <span className="bg-gray-100 dark:bg-zinc-800 px-2 py-1 rounded-md text-xs font-medium">
                {t.type === 'income' ? 'Receita' : (t as Cost).category}
              </span>
            </div>
          </div>
        ))}
        {transactions.length === 0 && (
          <div className="col-span-full py-12 text-center text-gray-500 dark:text-gray-400 bg-white dark:bg-zinc-900 rounded-xl border border-dashed border-gray-200 dark:border-zinc-800">
            Nenhuma transação registrada.
          </div>
        )}
      </div>

      {/* Add Cost Modal */}
      <Modal 
        isOpen={isAddingCost} 
        onClose={() => setIsAddingCost(false)} 
        title="Adicionar Custo"
        maxWidth="sm"
      >
        <form onSubmit={handleAddCost} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">Descrição *</label>
            <input 
              type="text" 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border border-gray-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-red-500 outline-none"
              placeholder="Ex: Compra de materiais..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">Valor (R$) *</label>
            <input 
              type="number" 
              value={value || ''}
              onChange={(e) => setValue(parseFloat(e.target.value) || 0)}
              className="w-full border border-gray-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-red-500 outline-none"
              min="0.01"
              step="0.01"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">Data *</label>
            <input 
              type="date" 
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full border border-gray-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-red-500 outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">Categoria</label>
            <select 
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full border border-gray-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-red-500 outline-none"
            >
              <option value="Material">Material</option>
              <option value="Combustível">Combustível</option>
              <option value="Alimentação">Alimentação</option>
              <option value="Ferramentas">Ferramentas</option>
              <option value="Outros">Outros</option>
            </select>
          </div>

          <div className="pt-4 flex justify-end gap-2">
            <button 
              type="button"
              onClick={() => setIsAddingCost(false)}
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

      {/* Add Income Modal */}
      <Modal 
        isOpen={isAddingIncome} 
        onClose={() => setIsAddingIncome(false)} 
        title="Adicionar Receita"
        maxWidth="sm"
      >
        <form onSubmit={handleAddIncome} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">Cliente *</label>
            <select 
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              className="w-full border border-gray-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-emerald-500 outline-none"
              required
            >
              <option value="">Selecione um cliente...</option>
              {clients.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">Descrição *</label>
            <input 
              type="text" 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border border-gray-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-emerald-500 outline-none"
              placeholder="Ex: Pagamento de serviço avulso..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">Valor (R$) *</label>
            <input 
              type="number" 
              value={value || ''}
              onChange={(e) => setValue(parseFloat(e.target.value) || 0)}
              className="w-full border border-gray-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-emerald-500 outline-none"
              min="0.01"
              step="0.01"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">Data *</label>
            <input 
              type="date" 
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full border border-gray-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-emerald-500 outline-none"
              required
            />
          </div>

          <div className="pt-4 flex justify-end gap-2">
            <button 
              type="button"
              onClick={() => setIsAddingIncome(false)}
              className="px-4 py-2 text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button 
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Salvar
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
