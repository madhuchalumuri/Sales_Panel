import React from "react";

const Modal = ({ open, onClose, children, width = "max-w-lg" }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/40">
      {/* Modal Box */}
      <div
        className={`bg-white w-full ${width} p-6 rounded-2xl shadow-xl animate-fadeIn relative`}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>

        {children}
      </div>
    </div>
  );
};

export default Modal;
