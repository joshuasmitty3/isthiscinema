
import React from 'react';

export function Footer() {
  return (
    <footer className="text-center py-4 text-sm text-muted-foreground">
      is it cinema? © {new Date().getFullYear()}
    </footer>
  );
}
