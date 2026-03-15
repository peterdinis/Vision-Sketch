"use client";

import { useState } from "react";
import { UploadSection } from "./UploadSection";
import { PackageSelector } from "./PackageSelector";
import { CodePreview } from "./CodePreview";
import { Banana, Sparkles, Wand2, Info } from "lucide-react";
import { motion } from "framer-motion";

export default function Dashboard() {
  const [image, setImage] = useState<string | null>(null);
  const [packages, setPackages] = useState<string[]>(["tailwind", "lucide"]);
  const [code, setCode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!image) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image, packages }),
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error);
      
      setCode(data.code);
    } catch (err: any) {
      setError(err.message || "Failed to generate code. Please check your OpenAI API key.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30 selection:text-primary-foreground p-6 md:p-12">
      {/* Background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 blur-[120px] rounded-full" />
      </div>

      <header className="max-w-7xl mx-auto flex items-center justify-between mb-12">
        <div className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-yellow-400 rounded-xl flex items-center justify-center neo-banana-glow group-hover:rotate-12 transition-transform shadow-lg shadow-yellow-400/20">
            <Banana className="w-6 h-6 text-slate-900 fill-slate-900" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            Neo<span className="text-yellow-400">Banana</span>
          </h1>
        </div>
        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
          <a href="#" className="hover:text-primary transition-colors">Documentation</a>
          <a href="#" className="hover:text-primary transition-colors">Templates</a>
          <button className="px-4 py-2 glass rounded-full hover:bg-white/10 transition-colors border-border/50">
            Sign In
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Panel: Configuration */}
          <div className="lg:col-span-5 space-y-8">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-2"
            >
              <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
                Turn your <span className="gradient-text">sketches</span> into code.
              </h2>
              <p className="text-lg text-muted-foreground">
                Upload a hand-drawn sketch or a wireframe and let Neo Banana build your React components in seconds.
              </p>
            </motion.div>

            <div className="glass rounded-3xl p-6 md:p-8 space-y-8 border border-border/50 shadow-2xl">
              <UploadSection onUpload={setImage} />
              
              <PackageSelector 
                selectedPackages={packages} 
                onChange={setPackages} 
              />

              <button
                disabled={!image || isLoading}
                onClick={handleGenerate}
                className={cn(
                  "w-full py-4 rounded-2xl flex items-center justify-center gap-2 font-bold text-lg transition-all duration-300",
                  !image || isLoading 
                    ? "bg-secondary text-muted-foreground cursor-not-allowed" 
                    : "bg-primary text-primary-foreground hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-primary/25"
                )}
              >
                {isLoading ? (
                  <Sparkles className="w-5 h-5 animate-spin" />
                ) : (
                  <Wand2 className="w-5 h-5" />
                )}
                {isLoading ? "Analyzing..." : "Generate Code"}
              </button>

              {error && (
                <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-xl flex gap-3 text-destructive text-sm">
                  <Info className="w-5 h-5 shrink-0" />
                  <p>{error}</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Panel: Output */}
          <div className="lg:col-span-7 h-[600px] lg:h-[800px]">
            <CodePreview code={code} isLoading={isLoading} />
          </div>

        </div>
      </main>

      <footer className="max-w-7xl mx-auto mt-20 pt-8 border-t border-border/30 text-center text-sm text-muted-foreground">
        <p>© 2026 Neo Banana AI. Built for designers and developers.</p>
      </footer>
    </div>
  );
}
