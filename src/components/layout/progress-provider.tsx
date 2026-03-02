'use client';
 
import { ProgressProvider as BaseProgressProvider } from '@bprogress/next/app';
 
const ProgressProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <BaseProgressProvider
      height="4px"
      color="#996A53"
      options={{ showSpinner: false }}
      shallowRouting
    >
      {children}
    </BaseProgressProvider>
  );
};
 
export default ProgressProvider;