import React, { useState, useEffect, useRef } from 'react';
import './WhatsAppWidget.css';

const WhatsAppWidget = ({ 
  phoneNumber, 
  message = '¿Estás pensando en contratar Avena y tienes dudas?',
  companyName = 'Natalia de Avena Health',
  responseTime = 'Tipicamente respondemos en minutos',
  avatar = null,
  exitIntentTrigger = true,
  sensitivity = 20,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [hasTriggeredExitIntent, setHasTriggeredExitIntent] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const chatWindowRef = useRef(null);
  const lastY = useRef(0);
  const exitIntentTimeout = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (chatWindowRef.current && !chatWindowRef.current.contains(event.target) && 
          !event.target.closest('.whatsapp-widget-button')) {
        handleClose(event);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!exitIntentTrigger || hasTriggeredExitIntent) return;

    const handleExitIntent = (e) => {
      if (isOpen) return;

      const { clientY } = e;
      const velocity = lastY.current - clientY;
      lastY.current = clientY;

      if (exitIntentTimeout.current) {
        clearTimeout(exitIntentTimeout.current);
      }

      if (clientY < sensitivity && velocity > 0) {
        exitIntentTimeout.current = setTimeout(() => {
          setIsOpen(true);
          setHasTriggeredExitIntent(true);
        }, 100);
      }
    };

    const handleMouseLeave = (e) => {
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
  }, [exitIntentTrigger, hasTriggeredExitIntent, isOpen, sensitivity]);

  const handleClick = () => {
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${phoneNumber}?text=${encodedMessage}`, '_blank');
  };

  const handleClose = (e) => {
    e.stopPropagation();
    if (!isClosing) {
      setIsClosing(true);
      setTimeout(() => {
        setIsOpen(false);
        setIsClosing(false);
      }, 300);
    }
  };

  const toggleChat = () => {
    if (isOpen) {
      handleClose({ stopPropagation: () => {} });
    } else {
      setIsOpen(true);
    }
  };

  useEffect(() => {
    if (hasTriggeredExitIntent) {
      const resetTimeout = setTimeout(() => {
        setHasTriggeredExitIntent(false);
      }, 30 * 60 * 1000);

      return () => clearTimeout(resetTimeout);
    }
  }, [hasTriggeredExitIntent]);

  // Control wave animation timing
  useEffect(() => {
    const animationTimer = setTimeout(() => {
      setIsAnimating(true);
      
      // Stop animation after 4 seconds
      const stopTimer = setTimeout(() => {
        setIsAnimating(false);
      }, 4000);

      return () => clearTimeout(stopTimer);
    }, 5000); // Start animation after 5 seconds

    return () => clearTimeout(animationTimer);
  }, []);

  return (
    <div className="whatsapp-widget">
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
            <div className="message-bubble">
              ¡Hola!
            </div>
            <div className="message-bubble">
              {message}
            </div>
            <div className="message-bubble">
              Yo te puedo ayudar.
            </div>
            <button 
              className="contact-button"
              onClick={handleClick}
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
      </button>
    </div>
  );
};

export default WhatsAppWidget;
