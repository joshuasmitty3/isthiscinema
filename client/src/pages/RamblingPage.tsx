import { Link } from "wouter";
import { format } from "date-fns";
import Layout from "@/components/Layout";
import { getRambling } from "@/lib/ramblings";
import { usePrivateRamblings } from "@/hooks/use-private-ramblings";
import { User } from "@/lib/types";

interface RamblingPageProps {
  slug: string;
  user: User | null;
  onLogout?: () => void;
  onSignIn?: () => void;
}

export default function RamblingPage({ slug, user, onLogout, onSignIn }: RamblingPageProps) {
  const { ramblings: privateRamblings, isLoading } = usePrivateRamblings(!!user);
  const rambling = getRambling(slug) ?? privateRamblings.find((r) => r.slug === slug);

  return (
    <Layout user={user} onLogout={onLogout} onSignIn={onSignIn} light>
      <div className="container mx-auto px-4 pt-4 pb-16">
        <Link
          href="/rambling"
          className="inline-block font-mono text-xs text-neutral-500 transition-colors hover:text-neutral-800"
        >
          ← ramblings
        </Link>

        {!rambling ? (
          <div className="py-16 text-center font-mono text-sm text-neutral-500">
            {isLoading ? "loading…" : "that rambling doesn't exist."}
          </div>
        ) : (
          <article className="mx-auto mt-8 max-w-[640px]">
            <h1 className="font-charis text-3xl font-bold tracking-tight text-neutral-900">
              {rambling.title}
            </h1>
            {rambling.subtitle && (
              <p className="mt-2 font-charis text-lg text-neutral-600">
                {rambling.subtitle}
              </p>
            )}
            {rambling.date && (
              <p className="mt-1.5 font-mono text-xs text-neutral-500">
                {format(new Date(`${rambling.date}T00:00:00`), "MMM d, yyyy")}
              </p>
            )}
            <div
              className="mt-8 font-charis text-[17px] leading-relaxed text-neutral-800 [&_p]:mb-5 [&_a]:text-[#86670f] [&_a]:underline [&_a]:underline-offset-2 [&_a:hover]:text-[#6b520b] [&_strong]:font-bold [&_strong]:text-neutral-900 [&_em]:italic [&_img]:my-8 [&_img]:block [&_img]:mx-auto [&_img]:w-auto [&_img]:max-w-full [&_img]:max-h-[560px] [&_img]:rounded-md [&_img]:border [&_img]:border-neutral-300"
              dangerouslySetInnerHTML={{ __html: rambling.html }}
            />
          </article>
        )}
      </div>
    </Layout>
  );
}
