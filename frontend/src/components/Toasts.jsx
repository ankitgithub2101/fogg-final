import React, { useEffect, useState, forwardRef, useImperativeHandle } from "react";

// Forward ref so parent can call show()
const Toasts = forwardRef((props, ref) => {
  const [toast, setToast] = useState({ type: "", message: "", show: false });

  useImperativeHandle(ref, () => ({
    show: (type, message) => {
      setToast({ type, message, show: true });
    },
  }));

  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => setToast({ ...toast, show: false }), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const bgColor = {
    success: "bg-green-500",
    danger: "bg-red-500",
    warning: "bg-yellow-500",
  };

  if (!toast.show) return null;

  return (
    <div
      className={`fixed top-5 right-5 p-4 text-white rounded shadow-lg ${bgColor[toast.type]}`}
    >
      {toast.message}
    </div>
  );
});

export default Toasts;