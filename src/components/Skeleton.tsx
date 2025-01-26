import React from 'react';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
  );
}

export function SongCardSkeleton() {
  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-md p-4">
      <div className="flex items-center space-x-3">
        <Skeleton className="h-5 w-5" />
        <Skeleton className="h-5 w-32" />
      </div>
      <div className="mt-2">
        <Skeleton className="h-4 w-24" />
      </div>
    </div>
  );
}

export function TimelineEntrySkeleton() {
  return (
    <div className="relative h-8 mb-2">
      <div className="absolute h-full w-1/4 rounded-md bg-gray-200 animate-pulse" 
        style={{ left: `${Math.random() * 75}%` }} />
    </div>
  );
}

export function WorkflowInstrumentSkeleton() {
  return (
    <div className="absolute p-4 rounded-lg bg-gray-200 animate-pulse"
      style={{
        width: '100px',
        height: '100px',
        left: `${Math.random() * 80}%`,
        top: `${Math.random() * 80}%`
      }}>
    </div>
  );
}