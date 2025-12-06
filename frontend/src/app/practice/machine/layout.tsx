import { MachineConfigProvider } from "../../../components/providers/MachineConfigProvider";

export default function MachineLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MachineConfigProvider>
      <div className="relative min-h-screen flex items-center justify-center bg-background px-4">
        {/* Background effects */}
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-1/2 left-1/2 h-[800px] w-[800px] -translate-x-1/2 rounded-full bg-gradient-to-b from-primary/5 to-transparent blur-3xl" />
        </div>

        {/* Centered Container */}
        <div className="w-full max-w-4xl">
          {children}
        </div>
      </div>
    </MachineConfigProvider>
  );
}
