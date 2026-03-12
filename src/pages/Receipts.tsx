import React, { useState, useRef } from 'react';
import { useStore } from '../store';
import { Download, Printer, FileText } from 'lucide-react';
import { generatePdf } from '../utils/pdfGenerator';

export default function Receipts() {
  const { clients, companyLogo, companyData, companySignature, addReceipt } = useStore();
  const [clientId, setClientId] = useState('');
  const [value, setValue] = useState<number>(0);
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isGenerating, setIsGenerating] = useState(false);

  const receiptRef = useRef<HTMLDivElement>(null);

  const selectedClient = clients.find(c => c.id === clientId);

  const handleSaveAndDownload = async () => {
    if (!clientId || value <= 0 || !description) {
      alert('Preencha todos os campos obrigatórios (Cliente, Valor e Descrição).');
      return;
    }

    if (!receiptRef.current) return;

    setIsGenerating(true);
    try {
      // Save to store
      addReceipt({
        clientId,
        value,
        description,
        date
      });

      // Generate PDF
      const fileName = `Recibo_${selectedClient?.name.replace(/\s+/g, '_')}_${date}.pdf`;
      
      await generatePdf(receiptRef.current, fileName);
      
      alert('Recibo salvo e baixado com sucesso!');
      
      // Reset form
      setClientId('');
      setValue(0);
      setDescription('');
      
    } catch (error) {
      console.error('Erro ao gerar recibo:', error);
      alert('Erro ao gerar PDF. Tente usar o botão "Imprimir" no topo da página como alternativa.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {isGenerating && (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-[9999] flex flex-col items-center justify-center">
          <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-zinc-900 font-black uppercase tracking-widest text-sm">Gerando Recibo...</p>
        </div>
      )}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 print:hidden">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Recibos</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Gere e salve recibos em PDF</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <button 
            onClick={handlePrint}
            className="flex-1 md:flex-none bg-white dark:bg-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg text-sm font-medium border border-gray-200 dark:border-zinc-700 transition-colors flex items-center justify-center gap-2"
          >
            <Printer className="w-4 h-4" /> Imprimir
          </button>
          <button 
            onClick={handleSaveAndDownload}
            disabled={isGenerating || !clientId || value <= 0 || !description}
            className="flex-1 md:flex-none bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" /> {isGenerating ? 'Gerando...' : 'Salvar e Baixar'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form */}
        <div className="lg:col-span-1 space-y-6 bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800 p-6 print:hidden">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Dados do Recibo</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Cliente *</label>
              <select 
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-900 dark:text-white rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              >
                <option value="">Selecione um cliente...</option>
                {clients.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Valor (R$) *</label>
              <input 
                type="number" 
                value={value || ''}
                onChange={(e) => setValue(parseFloat(e.target.value) || 0)}
                className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-900 dark:text-white rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                min="0"
                step="0.01"
                placeholder="0,00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Data *</label>
              <input 
                type="date" 
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-900 dark:text-white rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Referente a (Descrição) *</label>
              <textarea 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-900 dark:text-white rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all min-h-[120px] resize-none"
                placeholder="Ex: Serviços de manutenção preventiva..."
              />
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="lg:col-span-2">
          <div className="bg-gray-100 dark:bg-zinc-800/50 p-8 rounded-xl border border-gray-200 dark:border-zinc-700 overflow-x-auto print:p-0 print:bg-transparent print:border-none">
            
            {/* Actual Receipt to be printed/saved */}
            <div 
              ref={receiptRef}
              className="bg-white w-full max-w-[800px] mx-auto shadow-lg p-12 text-gray-900 print:shadow-none"
              style={{ minHeight: '1056px' }} // A4 approximate ratio
            >
              {/* Header */}
              <div className="flex justify-between items-start border-b-2 border-gray-800 pb-8 mb-8 break-inside-avoid">
                <div className="flex items-center gap-4">
                  {companyLogo ? (
                    <img src={companyLogo} alt="Logo" className="h-16 w-auto max-w-[200px] object-contain" />
                  ) : (
                    <div className="p-3 bg-red-600 rounded-lg">
                      <FileText className="w-8 h-8 text-white" />
                    </div>
                  )}
                  <div>
                    <h2 className="text-2xl font-bold uppercase tracking-wider">Recibo</h2>
                    <p className="text-gray-500 font-medium">Nº {Math.floor(Math.random() * 10000).toString().padStart(4, '0')}</p>
                  </div>
                </div>
                <div className="text-right text-sm text-gray-600">
                  {companyData ? (
                    <>
                      <p className="font-bold text-gray-900">{companyData.name}</p>
                      <p>CNPJ/CPF: {companyData.document}</p>
                      <p>{companyData.phone}</p>
                      <p>{companyData.email}</p>
                    </>
                  ) : (
                    <p className="italic">Configure os dados da empresa<br/>nas Configurações</p>
                  )}
                </div>
              </div>

              {/* Value Box */}
              <div className="flex justify-end mb-8 break-inside-avoid">
                <div className="text-3xl font-bold text-gray-900 border-2 border-gray-900 p-3 rounded-lg inline-block">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)}
                </div>
              </div>

              {/* Body */}
              <div className="space-y-8 text-lg leading-relaxed break-inside-avoid">
                <p>
                  Recebi(emos) de <strong className="uppercase">{selectedClient?.name || '__________________________________________________'}</strong>, 
                  {selectedClient?.document ? ` inscrito(a) no CNPJ/CPF sob o nº ${selectedClient.document}, ` : ' '}
                  a importância de <strong>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)}</strong>.
                </p>

                <p>
                  Referente a: <span className="italic">{description || '________________________________________________________________________________________________________________________________________________________________'}</span>
                </p>

                <p>
                  Para maior clareza, firmo(amos) o presente recibo para que produza os seus efeitos legais.
                </p>
              </div>

              {/* Footer */}
              <div className="mt-24 pt-8 text-center break-inside-avoid">
                <p className="mb-16">
                  _________________, {new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                </p>
                <div className="flex flex-col items-center w-64 mx-auto">
                  <div className="h-16 flex items-end justify-center w-full relative">
                    {companySignature && (
                      <img src={companySignature} alt="Assinatura" className="max-h-full max-w-full object-contain mb-[-8px] relative z-10" />
                    )}
                  </div>
                  <div className="border-t border-gray-800 pt-2 w-full">
                    <p className="font-bold">{companyData?.name || 'Assinatura do Recebedor'}</p>
                    {companyData?.document && <p className="text-sm text-gray-500 mt-1">{companyData.document}</p>}
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
