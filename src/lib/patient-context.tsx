'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface PatientContextType {
  selectedPatientId: string | null;
  setSelectedPatientId: (id: string | null) => void;
}

const PatientContext = createContext<PatientContextType | undefined>(undefined);

export function PatientProvider({ children }: { children: ReactNode }) {
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);

  return (
    <PatientContext.Provider value={{ selectedPatientId, setSelectedPatientId }}>
      {children}
    </PatientContext.Provider>
  );
}

export function useSelectedPatient() {
  const context = useContext(PatientContext);
  if (!context) {
    throw new Error('useSelectedPatient debe usarse dentro de PatientProvider');
  }
  return context;
}
