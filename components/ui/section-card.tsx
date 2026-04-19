import type { ReactNode } from "react";

type Props = {
  title?: string;
  description?: string;
  children: ReactNode;
};

export default function SectionCard({
  title,
  description,
  children,
}: Props) {
  return (
    <section className="rounded-xl border border-[#D9E1E7] bg-white p-6 shadow-sm">
      {title ? (
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-[#1F2937]">{title}</h2>
          {description ? (
            <p className="mt-1 text-sm text-[#667085]">{description}</p>
          ) : null}
        </div>
      ) : null}

      {children}
    </section>
  );
}