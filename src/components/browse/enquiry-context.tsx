"use client";

import { createContext, useContext } from "react";

export interface EnquiryTarget {
  slug: string;
  name: string;
}

export interface EnquiryContextValue {
  openEnquiry: (targets: EnquiryTarget | EnquiryTarget[]) => void;
}

export const EnquiryContext = createContext<EnquiryContextValue | null>(null);

export function useEnquiry(): EnquiryContextValue {
  const ctx = useContext(EnquiryContext);
  if (!ctx) throw new Error("useEnquiry must be used inside VendorsChrome");
  return ctx;
}
