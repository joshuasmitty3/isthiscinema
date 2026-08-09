export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center gap-3 bg-background px-4 text-center">
      <h1 className="font-heading text-3xl font-semibold text-foreground">404</h1>
      <p className="font-mono text-sm text-muted-foreground">this page isn't cinema.</p>
      <a href="/" className="font-mono text-sm text-primary hover:underline">← back home</a>
    </div>
  );
}
