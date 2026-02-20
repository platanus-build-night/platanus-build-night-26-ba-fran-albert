export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  documentNumber: string;
  birthDate: string;
  age: number;
  gender: "M" | "F";
  bloodType: string;
  rhFactor: "+" | "-";
  healthInsurance: string;
}

export interface Antecedente {
  category: "PATOLOGICO" | "FAMILIAR" | "QUIRURGICO" | "HABITO" | "ALERGIA";
  name: string;
  value: string;
  observations?: string;
}

export interface Evolution {
  id: number;
  doctorName: string;
  specialty: string;
  date: string;
  fields: {
    name: string;
    value: string;
  }[];
}

export interface Medication {
  name: string;
  dose: string;
  frequency: string;
  status: "ACTIVE" | "SUSPENDED";
  startDate: string;
}

export interface LabResult {
  testName: string;
  value: number;
  unit: string;
  referenceMin: number;
  referenceMax: number;
  alert: "normal" | "warning" | "critical";
  date: string;
}

export interface PatientRecord {
  patient: Patient;
  antecedentes: Antecedente[];
  evolutions: Evolution[];
  medications: Medication[];
  labs: LabResult[];
}

export const PATIENTS: PatientRecord[] = [
  {
    patient: {
      id: "p-001",
      firstName: "Carlos",
      lastName: "Mendez",
      documentNumber: "18.456.789",
      birthDate: "1960-03-15",
      age: 65,
      gender: "M",
      bloodType: "A",
      rhFactor: "+",
      healthInsurance: "OSDE 310",
    },
    antecedentes: [
      { category: "PATOLOGICO", name: "Hipertension arterial", value: "SI", observations: "Diagnosticada en 2010. Buen control con medicacion" },
      { category: "PATOLOGICO", name: "Diabetes mellitus tipo 2", value: "SI", observations: "Diagnosticada en 2015. HbA1c ultima: 7.2%" },
      { category: "PATOLOGICO", name: "Dislipemia", value: "SI", observations: "Colesterol total elevado, en tratamiento con estatinas" },
      { category: "PATOLOGICO", name: "Infarto agudo de miocardio", value: "SI", observations: "IAM anterior en 2020. Angioplastia con stent en DA" },
      { category: "FAMILIAR", name: "Padre: IAM a los 58 anos", value: "SI" },
      { category: "FAMILIAR", name: "Madre: DBT tipo 2", value: "SI" },
      { category: "QUIRURGICO", name: "Angioplastia coronaria", value: "SI", observations: "2020 - Stent farmacologico en DA" },
      { category: "QUIRURGICO", name: "Colecistectomia laparoscopica", value: "SI", observations: "2018" },
      { category: "HABITO", name: "Tabaquismo", value: "Ex-tabaquista", observations: "Dejo en 2020 post-IAM. Fumaba 20 cig/dia por 30 anos" },
      { category: "HABITO", name: "Alcohol", value: "Social", observations: "1-2 copas de vino los fines de semana" },
      { category: "ALERGIA", name: "Penicilina", value: "SI", observations: "Rash cutaneo" },
    ],
    evolutions: [
      {
        id: 1,
        doctorName: "Dr. Rodriguez",
        specialty: "Cardiologia",
        date: "2026-02-10",
        fields: [
          { name: "Motivo de consulta", value: "Control cardiologico semestral" },
          { name: "Enfermedad actual", value: "Paciente de 65 anos con antecedente de IAM anterior (2020) con stent en DA. Refiere buena tolerancia al ejercicio, camina 30 minutos diarios sin angor ni disnea. Niega palpitaciones, sincope o edemas." },
          { name: "Examen fisico", value: "TA 130/82 mmHg. FC 68 lpm regular. Peso 86kg. Talla 1.75m. IMC 28.1. Ruidos cardiacos normofonicos, sin soplos. Pulsos perifericos presentes y simetricos. Sin edemas." },
          { name: "Diagnostico", value: "Cardiopatia isquemica cronica. Post-angioplastia con stent en DA. HTA controlada. DBT2 en seguimiento." },
          { name: "Plan", value: "Mantiene medicacion actual. Solicito ergometria de control. Laboratorio con perfil lipidico y HbA1c. Continuar actividad fisica. Control en 6 meses o antes si presenta sintomas." },
        ],
      },
      {
        id: 2,
        doctorName: "Dra. Fernandez",
        specialty: "Clinica Medica",
        date: "2026-01-20",
        fields: [
          { name: "Motivo de consulta", value: "Control de diabetes y chequeo general" },
          { name: "Enfermedad actual", value: "Paciente diabetico tipo 2 en tratamiento con metformina y empagliflozina. Refiere buen cumplimiento del tratamiento. Automonitoreo glucemico con valores de ayuno entre 110-140 mg/dL. Niega hipoglucemias. Refiere poliuria leve nocturna (2 veces/noche)." },
          { name: "Examen fisico", value: "TA 128/80. FC 72. Peso 86kg (estable). Pies: pulsos presentes, sensibilidad conservada, sin lesiones. Fondo de ojo pendiente." },
          { name: "Diagnostico", value: "DBT tipo 2 con control glucemico aceptable. HTA controlada. Sobrepeso." },
          { name: "Plan", value: "Solicito HbA1c, glucemia, funcion renal, perfil lipidico, orina completa. Derivar a oftalmologia para fondo de ojo anual. Reforzar dieta hipoglucemica. Control en 3 meses con laboratorio." },
        ],
      },
      {
        id: 3,
        doctorName: "Dr. Rodriguez",
        specialty: "Cardiologia",
        date: "2025-08-05",
        fields: [
          { name: "Motivo de consulta", value: "Control post-ergometria" },
          { name: "Enfermedad actual", value: "Trae resultado de ergometria: prueba clinica y electricamente negativa. Alcanza 8.5 METS. Buena capacidad funcional. Asintomatico." },
          { name: "Examen fisico", value: "TA 126/78. FC 64. Sin hallazgos patologicos." },
          { name: "Diagnostico", value: "Cardiopatia isquemica cronica estable. Buena capacidad funcional." },
          { name: "Plan", value: "Continuar tratamiento. Ecocardiograma Doppler de control. Proximo control en 6 meses." },
        ],
      },
    ],
    medications: [
      { name: "Aspirina 100mg", dose: "1 comprimido", frequency: "Una vez al dia", status: "ACTIVE", startDate: "2020-05-10" },
      { name: "Clopidogrel 75mg", dose: "1 comprimido", frequency: "Una vez al dia", status: "SUSPENDED", startDate: "2020-05-10" },
      { name: "Atorvastatina 40mg", dose: "1 comprimido", frequency: "Una vez al dia (noche)", status: "ACTIVE", startDate: "2020-05-10" },
      { name: "Enalapril 10mg", dose: "1 comprimido", frequency: "Cada 12 horas", status: "ACTIVE", startDate: "2010-03-20" },
      { name: "Metformina 850mg", dose: "1 comprimido", frequency: "Cada 12 horas (con comidas)", status: "ACTIVE", startDate: "2015-07-15" },
      { name: "Empagliflozina 10mg", dose: "1 comprimido", frequency: "Una vez al dia", status: "ACTIVE", startDate: "2023-01-10" },
      { name: "Bisoprolol 2.5mg", dose: "1 comprimido", frequency: "Una vez al dia", status: "ACTIVE", startDate: "2020-05-10" },
    ],
    labs: [
      { testName: "Glucemia", value: 128, unit: "mg/dL", referenceMin: 70, referenceMax: 110, alert: "warning", date: "2026-01-22" },
      { testName: "HbA1c", value: 7.2, unit: "%", referenceMin: 4, referenceMax: 6.5, alert: "warning", date: "2026-01-22" },
      { testName: "Colesterol total", value: 185, unit: "mg/dL", referenceMin: 0, referenceMax: 200, alert: "normal", date: "2026-01-22" },
      { testName: "LDL", value: 88, unit: "mg/dL", referenceMin: 0, referenceMax: 100, alert: "normal", date: "2026-01-22" },
      { testName: "HDL", value: 42, unit: "mg/dL", referenceMin: 40, referenceMax: 200, alert: "normal", date: "2026-01-22" },
      { testName: "Trigliceridos", value: 178, unit: "mg/dL", referenceMin: 0, referenceMax: 150, alert: "warning", date: "2026-01-22" },
      { testName: "Creatinina", value: 1.1, unit: "mg/dL", referenceMin: 0.7, referenceMax: 1.3, alert: "normal", date: "2026-01-22" },
      { testName: "Urea", value: 42, unit: "mg/dL", referenceMin: 10, referenceMax: 50, alert: "normal", date: "2026-01-22" },
      { testName: "Hemoglobina", value: 14.2, unit: "g/dL", referenceMin: 13, referenceMax: 17, alert: "normal", date: "2026-01-22" },
    ],
  },
  {
    patient: {
      id: "p-002",
      firstName: "Maria Elena",
      lastName: "Gutierrez",
      documentNumber: "25.789.123",
      birthDate: "1978-11-22",
      age: 47,
      gender: "F",
      bloodType: "O",
      rhFactor: "+",
      healthInsurance: "Swiss Medical",
    },
    antecedentes: [
      { category: "PATOLOGICO", name: "Hipotiroidismo", value: "SI", observations: "Diagnosticado en 2019. Tiroiditis de Hashimoto" },
      { category: "PATOLOGICO", name: "Ansiedad generalizada", value: "SI", observations: "En tratamiento psicologico y psiquiatrico desde 2022" },
      { category: "PATOLOGICO", name: "Migranas", value: "SI", observations: "Desde la adolescencia, episodios 2-3/mes" },
      { category: "FAMILIAR", name: "Madre: cancer de mama a los 62 anos", value: "SI" },
      { category: "FAMILIAR", name: "Hermana: hipotiroidismo", value: "SI" },
      { category: "QUIRURGICO", name: "Cesarea", value: "SI", observations: "2008 y 2012" },
      { category: "HABITO", name: "Tabaquismo", value: "NO" },
      { category: "HABITO", name: "Actividad fisica", value: "Yoga 3 veces/semana" },
      { category: "ALERGIA", name: "Sin alergias conocidas", value: "NO" },
    ],
    evolutions: [
      {
        id: 4,
        doctorName: "Dra. Paredes",
        specialty: "Endocrinologia",
        date: "2026-02-05",
        fields: [
          { name: "Motivo de consulta", value: "Control de hipotiroidismo" },
          { name: "Enfermedad actual", value: "Paciente de 47 anos con hipotiroidismo por Hashimoto en tratamiento con levotiroxina. Refiere cansancio moderado en las ultimas semanas, ganancia de 2kg en 3 meses. Transito intestinal lento. Niega intolerancia al frio, caida de cabello excesiva o sequedad de piel significativa." },
          { name: "Examen fisico", value: "TA 118/74. FC 62. Peso 68kg (66kg en control anterior). Tiroides palpable, tamano normal, sin nodulos. Piel y faneras normales. Reflejos osteotendinosos normales." },
          { name: "Diagnostico", value: "Hipotiroidismo por Hashimoto. Posible subdosificacion de levotiroxina." },
          { name: "Plan", value: "Solicito TSH, T4 libre, anticuerpos anti-TPO. Aumento levotiroxina de 75mcg a 88mcg. Control con laboratorio en 6-8 semanas. Reforzar toma en ayunas 30 min antes del desayuno." },
        ],
      },
      {
        id: 5,
        doctorName: "Dr. Vidal",
        specialty: "Psiquiatria",
        date: "2026-01-15",
        fields: [
          { name: "Motivo de consulta", value: "Control de tratamiento ansioso" },
          { name: "Enfermedad actual", value: "Paciente con trastorno de ansiedad generalizada en tratamiento con sertralina y alprazolam. Refiere mejoria global del cuadro ansioso, menor frecuencia de crisis de angustia. Duerme mejor, 6-7hs/noche. Continua psicoterapia semanal. Tolera bien la medicacion." },
          { name: "Examen fisico", value: "Vigil, orientada. Animo eutimico. Sin ideacion suicida ni heteroagresiva. Juicio conservado." },
          { name: "Diagnostico", value: "TAG en remision parcial. Buena respuesta al tratamiento." },
          { name: "Plan", value: "Mantiene sertralina 50mg/dia. Inicio descenso gradual de alprazolam: de 0.5mg/noche a 0.25mg/noche por 4 semanas, luego suspender. Control en 1 mes." },
        ],
      },
    ],
    medications: [
      { name: "Levotiroxina 88mcg", dose: "1 comprimido", frequency: "En ayunas, 30 min antes del desayuno", status: "ACTIVE", startDate: "2019-06-10" },
      { name: "Sertralina 50mg", dose: "1 comprimido", frequency: "Una vez al dia (manana)", status: "ACTIVE", startDate: "2022-09-01" },
      { name: "Alprazolam 0.25mg", dose: "1 comprimido", frequency: "Antes de dormir (en descenso)", status: "ACTIVE", startDate: "2022-09-01" },
      { name: "Sumatriptan 50mg", dose: "1 comprimido", frequency: "SOS (al inicio de la migrana)", status: "ACTIVE", startDate: "2020-03-15" },
    ],
    labs: [
      { testName: "TSH", value: 5.8, unit: "mUI/L", referenceMin: 0.4, referenceMax: 4.0, alert: "warning", date: "2026-02-07" },
      { testName: "T4 libre", value: 0.9, unit: "ng/dL", referenceMin: 0.8, referenceMax: 1.8, alert: "normal", date: "2026-02-07" },
      { testName: "Anti-TPO", value: 320, unit: "UI/mL", referenceMin: 0, referenceMax: 35, alert: "critical", date: "2026-02-07" },
      { testName: "Hemoglobina", value: 12.8, unit: "g/dL", referenceMin: 12, referenceMax: 16, alert: "normal", date: "2026-02-07" },
      { testName: "Glucemia", value: 92, unit: "mg/dL", referenceMin: 70, referenceMax: 110, alert: "normal", date: "2026-02-07" },
      { testName: "Colesterol total", value: 210, unit: "mg/dL", referenceMin: 0, referenceMax: 200, alert: "warning", date: "2026-02-07" },
    ],
  },
  {
    patient: {
      id: "p-003",
      firstName: "Jorge Luis",
      lastName: "Ramirez",
      documentNumber: "32.145.678",
      birthDate: "1990-07-08",
      age: 35,
      gender: "M",
      bloodType: "B",
      rhFactor: "-",
      healthInsurance: "Galeno",
    },
    antecedentes: [
      { category: "PATOLOGICO", name: "Asma bronquial", value: "SI", observations: "Desde la infancia. Leve intermitente, usa salbutamol SOS" },
      { category: "PATOLOGICO", name: "Lumbalgia cronica", value: "SI", observations: "Hernia de disco L4-L5 diagnosticada por RMN en 2024" },
      { category: "FAMILIAR", name: "Padre: asma", value: "SI" },
      { category: "FAMILIAR", name: "Abuelo paterno: cancer de colon a los 70 anos", value: "SI" },
      { category: "QUIRURGICO", name: "Apendicectomia", value: "SI", observations: "2005, a los 15 anos" },
      { category: "HABITO", name: "Tabaquismo", value: "NO" },
      { category: "HABITO", name: "Actividad fisica", value: "Running 3 veces/semana, gimnasio 2 veces/semana" },
      { category: "HABITO", name: "Alcohol", value: "Ocasional" },
      { category: "ALERGIA", name: "Polvo y acaros", value: "SI", observations: "Rinitis alergica estacional" },
    ],
    evolutions: [
      {
        id: 6,
        doctorName: "Dr. Mansilla",
        specialty: "Traumatologia",
        date: "2026-02-12",
        fields: [
          { name: "Motivo de consulta", value: "Dolor lumbar reagudizado" },
          { name: "Enfermedad actual", value: "Paciente de 35 anos con hernia discal L4-L5 conocida. Consulta por reagudizacion de dolor lumbar con irradiacion a MII (ciatica) desde hace 5 dias, posterior a esfuerzo en gimnasio (peso muerto). Dolor EVA 7/10 que empeora con la sedestacion y mejora en decubito. Refiere parestesias en cara lateral de pierna izquierda y planta del pie." },
          { name: "Examen fisico", value: "Marcha antalgica. Lasegue positivo a 40 grados MII. Fuerza conservada en ambos MMII. ROT aquiliano izquierdo disminuido. Sensibilidad tactil disminuida en territorio L5-S1 izquierdo. Sin deficit motor." },
          { name: "Diagnostico", value: "Lumbociatica izquierda por hernia discal L4-L5. Reagudizacion post-esfuerzo." },
          { name: "Plan", value: "Reposo relativo 72hs. Diclofenac 75mg c/12hs por 5 dias. Ciclobenzaprina 10mg/noche por 7 dias. Pregabalina 75mg/noche. Suspender gimnasio 3 semanas. Solicito RMN lumbosacra de control. Derivar a kinesiologia. Control en 2 semanas con RMN." },
        ],
      },
      {
        id: 7,
        doctorName: "Dra. Fernandez",
        specialty: "Clinica Medica",
        date: "2025-12-10",
        fields: [
          { name: "Motivo de consulta", value: "Chequeo anual" },
          { name: "Enfermedad actual", value: "Paciente de 35 anos, consulta por control de salud anual. Asintomatico. Activo fisicamente. Sin sintomas respiratorios, niega uso reciente de salbutamol. Lumbalgia estable, controlada con actividad fisica." },
          { name: "Examen fisico", value: "TA 120/72. FC 58. Peso 78kg. Talla 1.80m. IMC 24.1. Auscultacion pulmonar: buena entrada de aire bilateral, sin sibilancias. Cardiovascular: R1R2 normofonicos, sin soplos. Abdomen blando, indoloro." },
          { name: "Diagnostico", value: "Paciente sano. Asma leve intermitente controlada. Lumbalgia cronica estable." },
          { name: "Plan", value: "Laboratorio completo de rutina. Continuar actividad fisica evitando sobrecarga lumbar. Vacunacion antigripal pendiente. Control en 1 ano." },
        ],
      },
    ],
    medications: [
      { name: "Salbutamol inhalador 100mcg", dose: "2 puffs", frequency: "SOS (antes de ejercicio o crisis)", status: "ACTIVE", startDate: "2010-01-01" },
      { name: "Diclofenac 75mg", dose: "1 comprimido", frequency: "Cada 12 horas (por 5 dias)", status: "ACTIVE", startDate: "2026-02-12" },
      { name: "Ciclobenzaprina 10mg", dose: "1 comprimido", frequency: "Antes de dormir (por 7 dias)", status: "ACTIVE", startDate: "2026-02-12" },
      { name: "Pregabalina 75mg", dose: "1 capsula", frequency: "Antes de dormir", status: "ACTIVE", startDate: "2026-02-12" },
    ],
    labs: [
      { testName: "Hemoglobina", value: 15.8, unit: "g/dL", referenceMin: 13, referenceMax: 17, alert: "normal", date: "2025-12-15" },
      { testName: "Hematocrito", value: 46, unit: "%", referenceMin: 40, referenceMax: 54, alert: "normal", date: "2025-12-15" },
      { testName: "Glucemia", value: 88, unit: "mg/dL", referenceMin: 70, referenceMax: 110, alert: "normal", date: "2025-12-15" },
      { testName: "Colesterol total", value: 175, unit: "mg/dL", referenceMin: 0, referenceMax: 200, alert: "normal", date: "2025-12-15" },
      { testName: "Creatinina", value: 0.95, unit: "mg/dL", referenceMin: 0.7, referenceMax: 1.3, alert: "normal", date: "2025-12-15" },
      { testName: "Hepatograma GOT", value: 22, unit: "U/L", referenceMin: 0, referenceMax: 40, alert: "normal", date: "2025-12-15" },
      { testName: "Hepatograma GPT", value: 28, unit: "U/L", referenceMin: 0, referenceMax: 41, alert: "normal", date: "2025-12-15" },
    ],
  },
  {
    patient: {
      id: "p-004",
      firstName: "Ana Laura",
      lastName: "Dominguez",
      documentNumber: "35.678.901",
      birthDate: "1993-04-12",
      age: 32,
      gender: "F",
      bloodType: "A",
      rhFactor: "+",
      healthInsurance: "OSDE 210",
    },
    antecedentes: [
      { category: "PATOLOGICO", name: "Diabetes gestacional", value: "SI", observations: "Diagnosticada semana 24. En tratamiento con dieta e insulina" },
      { category: "PATOLOGICO", name: "ITU recurrente", value: "SI", observations: "3 episodios en el ultimo ano" },
      { category: "PATOLOGICO", name: "Anemia ferropenica", value: "SI", observations: "En tratamiento con hierro oral" },
      { category: "FAMILIAR", name: "Madre: DBT tipo 2", value: "SI" },
      { category: "FAMILIAR", name: "Padre: HTA", value: "SI" },
      { category: "QUIRURGICO", name: "Sin antecedentes quirurgicos", value: "NO" },
      { category: "HABITO", name: "Tabaquismo", value: "NO" },
      { category: "HABITO", name: "Actividad fisica", value: "Caminatas diarias 30 min" },
      { category: "ALERGIA", name: "Sulfonamidas", value: "SI", observations: "Rash cutaneo generalizado" },
    ],
    evolutions: [
      {
        id: 8,
        doctorName: "Dra. Lopez",
        specialty: "Obstetricia",
        date: "2026-02-15",
        fields: [
          { name: "Motivo de consulta", value: "Control obstetrico semana 28" },
          { name: "Enfermedad actual", value: "Embarazo de 28 semanas por FUM concordante con ecografia. Diabetes gestacional diagnosticada en semana 24, en tratamiento con plan alimentario y 2 dosis de insulina NPH. Automonitoreo con valores preprandiales entre 80-95 mg/dL y postprandiales entre 110-130 mg/dL. Refiere movimientos fetales activos. Niega perdidas, contracciones, cefalea o edemas." },
          { name: "Examen fisico", value: "TA 110/68. Peso 72kg (+8kg total). AU 28cm. LCF 142 lpm con Doppler. Presentacion cefalica. Edemas leves en MMII. Especuloscopia: cuello cerrado, sin perdidas." },
          { name: "Diagnostico", value: "Embarazo de 28 semanas. DBT gestacional controlada. Anemia en tratamiento." },
          { name: "Plan", value: "Ecografia obstétrica de control en 2 semanas. Laboratorio: glucemia, HbA1c, hemograma, ferritina. Mantiene insulina NPH 10UI manana + 8UI noche. Monitoreo fetal semanal a partir de semana 32. Control en 2 semanas." },
        ],
      },
    ],
    medications: [
      { name: "Insulina NPH", dose: "10UI manana + 8UI noche", frequency: "Subcutanea", status: "ACTIVE", startDate: "2026-01-10" },
      { name: "Hierro polimaltosato 100mg", dose: "1 comprimido", frequency: "Una vez al dia con jugo de naranja", status: "ACTIVE", startDate: "2025-12-01" },
      { name: "Acido folico 5mg", dose: "1 comprimido", frequency: "Una vez al dia", status: "ACTIVE", startDate: "2025-06-01" },
      { name: "Progesterona 200mg", dose: "1 ovulo", frequency: "Antes de dormir", status: "SUSPENDED", startDate: "2025-06-15" },
    ],
    labs: [
      { testName: "Glucemia", value: 92, unit: "mg/dL", referenceMin: 70, referenceMax: 95, alert: "normal", date: "2026-02-10" },
      { testName: "HbA1c", value: 5.8, unit: "%", referenceMin: 4, referenceMax: 5.6, alert: "warning", date: "2026-02-10" },
      { testName: "Hemoglobina", value: 10.2, unit: "g/dL", referenceMin: 11, referenceMax: 16, alert: "warning", date: "2026-02-10" },
      { testName: "Hematocrito", value: 31, unit: "%", referenceMin: 33, referenceMax: 45, alert: "warning", date: "2026-02-10" },
      { testName: "Ferritina", value: 8, unit: "ng/mL", referenceMin: 15, referenceMax: 200, alert: "critical", date: "2026-02-10" },
      { testName: "Urocultivo", value: 0, unit: "UFC/mL", referenceMin: 0, referenceMax: 100000, alert: "normal", date: "2026-02-10" },
    ],
  },
  {
    patient: {
      id: "p-005",
      firstName: "Roberto Oscar",
      lastName: "Villanueva",
      documentNumber: "10.234.567",
      birthDate: "1953-09-30",
      age: 72,
      gender: "M",
      bloodType: "O",
      rhFactor: "-",
      healthInsurance: "PAMI",
    },
    antecedentes: [
      { category: "PATOLOGICO", name: "EPOC Gold III", value: "SI", observations: "Diagnosticado en 2018. Usa oxigeno domiciliario nocturno" },
      { category: "PATOLOGICO", name: "Insuficiencia cardiaca cronica", value: "SI", observations: "FEVI 38%, NYHA II. Ecocardiograma 2025: dilatacion VI leve" },
      { category: "PATOLOGICO", name: "Fibrilacion auricular cronica", value: "SI", observations: "Anticoagulado con apixaban" },
      { category: "PATOLOGICO", name: "IRC estadio 3a", value: "SI", observations: "ClCr 48 mL/min. Nefrologo cada 6 meses" },
      { category: "PATOLOGICO", name: "HTA", value: "SI", observations: "De larga data, controlada" },
      { category: "PATOLOGICO", name: "Gota", value: "SI", observations: "Ultimo ataque hace 6 meses" },
      { category: "FAMILIAR", name: "Padre: ACV a los 68 anos", value: "SI" },
      { category: "FAMILIAR", name: "Madre: ICC", value: "SI" },
      { category: "QUIRURGICO", name: "Protesis de cadera derecha", value: "SI", observations: "2022" },
      { category: "QUIRURGICO", name: "Hernioplastia inguinal bilateral", value: "SI", observations: "2015" },
      { category: "HABITO", name: "Tabaquismo", value: "Ex-tabaquista", observations: "Dejo en 2018. Fumaba 40 cig/dia por 45 anos. IPA 90" },
      { category: "HABITO", name: "Alcohol", value: "NO" },
      { category: "ALERGIA", name: "AINEs", value: "SI", observations: "Broncoespasmo con ibuprofeno y diclofenac" },
      { category: "ALERGIA", name: "Contraste yodado", value: "SI", observations: "Reaccion anafilactoide en 2019" },
    ],
    evolutions: [
      {
        id: 9,
        doctorName: "Dra. Fernandez",
        specialty: "Clinica Medica",
        date: "2026-02-18",
        fields: [
          { name: "Motivo de consulta", value: "Disnea progresiva y edemas" },
          { name: "Enfermedad actual", value: "Paciente de 72 anos con ICC y EPOC conocidos. Consulta por aumento de disnea en la ultima semana, de CF II a III (disnea al vestirse, subir 5 escalones). Ortopnea de 2 almohadas. Edemas en MMII progresivos. Aumento de peso 3kg en 10 dias. Tos productiva con esputo blanquecino, sin fiebre. Refiere haber comido con mas sal durante un evento familiar." },
          { name: "Examen fisico", value: "TA 145/88. FC 92 irregular. FR 22. SatO2 90% (AA). Peso 88kg (+3kg). Ingurgitacion yugular 2/3. Rales crepitantes bibasales hasta campos medios. Sibilancias espiratorias difusas. R1R2 arritmicos, soplo sistolico mitral II/VI. Edemas MMII 3+ con godet hasta rodillas. Hepatomegalia 2cm debajo del reborde costal." },
          { name: "Diagnostico", value: "Descompensacion de ICC (probable por transgresion alimentaria). EPOC reagudizado vs congestion pulmonar. FA cronica con respuesta ventricular alta." },
          { name: "Plan", value: "Furosemida 40mg EV ahora, luego 40mg VO c/12hs. Restriccion hidrica 1.5L/dia y sodica. Control de peso diario. Ajustar bisoprolol de 2.5mg a 5mg. Mantener apixaban. Laboratorio urgente: funcion renal, ionograma, BNP, hemograma. Rx torax. ECG 12 derivaciones. Nebulizaciones con salbutamol + ipratropio. Control en 48hs con laboratorio. Si empeora, internacion." },
        ],
      },
      {
        id: 10,
        doctorName: "Dr. Gimenez",
        specialty: "Neumonologia",
        date: "2026-01-08",
        fields: [
          { name: "Motivo de consulta", value: "Control de EPOC" },
          { name: "Enfermedad actual", value: "Paciente con EPOC Gold III, ex tabaquista IPA 90. Usa tiotropio + formoterol/budesonide inhalados. Oxigeno nocturno 2L/min. Refiere 1 exacerbacion en los ultimos 6 meses (octubre 2025), tratada ambulatoriamente con corticoides y antibioticos. Actualmente estable, disnea mMRC 2." },
          { name: "Examen fisico", value: "TA 138/82. FC 78 irregular. SatO2 92% (AA). Torax: hipersonoridad, espiacion prolongada, roncus basales bilaterales. Sin sibilancias en reposo." },
          { name: "Diagnostico", value: "EPOC Gold III grupo E. Ex tabaquista. 1 exacerbacion en 6 meses." },
          { name: "Plan", value: "Mantiene triple terapia inhalatoria. Espirometria de control. Vacunacion antineumococica (refuerzo pendiente). Control en 3 meses." },
        ],
      },
    ],
    medications: [
      { name: "Apixaban 5mg", dose: "1 comprimido", frequency: "Cada 12 horas", status: "ACTIVE", startDate: "2021-03-15" },
      { name: "Furosemida 40mg", dose: "1 comprimido", frequency: "Una vez al dia (manana)", status: "ACTIVE", startDate: "2023-06-01" },
      { name: "Bisoprolol 2.5mg", dose: "1 comprimido", frequency: "Una vez al dia", status: "ACTIVE", startDate: "2023-06-01" },
      { name: "Enalapril 10mg", dose: "1 comprimido", frequency: "Cada 12 horas", status: "ACTIVE", startDate: "2015-01-01" },
      { name: "Espironolactona 25mg", dose: "1 comprimido", frequency: "Una vez al dia", status: "ACTIVE", startDate: "2023-06-01" },
      { name: "Tiotropio 18mcg", dose: "1 capsula inhalada", frequency: "Una vez al dia", status: "ACTIVE", startDate: "2018-09-01" },
      { name: "Formoterol/Budesonide 12/400mcg", dose: "1 inhalacion", frequency: "Cada 12 horas", status: "ACTIVE", startDate: "2020-01-15" },
      { name: "Alopurinol 100mg", dose: "1 comprimido", frequency: "Una vez al dia", status: "ACTIVE", startDate: "2024-08-01" },
      { name: "Omeprazol 20mg", dose: "1 capsula", frequency: "En ayunas", status: "ACTIVE", startDate: "2020-01-15" },
      { name: "Oxigeno domiciliario", dose: "2 L/min", frequency: "Nocturno (8hs)", status: "ACTIVE", startDate: "2022-01-01" },
    ],
    labs: [
      { testName: "Creatinina", value: 1.8, unit: "mg/dL", referenceMin: 0.7, referenceMax: 1.3, alert: "critical", date: "2026-02-18" },
      { testName: "Urea", value: 68, unit: "mg/dL", referenceMin: 10, referenceMax: 50, alert: "warning", date: "2026-02-18" },
      { testName: "Potasio", value: 5.4, unit: "mEq/L", referenceMin: 3.5, referenceMax: 5.0, alert: "warning", date: "2026-02-18" },
      { testName: "Sodio", value: 133, unit: "mEq/L", referenceMin: 135, referenceMax: 145, alert: "warning", date: "2026-02-18" },
      { testName: "BNP", value: 890, unit: "pg/mL", referenceMin: 0, referenceMax: 100, alert: "critical", date: "2026-02-18" },
      { testName: "Hemoglobina", value: 11.8, unit: "g/dL", referenceMin: 13, referenceMax: 17, alert: "warning", date: "2026-02-18" },
      { testName: "Acido urico", value: 8.2, unit: "mg/dL", referenceMin: 3.5, referenceMax: 7.0, alert: "warning", date: "2026-02-18" },
      { testName: "INR", value: 1.1, unit: "", referenceMin: 0.8, referenceMax: 1.2, alert: "normal", date: "2026-02-18" },
    ],
  },
];

export function getPatientById(id: string): PatientRecord | undefined {
  return PATIENTS.find((p) => p.patient.id === id);
}

export function buildPatientContext(record: PatientRecord): string {
  const { patient, antecedentes, evolutions, medications, labs } = record;

  let ctx = "";

  ctx += `## PACIENTE\n`;
  ctx += `- Nombre: ${patient.firstName} ${patient.lastName}\n`;
  ctx += `- Edad: ${patient.age} anos\n`;
  ctx += `- Sexo: ${patient.gender === "M" ? "Masculino" : "Femenino"}\n`;
  ctx += `- Grupo sanguineo: ${patient.bloodType}${patient.rhFactor}\n`;
  ctx += `- Obra social: ${patient.healthInsurance}\n\n`;

  ctx += `## ANTECEDENTES\n`;
  const categories = [...new Set(antecedentes.map((a) => a.category))];
  for (const cat of categories) {
    const catLabel =
      cat === "PATOLOGICO"
        ? "Patologicos"
        : cat === "FAMILIAR"
          ? "Familiares"
          : cat === "QUIRURGICO"
            ? "Quirurgicos"
            : cat === "HABITO"
              ? "Habitos"
              : "Alergias";
    ctx += `### ${catLabel}\n`;
    for (const a of antecedentes.filter((x) => x.category === cat)) {
      ctx += `- ${a.name}: ${a.value}`;
      if (a.observations) ctx += ` (${a.observations})`;
      ctx += "\n";
    }
  }

  ctx += `\n## EVOLUCIONES RECIENTES\n`;
  for (const evo of evolutions.slice(0, 10)) {
    ctx += `### ${evo.date} - ${evo.doctorName} (${evo.specialty})\n`;
    for (const f of evo.fields) {
      ctx += `**${f.name}:** ${f.value}\n`;
    }
    ctx += "\n";
  }

  ctx += `## MEDICACION ACTUAL\n`;
  const active = medications.filter((m) => m.status === "ACTIVE");
  for (const med of active) {
    ctx += `- ${med.name} - ${med.dose}, ${med.frequency}\n`;
  }

  if (labs.length > 0) {
    ctx += `\n## ULTIMO LABORATORIO (${labs[0].date})\n`;
    for (const lab of labs) {
      const flag =
        lab.alert === "critical"
          ? " [CRITICO]"
          : lab.alert === "warning"
            ? " [ALERTA]"
            : "";
      ctx += `- ${lab.testName}: ${lab.value} ${lab.unit} (ref: ${lab.referenceMin}-${lab.referenceMax})${flag}\n`;
    }
  }

  return ctx;
}
