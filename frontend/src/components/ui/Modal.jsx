import { X } from 'lucide-react';
import { useEffect } from 'react';

export default function Modal({ isOpen, onClose, title, children, maxWidth = '540px' }) {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose} id="modal-overlay">
      <div className="modal" style={{ maxWidth }} onClick={e => e.stopPropagation()} id="modal-dialog">
        <div className="modal__header">
          <h3 className="modal__title">{title}</h3>
          <button className="modal__close" onClick={onClose} aria-label="Close modal" id="modal-close-btn">
            <X size={16} />
          </button>
        </div>
        <div className="modal__body">{children}</div>
      </div>
    </div>
  );
}
