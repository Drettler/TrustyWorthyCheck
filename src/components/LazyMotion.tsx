import { LazyMotion, domAnimation } from "framer-motion";
import type { ReactNode } from "react";

interface LazyMotionProviderProps {
  children: ReactNode;
}

/**
 * Wraps children with LazyMotion for reduced bundle size.
 * Uses domAnimation (lighter) instead of full framer-motion features.
 */
export function LazyMotionProvider({ children }: LazyMotionProviderProps) {
  return <LazyMotion features={domAnimation}>{children}</LazyMotion>;
}
