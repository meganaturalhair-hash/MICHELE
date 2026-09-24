import React, { useState } from 'react';
import { X, Package, Check, Sparkles, AlertCircle } from 'lucide-react';
import { PlaquinhaRecord } from '../types';

interface BatchStockModalProps {
  nextId: number;
  onClose: () => void;
  onCreated: () => void;
}

export const BatchStockModal: React.FC<BatchStockModalProps> = ({
  nextId,
  onClose,
  onCreated,
}) => {
  const [count, setCount] = useState<number>(10);
  const [tipoPlaquinha, setTipoPlaquinha] = useState<PlaquinhaRecord['tipoPlaquinha']>('acrilico');
  const [valorCobrado, setValorCobrado] = useState<number>(149.90);
  const [loading, setLoading] = useState(false);
  const [successCount, setSuccessCount] = useState<number | null>(null);

  const handleGenerateBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/plaquinhas/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          count,
          tipoPlaquinha,
          valorCobrado,
        }),
      });

      if (!res.ok) {
        throw new Error('Falha ao gerar lote de plaquinhas');
      }

      const data = await res.json();
      setSuccessCount(data.created?.length || count);
      onCreated();
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: any) {
      alert(err.message || 'Erro ao gerar lote');
    } finally {
      setLoading(false);
    }
  };

  const endId = nextId + count - 1;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden text-slate-100 animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Estoque Pré-Fabricado
            </span>
            <h3 className="text-xl font-bold text-white mt-1">
              Gerar Lote de Plaquinhas em Branco
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Crie numerações sequenciais prontas para impressão e corte de acrílico.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleGenerateBatch} className="p-6 space-y-5">
          
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Faixa de Numeração Sequencial:</span>
              <span className="font-mono font-bold text-amber-300 text-sm">
                #{nextId} até #{endId}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              💡 <strong>Como funciona:</strong> Cada plaquinha receberá um QR Code permanente apontando para <code className="text-blue-300">/r/NUMERO</code>.
              Você pode mandar imprimir 10 ou 20 plaquinhas com o adesivo e o QR Code. Ao visitar o cliente e fechar a venda, você ativa a plaquinha no balcão em 5 segundos!
            </p>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="text-slate-300 font-semibold block mb-1">
                Quantidade de Plaquinhas a Fabricar
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[5, 10, 20, 50].map((qty) => (
                  <button
                    type="button"
                    key={qty}
                    onClick={() => setCount(qty)}
                    className={`py-2.5 rounded-xl font-bold text-xs border transition-all cursor-pointer ${
                      count === qty
                        ? 'bg-emerald-600 border-emerald-500 text-white shadow-md'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {qty} unidades
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">
                Material da Plaquinha
              </label>
              <select
                value={tipoPlaquinha}
                onChange={(e) => setTipoPlaquinha(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
              >
                <option value="acrilico">Acrílico Cristal com Base (Mais vendido)</option>
                <option value="madeira">Base de Madeira Nobre</option>
                <option value="pvc">PVC Expandido com Adesivo</option>
                <option value="metal">Metal / Aço Escovado</option>
                <option value="adesivo">Adesivo Vinil Impermeável</option>
                <option value="chaveiro">Chaveiro Inteligente NFC</option>
              </select>
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">
                Preço Padrão de Venda Sugerido (R$)
              </label>
              <input
                type="number"
                step="0.01"
                value={valorCobrado}
                onChange={(e) => setValorCobrado(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono"
              />
            </div>
          </div>

          {successCount && (
            <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs font-semibold flex items-center space-x-2">
              <Check className="w-4 h-4" />
              <span>{successCount} plaquinhas em branco criadas com sucesso no estoque!</span>
            </div>
          )}

          {/* Footer */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 flex items-center space-x-2 transition-all cursor-pointer"
            >
              <Package className="w-4 h-4" />
              <span>{loading ? 'Gerando...' : `Criar ${count} Plaquinhas em Estoque`}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
