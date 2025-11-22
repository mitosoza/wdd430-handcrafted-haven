"use client";

import React from 'react';

export default function ImageWithFallback({
  src,
  alt,
  className,
}: {
  src: string;
  alt?: string;
  className?: string;
}) {
  const [imgSrc, setImgSrc] = React.useState(src);

  return (
    // client-side image so onError can be used safely
    // fallback to placeholder.svg on error
    // eslint-disable-next-line jsx-a11y/alt-text
    <img
      src={imgSrc}
      alt={alt}
      className={className}
      onError={() => {
        if (imgSrc !== '/placeholder.svg') setImgSrc('/placeholder.svg');
      }}
    />
  );
}
