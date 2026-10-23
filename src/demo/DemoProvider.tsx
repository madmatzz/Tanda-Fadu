import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  type Dispatch,
  type ReactNode,
} from "react";
import {
  demoReducer,
  loadDemoState,
  saveDemoState,
  type DemoAction,
} from "./reducer";
import type { DemoState } from "./types";

interface DemoContextValue {
  state: DemoState;
  dispatch: Dispatch<DemoAction>;
  resetDemo: () => void;
}

const DemoContext = createContext<DemoContextValue | null>(null);

export function DemoProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(demoReducer, undefined, loadDemoState);

  useEffect(() => {
    saveDemoState(state);
  }, [state]);

  const resetDemo = () => dispatch({ type: "RESET_DEMO" });

  return (
    <DemoContext.Provider value={{ state, dispatch, resetDemo }}>
      {children}
    </DemoContext.Provider>
  );
}

export function useDemo(): DemoContextValue {
  const context = useContext(DemoContext);
  if (!context) {
    throw new Error("useDemo debe usarse dentro de DemoProvider");
  }
  return context;
}
