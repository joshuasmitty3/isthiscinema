
export function Footer() {
  return (
    <footer className="py-4 text-center text-sm text-muted-foreground">
      is it cinema? © 2025
    </footer>
  );
}
import React from 'react';

export function Footer() {
  return (
    <footer className="text-center py-4 text-sm text-neutral-500">
      is it cinema? © {new Date().getFullYear()}
    </footer>
  );
}
