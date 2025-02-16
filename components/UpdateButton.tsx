// app/components/update-button.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function UpdateButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showError, setShowError] = useState(false);

  const updateData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/update-market-data");
      const data = await response.json();

      if (!data.success) {
        setError(data.message);
        setShowError(true);
      } else {
        router.refresh(); // Refresh the page to show new data
      }
    } catch (error) {
      setError("Failed to update market data");
      setShowError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button onClick={updateData} disabled={loading}>
        {loading ? "Updating..." : "Update Market Data"}
      </Button>

      <AlertDialog open={showError} onOpenChange={setShowError}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Error</AlertDialogTitle>
            <AlertDialogDescription>{error}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowError(false)}>
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
