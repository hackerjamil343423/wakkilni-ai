"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MoreVertical } from "lucide-react";
import dynamic from "next/dynamic";

// Dynamic import to avoid SSR issues
const WorldMap = dynamic(() => import("./world-map"), { ssr: false });

interface CountryData {
  flag: string;
  name: string;
  customers: number;
  percentage: number;
}

interface CustomersDemographicProps {
  data?: CountryData[];
}

const defaultData: CountryData[] = [
  { flag: "🇺🇸", name: "USA", customers: 2379, percentage: 79 },
  { flag: "🇫🇷", name: "France", customers: 589, percentage: 23 },
  { flag: "🇩🇪", name: "Germany", customers: 342, percentage: 18 },
  { flag: "🇬🇧", name: "United Kingdom", customers: 256, percentage: 14 },
];

export function CustomersDemographic({
  data = defaultData,
}: CustomersDemographicProps) {
  return (
    <Card className="bg-white border border-slate-200 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold text-slate-900">
              Customers Demographic
            </CardTitle>
            <p className="text-xs text-slate-500 mt-1">
              Number of customers by country
            </p>
          </div>
          <button className="text-slate-400 hover:text-slate-600 transition-colors">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {/* World Map */}
        <div className="mb-6 rounded-lg border border-slate-100 h-64 overflow-hidden">
          <WorldMap data={data} />
        </div>

        {/* Country List */}
        <div className="space-y-3">
          {data.slice(0, 2).map((country, index) => (
            <div key={index} className="space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{country.flag}</span>
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      {country.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {country.customers.toLocaleString()} Customers
                    </p>
                  </div>
                </div>
                <span className="text-sm font-semibold text-slate-900">
                  {country.percentage}%
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all"
                  style={{ width: `${country.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
