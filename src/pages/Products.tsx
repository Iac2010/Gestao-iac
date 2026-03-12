import React, { useState, useRef } from 'react';
import { useStore, Product } from '../store';
import { Plus, Trash2, Edit, FileSpreadsheet, Search, Package } from 'lucide-react';
import Papa from 'papaparse';
import { Modal } from '../components/Modal';

export default function Products() {
  const { products, addProduct, updateProduct, deleteProduct, importProducts } = useStore();
  
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [formData, setFormData] = useState<Omit<Product, 'id'>>({
    code: '',
    name: '',
    description: '',
    price: 0,
    unit: 'UN'
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const parsedProducts: Omit<Product, 'id'>[] = results.data.map((row: any) => {
          const nameKey = Object.keys(row).find(k => k.toLowerCase().includes('nome') || k.toLowerCase().includes('prod'));
          const priceKey = Object.keys(row).find(k => k.toLowerCase().includes('preco') || k.toLowerCase().includes('preço') || k.toLowerCase().includes('valor'));
          const codeKey = Object.keys(row).find(k => k.toLowerCase().includes('cod') || k.toLowerCase().includes('cód'));
          const descKey = Object.keys(row).find(k => k.toLowerCase().includes('desc'));
          const unitKey = Object.keys(row).find(k => k.toLowerCase().includes('unid') || k.toLowerCase().includes('medida'));

          const name = nameKey ? row[nameKey] : Object.values(row)[0] as string;
          
          let price = 0;
          if (priceKey) {
            const priceStr = String(row[priceKey]).replace(/[R$\s]/g, '').replace(',', '.');
            price = parseFloat(priceStr);
          }

          return {
            name: name || 'Produto sem nome',
            price: isNaN(price) ? 0 : price,
            code: codeKey ? row[codeKey] : '',
            description: descKey ? row[descKey] : '',
            unit: unitKey ? row[unitKey] : 'UN'
          };
        });

        importProducts(parsedProducts);
        alert(`${parsedProducts.length} produtos importados com sucesso!`);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || formData.price < 0) return;

    if (editingId) {
      updateProduct(editingId, formData);
    } else {
      addProduct(formData);
    }

    setIsAdding(false);
    setEditingId(null);
    setFormData({ code: '', name: '', description: '', price: 0, unit: 'UN' });
  };

  const handleEdit = (product: Product) => {
    setFormData({
      code: product.code || '',
      name: product.name,
      description: product.description || '',
      price: product.price,
      unit: product.unit || 'UN'
    });
    setEditingId(product.id);
    setIsAdding(true);
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (p.code && p.code.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Produtos</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Gerencie seu catálogo de produtos e serviços</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <input 
            type="file" 
            accept=".csv" 
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden" 
            id="csv-upload-products"
          />
          <label 
            htmlFor="csv-upload-products"
            className="bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 text-gray-700 dark:text-zinc-300 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-zinc-700"
          >
            <FileSpreadsheet className="w-4 h-4" /> Importar CSV
          </label>
          <button 
            onClick={() => {
              setFormData({ code: '', name: '', description: '', price: 0, unit: 'UN' });
              setEditingId(null);
              setIsAdding(true);
            }}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> 
            Novo Produto
          </button>
        </div>
      </div>

      <div className="mb-6 max-w-md relative">
        <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input 
          type="text" 
          placeholder="Buscar por nome ou código..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map((product) => (
          <div key={product.id} className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800 p-6 flex flex-col">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{product.name}</h3>
                {product.code && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">Cód: {product.code}</p>
                )}
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => handleEdit(product)}
                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                  title="Editar"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => {
                    if (window.confirm('Tem certeza que deseja excluir este produto?')) {
                      deleteProduct(product.id);
                    }
                  }}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  title="Excluir"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="mt-auto pt-4 border-t border-gray-100 dark:border-zinc-800 flex justify-between items-end">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Preço ({product.unit || 'UN'})</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price)}
                </p>
              </div>
            </div>
          </div>
        ))}

        {filteredProducts.length === 0 && (
          <div className="col-span-full py-12 text-center text-gray-500 dark:text-gray-400 bg-white dark:bg-zinc-900 rounded-xl border border-dashed border-gray-200 dark:border-zinc-800">
            Nenhum produto encontrado. Clique em "Novo Produto" para cadastrar.
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal 
        isOpen={isAdding} 
        onClose={() => setIsAdding(false)} 
        title={editingId ? 'Editar Produto' : 'Novo Produto'}
        maxWidth="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">Nome *</label>
              <input 
                type="text" 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full border border-gray-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-red-500 outline-none"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">Código</label>
              <input 
                type="text" 
                value={formData.code}
                onChange={(e) => setFormData({...formData, code: e.target.value})}
                className="w-full border border-gray-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-red-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">Unidade</label>
              <input 
                type="text" 
                value={formData.unit}
                onChange={(e) => setFormData({...formData, unit: e.target.value})}
                className="w-full border border-gray-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-red-500 outline-none"
                placeholder="Ex: UN, KG, M"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">Preço (R$) *</label>
              <input 
                type="number" 
                value={formData.price || ''}
                onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value) || 0})}
                className="w-full border border-gray-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-red-500 outline-none"
                min="0"
                step="0.01"
                required
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">Descrição</label>
              <textarea 
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full border border-gray-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-red-500 outline-none min-h-[80px] resize-none"
              />
            </div>
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
      </Modal>
    </div>
  );
}
