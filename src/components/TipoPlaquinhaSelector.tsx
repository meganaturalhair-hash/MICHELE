import React from 'react';
import { 
  Check, Sparkles, Layers, CreditCard, Tag, 
  Square, Circle, Box, RefreshCw 
} from 'lucide-react';
import { TIPOS_PLAQUINHAS_CATALOGO, TipoPlaquinhaCatalogo, TipoPlaquinhaId } from '../types';

interface TipoPlaquinhaSelectorProps {
  selectedTipo: TipoPlaquinhaId;
  valorCobrado: number;
  onSelectTipo: (tipoId: TipoPlaquinhaId, precoSugerido: number) => void;
  onChangeValorCobrado: (novoValor: number) => void;
}

export const TipoPlaquinhaSelector: React.FC<TipoPlaquinhaSelectorProps> = ({
  selectedTipo,
  valorCobrado,
  onSelectTipo,
  onChangeValorCobrado,
}) => {
  // Find current selected info
  const currentModel = TIPOS_PLAQUINHAS_CATALOGO.find(
    (t) => t.id === selectedTipo || 
    (selectedTipo === 'madeira' && t.id === 'placa_10x15_madeira') ||
    (selectedTipo === 'acrilico' && t.id === 'placa_10x15_base_virada') ||
    ((selectedTipo === 'adesivo' || selectedTipo === 'pvc') && t.id === 'placa_10x10_cola') ||
    (selectedTipo === 'chaveiro' && t.id === 'cartao_vcard')
  ) || TIPOS_PLAQUINHAS_CATALOGO[1];

  const getIconForType = (icone: string) => {
    switch (icone) {
      case 'madeira':
        return <Box className="w-5 h-5 text-amber-400" />;
      case 'base_virada':
        return <Layers className="w-5 h-5 text-blue-400" />;
      case 'adesivo':
        return <Square className="w-5 h-5 text-emerald-400" />;
      case 'vcard':
        return <CreditCard className="w-5 h-5 text-indigo-400" />;
      case 'tag_quadrada':
        return <Tag className="w-5 h-5 text-purple-400" />;
      case 'tag_redonda':
        return <Circle className="w-5 h-5 text-pink-400" />;
      default:
        return <Layers className="w-5 h-5 text-blue-400" />;
    }
  };

  return (
    <div className="space-y-4">
      
      {/* Intro Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-950/60 via-slate-900 to-indigo-950/60 border border-blue-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center space-x-1.5">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>Catálogo de Modelos &amp; Preços</span>
          </span>
          <h4 className="text-sm font-bold text-white mt-0.5">
            Selecione o Tipo de Plaquinha do Cliente
          </h4>
          <p className="text-xs text-slate-400">
            Ao clicar em qualquer modelo, o valor cobrado é preenchido automaticamente com o preço de tabela.
          </p>
        </div>

        {/* Price display & customize */}
        <div className="bg-slate-950/90 border border-slate-800 p-3 rounded-xl flex items-center space-x-3 self-start sm:self-auto">
          <div>
            <label className="text-[10px] uppercase font-bold text-slate-400 block">
              Valor Final Cobrado (R$)
            </label>
            <div className="flex items-center space-x-1 mt-0.5">
              <span className="text-xs font-bold text-slate-400">R$</span>
              <input
                type="number"
                step="0.01"
                value={valorCobrado}
                onChange={(e) => onChangeValorCobrado(parseFloat(e.target.value) || 0)}
                className="w-24 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-white font-mono font-bold text-sm focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={() => onChangeValorCobrado(currentModel.precoSugerido)}
            className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 cursor-pointer"
            title="Restaurar preço padrão deste modelo"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Grid of the 6 Plaquinha Types */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {TIPOS_PLAQUINHAS_CATALOGO.map((item: TipoPlaquinhaCatalogo) => {
          const isSelected = 
            selectedTipo === item.id ||
            (selectedTipo === 'madeira' && item.id === 'placa_10x15_madeira') ||
            (selectedTipo === 'acrilico' && item.id === 'placa_10x15_base_virada') ||
            ((selectedTipo === 'adesivo' || selectedTipo === 'pvc') && item.id === 'placa_10x10_cola') ||
            (selectedTipo === 'chaveiro' && item.id === 'cartao_vcard');

          return (
            <div
              key={item.id}
              onClick={() => onSelectTipo(item.id, item.precoSugerido)}
              className={`relative p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'bg-blue-950/40 border-blue-500 shadow-lg shadow-blue-500/10 ring-2 ring-blue-500/30'
                  : 'bg-slate-950/80 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
              }`}
            >
              {/* Badge */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-slate-300">
                  {item.dimensoes}
                </span>

                {item.badge && (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    item.destaque 
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </div>

              {/* Title & Icon */}
              <div className="space-y-1">
                <div className="flex items-start space-x-2.5">
                  <div className={`p-2 rounded-xl flex-shrink-0 ${
                    isSelected ? 'bg-blue-500/20' : 'bg-slate-900'
                  }`}>
                    {getIconForType(item.icone)}
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-white leading-snug">
                      {item.nome}
                    </h5>
                    <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                      {item.subtitulo}
                    </p>
                  </div>
                </div>
              </div>

              {/* Material and Price Footer */}
              <div className="mt-4 pt-3 border-t border-slate-850 flex items-center justify-between text-xs">
                <span className="text-[10px] text-slate-500 truncate max-w-[120px]">
                  {item.material}
                </span>

                <div className="flex items-center space-x-2">
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block leading-none">Preço</span>
                    <span className="text-sm font-extrabold text-emerald-400 font-mono">
                      R$ {item.precoSugerido.toFixed(2).replace('.', ',')}
                    </span>
                  </div>

                  <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                    isSelected 
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/50' 
                      : 'border border-slate-700 bg-slate-900'
                  }`}>
                    {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                </div>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
