/** Renders one or more schema.org objects as JSON-LD. Server component. */
export function JsonLd({ schema }: { schema: Record<string, unknown> | Record<string, unknown>[] }) {
  const items = Array.isArray(schema) ? schema : [schema];
  return (
    <>
      {items.map((item, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(item).replace(/</g, "\\u003c") }}
        />
      ))}
    </>
  );
}
