"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import useRentModal from "@/app/hooks/useRentModal";

export default function SewakanBarangPage() {
  const rentModal = useRentModal();
  const router = useRouter();

  useEffect(() => {
    // Open the rent modal when visiting this route
    const t = setTimeout(() => {
      rentModal.onOpen();
    }, 0);
    return () => clearTimeout(t);
  }, [rentModal]);

  // If user closes the modal, navigate back to home for a clean URL
  useEffect(() => {
    if (!rentModal.isOpen) return;
    const handle = () => {
      router.push("/");
    };
    // naive effect: when modal closes, redirect
    return () => {
      if (!rentModal.isOpen) handle();
    };
  }, [rentModal.isOpen, router]);

  return null;
}
