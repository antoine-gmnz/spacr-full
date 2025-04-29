import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import type { JSX } from "react";

interface PaginationWrapperProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function PaginationWrapper({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationWrapperProps): JSX.Element {
  const renderEllipsis = (key: string) => (
    <PaginationItem className="hover:cursor-pointer" key={key}>
      <PaginationEllipsis />
    </PaginationItem>
  );

  const renderPageLink = (page: number) => (
    <PaginationItem className="hover:cursor-pointer" key={page}>
      <PaginationLink
        isActive={currentPage === page}
        onClick={() => onPageChange(page)}
      >
        {page}
      </PaginationLink>
    </PaginationItem>
  );

  const renderPageLinks = () => {
    const pageLinks = [];

    // Always show the first page
    pageLinks.push(renderPageLink(1));

    // Show ellipsis if current page is greater than 3
    if (currentPage > 3) {
      pageLinks.push(renderEllipsis("ellipsis-start"));
    }

    // Show the previous page if it's not the first page
    if (currentPage > 2) {
      pageLinks.push(renderPageLink(currentPage - 1));
    }

    // Show the current page
    if (currentPage !== 1 && currentPage !== totalPages) {
      pageLinks.push(renderPageLink(currentPage));
    }

    // Show the next page if it's not the last page
    if (currentPage < totalPages - 1) {
      pageLinks.push(renderPageLink(currentPage + 1));
    }

    // Show ellipsis if current page is less than totalPages - 2
    if (currentPage < totalPages - 2) {
      pageLinks.push(renderEllipsis("ellipsis-end"));
    }

    // Always show the last page
    if (totalPages > 1) {
      pageLinks.push(renderPageLink(totalPages));
    }

    return pageLinks;
  };

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem className="hover:cursor-pointer">
          <PaginationPrevious onClick={() => onPageChange(currentPage - 1)} />
        </PaginationItem>
        {renderPageLinks()}
        <PaginationItem className="hover:cursor-pointer">
          <PaginationNext onClick={() => onPageChange(currentPage + 1)} />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
