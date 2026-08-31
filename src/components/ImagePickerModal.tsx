import React, { useState } from 'react';
import { X, Upload, Link, Check, Image as ImageIcon, Sparkles } from 'lucide-react';

interface ImagePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectImage: (url: string) => void;
  currentUrl?: string;
}

const CURATED_PRESETS = [
  {
    category: 'Imagens de exemplo',
    images: [
      { url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80', label: 'Equipe e Colaboração' },
      { url: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=80', label: 'Tecnologia & Dados' },
      { url: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=800&q=80', label: 'Planejamento Ágil' },
    ]
  }
];

export const ImagePickerModal: React.FC<ImagePickerModalProps> = ({
  isOpen,
  onClose,
  onSelectImage,
  currentUrl = ''
}) => {
  const [customUrl, setCustomUrl] = useState(currentUrl);
  const [activeTab, setActiveTab] = useState<'curated' | 'url' | 'upload'>('curated');
  const [previewError, setPreviewError] = useState(false);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('Por favor, selecione uma imagem com menos de 2MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          onSelectImage(reader.result);
          onClose();
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleApplyCustomUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (customUrl.trim()) {
      onSelectImage(customUrl.trim());
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
              <ImageIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base">Selecionar Imagem do Card</h3>
              <p className="text-xs text-slate-500">Escolha imagem de exemplo, insira URL ou envie a imagem</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 px-6 gap-6 text-sm font-medium bg-white">
          <button
            onClick={() => setActiveTab('curated')}
            className={`py-3 border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'curated'
                ? 'border-blue-600 text-blue-600 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            Imagens de exemplo
          </button>
          <button
            onClick={() => setActiveTab('url')}
            className={`py-3 border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'url'
                ? 'border-blue-600 text-blue-600 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Link className="w-4 h-4" />
            URL Direta
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={`py-3 border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'upload'
                ? 'border-blue-600 text-blue-600 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Upload className="w-4 h-4" />
            Upload Local
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {activeTab === 'curated' && (
            <div className="space-y-6">
              {CURATED_PRESETS.map((group) => (
                <div key={group.category}>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                    {group.category}
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {group.images.map((img) => {
                      const isSelected = currentUrl === img.url;
                      return (
                        <button
                          key={img.url}
                          type="button"
                          onClick={() => {
                            onSelectImage(img.url);
                            onClose();
                          }}
                          className={`group relative rounded-xl overflow-hidden border-2 text-left transition-all ${
                            isSelected
                              ? 'border-blue-600 ring-2 ring-blue-300 ring-offset-1'
                              : 'border-slate-200 hover:border-blue-400 hover:shadow-md'
                          }`}
                        >
                          <div className="aspect-4/3 bg-slate-100 overflow-hidden relative">
                            <img
                              src={img.url}
                              alt={img.label}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                              loading="lazy"
                            />
                            {isSelected && (
                              <div className="absolute top-1.5 right-1.5 bg-blue-600 text-white rounded-full p-0.5 shadow-sm">
                                <Check className="w-3.5 h-3.5" />
                              </div>
                            )}
                          </div>
                          <div className="p-1.5 bg-white text-[11px] font-medium text-slate-700 truncate">
                            {img.label}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'url' && (
            <form onSubmit={handleApplyCustomUrl} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  URL da Imagem (Web)
                </label>
                <div className="relative">
                  <input
                    type="url"
                    value={customUrl}
                    onChange={(e) => {
                      setCustomUrl(e.target.value);
                      setPreviewError(false);
                    }}
                    placeholder="https://exemplo.com/imagem.jpg"
                    className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-hidden"
                  />
                  <Link className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Insira o link direto de uma imagem (JPG, PNG, WebP ou SVG).
                </p>
              </div>

              {customUrl.trim() && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <p className="text-xs font-semibold text-slate-600 mb-2">Pré-visualização:</p>
                  <div className="h-40 rounded-lg overflow-hidden bg-slate-200 flex items-center justify-center">
                    {previewError ? (
                      <p className="text-xs text-rose-500">Erro ao carregar imagem desta URL.</p>
                    ) : (
                      <img
                        src={customUrl}
                        alt="Preview"
                        className="w-full h-full object-cover"
                        onError={() => setPreviewError(true)}
                      />
                    )}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!customUrl.trim() || previewError}
                  className="px-5 py-2 text-sm font-semibold bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  Aplicar Imagem
                </button>
              </div>
            </form>
          )}

          {activeTab === 'upload' && (
            <div className="space-y-4">
              <label className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-2xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer bg-slate-50 hover:bg-blue-50/30 transition-all">
                <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                  <Upload className="w-6 h-6" />
                </div>
                <div className="text-center">
                  <span className="font-semibold text-slate-800 text-sm block">Clique para fazer upload ou arraste o arquivo</span>
                  <span className="text-xs text-slate-500 mt-1 block">Formatos suportados: PNG, JPG, GIF ou WebP (máx. 2MB)</span>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          {currentUrl && (
            <button
              type="button"
              onClick={() => {
                onSelectImage('');
                onClose();
              }}
              className="text-xs text-rose-600 hover:text-rose-700 font-medium"
            >
              Remover imagem atual
            </button>
          )}
          <div className="ml-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-200/70 rounded-lg"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
