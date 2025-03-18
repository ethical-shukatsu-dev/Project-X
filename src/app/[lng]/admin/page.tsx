"use client";

import React, {useState} from "react";
import {Button} from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function AdminPage() {
  const [apiKey, setApiKey] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState("");

  const updateLogos = async () => {
    if (!apiKey) {
      setStatus("error");
      setMessage("API key is required");
      return;
    }

    try {
      setStatus("loading");
      setMessage("Updating company logos...");

      const response = await fetch("/api/update-logos", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setStatus("success");
        setMessage("Company logos update process started successfully");
      } else {
        setStatus("error");
        setMessage(`Error: ${data.error || "Unknown error"}`);
      }
    } catch (error) {
      setStatus("error");
      setMessage(
        `Error: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  };

  const updateDomains = async () => {
    if (!apiKey) {
      setStatus("error");
      setMessage("API key is required");
      return;
    }

    try {
      setStatus("loading");
      setMessage("Updating company site URLs...");

      const response = await fetch("/api/update-domains", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setStatus("success");
        setMessage(`Company site URLs update completed. Updated: ${data.updated}, Failed: ${data.failed}`);
      } else {
        setStatus("error");
        setMessage(`Error: ${data.error || "Unknown error"}`);
      }
    } catch (error) {
      setStatus("error");
      setMessage(
        `Error: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  };

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Admin Panel</CardTitle>
          <CardDescription>Manage company data and settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">API Key</label>
            <Input
              type="password"
              placeholder="Enter API key"
              value={apiKey}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setApiKey(e.target.value)
              }
            />
          </div>
          {status !== "idle" && (
            <div
              className={`p-3 rounded ${
                status === "loading"
                  ? "bg-blue-100 text-blue-800"
                  : status === "success"
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {message}
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          <Button
            onClick={updateLogos}
            disabled={status === "loading"}
            className="w-full"
          >
            {status === "loading" && message.includes("logos") ? "Updating..." : "Update Company Logos"}
          </Button>
          <Button
            onClick={updateDomains}
            disabled={status === "loading"}
            className="w-full"
          >
            {status === "loading" && message.includes("site URLs") ? "Updating..." : "Update Company Site URLs"}
          </Button>
          <Button
            onClick={() => window.location.href = "./admin/value-images"}
            className="w-full"
          >
            Manage Value Images
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
