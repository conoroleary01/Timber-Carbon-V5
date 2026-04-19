import Link from "next/link";

type Props = {
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
};

export default function EmptyState({
  title,
  description,
  actionLabel,
  actionHref,
}: Props) {
  return (
    <div className="rounded-xl border border-dashed border-[#D9E1E7] bg-[#F7F9FA] px-6 py-12 text-center">
      <h3 className="text-lg font-semibold text-[#1F2937]">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-[#667085]">
        {description}
      </p>

      {actionLabel && actionHref ? (
        <div className="mt-6">
          <Link
            href={actionHref}
            className="inline-flex rounded-lg bg-cygnum-green px-4 py-2 text-sm font-medium text-white hover:bg-cygnum-green-dark"
          >
            {actionLabel}
          </Link>
        </div>
      ) : null}
    </div>
  );
}