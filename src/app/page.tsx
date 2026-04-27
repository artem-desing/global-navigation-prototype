import { Button } from "@wallarm-org/design-system/Button";

export default function Home() {
  return (
    <main className="flex flex-1 items-center justify-center p-12">
      <div className="flex flex-col gap-6 max-w-xl">
        <h1 className="text-3xl font-semibold tracking-tight">
          Global Navigation Prototype
        </h1>
        <p className="text-base text-neutral-600">
          Internal sandbox for exploring an updated cross-product navigation
          model. Clone, run locally, and propose alternatives via PR.
        </p>
        <div className="flex gap-3">
          <Button>Primary action</Button>
          <Button variant="ghost">Secondary action</Button>
        </div>
      </div>
    </main>
  );
}
