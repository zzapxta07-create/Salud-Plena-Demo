'use client';

import { useEffect, useState } from 'react';
import { Search, X } from 'lucide-react';
import { useSelectedPatient } from '@/lib/patient-context';
import { calcAge, fullName } from '@/lib/utils';

interface Patient {
  id: string;
  firstName: string;
  middleName?: string;
  firstLastName: string;
  secondLastName?: string;
  birthDate: string;
  documentNumber: string;
  gender: string;
  entityName?: string;
  status: string;
}

export function PatientContextSelector() {
  const { selectedPatientId, setSelectedPatientId } = useSelectedPatient();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [q, setQ] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const res = await fetch('/api/patients');
        const data = await res.json();
        setPatients(data);
        if (selectedPatientId) {
          const found = data.find((p: Patient) => p.id === selectedPatientId);
          setSelectedPatient(found || null);
        }
      } catch (error) {
        console.error('Failed to fetch patients:', error);
      }
    };
    fetchPatients();
  }, [selectedPatientId]);

  const filtered = patients.filter((p) => {
    const matchQ = !q.trim() ||
      p.documentNumber.includes(q) ||
      fullName(p).toLowerCase().includes(q.toLowerCase());
    return matchQ;
  });

  const handleSelect = (patient: Patient) => {
    setSelectedPatientId(patient.id);
    setSelectedPatient(patient);
    setIsOpen(false);
    setQ('');
  };

  const handleClear = () => {
    setSelectedPatientId(null);
    setSelectedPatient(null);
    setQ('');
  };

  return (
    <div className="relative">
      {/* Botón para abrir selector */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg border border-ink-200 bg-white hover:bg-ink-50 text-sm text-left transition"
      >
        {selectedPatient ? (
          <>
            <div className="w-7 h-7 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-xs font-medium flex-shrink-0">
              {selectedPatient.firstName[0]}{selectedPatient.firstLastName[0]}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-ink-900 truncate">{fullName(selectedPatient)}</div>
              <div className="text-[11px] text-ink-500">CC {selectedPatient.documentNumber}</div>
            </div>
            <X className="w-4 h-4 text-ink-400 flex-shrink-0" onClick={(e) => { e.stopPropagation(); handleClear(); }} />
          </>
        ) : (
          <>
            <Search className="w-4 h-4 text-ink-400 flex-shrink-0" />
            <span className="text-ink-500">Seleccionar paciente...</span>
          </>
        )}
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-ink-200 rounded-lg shadow-lg z-50">
          {/* Search input */}
          <div className="p-2 border-b border-ink-100">
            <input
              autoFocus
              type="text"
              placeholder="Buscar por documento, nombre..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="input text-sm w-full"
            />
          </div>

          {/* Patient list */}
          <div className="max-h-64 overflow-y-auto">
            {filtered.length > 0 ? (
              filtered.map((patient) => (
                <button
                  key={patient.id}
                  onClick={() => handleSelect(patient)}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-left text-sm hover:bg-ink-50 transition border-b border-ink-100 last:border-b-0 ${
                    selectedPatientId === patient.id ? 'bg-brand-50' : ''
                  }`}
                >
                  <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-xs font-medium flex-shrink-0">
                    {patient.firstName[0]}{patient.firstLastName[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-ink-900">{fullName(patient)}</div>
                    <div className="text-[11px] text-ink-500">
                      CC {patient.documentNumber} · {calcAge(patient.birthDate)} años · {patient.entityName ?? '—'}
                    </div>
                  </div>
                  {selectedPatientId === patient.id && (
                    <div className="w-2 h-2 rounded-full bg-brand-600 flex-shrink-0" />
                  )}
                </button>
              ))
            ) : (
              <div className="px-3 py-4 text-center text-sm text-ink-500">
                Sin pacientes que coincidan
              </div>
            )}
          </div>

          {/* Clear button */}
          {selectedPatient && (
            <div className="p-2 border-t border-ink-100">
              <button
                onClick={handleClear}
                className="w-full px-3 py-2 text-sm text-ink-600 hover:bg-ink-50 rounded transition"
              >
                Ver todos
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
