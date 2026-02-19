import React from 'react';
import { useModal } from '../context/ModalContext';

const Modal = ({ id, title, children }) => {
    const { activeModal, closeModal } = useModal();

    if (activeModal !== id) return null;

    return (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/80 backdrop-blur-sm p-5 animate-fadeIn" onClick={closeModal}>
            <div
                className="bg-card-bg border border-accent-secondary p-10 rounded-xl shadow-[0_0_50px_rgba(188,19,254,0.2)] w-full max-w-3xl relative max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                <span
                    className="absolute top-4 right-6 text-2xl cursor-pointer text-text-secondary hover:text-accent-primary"
                    onClick={closeModal}
                >
                    &times;
                </span>
                <h3 className="text-2xl font-heading mb-5 text-white">{title}</h3>
                {children}
            </div>
        </div>
    );
};

export default Modal;
