"use client";

import React from 'react';
import NextLink from 'next/link';
import { useSearchParams } from 'next/navigation';

interface LinkProps extends React.ComponentPropsWithoutRef<typeof NextLink> {
  preserveQuery?: boolean;
}

export const Link: React.FC<LinkProps> = ({
  href,
  preserveQuery = true,
  children,
  ...props
}) => {
  const searchParams = useSearchParams();
  
  // If preserveQuery is false or there are no search params, just use the original href
  if (!preserveQuery || !searchParams.size) {
    return <NextLink href={href} {...props}>{children}</NextLink>;
  }

  // Convert href to string if it's an object
  const hrefString = typeof href === 'object' 
    ? href.pathname || '/' 
    : href.toString();

  // Check if href already has query parameters
  const hasQueryParams = hrefString.includes('?');

  // Create the query string from current search params
  const queryString = searchParams.toString();
  
  // Append the query string to the href
  const newHref = hasQueryParams 
    ? `${hrefString}&${queryString}` 
    : `${hrefString}${queryString ? `?${queryString}` : ''}`;

  return <NextLink href={newHref} {...props}>{children}</NextLink>;
};

export default Link; 