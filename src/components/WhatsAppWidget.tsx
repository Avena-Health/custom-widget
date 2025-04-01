import React, { useState, useEffect, useRef, useCallback } from 'react';

import './WhatsAppWidget.css';

export type  WhatsAppMessage = string;

export interface WhatsAppWidgetProps {
  /** Phone number in international format */
  phoneNumber: string;
  
  /** Company or person name displayed in the header */
  companyName?: string;
  
  /** Response time message displayed under the name */
  responseTime?: string;
  
  /** URL to the avatar image */
  avatar?: string;
  
  /** Array of messages to display in the chat */
  messages?: WhatsAppMessage[];
  
  /** Default message to send when clicking the WhatsApp button */
  defaultMessage?: string;
  
  /** Whether to enable exit intent detection */
  enableExitIntent?: boolean;
  
  /** Sensitivity for exit intent detection in pixels from top */
  exitIntentSensitivity?: number;
  
  /** Callback when chat window opens */
  onOpen?: () => void;
  
  /** Callback when chat window closes */
  onClose?: () => void;
  
  /** Callback when WhatsApp redirect button is clicked */
  onRedirect?: () => void;
  
  /** Custom class name for the widget container */
  className?: string;
  
  /** Whether to show the notification dot */
  showNotification?: boolean;
  
  /** Custom styles for the widget */
  style?: React.CSSProperties;
}

const defaultMessages: WhatsAppMessage[] = ['¡Hola!'];

export const WhatsAppWidget: React.FC<WhatsAppWidgetProps> = ({
  phoneNumber,
  companyName = 'Natalia de Avena Health',
  responseTime = 'Tipicamente respondemos en minutos',
  avatar,
  messages = defaultMessages,
  defaultMessage = '¿Estás pensando en contratar Avena y tienes dudas?',
  enableExitIntent = true,
  exitIntentSensitivity = 20,
  onOpen,
  onClose,
  onRedirect,
  className = '',
  showNotification = true,
  style = {},
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [hasTriggeredExitIntent, setHasTriggeredExitIntent] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  
  const chatWindowRef = useRef<HTMLDivElement>(null);
  const lastY = useRef(0);
  const exitIntentTimeout = useRef<NodeJS.Timeout | null>(null);



  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (
      chatWindowRef.current &&
      !chatWindowRef.current.contains(event.target as Node) &&
      !(event.target as Element).closest('.whatsapp-widget-button')
    ) {
      handleClose(event);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      onOpen?.();
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, handleClickOutside, onOpen]);

  useEffect(() => {
    if (!enableExitIntent || hasTriggeredExitIntent) return;

    const handleExitIntent = (e: MouseEvent) => {
      if (isOpen) return;

      const { clientY } = e;
      const velocity = lastY.current - clientY;
      lastY.current = clientY;

      if (exitIntentTimeout.current) {
        clearTimeout(exitIntentTimeout.current);
      }

      if (clientY < exitIntentSensitivity && velocity > 0) {
        exitIntentTimeout.current = setTimeout(() => {
          setIsOpen(true);
          setHasTriggeredExitIntent(true);
        }, 100);
      }
    };

    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 && !isOpen) {
        setIsOpen(true);
        setHasTriggeredExitIntent(true);
      }
    };

    document.addEventListener('mousemove', handleExitIntent);
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      document.removeEventListener('mousemove', handleExitIntent);
      document.removeEventListener('mouseleave', handleMouseLeave);
      if (exitIntentTimeout.current) {
        clearTimeout(exitIntentTimeout.current);
      }
    };
  }, [enableExitIntent, hasTriggeredExitIntent, isOpen, exitIntentSensitivity]);

  const handleRedirect = useCallback(() => {
    const encodedMessage = encodeURIComponent(defaultMessage);
    onRedirect?.();
    window.open(`https://wa.me/${phoneNumber}?text=${encodedMessage}`, '_blank');
  }, [phoneNumber, defaultMessage, onRedirect]);

  const handleClose = useCallback((e: MouseEvent | React.MouseEvent) => {
    e.stopPropagation();
    if (!isClosing) {
      setIsClosing(true);
      setTimeout(() => {
        setIsOpen(false);
        setIsClosing(false);
        onClose?.();
      }, 300);
    }
  }, [isClosing, onClose]);

  const toggleChat = useCallback(() => {
    if (isOpen) {
      handleClose({ stopPropagation: () => {} } as MouseEvent);
    } else {
      setIsOpen(true);
    }
  }, [isOpen, handleClose]);

  useEffect(() => {
    if (hasTriggeredExitIntent) {
      const resetTimeout = setTimeout(() => {
        setHasTriggeredExitIntent(false);
      }, 30 * 60 * 1000);

      return () => clearTimeout(resetTimeout);
    }
  }, [hasTriggeredExitIntent]);

  useEffect(() => {
    const animationTimer = setTimeout(() => {
      setIsAnimating(true);
      
      const stopTimer = setTimeout(() => {
        setIsAnimating(false);
      }, 4000);

      return () => clearTimeout(stopTimer);
    }, 5000);

    return () => clearTimeout(animationTimer);
  }, []);

  return (
    <div className={`whatsapp-widget ${className}`} style={style}>
      {isOpen && (
        <div 
          ref={chatWindowRef}
          className={`whatsapp-chat-window ${isClosing ? 'chat-window-exit' : ''}`}
        >
          <div className="chat-header">
            {avatar ? (
              <img src={avatar} alt="Profile" className="avatar" />
            ) : (
              <div className="avatar-placeholder">
                {companyName.charAt(0)}
              </div>
            )}
            <div className="header-info">
              <h3>{companyName}</h3>
              <p>{responseTime}</p>
            </div>
            <button 
              className="close-button"
              onClick={handleClose}
              aria-label="Close chat"
            >
              ×
            </button>
          </div>
          <div className="chat-body">
            {messages.map((message, index) => (
              <div key={index} className="message-bubble">
                {message}
              </div>
            ))}
            <button 
              className="contact-button"
              onClick={handleRedirect}
            >
              <svg
                className="whatsapp-icon-small"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Contactar ahora
            </button>
          </div>
        </div>
      )}
      <button 
        className={`whatsapp-widget-button ${isOpen ? 'active' : ''} ${isAnimating ? 'animate-waves' : ''}`}
        onClick={toggleChat}
        aria-label="Open WhatsApp chat"
      >
        <div className="wave-circle"></div>
        <div className="wave-circle"></div>
        <div className="wave-circle"></div>
        <svg
          className="whatsapp-icon"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
        {showNotification && <span className="notification-dot" />}
      </button>
    </div>
  );
};

export default WhatsAppWidget;
