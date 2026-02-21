import type {
  Patient,
  PatientRecord,
  Antecedente,
  Evolution,
  Medication,
  LabResult,
} from "./mock-data";

// ---------------------------------------------------------------------------
// EHR DTO types (generic, based on common HC API patterns)
// ---------------------------------------------------------------------------

interface EHRPatientDTO {
  userId: number;
  name: string;
  lastName: string;
  document: string;
  birthDate: string;
  gender: string;
  bloodType?: string;
  rhFactor?: string;
  healthPlans?: Array<{
    name: string;
    plan?: string;
  }>;
}

interface EHRAntecedentesDTO {
  id: number;
  name: string;
  value: string;
  observations?: string;
  dataType?: {
    id: number;
    name: string;
  };
}

interface EHREvolucionDTO {
  id: number;
  date: string;
  data: Array<{
    fieldName: string;
    value: string;
  }>;
  doctor?: {
    name: string;
    lastName: string;
    specialities?: Array<{ name: string }>;
  };
}

interface EHRMedicationDTO {
  id: number;
  name: string;
  dose: string;
  frequency: string;
  status: string;
  startDate: string;
}

interface EHRStudyDTO {
  id: number;
  date: string;
  type: string;
}

interface EHRLabDataDTO {
  id: number;
  studyId: number;
  bloodTest: {
    name: string;
    unit: string;
    referenceValue: string;
  };
  value: string;
}

interface EHRSearchResultDTO {
  userId: number;
  name: string;
  lastName: string;
  birthDate: string;
  healthPlans?: Array<{ name: string; plan?: string }>;
}

// ---------------------------------------------------------------------------
// Config helpers
// ---------------------------------------------------------------------------

function getBaseUrl(overrideUrl?: string): string {
  const url = overrideUrl || process.env.EHR_API_URL;
  if (!url) throw new Error("EHR_API_URL env var is not set and no override URL provided");
  return url.replace(/\/$/, "");
}

function getEndpoint(envKey: string, defaultPath: string): string {
  return process.env[envKey] || defaultPath;
}

function buildUrl(pathTemplate: string, params: Record<string, string>, ehrUrl?: string): string {
  let path = pathTemplate;
  for (const [key, val] of Object.entries(params)) {
    path = path.replace(`{${key}}`, encodeURIComponent(val));
  }
  return `${getBaseUrl(ehrUrl)}${path}`;
}

// ---------------------------------------------------------------------------
// Generic fetch wrapper
// ---------------------------------------------------------------------------

async function ehrFetch<T>(path: string, token: string): Promise<T> {
  const res = await fetch(path, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) {
    console.error(`[ehr-adapter] API error: ${res.status} ${res.statusText} — ${path}`);
    throw new Error(`EHR API error: ${res.status} ${res.statusText}`);
  }
  return res.json() as Promise<T>;
}

// ---------------------------------------------------------------------------
// Resource fetch functions
// ---------------------------------------------------------------------------

function fetchPatientProfile(patientId: string, token: string, ehrUrl?: string) {
  const endpoint = getEndpoint("EHR_ENDPOINT_PATIENT", "/patient/{id}");
  return ehrFetch<EHRPatientDTO>(buildUrl(endpoint, { id: patientId }, ehrUrl), token);
}

function fetchAntecedentes(patientId: string, token: string, ehrUrl?: string) {
  const endpoint = getEndpoint(
    "EHR_ENDPOINT_ANTECEDENTES",
    "/historia-clinica/{id}/antecedentes",
  );
  return ehrFetch<EHRAntecedentesDTO[]>(buildUrl(endpoint, { id: patientId }, ehrUrl), token);
}

function fetchEvoluciones(patientId: string, token: string, ehrUrl?: string) {
  const endpoint = getEndpoint(
    "EHR_ENDPOINT_EVOLUCIONES",
    "/historia-clinica/{id}/evoluciones",
  );
  return ehrFetch<EHREvolucionDTO[]>(buildUrl(endpoint, { id: patientId }, ehrUrl), token);
}

function fetchMedicacion(patientId: string, token: string, ehrUrl?: string) {
  const endpoint = getEndpoint(
    "EHR_ENDPOINT_MEDICATION",
    "/historia-clinica/{id}/medicacion-actual",
  );
  return ehrFetch<EHRMedicationDTO[]>(buildUrl(endpoint, { id: patientId }, ehrUrl), token);
}

async function fetchLabResults(
  patientId: string,
  token: string,
  ehrUrl?: string,
): Promise<{ studies: EHRStudyDTO[]; labData: EHRLabDataDTO[] }> {
  const studiesEndpoint = getEndpoint("EHR_ENDPOINT_STUDIES", "/study/byUser/{id}");
  const studies = await ehrFetch<EHRStudyDTO[]>(
    buildUrl(studiesEndpoint, { id: patientId }, ehrUrl),
    token,
  );

  if (studies.length === 0) return { studies: [], labData: [] };

  const labDataEndpoint = getEndpoint(
    "EHR_ENDPOINT_LAB_DATA",
    "/blood-test-data/byStudies",
  );
  const studyIds = studies.map((s) => s.id);
  const queryString = studyIds.map((id) => `studiesIds=${id}`).join("&");
  const labDataUrl = `${getBaseUrl(ehrUrl)}${labDataEndpoint}?${queryString}`;

  const labData = await ehrFetch<EHRLabDataDTO[]>(labDataUrl, token);
  return { studies, labData };
}

export async function searchPatientsEHR(
  query: string,
  token: string,
  ehrUrl?: string,
): Promise<Array<{ id: string; firstName: string; lastName: string; age: number; healthInsurance: string }>> {
  const endpoint = getEndpoint("EHR_ENDPOINT_SEARCH", "/patient/search");
  const url = `${getBaseUrl(ehrUrl)}${endpoint}?q=${encodeURIComponent(query)}`;
  const results = await ehrFetch<EHRSearchResultDTO[]>(url, token);
  return results.map((r) => ({
    id: String(r.userId),
    firstName: r.name,
    lastName: r.lastName,
    age: calculateAge(r.birthDate),
    healthInsurance: r.healthPlans?.[0]
      ? [r.healthPlans[0].name, r.healthPlans[0].plan].filter(Boolean).join(" ")
      : "Sin cobertura",
  }));
}

// ---------------------------------------------------------------------------
// Mappers: EHR DTO → MediScribe types
// ---------------------------------------------------------------------------

function calculateAge(birthDate: string): number {
  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

function mapPatient(dto: EHRPatientDTO): Patient {
  const healthInsurance = dto.healthPlans?.[0]
    ? [dto.healthPlans[0].name, dto.healthPlans[0].plan].filter(Boolean).join(" ")
    : "Sin cobertura";

  return {
    id: String(dto.userId),
    firstName: dto.name,
    lastName: dto.lastName,
    documentNumber: dto.document,
    birthDate: dto.birthDate,
    age: calculateAge(dto.birthDate),
    gender: dto.gender?.toUpperCase().startsWith("F") ? "F" : "M",
    bloodType: dto.bloodType || "Desconocido",
    rhFactor: dto.rhFactor === "-" ? "-" : "+",
    healthInsurance,
  };
}

const ANTECEDENTE_CATEGORY_KEYWORDS: Record<Antecedente["category"], string[]> = {
  ALERGIA: ["alergia", "alergico", "alergica", "intolerancia"],
  QUIRURGICO: [
    "cirugia", "quirurgico", "operacion", "intervencion",
    "colecistectomia", "apendicectomia", "cesarea", "angioplastia",
    "artroscopia", "protesis",
  ],
  FAMILIAR: ["padre", "madre", "hermano", "hermana", "abuelo", "abuela", "familiar", "familia"],
  HABITO: ["tabaco", "tabaquismo", "alcohol", "droga", "ejercicio", "actividad fisica", "habito"],
  PATOLOGICO: [],
};

function inferCategory(name: string): Antecedente["category"] {
  const lower = name.toLowerCase();
  for (const [cat, keywords] of Object.entries(ANTECEDENTE_CATEGORY_KEYWORDS)) {
    if (cat === "PATOLOGICO") continue;
    if (keywords.some((kw) => lower.includes(kw))) {
      return cat as Antecedente["category"];
    }
  }
  return "PATOLOGICO";
}

function mapAntecedentes(dtos: EHRAntecedentesDTO[]): Antecedente[] {
  return dtos.map((dto) => ({
    category: inferCategory(dto.dataType?.name ?? dto.name),
    name: dto.name,
    value: dto.value,
    observations: dto.observations,
  }));
}

function mapEvoluciones(dtos: EHREvolucionDTO[]): Evolution[] {
  return dtos.map((dto) => ({
    id: dto.id,
    doctorName: dto.doctor
      ? `Dr. ${dto.doctor.name} ${dto.doctor.lastName}`
      : "Sin datos",
    specialty: dto.doctor?.specialities?.[0]?.name ?? "General",
    date: dto.date.split("T")[0],
    fields: dto.data.map((d) => ({ name: d.fieldName, value: d.value })),
  }));
}

function mapMedications(dtos: EHRMedicationDTO[]): Medication[] {
  return dtos.map((dto) => ({
    name: dto.name,
    dose: dto.dose,
    frequency: dto.frequency,
    status: dto.status?.toUpperCase() === "ACTIVE" ? "ACTIVE" : "SUSPENDED",
    startDate: dto.startDate?.split("T")[0] ?? "",
  }));
}

function parseReferenceValue(ref: string): { min: number; max: number } {
  const trimmed = ref.trim();

  // "0.7 - 1.1" or "70 - 110"
  const rangeMatch = trimmed.match(/^([\d.]+)\s*[-–]\s*([\d.]+)$/);
  if (rangeMatch) {
    return { min: parseFloat(rangeMatch[1]), max: parseFloat(rangeMatch[2]) };
  }

  // "Hasta 200" or "< 129" or "<129"
  const upToMatch = trimmed.match(/^(?:hasta|<)\s*([\d.]+)$/i);
  if (upToMatch) {
    return { min: 0, max: parseFloat(upToMatch[1]) };
  }

  // "> 40" or ">40"
  const greaterMatch = trimmed.match(/^>\s*([\d.]+)$/);
  if (greaterMatch) {
    return { min: parseFloat(greaterMatch[1]), max: Infinity };
  }

  return { min: 0, max: Infinity };
}

function calculateAlert(
  value: number,
  min: number,
  max: number,
): LabResult["alert"] {
  if (min < 0 || (max < 0 && max !== Infinity)) return "normal";
  if (max === Infinity && value >= min) return "normal";
  const critLow = min > 0 ? min * 0.8 : min;
  const critHigh = max < Infinity ? max * 1.2 : Infinity;
  if (value < critLow || value > critHigh) return "critical";
  if (value < min || value > max) return "warning";
  return "normal";
}

function mapLabs(
  studies: EHRStudyDTO[],
  labData: EHRLabDataDTO[],
): LabResult[] {
  const studyDateMap = new Map(studies.map((s) => [s.id, s.date.split("T")[0]]));

  return labData.filter((ld) => {
    const parsed = parseFloat(ld.value);
    return !Number.isNaN(parsed);
  }).map((ld) => {
    const numValue = parseFloat(ld.value);
    const { min, max } = parseReferenceValue(ld.bloodTest.referenceValue);
    return {
      testName: ld.bloodTest.name,
      value: numValue,
      unit: ld.bloodTest.unit,
      referenceMin: min,
      referenceMax: max === Infinity ? 9999 : max,
      alert: calculateAlert(numValue, min, max),
      date: studyDateMap.get(ld.studyId) ?? "",
    };
  });
}

// ---------------------------------------------------------------------------
// Main orchestrator
// ---------------------------------------------------------------------------

export async function fetchPatientRecord(
  patientId: string,
  token: string,
  ehrUrl?: string,
): Promise<PatientRecord> {
  const [patientResult, antecResult, evoResult, medsResult, labsResult] =
    await Promise.allSettled([
      fetchPatientProfile(patientId, token, ehrUrl),
      fetchAntecedentes(patientId, token, ehrUrl),
      fetchEvoluciones(patientId, token, ehrUrl),
      fetchMedicacion(patientId, token, ehrUrl),
      fetchLabResults(patientId, token, ehrUrl),
    ]);

  if (patientResult.status === "rejected") {
    throw new Error(`Failed to fetch patient profile: ${patientResult.reason}`);
  }

  const patient = mapPatient(patientResult.value);

  const antecedentes =
    antecResult.status === "fulfilled"
      ? mapAntecedentes(antecResult.value)
      : [];

  const evolutions =
    evoResult.status === "fulfilled"
      ? mapEvoluciones(evoResult.value)
      : [];

  const medications =
    medsResult.status === "fulfilled"
      ? mapMedications(medsResult.value)
      : [];

  const labs =
    labsResult.status === "fulfilled"
      ? mapLabs(labsResult.value.studies, labsResult.value.labData)
      : [];

  return { patient, antecedentes, evolutions, medications, labs };
}
