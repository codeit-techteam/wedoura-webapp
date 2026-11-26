"use client";

import { useCallback, useState } from "react";
import type { CategoryGroup, CityOption } from "@/components/browse/SearchPill";
import { VendorsCategoryRail } from "@/components/browse/vendors/VendorsCategoryRail";
import { VendorsSearch } from "@/components/browse/vendors/VendorsSearch";
import type { CategoryWithCount } from "@/lib/api";
import type { ParamRecord } from "@/lib/url";

type Props = {
  pathname: string;
  params: ParamRecord;
  cities: CityOption[];
  categoryGroups: CategoryGroup[];
  categories: CategoryWithCount[];
  city?: string;
  category?: string;
  q?: string;
};

type Panel = "where" | "what" | null;

/** Search bar + category tiles with shared “open What panel” state. */
export function VendorsFindBar({
  pathname,
  params,
  cities,
  categoryGroups,
  categories,
  city,
  category,
  q,
}: Props) {
  const [panel, setPanel] = useState<Panel>(null);
  const onPanelChange = useCallback((next: Panel) => setPanel(next), []);

  return (
    <>
      <VendorsSearch
        key={`${city ?? ""}|${category ?? ""}|${q ?? ""}`}
        cities={cities}
        categoryGroups={categoryGroups}
        city={city}
        category={category}
        q={q}
        panel={panel}
        onPanelChange={onPanelChange}
      />
      <VendorsCategoryRail
        pathname={pathname}
        params={params}
        categories={categories}
        activeCategory={category}
        onOpenCategories={() => setPanel("what")}
      />
    </>
  );
}
