import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function NotificationToast() {
  const { toast } = useAuth();
  if (!toast) return null;

  const bgStyles = {
    success: 'bg-emerald-500 text-white shadow-emerald-500/25',
    error: 'bg-rose-500 text-white shadow-rose-500/25',
    info: 'bg-primary text-white shadow-primary/25',
    warning: 'bg-amber-500 text-white shadow-amber-500/25',
  }[toast.type] || 'bg-primary text-white shadow-primary/25';

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 flex-shrink-0" />,
    error: <AlertCircle className="w-5 h-5 flex-shrink-0" />,
    info: <Info className="w-5 h-5 flex-shrink-0" />,
    warning: <AlertCircle className="w-5 h-5 flex-shrink-0" />,
  }[toast.type] || <Info className="w-5 h-5 flex-shrink-0" />;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-bounce-in max-w-md">
      <div className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl font-medium text-sm transition-all duration-300 ${bgStyles}`}>
        {icons}
        <span>{toast.message}</span>
      </div>
    </div>
  );
}
