import { Link } from "wouter";
import { format } from "date-fns";
import Layout from "@/components/Layout";
import { getRambling } from "@/lib/ramblings";
import { User } from "@/lib/types";

interface RamblingPageProps {
  slug: string;
  user: User | null;
  onLogout?: () => void;
  onSignIn?: () => void;
}

export default function RamblingPage({ slug, user, onLogout, onSignIn }: RamblingPageProps) {
  const rambling = getRambling(slug);

  return (
    <Layout user={user} onLogout={onLogout} onSignIn={onSignIn}>
      <div className="container mx-auto px-4 pt-4 pb-16">
        <Link
          href="/rambling"
          className="inline-block font-mono text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          ← ramblings
        </Link>

        {!rambling ? (
          <div className="py-16 text-center font-mono text-sm text-muted-foreground">
            that rambling doesn't exist.
          </div>
        ) : (
          <article className="mx-auto mt-8 max-w-[640px]">
            <h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground">
              {rambling.title}
            </h1>
            {rambling.date && (
              <p className="mt-1.5 font-mono text-xs text-muted-foreground/70">
                {format(new Date(rambling.date), "MMM d, yyyy")}
              </p>
            )}
            <div
              className="mt-8 text-[15px] leading-relaxed text-foreground/90 [&_p]:mb-5 [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2 [&_a:hover]:text-primary/80 [&_strong]:font-semibold [&_strong]:text-foreground [&_em]:italic"
              dangerouslySetInnerHTML={{ __html: rambling.html }}
            />
          </article>
        )}
      </div>
    </Layout>
  );
}
