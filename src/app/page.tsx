"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import {
  Sparkles,
  Mic,
  FileText,
  MessageCircle,
  ArrowRight,
  Github,
  Stethoscope,
  Brain,
  CheckCircle2,
  Code2,
  Monitor,
} from "lucide-react";

export default function Home() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-in");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -40px 0px" },
    );

    document.querySelectorAll("[data-animate]").forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-background overflow-x-hidden transition-colors duration-300">
      {/* Animated background */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
        <div className="dot-grid" />
      </div>

      {/* Nav */}
      <nav className="sticky top-0 z-50 backdrop-blur-xl bg-background/50 border-b border-border/50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <span className="font-semibold tracking-tight text-lg">
              MediScribe
            </span>
          </div>
          <div className="flex items-center gap-4">
            <ModeToggle />
            <a
              href="https://github.com/platanus-build-night/platanus-build-night-26-ba-fran-albert"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors duration-300"
              aria-label="Ver repositorio en GitHub"
            >
              <Github className="h-5 w-5" />
            </a>
            <Link href="/demo">
              <Button className="group">
                Probar demo
                <ArrowRight className="h-3.5 w-3.5 ml-1.5 transition-transform duration-300 group-hover:translate-x-0.5" />
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative min-h-[92vh] flex items-center justify-center px-6">
        <div className="max-w-4xl mx-auto text-center hero-stagger">
          {/* Badge */}
          <div className="inline-flex items-center gap-2.5 shimmer-badge border border-border/60 rounded-full px-5 py-2 text-sm text-muted-foreground bg-muted/20 backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
            </span>
            Open source · AGPL-3.0
          </div>

          {/* Heading */}
          <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl xl:text-8xl tracking-tight leading-[1.08] mt-8 mb-6">
            Documentación clínica
            <br />
            <span className="gradient-text">asistida por IA</span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            El médico habla o escribe en texto libre, MediScribe genera la
            evolución clínica estructurada.{" "}
            <span className="text-foreground/80">
              En español, en tiempo real.
            </span>
          </p>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row justify-center gap-4 mt-10">
            <Link href="/demo">
              <Button
                size="lg"
                className="group text-base px-8 h-12 shadow-lg shadow-primary/20"
              >
                Probar demo
                <ArrowRight className="h-4 w-4 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
              </Button>
            </Link>
            <a
              href="https://github.com/platanus-build-night/platanus-build-night-26-ba-fran-albert"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button
                size="lg"
                variant="outline"
                className="text-base px-8 h-12 border-border/60 bg-muted/20 hover:bg-muted/40 transition-all duration-300"
              >
                <Github className="h-4 w-4 mr-2" />
                Ver código
              </Button>
            </a>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-muted-foreground/40 animate-[fadeInUp_1s_ease-out_1.2s_forwards] opacity-0">
          <span className="text-[10px] tracking-[0.2em] uppercase">
            Scroll
          </span>
          <div className="w-px h-8 bg-gradient-to-b from-muted-foreground/40 to-transparent" />
        </div>
      </section>

      {/* Demo Preview */}
      <section className="py-24 px-6 bg-muted/10">
        <div className="max-w-5xl mx-auto">
          <div data-animate className="text-center mb-14">
            <p className="text-sm font-medium text-primary tracking-widest uppercase mb-3">
              Cómo funciona
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl tracking-tight">
              De texto libre a evolución estructurada
            </h2>
          </div>

          <div data-animate data-delay="1" className="relative">
            {/* Mockup glow */}
            <div className="mockup-glow" />

            {/* Mock window */}
            <div className="rounded-2xl border border-border/50 bg-card/40 backdrop-blur-md overflow-hidden shadow-2xl">
              {/* Window bar */}
              <div className="flex items-center gap-2 px-5 py-3.5 border-b border-border/50 bg-muted/30">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-border" />
                  <div className="w-3 h-3 rounded-full bg-border" />
                  <div className="w-3 h-3 rounded-full bg-border" />
                </div>
                <div className="flex items-center gap-1.5 ml-3">
                  <Sparkles className="h-3 w-3 text-primary" />
                  <span className="text-xs text-muted-foreground">
                    MediScribe — Demo
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="grid md:grid-cols-2">
                {/* Input side */}
                <div className="p-6 sm:p-8 lg:p-10">
                  <div className="flex items-center gap-2 mb-5">
                    <div className="h-6 w-6 rounded-md bg-red-500/10 flex items-center justify-center">
                      <Mic className="h-3 w-3 text-red-500" />
                    </div>
                    <span className="text-xs font-medium text-red-500 tracking-wide">
                      Dictado del médico
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-[1.8] font-mono">
                    &ldquo;Paciente masculino 65 años consulta por dolor torácico
                    opresivo de 2 horas de evolución, irradia a brazo izquierdo,
                    sudoración fría. Antecedentes: HTA, DBT tipo 2, tabaquismo.
                    TA 160/95, FC 98, Sat 96%. ECG: supra ST en
                    V1-V4.&rdquo;
                  </p>
                </div>

                {/* Divider with arrow */}
                <div className="relative md:border-l border-t md:border-t-0 border-border/50">
                  <div className="absolute top-1/2 -translate-y-1/2 -left-3.5 hidden md:flex h-7 w-7 rounded-full bg-primary/10 border border-primary/20 items-center justify-center bg-card">
                    <ArrowRight className="h-3 w-3 text-primary" />
                  </div>
                  <div className="md:hidden flex justify-center -mt-3.5 mb-0 relative z-10">
                    <div className="h-7 w-7 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center rotate-90 bg-card">
                      <ArrowRight className="h-3 w-3 text-primary" />
                    </div>
                  </div>

                  {/* Output side */}
                  <div className="p-6 sm:p-8 lg:p-10 bg-muted/10">
                    <div className="flex items-center gap-2 mb-5">
                      <div className="h-6 w-6 rounded-md bg-primary/10 flex items-center justify-center">
                        <Sparkles className="h-3 w-3 text-primary" />
                      </div>
                      <span className="text-xs font-medium text-primary tracking-wide">
                        Evolución estructurada
                      </span>
                    </div>
                    <div className="space-y-4 text-sm">
                      {[
                        {
                          label: "Motivo de consulta",
                          text: "Dolor torácico opresivo",
                        },
                        {
                          label: "Enfermedad actual",
                          text: "Dolor de 2h de evolución, irradiado a MSI, acompañado de sudoración fría",
                        },
                        {
                          label: "Signos vitales",
                          text: "TA 160/95 · FC 98 · SatO\u2082 96%",
                        },
                        {
                          label: "Diagnóstico presuntivo",
                          text: "SCA con elevación del ST (IAMCEST anterior)",
                        },
                      ].map((item) => (
                        <div key={item.label}>
                          <span className="text-[10px] font-semibold text-primary/70 uppercase tracking-[0.15em]">
                            {item.label}
                          </span>
                          <p className="text-muted-foreground mt-0.5 leading-relaxed">
                            {item.text}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div data-animate className="text-center mb-16">
            <p className="text-sm font-medium text-primary tracking-widest uppercase mb-3">
              Funcionalidades
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl tracking-tight">
              Todo lo que necesitás para documentar
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div data-animate data-delay="1">
              <FeatureCard
                icon={<Mic className="h-5 w-5" />}
                title="Voz a evolución"
                description="Dictá la consulta con el micrófono. La IA la estructura automáticamente en formato de evolución clínica."
                glowClass="icon-glow-teal"
                gradient="from-primary/20 to-primary/5"
              />
            </div>
            <div data-animate data-delay="1">
              <FeatureCard
                icon={<FileText className="h-5 w-5" />}
                title="Resumen de HC"
                description="Generá un resumen conciso de la historia clínica completa del paciente con un click."
                glowClass="icon-glow-blue"
                gradient="from-blue-500/20 to-blue-500/5"
              />
            </div>
            <div data-animate data-delay="2">
              <FeatureCard
                icon={<Brain className="h-5 w-5" />}
                title="Diagnóstico diferencial"
                description="La IA analiza los datos clínicos y sugiere diagnósticos diferenciales con evidencia."
                glowClass="icon-glow-violet"
                gradient="from-violet-500/20 to-violet-500/5"
              />
            </div>
            <div data-animate data-delay="2">
              <FeatureCard
                icon={<MessageCircle className="h-5 w-5" />}
                title="Chat contextual"
                description="Preguntale sobre el paciente: medicación, antecedentes, estudios. Responde con datos de la HC."
                glowClass="icon-glow-blue"
                gradient="from-blue-500/20 to-blue-500/5"
              />
            </div>
          </div>
        </div>
      </section>

      {/* How it works - Steps */}
      <section className="py-24 px-6 bg-muted/10">
        <div className="max-w-4xl mx-auto">
          <div data-animate className="text-center mb-16">
            <p className="text-sm font-medium text-primary tracking-widest uppercase mb-3">
              Flujo de trabajo
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl tracking-tight">
              Tres pasos, cero fricción
            </h2>
          </div>

          <div className="relative">
            {/* Connection line */}
            <div className="absolute top-10 left-[calc(16.66%+20px)] right-[calc(16.66%+20px)] h-px step-line hidden md:block" />

            <div className="grid md:grid-cols-3 gap-12 md:gap-8">
              <div data-animate data-delay="1">
                <Step
                  number="01"
                  icon={<Stethoscope className="h-4 w-4" />}
                  title="Dictá o escribí"
                  description="Hablá naturalmente como en una consulta o escribí tus notas en texto libre. Sin formato, sin estructura."
                />
              </div>
              <div data-animate data-delay="2">
                <Step
                  number="02"
                  icon={<Brain className="h-4 w-4" />}
                  title="La IA estructura"
                  description="Claude analiza el texto, identifica los datos clínicos y los organiza en los campos de una evolución médica."
                />
              </div>
              <div data-animate data-delay="3">
                <Step
                  number="03"
                  icon={<CheckCircle2 className="h-4 w-4" />}
                  title="Evolución lista"
                  description="Obtenés la evolución clínica completa y estructurada. Revisá, editá si hace falta, y listo."
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Integration / Embed */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div data-animate className="text-center mb-14">
            <p className="text-sm font-medium text-primary tracking-widest uppercase mb-3">
              Integración
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl tracking-tight">
              Integralo en tu sistema de HC
            </h2>
            <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
              MediScribe se embebe como un iframe en cualquier sistema de
              historia clínica existente. Sin migración, sin cambios en tu
              infraestructura.
            </p>
          </div>

          <div data-animate data-delay="1" className="relative">
            <div className="mockup-glow" />
            <div className="rounded-2xl border border-border/50 bg-card/40 backdrop-blur-sm overflow-hidden shadow-xl">
              <div className="flex items-center gap-2 px-5 py-3.5 border-b border-border/50 bg-muted/30">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-border" />
                  <div className="w-3 h-3 rounded-full bg-border" />
                  <div className="w-3 h-3 rounded-full bg-border" />
                </div>
                <div className="flex items-center gap-1.5 ml-3">
                  <Monitor className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    tu-sistema-hc.com/paciente/12345
                  </span>
                </div>
              </div>
              <div className="grid md:grid-cols-2">
                <div className="p-6 sm:p-8 lg:p-10 border-r border-border/50">
                  <div className="flex items-center gap-2 mb-5">
                    <Code2 className="h-4 w-4 text-primary" />
                    <span className="text-xs font-medium text-primary tracking-wide">
                      Tu sistema de HC
                    </span>
                  </div>
                  <div className="font-mono text-xs text-muted-foreground space-y-1 leading-relaxed">
                    <p className="text-blue-400">
                      &lt;!-- Datos del paciente --&gt;
                    </p>
                    <p>&lt;div class=&quot;patient-data&quot;&gt;</p>
                    <p className="pl-4">...</p>
                    <p>&lt;/div&gt;</p>
                    <p className="mt-3 text-blue-400">
                      &lt;!-- MediScribe embed --&gt;
                    </p>
                    <p>
                      &lt;iframe src=&quot;
                      <span className="text-primary">
                        /embed?patientId=12345
                      </span>
                      &quot;
                    </p>
                    <p className="pl-4">
                      width=&quot;100%&quot; height=&quot;600&quot;
                    </p>
                    <p className="pl-4">
                      style=&quot;border:none&quot; /&gt;
                    </p>
                  </div>
                </div>
                <div className="p-6 sm:p-8 lg:p-10 flex items-center justify-center bg-muted/10">
                  <div className="text-center space-y-3">
                    <div className="inline-flex h-14 w-14 rounded-xl bg-primary/10 items-center justify-center">
                      <Sparkles className="h-6 w-6 text-primary" />
                    </div>
                    <p className="text-sm font-medium">
                      Widget embebible
                    </p>
                    <p className="text-xs text-muted-foreground max-w-[200px]">
                      Evolución, resumen, diagnóstico y chat — todo en un
                      iframe liviano
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-28 px-6 relative">
        <div className="cta-gradient absolute inset-0" />
        <div data-animate className="max-w-2xl mx-auto text-center relative">
          <div className="inline-flex h-12 w-12 rounded-xl bg-primary/10 items-center justify-center mb-6">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl tracking-tight mb-5">
            Probalo ahora
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed mb-10">
            Sin registro, sin instalación. Abrí el demo y experimentá la
            documentación clínica del futuro.
          </p>
          <Link href="/demo">
            <Button
              size="lg"
              className="group text-base px-10 h-13 shadow-lg shadow-primary/25"
            >
              Abrir demo
              <ArrowRight className="h-4 w-4 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-10 bg-muted/10">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2.5">
            <div className="h-6 w-6 rounded-md bg-primary/10 flex items-center justify-center">
              <Sparkles className="h-3 w-3 text-primary" />
            </div>
            <span>MediScribe — Platanus Build Night 2026</span>
          </div>
          <p>
            Hecho por{" "}
            <a
              href="https://x.com/Fraan_Albert"
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground hover:text-primary transition-colors duration-300"
            >
              Francisco Albert
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
  glowClass,
  gradient,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  glowClass: string;
  gradient: string;
}) {
  return (
    <div className="glass-card p-7 h-full">
      <div
        className={`icon-glow ${glowClass} h-11 w-11 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-foreground mb-5`}
      >
        {icon}
      </div>
      <h3 className="font-semibold text-lg mb-2 tracking-tight">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">
        {description}
      </p>
    </div>
  );
}

function Step({
  number,
  icon,
  title,
  description,
}: {
  number: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="text-center">
      <div className="step-number inline-flex h-20 w-20 rounded-full bg-muted/20 border border-border/50 items-center justify-center mb-5 mx-auto">
        <div className="flex flex-col items-center gap-0.5">
          {icon}
          <span className="text-[10px] font-bold text-primary tracking-widest">
            {number}
          </span>
        </div>
      </div>
      <h3 className="font-semibold text-lg mb-2 tracking-tight">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">
        {description}
      </p>
    </div>
  );
}