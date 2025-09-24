import React from 'react';

export const Avatar = ({ className, children }: { className?: string; children: React.ReactNode }) => (
  <div className={`relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full ${className}`}>
    {children}
  </div>
);

export const AvatarImage = (props: React.ImgHTMLAttributes<HTMLImageElement>) => (
  <img className="aspect-square h-full w-full" {...props} />
);

export const AvatarFallback = ({ className, children }: { className?: string; children: React.ReactNode }) => (
  <div className={`flex h-full w-full items-center justify-center rounded-full bg-muted ${className}`}>
    {children}
  </div>
);
