"use client";

import { useFloatingComponent } from "@/app/shared";
import { useEffect, useRef, useState } from "react";

export function FloatingComponentContainer() {
  const { isVisible, component, hideFloatingComponent } = useFloatingComponent();
  const componentRef = useRef<HTMLDivElement>(null);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    // 点击外部区域时隐藏组件
    const handleClickOutside = (event: MouseEvent) => {
      if (componentRef.current && !componentRef.current.contains(event.target as Node)) {
        handleClose();
      }
    };

    // 按ESC键关闭
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        handleClose();
      }
    };

    if (isVisible) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscKey);
      // 防止背景滚动
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscKey);
      document.body.style.overflow = "";
    };
  }, [isVisible, hideFloatingComponent]);

  // 重置状态当组件显示时
  useEffect(() => {
    if (isVisible) {
      setIsClosing(false);
    }
  }, [isVisible]);

  const handleClose = () => {
    setIsClosing(true);
    // 添加关闭动画后再隐藏
    setTimeout(() => {
      hideFloatingComponent();
    }, 300);
  };

  if (!isVisible) return null;

  return (
    <div className={`floating-component-overlay ${isClosing ? 'closing' : ''}`}>
      <div 
        ref={componentRef} 
        className={`floating-component-container ${isClosing ? 'closing' : ''}`}
      >
        <div className="floating-component-header">
          <div className="floating-component-title">AI健身助手</div>
          <button 
            className="floating-component-close"
            onClick={handleClose}
            aria-label="关闭"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
        <div className="floating-component-content flex items-center justify-center">
          {component}
        </div>
        <div className="floating-component-footer">
          <div className="floating-component-tip">提示: 按ESC键可关闭此窗口</div>
          <button 
            className="floating-component-action-btn"
            onClick={handleClose}
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  );
}