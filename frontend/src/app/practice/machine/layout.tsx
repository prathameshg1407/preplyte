// src/app/practice/machine/layout.tsx

import { MachineConfigProvider } from '@/components/providers/MachineConfigProvider';

export default function MachineLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MachineConfigProvider>
      {children}
    </MachineConfigProvider>
  );
}