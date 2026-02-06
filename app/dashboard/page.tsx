import { SectionCards } from "./_components/section-cards";
import { ChartAreaInteractive } from "./_components/chart-interactive";

export default async function Dashboard() {
  return (
    <section className="flex flex-col items-start justify-start p-6 w-full">
      <div className="w-full">
        <div className="flex flex-col items-start justify-center gap-2">
          <h1 className="text-3xl font-semibold tracking-tight">
            Interactive Chart
          </h1>
          <p className="text-muted-foreground">
            Interactive chart with data visualization and interactive elements.
          </p>
        </div>
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <SectionCards />
            <ChartAreaInteractive />
          </div>
        </div>
      </div>
    </section>
  );
}
