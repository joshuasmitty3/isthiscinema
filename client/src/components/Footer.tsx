
import React from 'react';

export function Footer() {
  return (
    <footer className="bg-primary/10 py-3 text-center text-sm text-neutral-600">
      <div className="container mx-auto px-4">
        <p>is it cinema? &copy; {new Date().getFullYear()}</p>
      </div>
    </footer>
  );
}
