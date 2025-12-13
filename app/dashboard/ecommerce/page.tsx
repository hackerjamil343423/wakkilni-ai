import type { Metadata } from "next";
import { EcommerceMetrics } from "./_components/EcommerceMetrics";
import React from "react";
import MonthlyTarget from "./_components/MonthlyTarget";
import MonthlySalesChart from "./_components/MonthlySalesChart";
import StatisticsChart from "./_components/StatisticsChart";
import RecentOrders from "./_components/RecentOrders";
import DemographicCard from "./_components/DemographicCard";

export const metadata: Metadata = {
  title: "Ecommerce Dashboard | Wakklni AI",
  description: "Ecommerce dashboard with sales analytics and order management",
};

export default function EcommerceDashboard() {
  return (
    <div className="min-h-screen bg-slate-50/50">
      <div className="p-4 lg:p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            E-commerce
          </h1>
          <p className="text-slate-600 mt-2">
            Sales analytics and order management dashboard
          </p>
        </div>

        <div className="grid grid-cols-12 gap-4 md:gap-6">
          <div className="col-span-12 space-y-6 xl:col-span-7">
            <EcommerceMetrics />
            <MonthlySalesChart />
          </div>

          <div className="col-span-12 xl:col-span-5">
            <MonthlyTarget />
          </div>

          <div className="col-span-12">
            <StatisticsChart />
          </div>

          <div className="col-span-12 xl:col-span-5">
            <DemographicCard />
          </div>

          <div className="col-span-12 xl:col-span-7">
            <RecentOrders />
          </div>
        </div>
      </div>
    </div>
  );
}
