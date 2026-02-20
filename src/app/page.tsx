import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sparkles, Mic, FileText, MessageCircle, ArrowRight, Github } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="border-b">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <span className="font-semibold">MediScribe</span>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="https://github.com/platanus-build-night/platanus-build-night-26-ba-fran-albert"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <Github className="h-5 w-5" />
            </a>
            <Link href="/demo">
              <Button size="sm">
                Probar demo
                <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-16">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 border rounded-full px-4 py-1.5 text-sm text-muted-foreground mb-6">
            <Sparkles className="h-3.5 w-3.5" />
            Open source - AGPL-3.0
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
            Documentacion clinica
            <br />
            <span className="text-primary">asistida por IA</span>
          </h1>
          <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
            El medico habla o escribe en texto libre, MediScribe genera la
            evolucion clinica estructurada. En español, en tiempo real.
          </p>
          <div className="flex justify-center gap-3">
            <Link href="/demo">
              <Button size="lg">
                Probar demo
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
            <a
              href="https://github.com/platanus-build-night/platanus-build-night-26-ba-fran-albert"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button size="lg" variant="outline">
                <Github className="h-4 w-4 mr-2" />
                Ver codigo
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        <div className="grid md:grid-cols-3 gap-6">
          <FeatureCard
            icon={<Mic className="h-5 w-5" />}
            title="Voz a evolucion"
            description="Dicta la consulta con el microfono. La IA la estructura automaticamente en formato de evolucion clinica."
          />
          <FeatureCard
            icon={<FileText className="h-5 w-5" />}
            title="Resumen de HC"
            description="Genera un resumen conciso de la historia clinica completa del paciente con un click."
          />
          <FeatureCard
            icon={<MessageCircle className="h-5 w-5" />}
            title="Chat contextual"
            description="Preguntale sobre el paciente: medicacion, antecedentes, ultimos estudios. La IA responde con datos de la HC."
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            <span>MediScribe - Platanus Build Night 2026</span>
          </div>
          <p>Hecho por Francisco Albert</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="border rounded-xl p-6 space-y-3">
      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
        {icon}
      </div>
      <h3 className="font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}
