# MediScribe

Asistente de IA para documentacion clinica en espanol. El medico habla o escribe en texto libre, MediScribe genera la evolucion clinica estructurada en tiempo real.

Proyecto creado para [Platanus Build Night #26](https://build-night.platan.us/) - Buenos Aires, Febrero 2026.

## Features

- **Voz a evolucion** - Dicta la consulta con el microfono (Web Speech API, es-AR). La IA la estructura automaticamente en formato de evolucion clinica (motivo de consulta, enfermedad actual, examen fisico, diagnostico, plan).
- **Resumen de HC** - Genera un resumen conciso de la historia clinica completa del paciente con un click.
- **Chat contextual** - Preguntale sobre el paciente: medicacion, antecedentes, ultimos estudios. La IA responde con datos de la HC.

## Tech Stack

- **Next.js 16** (App Router, Turbopack)
- **TypeScript** (strict mode)
- **Tailwind CSS** + **shadcn/ui**
- **Anthropic SDK** (Claude Sonnet)
- **Web Speech API** (reconocimiento de voz nativo)
- **Server-Sent Events** (streaming de respuestas)

## Setup

```bash
# Clonar
git clone https://github.com/platanus-build-night/platanus-build-night-26-ba-fran-albert.git
cd platanus-build-night-26-ba-fran-albert

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local y agregar tu ANTHROPIC_API_KEY

# Desarrollo
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000).

## Variables de entorno

| Variable | Descripcion |
|---|---|
| `ANTHROPIC_API_KEY` | API key de Anthropic (requerida) |

## Estructura del proyecto

```
src/
  app/
    page.tsx              # Landing page
    demo/page.tsx         # Demo interactivo
    api/
      chat/route.ts       # Chat con streaming SSE
      generate-evolution/route.ts  # Texto libre -> evolucion estructurada
      summarize/route.ts  # Resumen de HC
  components/mediscribe/
    patient-selector.tsx  # Selector de pacientes
    patient-info.tsx      # Informacion del paciente
    evolution-panel.tsx   # Panel de evolucion con voz
    summary-panel.tsx     # Panel de resumen
    chat-panel.tsx        # Chat con IA
  hooks/
    use-voice-input.ts    # Hook para Web Speech API
  lib/
    ai.ts                 # Wrapper de Anthropic SDK
    mock-data.ts          # Datos de pacientes de ejemplo
    prompts.ts            # System prompts medicos
```

## Licencia

[AGPL-3.0](LICENSE)

## Autor

Francisco Albert - [@Fraan_Albert](https://x.com/Fraan_Albert)
