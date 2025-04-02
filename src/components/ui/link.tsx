"use client";

import React from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

interface QueryLinkProps extends React.ComponentPropsWithoutRef<typeof Link> {
  preserveQuery?: boolean;
}

export const QueryLink: React.FC<QueryLinkProps> = ({
  href,
  preserveQuery = true,
  children,
  ...props
}) => {
  const searchParams = useSearchParams();
  
  // If preserveQuery is false or there are no search params, just use the original href
  if (!preserveQuery || !searchParams.size) {
    return <Link href={href} {...props}>{children}</Link>;
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

  return <Link href={newHref} {...props}>{children}</Link>;
};

export default QueryLink; 