"use client";

import { useState, type ReactNode } from "react";
import { EnquiryDrawer } from "@/components/browse/EnquiryDrawer";
import { ShortlistDrawer } from "@/components/browse/ShortlistDrawer";
import { EnquiryContext, type EnquiryTarget } from "@/components/browse/enquiry-context";

interface Props {
  children: ReactNode;
}

/**
 * Client wrapper that provides the enquiry drawer context and mounts the
 * shortlist tray. Wraps the server-rendered VendorBrowse output.
 */
export function VendorsChrome({ children }: Props) {
  const [enquiryTargets, setEnquiryTargets] = useState<EnquiryTarget[]>([]);

  function openEnquiry(targets: EnquiryTarget | EnquiryTarget[]) {
    setEnquiryTargets(Array.isArray(targets) ? targets : [targets]);
  }

  function closeEnquiry() {
    setEnquiryTargets([]);
  }

  return (
    <EnquiryContext.Provider value={{ openEnquiry }}>
      {children}
      <ShortlistDrawer onEnquireAll={(targets) => openEnquiry(targets)} />
      <EnquiryDrawer targets={enquiryTargets} onClose={closeEnquiry} />
    </EnquiryContext.Provider>
  );
}
