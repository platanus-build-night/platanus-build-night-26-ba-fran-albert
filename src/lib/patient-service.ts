export type {
  Patient,
  PatientRecord,
  Antecedente,
  Evolution,
  Medication,
  LabResult,
} from "./mock-data";
export { buildPatientContext } from "./mock-data";

import {
  getPatientById as getMockPatient,
  PATIENTS,
  type PatientRecord,
} from "./mock-data";
import { fetchPatientRecord, searchPatientsEHR } from "./ehr-adapter";

function isEhrMode(): boolean {
  return process.env.DATA_SOURCE === "ehr";
}

export async function getPatientById(
  id: string,
  token?: string,
): Promise<PatientRecord | undefined> {
  if (isEhrMode() && token) {
    return await fetchPatientRecord(id, token);
  }
  return getMockPatient(id);
}

export interface PatientSearchResult {
  id: string;
  firstName: string;
  lastName: string;
  age: number;
  healthInsurance: string;
}

export async function searchPatients(
  query: string,
  token?: string,
): Promise<PatientSearchResult[]> {
  if (isEhrMode() && token) {
    return await searchPatientsEHR(query, token);
  }

  const q = query.toLowerCase();
  return PATIENTS.filter((r) => {
    const p = r.patient;
    return (
      p.firstName.toLowerCase().includes(q) ||
      p.lastName.toLowerCase().includes(q) ||
      p.documentNumber.includes(q)
    );
  }).map((r) => ({
    id: r.patient.id,
    firstName: r.patient.firstName,
    lastName: r.patient.lastName,
    age: r.patient.age,
    healthInsurance: r.patient.healthInsurance,
  }));
}
