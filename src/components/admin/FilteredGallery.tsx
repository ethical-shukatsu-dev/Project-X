"use client";

import {useEffect, useMemo, useState} from "react";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {Loader2, Search, X} from "lucide-react";
import {ValueImage} from "@/lib/supabase/client";

// FilteredGallery component to isolate filtering logic
export function FilteredGallery({
  images,
  VALUE_CATEGORIES,
  isLoading,
}: {
  images: ValueImage[];
  VALUE_CATEGORIES: {value: string; label: string}[];
  isLoading: boolean;
}) {
  // Filter state (contained in this component)
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [inputValue, setInputValue] = useState<string>("");
  const [activeFilters, setActiveFilters] = useState<{
    category: string;
    searchTerm: string;
  }>({category: "all", searchTerm: ""});
  const [isFiltering, setIsFiltering] = useState(false);

  // Apply filters when search is executed
  useEffect(() => {
    if (
      images.length > 0 &&
      (activeFilters.category !== "all" ||
        activeFilters.searchTerm.trim() !== "")
    ) {
      setIsFiltering(true);

      // Short timeout to show loading state for better UX
      const filterTimer = setTimeout(() => {
        setIsFiltering(false);
      }, 300);

      return () => clearTimeout(filterTimer);
    } else {
      setIsFiltering(false);
    }
  }, [activeFilters, images.length]);

  // Handle input changes without triggering search
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  // Handle key press - trigger search on Enter
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      executeSearch();
    }
  };

  // Execute search with current filter values
  const executeSearch = () => {
    setActiveFilters({
      category: filterCategory,
      searchTerm: inputValue.trim(),
    });
    setIsFiltering(true);
  };

  // Clear search
  const handleClearSearch = () => {
    setInputValue("");
  };

  // Handle filter reset
  const handleResetFilters = () => {
    setFilterCategory("all");
    setInputValue("");
    setActiveFilters({category: "all", searchTerm: ""});
    setIsFiltering(false);
  };

  // Calculate filtered images
  const filteredImages = useMemo(() => {
    if (images.length === 0) return [];

    // Quick return if no filters applied
    if (activeFilters.category === "all" && activeFilters.searchTerm === "") {
      return images;
    }

    // First apply category filter (faster)
    let result = images;

    if (activeFilters.category !== "all") {
      result = result.filter(
        (image) => image.category === activeFilters.category
      );
    }

    // Then apply search term filter (slower)
    if (activeFilters.searchTerm) {
      const term = activeFilters.searchTerm.toLowerCase();

      // Optimize filtering by using more efficient checks
      result = result.filter((image) => {
        // Check name first (most common match)
        if (image.value_name.toLowerCase().includes(term)) return true;

        // Then check description if it exists
        if (image.description && image.description.toLowerCase().includes(term))
          return true;

        // Finally check tags if they exist (most expensive)
        return (
          image.tags &&
          image.tags.some((tag) => tag.toLowerCase().includes(term))
        );
      });
    }

    return result;
  }, [images, activeFilters]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Value Images Gallery</CardTitle>
        <CardDescription>Manage existing value images.</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Filter Controls */}
        <div className="mb-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-4">
              <Label htmlFor="filter-category" className="mb-2 block">
                Filter by Category
              </Label>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {VALUE_CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-span-6">
              <Label htmlFor="search-term" className="mb-2 block">
                Search
              </Label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  id="search-term"
                  value={inputValue}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyPress}
                  placeholder="Search by name, description, or tag"
                  className="w-full pl-9 pr-9"
                />
                {inputValue && (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="absolute right-2.5 top-2.5 h-4 w-4 text-gray-500 hover:text-gray-700"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            </div>

            <div className="md:col-span-2 flex flex-col justify-end">
              <div className="flex flex-col space-y-2">
                <Button
                  onClick={executeSearch}
                  disabled={isFiltering}
                  className="w-full"
                >
                  {isFiltering ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Search className="h-4 w-4 mr-2" />
                  )}
                  Search
                </Button>

                <Button
                  variant="outline"
                  onClick={handleResetFilters}
                  disabled={
                    (activeFilters.category === "all" &&
                      !activeFilters.searchTerm) ||
                    isFiltering
                  }
                  className="w-full"
                >
                  Reset
                </Button>
              </div>
            </div>
          </div>

          {/* Filter stats */}
          <div className="text-sm text-gray-500">
            Showing {filteredImages.length} of {images.length} images
            {activeFilters.category &&
              activeFilters.category !== "all" &&
              ` in category "${
                VALUE_CATEGORIES.find(
                  (cat) => cat.value === activeFilters.category
                )?.label || activeFilters.category
              }"`}
            {activeFilters.searchTerm &&
              ` matching "${activeFilters.searchTerm}"`}
            {isFiltering && " (filtering...)"}
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading images...</span>
          </div>
        ) : filteredImages.length === 0 && !isFiltering ? (
          <p>
            No images match your current filters. Try adjusting your filters or{" "}
            <button
              onClick={handleResetFilters}
              className="text-primary underline hover:text-primary/80"
              disabled={isFiltering}
            >
              reset them
            </button>
            .
          </p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredImages.map((image) => (
              <div key={image.id} className="relative group">
                <div className="aspect-square relative rounded-md overflow-hidden">
                  <Image
                    src={image.image_url}
                    alt={image.description || image.value_name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="mt-2">
                  <p className="font-medium">{image.value_name}</p>
                  <p className="text-sm text-gray-500">{image.category}</p>
                  {image.tags && image.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {image.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
