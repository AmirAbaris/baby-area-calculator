import AreaCalculator from "@/components/area-calculator";

export default function Home() {
  return (
    <div className="container min-h-dvh mx-auto py-32 px-4 flex flex-col items-center space-y-11 md:px-0">
      <div className={'text-center'}>
        <h2 className="font-black text-3xl">محاسبه مساحت</h2>
          <p className="mt-4 text-muted-foreground text-xl">
          یک شکل بسته روی بوم بکشید تا مساحت آن خودکار محاسبه شود
          </p>
      </div>
      <AreaCalculator />
    </div>
  );
}
