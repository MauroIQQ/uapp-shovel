const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });
const { prisma } = require("./client");

const categories = [
  {
    codigo: "LAB", nombre: "Laboratorio y Bioquímica", descripcion: "Exámenes de laboratorio obtenidos a partir de muestras biológicas.", orden: 1,
    subcategorias: [
      { codigo: "LAB001", nombre: "Hematología Completa", descripcion: "Hemograma, serie roja, serie blanca, plaquetas", orden: 1 },
      { codigo: "LAB002", nombre: "Bioquímica Sanguínea", descripcion: "Glicemia, colesterol, triglicéridos, perfil renal, perfil hepático", orden: 2 },
      { codigo: "LAB003", nombre: "Hormonas", descripcion: "TSH, T4, testosterona, estrógenos, cortisol, insulina", orden: 3 },
      { codigo: "LAB004", nombre: "Serología / Inmunología", descripcion: "VIH, Hepatitis, COVID-19, Dengue, anticuerpos", orden: 4 },
      { codigo: "LAB005", nombre: "Estudios de Coagulación", descripcion: "TP, TTPA, INR, fibrinógeno", orden: 5 },
      { codigo: "LAB006", nombre: "Gasometría", descripcion: "Arterial o venosa", orden: 6 },
      { codigo: "LAB007", nombre: "Examen de Orina", descripcion: "EOC, sedimento urinario", orden: 7 },
      { codigo: "LAB008", nombre: "Examen de Heces", descripcion: "Parasitológico, sangre oculta", orden: 8 },
      { codigo: "LAB009", nombre: "Líquidos Biológicos", descripcion: "LCR, pleural, ascítico, sinovial", orden: 9 },
      { codigo: "LAB010", nombre: "Pruebas Especiales", descripcion: "PCR, Dímero D, Ferritina, Procalcitonina", orden: 10 },
    ],
  },
  {
    codigo: "IMG", nombre: "Imagenología y Diagnóstico por Imágenes", descripcion: "Estudios obtenidos mediante equipos de imágenes médicas.", orden: 2,
    subcategorias: [
      { codigo: "IMG001", nombre: "Radiografía (RX)", descripcion: "Tórax, abdomen, columna, extremidades", orden: 1 },
      { codigo: "IMG002", nombre: "Ecografía / Ultrasonido", descripcion: "Abdominal, obstétrica, Doppler, tiroidea, músculo-esquelética", orden: 2 },
      { codigo: "IMG003", nombre: "Tomografía Computarizada (TAC / CT)", descripcion: "Con o sin contraste", orden: 3 },
      { codigo: "IMG004", nombre: "Resonancia Magnética (RM / MRI)", descripcion: "Cerebral, columna, articulaciones, próstata", orden: 4 },
      { codigo: "IMG005", nombre: "Mamografía", descripcion: "Incluye tomosíntesis", orden: 5 },
      { codigo: "IMG006", nombre: "Densitometría Ósea", descripcion: "DEXA", orden: 6 },
      { codigo: "IMG007", nombre: "Medicina Nuclear", descripcion: "PET, SPECT", orden: 7 },
      { codigo: "IMG008", nombre: "Electrocardiograma (ECG / EKG)", descripcion: "Registro eléctrico cardíaco", orden: 8 },
      { codigo: "IMG009", nombre: "Electroencefalograma (EEG)", descripcion: "Actividad eléctrica cerebral", orden: 9 },
    ],
  },
  {
    codigo: "INF", nombre: "Informes Médicos y Evolución", descripcion: "Documentación elaborada por profesionales de salud.", orden: 3,
    subcategorias: [
      { codigo: "INF001", nombre: "Informe de Consulta", descripcion: "Evolución médica ambulatoria", orden: 1 },
      { codigo: "INF002", nombre: "Epicrisis", descripcion: "Resumen de hospitalización o alta médica", orden: 2 },
      { codigo: "INF003", nombre: "Informe Quirúrgico", descripcion: "Protocolo operatorio", orden: 3 },
      { codigo: "INF004", nombre: "Interconsulta", descripcion: "Derivación o respuesta entre especialistas", orden: 4 },
      { codigo: "INF005", nombre: "Certificado Médico", descripcion: "Laboral, escolar, discapacidad, reposo", orden: 5 },
      { codigo: "INF006", nombre: "Historia Clínica Externa", descripcion: "Documentación proveniente de otro centro asistencial", orden: 6 },
    ],
  },
  {
    codigo: "FUN", nombre: "Estudios Funcionales", descripcion: "Exámenes que evalúan el funcionamiento de órganos o sistemas.", orden: 4,
    subcategorias: [
      { codigo: "FUN001", nombre: "Espirometría", descripcion: "Función pulmonar", orden: 1 },
      { codigo: "FUN002", nombre: "Prueba de Esfuerzo", descripcion: "Ergometría", orden: 2 },
      { codigo: "FUN003", nombre: "Holter", descripcion: "ECG 24 horas o Presión Arterial", orden: 3 },
      { codigo: "FUN004", nombre: "Polisomnografía", descripcion: "Estudio del sueño", orden: 4 },
      { codigo: "FUN005", nombre: "Potenciales Evocados", descripcion: "Auditivos, visuales, somatosensoriales", orden: 5 },
      { codigo: "FUN006", nombre: "Endoscopía", descripcion: "Digestiva alta", orden: 6 },
      { codigo: "FUN007", nombre: "Colonoscopía", descripcion: "Colon y recto", orden: 7 },
    ],
  },
  {
    codigo: "PAT", nombre: "Anatomía Patológica y Citología", descripcion: "Estudios histológicos y citológicos.", orden: 5,
    subcategorias: [
      { codigo: "PAT001", nombre: "Biopsia", descripcion: "Cualquier órgano o tejido", orden: 1 },
      { codigo: "PAT002", nombre: "Citología", descripcion: "PAP, líquidos, PAAF", orden: 2 },
      { codigo: "PAT003", nombre: "Pieza Quirúrgica", descripcion: "Estudio anatomopatológico de cirugía", orden: 3 },
      { codigo: "PAT004", nombre: "Inmunohistoquímica", descripcion: "Marcadores tumorales y otros", orden: 4 },
    ],
  },
  {
    codigo: "ADM", nombre: "Documentos Administrativos y Legales", descripcion: "Documentación administrativa asociada a la atención médica.", orden: 6,
    subcategorias: [
      { codigo: "ADM001", nombre: "Orden de Compra / Presupuesto", descripcion: "Cotizaciones y autorizaciones", orden: 1 },
      { codigo: "ADM002", nombre: "Consentimiento Informado", descripcion: "Firmado por el paciente", orden: 2 },
      { codigo: "ADM003", nombre: "Receta Médica", descripcion: "Recetas electrónicas o escaneadas", orden: 3 },
      { codigo: "ADM004", nombre: "Orden de Exámenes", descripcion: "Solicitud de laboratorio o imágenes", orden: 4 },
      { codigo: "ADM005", nombre: "Carnet de Vacunación", descripcion: "Registro de inmunizaciones", orden: 5 },
    ],
  },
  {
    codigo: "OTR", nombre: "Otros", descripcion: "Documentos que no corresponden a las categorías anteriores.", orden: 7,
    subcategorias: [
      { codigo: "OTR001", nombre: "Sin Tipo Definido", descripcion: "Documento sin clasificación", orden: 1 },
      { codigo: "OTR002", nombre: "Documento Personal", descripcion: "Cédula de identidad, pasaporte", orden: 2 },
      { codigo: "OTR003", nombre: "Archivo Clínico General", descripcion: "Cualquier otro documento clínico", orden: 3 },
    ],
  },
];

async function main() {
  console.log("Seeding document categories...\n");

  for (const cat of categories) {
    const created = await prisma.uapp_document_categories.create({
      data: {
        codigo: cat.codigo,
        nombre: cat.nombre,
        descripcion: cat.descripcion,
        orden: cat.orden,
        updated: new Date(),
        subcategorias: {
          create: cat.subcategorias.map((sub) => ({
            codigo: sub.codigo,
            nombre: sub.nombre,
            descripcion: sub.descripcion,
            orden: sub.orden,
            updated: new Date(),
          })),
        },
      },
    });
    console.log("  \u2705", cat.codigo, "-", cat.nombre, "(" + cat.subcategorias.length + " subcategorías)");
  }

  console.log("\n\u2705 Seed completado!");
}

main()
  .catch((e) => {
    console.error("Error:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
