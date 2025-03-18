"use client";

import React, {useState, useEffect} from "react";
import {Button} from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {ValueImage} from "@/lib/supabase/client";
import Image from "next/image";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {Loader2} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {FilteredGallery} from "@/components/admin/FilteredGallery";

// Define the categories for value images
const VALUE_CATEGORIES = [
  {value: "hobbies", label: "Hobbies & Interests"},
  {value: "work_values", label: "Work Values"},
  {value: "leadership_values", label: "Leadership Values"},
  {value: "company_culture", label: "Company Culture"},
  {value: "work_environment", label: "Work Environment"},
  {value: "innovation", label: "Innovation"},
  {
    value: "personal_professional_growth",
    label: "Personal & Professional Growth",
  },
  {value: "work_life_balance", label: "Work-Life Balance & Well-being"},
  {value: "financial_job_security", label: "Financial & Job Security"},
  {value: "impact_purpose", label: "Impact & Purpose"},
  {value: "communication_transparency", label: "Communication & Transparency"},
  {value: "recognition_appreciation", label: "Recognition & Appreciation"},
];

export default function AdminValueImagesPage() {
  const [images, setImages] = useState<ValueImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isFetchingPexels, setIsFetchingPexels] = useState(false);
  const [isFetchingUnsplash, setIsFetchingUnsplash] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [category, setCategory] = useState<string>("");
  const [valueName, setValueName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [tags, setTags] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [pexelsCategory, setPexelsCategory] = useState<string>("all");
  const [pexelsCount, setPexelsCount] = useState<number>(10);
  const [unsplashCategory, setUnsplashCategory] = useState<string>("all");
  const [unsplashCount, setUnsplashCount] = useState<number>(10);
  const [activeTab, setActiveTab] = useState<string>("upload");

  // Fetch existing images on component mount
  useEffect(() => {
    fetchImages();
  }, []);

  // Fetch images from the API
  const fetchImages = async () => {
    try {
      const response = await fetch("/api/value-images");
      if (!response.ok) {
        throw new Error("Failed to fetch images");
      }
      const data = await response.json();
      setImages(data);
    } catch (error) {
      console.error("Error fetching images:", error);
      setError("Failed to fetch images");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validate form
    if (!selectedFile || !category || !valueName) {
      setError("Please fill in all required fields");
      return;
    }

    setIsUploading(true);
    setError(null);
    setSuccess(null);

    try {
      const formData = new FormData();
      formData.append("image", selectedFile);
      formData.append("category", category);
      formData.append("value_name", valueName);

      if (description) {
        formData.append("description", description);
      }

      if (tags) {
        // Parse tags as a comma-separated list
        const tagArray = tags.split(",").map((tag) => tag.trim());
        formData.append("tags", JSON.stringify(tagArray));
      }

      const response = await fetch("/api/value-images", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to upload image");
      }

      // Reset form
      setSelectedFile(null);
      setPreviewUrl(null);
      setCategory("");
      setValueName("");
      setDescription("");
      setTags("");

      // Show success message
      setSuccess("Image uploaded successfully");

      // Refresh images
      fetchImages();
    } catch (error) {
      console.error("Error uploading image:", error);
      setError(
        error instanceof Error ? error.message : "Failed to upload image"
      );
    } finally {
      setIsUploading(false);
    }
  };

  // Handle fetching images from Pexels
  const handleFetchPexelsImages = async () => {
    setIsFetchingPexels(true);
    setError(null);
    setSuccess(null);

    try {
      const payload = {
        action: "fetch_pexels",
        category:
          pexelsCategory && pexelsCategory !== "all"
            ? pexelsCategory
            : undefined,
        count: pexelsCount,
      };

      const response = await fetch("/api/value-images", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Failed to fetch images from Pexels"
        );
      }

      const data = await response.json();

      // Show success message
      setSuccess(data.message || "Images fetched successfully from Pexels");

      // Refresh images
      fetchImages();
    } catch (error) {
      console.error("Error fetching Pexels images:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Failed to fetch images from Pexels"
      );
    } finally {
      setIsFetchingPexels(false);
    }
  };

  // Handle fetching images from Unsplash
  const handleFetchUnsplashImages = async () => {
    setIsFetchingUnsplash(true);
    setError(null);
    setSuccess(null);

    try {
      const payload = {
        action: "fetch_unsplash",
        category:
          unsplashCategory && unsplashCategory !== "all"
            ? unsplashCategory
            : undefined,
        count: unsplashCount,
      };

      const response = await fetch("/api/value-images", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Failed to fetch images from Unsplash"
        );
      }

      const data = await response.json();

      // Show success message
      setSuccess(data.message || "Images fetched successfully from Unsplash");

      // Refresh images
      fetchImages();
    } catch (error) {
      console.error("Error fetching Unsplash images:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Failed to fetch images from Unsplash"
      );
    } finally {
      setIsFetchingUnsplash(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Value Images Admin</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upload">Upload Image</TabsTrigger>
          <TabsTrigger value="fetch-pexels">Fetch from Pexels</TabsTrigger>
          <TabsTrigger value="fetch-unsplash">Fetch from Unsplash</TabsTrigger>
        </TabsList>

        {/* Upload Tab */}
        <TabsContent value="upload">
          <Card>
            <CardHeader>
              <CardTitle>Upload New Value Image</CardTitle>
              <CardDescription>
                Upload images that represent different values for the
                questionnaire.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                {error && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    {error}
                  </div>
                )}

                {success && (
                  <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                    {success}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="image">Image *</Label>
                    <Input
                      id="image"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      required
                    />

                    {previewUrl && (
                      <div className="mt-2 relative aspect-square w-full max-w-[200px] rounded-md overflow-hidden">
                        <Image
                          src={previewUrl}
                          alt="Preview"
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="category" className="mb-2 block">
                        Category *
                      </Label>
                      <Select
                        value={category}
                        onValueChange={setCategory}
                        required
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          {VALUE_CATEGORIES.map((cat) => (
                            <SelectItem key={cat.value} value={cat.value}>
                              {cat.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="value_name">Value Name *</Label>
                      <Input
                        id="value_name"
                        value={valueName}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setValueName(e.target.value)
                        }
                        placeholder="e.g., collaborative, innovative"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <textarea
                        id="description"
                        value={description}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                          setDescription(e.target.value)
                        }
                        placeholder="Describe what this image represents"
                        rows={3}
                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="tags">Tags (comma-separated)</Label>
                      <Input
                        id="tags"
                        value={tags}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setTags(e.target.value)
                        }
                        placeholder="e.g., teamwork, collaboration, office"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>

              <CardFooter>
                <Button type="submit" disabled={isUploading}>
                  {isUploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    "Upload Image"
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>

        {/* Fetch from Pexels Tab */}
        <TabsContent value="fetch-pexels">
          <Card>
            <CardHeader>
              <CardTitle>Fetch Images from Pexels</CardTitle>
              <CardDescription>
                Automatically fetch and save images from Pexels API based on
                value categories.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              {success && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                  {success}
                </div>
              )}

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="pexels-category" className="mb-2 block">
                    Category (optional)
                  </Label>
                  <Select
                    value={pexelsCategory}
                    onValueChange={setPexelsCategory}
                  >
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
                  <p className="text-sm text-gray-500 mt-1">
                    Leave empty to fetch images for all categories.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pexels-count">Number of Images</Label>
                  <Input
                    id="pexels-count"
                    type="number"
                    min={1}
                    max={100}
                    value={pexelsCount}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setPexelsCount(parseInt(e.target.value) || 10)
                    }
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    For a single category, this is the total number of images.
                    For all categories, this is per category.
                  </p>
                </div>
              </div>
            </CardContent>

            <CardFooter>
              <Button
                onClick={handleFetchPexelsImages}
                disabled={isFetchingPexels}
              >
                {isFetchingPexels ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Fetching Images...
                  </>
                ) : (
                  "Fetch Images from Pexels"
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Fetch from Unsplash Tab */}
        <TabsContent value="fetch-unsplash">
          <Card>
            <CardHeader>
              <CardTitle>Fetch Images from Unsplash</CardTitle>
              <CardDescription>
                Automatically fetch and save images from Unsplash API based on
                value categories.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              {success && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                  {success}
                </div>
              )}

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="unsplash-category" className="mb-2 block">
                    Category (optional)
                  </Label>
                  <Select
                    value={unsplashCategory}
                    onValueChange={setUnsplashCategory}
                  >
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
                  <p className="text-sm text-gray-500 mt-1">
                    Leave empty to fetch images for all categories.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="unsplash-count">Number of Images</Label>
                  <Input
                    id="unsplash-count"
                    type="number"
                    min={1}
                    max={100}
                    value={unsplashCount}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setUnsplashCount(parseInt(e.target.value) || 10)
                    }
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    For a single category, this is the total number of images.
                    For all categories, this is per category.
                  </p>
                </div>
              </div>
            </CardContent>

            <CardFooter>
              <Button
                onClick={handleFetchUnsplashImages}
                disabled={isFetchingUnsplash}
              >
                {isFetchingUnsplash ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Fetching Images...
                  </>
                ) : (
                  "Fetch Images from Unsplash"
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

      <FilteredGallery
        images={images}
        VALUE_CATEGORIES={VALUE_CATEGORIES}
        isLoading={isLoading}
      />
    </div>
  );
}
