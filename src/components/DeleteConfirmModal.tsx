import React, { useState } from 'react';
import { Trash2, AlertTriangle, X } from 'lucide-react';
import { PlaquinhaRecord } from '../types';

interface DeleteConfirmModalProps {
  plaquinha: PlaquinhaRecord;
  onClose: () => void;
  onDeleted: () => void;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  plaquinha,
  onClose,
  onDeleted,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirmDelete = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/plaquinhas/${plaquinha.id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Falha ao excluir a plaquinha');
      }

      onDeleted();
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Erro ao excluir a plaquinha');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative w-full max-w-md bg-slate-900 border border-rose-500/40 rounded-3xl shadow-2xl overflow-hidden text-slate-100 animate-in fade-in zoom-in-95">
        
        {/* Glow accent */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-rose-600 via-red-500 to-amber-500" />

        <div className="p-6">
          <div className="flex items-start justify-between">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <Trash2 className="w-6 h-6 animate-pulse" />
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mt-4 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center space-x-1.5">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Confirmação de Exclusão</span>
            </span>
            <h3 className="text-lg font-bold text-white">
              Tem certeza que deseja apagar?
            </h3>
            
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-400">Plaquinha:</span>
                <span className="font-mono font-bold text-blue-400">PLQ-{plaquinha.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Empresa:</span>
                <span className="font-bold text-white truncate max-w-[200px]">{plaquinha.empresa}</span>
              </div>
              {plaquinha.responsavel && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Responsável:</span>
                  <span className="text-slate-300">{plaquinha.responsavel}</span>
                </div>
              )}
            </div>

            <p className="text-xs text-slate-400 leading-relaxed pt-1">
              Ao clicar em <strong>&ldquo;Sim, Apagar Tudo&rdquo;</strong>, todos os dados cadastrais do cliente, configurações de pagamento PIX, Wi-Fi, WhatsApp e estatísticas de scans serão excluídos definitivamente do sistema.
            </p>

            {error && (
              <div className="p-3 bg-rose-500/20 border border-rose-500/50 rounded-xl text-rose-300 text-xs">
                {error}
              </div>
            )}
          </div>

          {/* Action buttons with clear Sim / Não */}
          <div className="mt-6 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all cursor-pointer text-center"
            >
              NÃO, CANCELAR
            </button>

            <button
              type="button"
              onClick={handleConfirmDelete}
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white text-xs font-bold shadow-lg shadow-rose-600/30 flex items-center justify-center space-x-1.5 transition-all cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{loading ? 'APAGANDO...' : 'SIM, APAGAR TUDO'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
