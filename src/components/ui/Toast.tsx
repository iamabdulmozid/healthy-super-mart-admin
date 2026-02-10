import { useEffect, useState } from 'react';
import { 
  CheckCircleIcon, 
  ExclamationCircleIcon, 
  ExclamationTriangleIcon, 
  InformationCircleIcon,
  XMarkIcon 
} from '@heroicons/react/24/outline';
import type { ToastType } from '@/context/ToastContext';

export interface ToastProps {
  type: ToastType;
  title?: string;
  message: string;
  errors?: string[];
  onClose: () => void;
}

export function Toast({ type, title, message, errors, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger animation on mount
    setTimeout(() => setIsVisible(true), 10);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 200);
  };

  // Show validation errors list if available
  const hasErrors = errors && errors.length > 0;

  const config = {
    success: {
      icon: CheckCircleIcon,
      bgColor: 'bg-secondary-50',
      borderColor: 'border-secondary-200',
      iconColor: 'text-secondary-600',
      textColor: 'text-secondary-900',
    },
    error: {
      icon: ExclamationCircleIcon,
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      iconColor: 'text-red-600',
      textColor: 'text-red-900',
    },
    warning: {
      icon: ExclamationTriangleIcon,
      bgColor: 'bg-accent-50',
      borderColor: 'border-accent-200',
      iconColor: 'text-accent-600',
      textColor: 'text-accent-900',
    },
    info: {
      icon: InformationCircleIcon,
      bgColor: 'bg-primary-50',
      borderColor: 'border-primary-200',
      iconColor: 'text-primary-600',
      textColor: 'text-primary-900',
    },
  };

  const { icon: Icon, bgColor, borderColor, iconColor, textColor } = config[type];

  return (
    <div
      className={`${bgColor} border ${borderColor} rounded-lg shadow-lg p-4 pointer-events-auto transition-all duration-200 max-h-[85vh] flex flex-col ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
    >
      <div className="flex items-start gap-3 overflow-y-auto">
        <Icon className={`h-5 w-5 ${iconColor} flex-shrink-0 mt-0.5`} />
        <div className="flex-1 min-w-0">
          {title && (
            <h4 className={`font-semibold text-sm ${textColor} mb-1`}>{title}</h4>
          )}
          <p className={`text-sm ${textColor}`}>{message}</p>
          
          {/* Display all validation errors as a list */}
          {hasErrors && (
            <ul className={`mt-2 space-y-1 text-sm ${textColor} list-disc list-inside max-h-[50vh] overflow-y-auto pr-2`}>
              {errors.map((error, index) => (
                <li key={index} className="leading-snug break-words">{error}</li>
              ))}
            </ul>
          )}
        </div>
        <button
          onClick={handleClose}
          className={`flex-shrink-0 ${textColor} hover:opacity-70 transition-opacity`}
        >
          <XMarkIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export default Toast;
