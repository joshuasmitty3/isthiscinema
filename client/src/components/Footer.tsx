
import React from 'react';

export function Footer() {
  return (
    <footer className="bg-muted/20 py-4 text-center text-sm text-muted-foreground">
      <div className="container mx-auto">
        is it cinema? © {new Date().getFullYear()}
      </div>
    </footer>
  );
}
