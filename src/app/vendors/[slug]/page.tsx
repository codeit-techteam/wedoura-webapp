import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Placeholder } from "@/components/chrome/Placeholder";
import { getCategory, getVendor, getVendors } from "@/lib/api";

export async function generateStaticParams() {
  const vendors = await getVendors();
  return vendors.map((v) => ({ slug: v.slug }));
}

export async function generateMetadata({ params }: PageProps<"/vendors/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const vendor = await getVendor(slug);
  return vendor ? { title: vendor.name, description: vendor.summary } : { title: "Vendor" };
}

export default async function VendorPage({ params }: PageProps<"/vendors/[slug]">) {
  const { slug } = await params;
  const vendor = await getVendor(slug);
  if (!vendor) notFound();
  const category = await getCategory(vendor.category);
  return <Placeholder eyebrow={category?.name ?? "Vendor"} title={vendor.name} step={vendor.venue ? 9 : 4} />;
}
