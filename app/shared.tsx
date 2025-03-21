"use client";
import { createContext, useState, useContext, ReactNode } from "react";

// 定义浮动组件的状态接口
interface FloatingComponentState {
  isVisible: boolean;
  component: ReactNode | null;
  showFloatingComponent: (component: ReactNode) => void;
  hideFloatingComponent: () => void;
}

// 创建上下文
const FloatingComponentContext = createContext<FloatingComponentState | undefined>(undefined);

// 创建提供者组件
export function FloatingComponentProvider({ children }: { children: ReactNode }) {
  const [isVisible, setIsVisible] = useState(false);
  const [component, setComponent] = useState<ReactNode | null>(null);

  const showFloatingComponent = (component: ReactNode) => {
    setComponent(component);
    setIsVisible(true);
  };

  const hideFloatingComponent = () => {
    setIsVisible(false);
  };

  return (
    <FloatingComponentContext.Provider
      value={{
        isVisible,
        component,
        showFloatingComponent,
        hideFloatingComponent
      }}
    >
      {children}
    </FloatingComponentContext.Provider>
  );
}

// 创建自定义Hook
export function useFloatingComponent() {
  const context = useContext(FloatingComponentContext);
  if (context === undefined) {
    throw new Error('useFloatingComponent must be used within a FloatingComponentProvider');
  }
  return context;
}

// 现有的LocalContext保持不变
export const LocalContext = createContext<any>(null);
