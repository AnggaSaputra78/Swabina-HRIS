import { X } from 'lucide-react';

export default function DetailModal({ isOpen, onClose, title, subtitle, icon: Icon, iconBg = 'bg-slate-100', iconColor = 'text-slate-600', children }) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 p-5">
          <div className="flex items-center gap-3">
            {Icon && (
              <span className={`rounded-xl ${iconBg} p-2.5 ${iconColor}`}>
                <Icon className="h-5 w-5" />
              </span>
            )}
            <div>
              <h2 className="text-lg font-bold text-slate-900">{title}</h2>
              {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-slate-100 transition-colors">
            <X className="h-5 w-5 text-slate-500" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto p-5">{children}</div>
      </div>
    </div>
  );
}