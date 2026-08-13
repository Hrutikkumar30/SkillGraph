import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function Card({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("bg-white border border-gray-200 rounded-xl shadow-sm", className)} {...props}>
      {children}
    </div>
  );
}

export function Badge({ children, className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium", className)} {...props}>
      {children}
    </span>
  );
}

export function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-gray-500">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mb-4"></div>
      <p>Loading graph data...</p>
    </div>
  );
}

export function ErrorState({ message = "We couldn't load this data. Please try again." }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-red-500">
      <p className="font-medium text-lg mb-2">Something went wrong</p>
      <p className="text-sm">{message}</p>
    </div>
  );
}

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-300">
      <p>{message}</p>
    </div>
  );
}
