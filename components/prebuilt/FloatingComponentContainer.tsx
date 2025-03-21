"use client";

import { useFloatingComponent } from "@/app/shared";
import { useEffect, useRef } from "react";

export function FloatingComponentContainer() {
  const { isVisible, component, hideFloatingComponent } = useFloatingComponent();
  const componentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 点击外部区域时隐藏组件
    const handleClickOutside = (event: MouseEvent) => {
      if (componentRef.current && !componentRef.current.contains(event.target as Node)) {
        hideFloatingComponent();
      }
    };

    if (isVisible) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isVisible, hideFloatingComponent]);

  if (!isVisible) return null;

  return (
    <div className="floating-component-overlay">
      <div 
        ref={componentRef} 
        className="floating-component-container"
        style={{
          width: "80%",
          maxWidth: "1200px",
          minHeight: "70vh",
          display: "flex",
          flexDirection: "column"
        }}
      >
        <div className="p-4 flex-1 overflow-auto">
          {component}
        </div>
        <button 
          className="floating-component-close"
          onClick={hideFloatingComponent}
        >
          <i className="fas fa-times"></i>
        </button>
      </div>
    </div>
  );
}