import React, { useState, useEffect, useRef, useCallback } from 'react';

import styles from './WhatsAppWidget.module.css';

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

// Typing indicator component
const TypingIndicator: React.FC = () => (
  <div className={styles['typing-indicator']}>
    <span></span>
    <span></span>
    <span></span>
  </div>
);

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
  const [isTyping, setIsTyping] = useState(true);
  const chatWindowRef = useRef<HTMLDivElement>(null);
  const lastY = useRef(0);
  const exitIntentTimeout = useRef<NodeJS.Timeout | null>(null);


useEffect(() => {
  if(isOpen) {
    setTimeout(() => {
      setIsTyping(false);
    }, 800);
  } else {
    setIsTyping(true);
  }
}, [isOpen]);

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
    <div className={`${styles['whatsapp-widget']} ${className}`} style={style}>
      {isOpen && (
        <div 
          ref={chatWindowRef}
          className={`${styles['chat-window']} ${isClosing ? styles['closing'] : ''}`}
        >
          <div className={styles['chat-header']}>
            <div className={styles['chat-header-content']}>
              {avatar && (
                <img
                  src={avatar}
                  alt={companyName}
                  className={styles['company-avatar']}
                />
              )}
              <div className={styles['chat-header-text']}>
                <h4>{companyName}</h4>
                <p>{responseTime}</p>
              </div>
            </div>
            <button 
              onClick={handleClose} 
              className={styles['close-button']}
              aria-label="Close chat"
            >
              ×
            </button>
          </div>
          <div className={styles['chat-messages']}>
            {messages.map((message, index) => (
              <div key={index} className={styles['message']}>
                {isTyping && index === messages.length - 1 ? (
                  <TypingIndicator />
                ) : (
                  message
                )}
              </div>
            ))}
          </div>
          <div className={styles['chat-footer']}>
            <button
              onClick={handleRedirect}
              className={styles['whatsapp-button']}
            >
              Iniciar conversación
            </button>
          </div>
        </div>
      )}
      {!isOpen && (
        <button
          onClick={toggleChat}
          className={`${styles['whatsapp-widget-button']} ${
            isAnimating ? styles['animate'] : ''
          }`}
          aria-label="Open WhatsApp chat"
        >
          {showNotification && (
            <span className={styles['notification-dot']}></span>
          )}
          <svg
            className={styles['whatsapp-icon']}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 32 32"
          >
            <path
              d=" M19.11 17.205c-.372 0-1.088 1.39-1.518 1.39a.63.63 0 0 1-.315-.1c-.802-.402-1.504-.817-2.163-1.447-.545-.516-1.146-1.29-1.46-1.963a.426.426 0 0 1-.073-.215c0-.33.99-.945.99-1.49 0-.143-.73-2.09-.832-2.335-.143-.372-.214-.487-.6-.487-.187 0-.36-.043-.53-.043-.302 0-.53.115-.746.315-.688.645-1.032 1.318-1.06 2.264v.114c-.015.99.472 1.977 1.017 2.78 1.23 1.82 2.506 3.41 4.554 4.34.616.287 2.035.888 2.722.888.817 0 2.15-.515 2.478-1.318.13-.33.244-.73.244-1.088 0-.058 0-.144-.03-.215-.1-.172-2.434-1.39-2.678-1.39zm-2.908 7.593c-1.747 0-3.48-.53-4.942-1.49L7.793 24.41l1.132-3.337a8.955 8.955 0 0 1-1.72-5.272c0-4.955 4.04-8.995 8.997-8.995S25.2 10.845 25.2 15.8c0 4.958-4.04 8.998-8.998 8.998zm0-19.798c-5.96 0-10.8 4.842-10.8 10.8 0 1.964.53 3.898 1.546 5.574L5 27.176l5.974-1.92a10.807 10.807 0 0 0 16.03-9.455c0-5.958-4.842-10.8-10.802-10.8z"
              fill="#fff"
            />
          </svg>
        </button>
      )}
    </div>
  );
};

export default WhatsAppWidget;
