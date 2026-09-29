"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { QRLabelGenerator } from "@/components/qr/QRLabelGenerator";
import { Equipment } from "@/types";

export default function QRLabelsPage() {
  const [equipmentList, setEquipmentList] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/equipment")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setEquipmentList(data);
      })
      .catch((err) => console.error("Error loading equipment for labels:", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <Link
          href="/equipment"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Equipment Directory
        </Link>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center text-emerald-400">
          <RefreshCw className="h-6 w-6 animate-spin" />
        </div>
      ) : (
        <QRLabelGenerator
          equipmentList={equipmentList}
          facilityName="MetroFlex Flagship Club - Downtown"
        />
      )}
    </div>
  );
}
