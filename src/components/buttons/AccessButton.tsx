import React from "react";
import { domainConfigs } from "@/components/data/links";

interface AccessButtonProps {
  className?: string;
}

export function AccessButton({ className }: AccessButtonProps) {
  const handleKomunitasClick = () => {
    if (typeof window !== "undefined") {
      const config = domainConfigs.find(
        (d) => d.hostname === window.location.hostname
      );
      if (config?.openInNewTab) {
        window.open(config.url, "_blank");
      } else {
        window.location.href = "/menu/komunitas";
      }
    }
  };

  return (
    <button
      onClick={handleKomunitasClick}
      className={`flex-1 py-3 rounded-lg bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold hover:opacity-90 transition-opacity ${
        className ?? ""
      }`}
    >
      <i className="fas fa-unlock mr-2"></i> Get Access
    </button>
  );
}
