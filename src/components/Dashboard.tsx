"use client";

import { motion } from "framer-motion";
import { Brush, Layout, Sparkles, Wand2, Zap } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { lazy, Suspense, useCallback, useState } from "react";
import { generateCode } from "@/app/api/generate/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { CodePreviewSkeleton } from "./CodePreviewSkeleton";
import { InlineError } from "./InlineError";
import { PackageSelector } from "./PackageSelector";
import { ThemeToggle } from "./ThemeToggle";
import { UploadSection } from "./UploadSection";

const CodePreview = lazy(() => import("./CodePreview"));

export default function Dashboard() {
  const [image, setImage] = useState<string | null>(null);
  const [packages, setPackages] = useState<string[]>(["tailwind", "lucide"]);
  const [code, setCode] = useState<string | null>(null);

  const { execute, status, result } = useAction(generateCode, {
    onSuccess: ({ data }) => {
      if (data?.success && data.data) {
        setCode(data.data.code);
      }
    },
  });

  const isPending = status === "executing";
  const isBusy = isPending;
  const isActionPending = isPending;
  const error = isBusy ? undefined : result.serverError || result.validationErrors?._errors?.[0];

  const handleGenerate = useCallback(() => {
    if (!image || isPending) return;
    execute({ image, packages });
  }, [image, packages, execute, isPending]);

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300 selection:bg-primary/30 selection:text-primary-foreground p-4 md:p-8 lg:p-12 relative overflow-hidden">
      {/* Background blobs with refined HSL colors */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[hsl(217,91%,60%,0.08)] dark:bg-[hsl(217,91%,60%,0.05)] blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[hsl(270,91%,60%,0.08)] dark:bg-[hsl(270,91%,60%,0.05)] blur-[120px] rounded-full animate-pulse delay-700" />
      </div>

      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto flex items-center justify-between mb-8 md:mb-16"
      >
        <motion.button
          type="button"
          className="flex items-center gap-3 group cursor-pointer bg-transparent border-none p-0 text-left"
          onClick={() => window.location.reload()}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <motion.div
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.9 }}
            className="w-12 h-12 bg-linear-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20"
          >
            <Brush className="w-7 h-7 text-white" />
          </motion.div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tighter">
            Vision
            <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-500 to-purple-600">
              Sketch
            </span>
          </h1>
        </motion.button>

        <div className="flex items-center gap-2 md:gap-4">
          <ThemeToggle />
        </div>
      </motion.header>

      <main className="max-w-7xl mx-auto">
        <div className="sr-only" aria-live="polite" aria-atomic="true">
          {isBusy && "Generating code from your sketch. Please wait."}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Panel: Configuration */}
          <div className="lg:col-span-12 xl:col-span-5 space-y-8 lg:sticky lg:top-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="flex flex-wrap gap-2">
                <Badge
                  variant="secondary"
                  className="px-3 py-1 text-[10px] font-bold uppercase tracking-widest bg-blue-500/10 text-blue-600 dark:text-blue-400 border-none"
                >
                  AI-Powered Generation
                </Badge>
                <Badge
                  variant="outline"
                  className="px-3 py-1 text-[10px] font-bold uppercase tracking-widest border-purple-500/30 text-purple-600 dark:text-purple-400"
                >
                  Next.js 15 + Tailwind 4
                </Badge>
              </div>
              <h2 className="text-4xl md:text-6xl font-black tracking-tight leading-[1.1] text-balance">
                Your{" "}
                <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-500 to-cyan-400">
                  Sketch
                </span>
                , our{" "}
                <span className="text-transparent bg-clip-text bg-linear-to-r from-purple-500 to-pink-500">
                  Reality.
                </span>
              </h2>
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-xl">
                Upload a clear photo of your sketch — the model maps layout and labels to code.
                Output is always responsive and follows premium UI patterns.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="border-border/40 bg-card/50 backdrop-blur-xl shadow-2xl rounded-[2.5rem] overflow-hidden">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Layout className="w-5 h-5 text-blue-500" />
                    Studio Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-8">
                  <UploadSection onUpload={setImage} />

                  <Separator className="opacity-50" />

                  <PackageSelector selectedPackages={packages} onChange={setPackages} />

                  <Button
                    type="button"
                    onClick={handleGenerate}
                    disabled={!image || isBusy}
                    size="lg"
                    aria-busy={isBusy}
                    className={cn(
                      "w-full h-16 rounded-2xl flex items-center justify-center gap-3 font-bold text-xl transition-all duration-500 relative overflow-hidden group",
                      image &&
                      !isBusy &&
                      "bg-linear-to-r from-blue-600 to-purple-600 hover:shadow-xl hover:shadow-blue-500/20 hover:scale-[1.01] active:scale-[0.99]",
                    )}
                  >
                    {isBusy ? (
                      <Sparkles className="w-6 h-6 animate-spin" />
                    ) : (
                      <Wand2 className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                    )}
                    {isBusy ? "Generating…" : "Generate UI code"}

                    <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  </Button>

                  <InlineError message={error} />
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Right Panel: Output */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-12 xl:col-span-7 h-150 md:h-175 xl:h-212.5 xl:sticky xl:top-8"
          >
            <Suspense fallback={<CodePreviewSkeleton />}>
              <CodePreview code={code} isLoading={isBusy} />
            </Suspense>
          </motion.div>
        </div>
      </main>

      <footer className="max-w-7xl mx-auto mt-24 pb-12 pt-8 border-t border-border/20">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8 opacity-60 hover:opacity-100 transition-opacity">
          <div className="flex items-center gap-2">
            <Brush className="w-5 h-5" />
            <span className="font-bold tracking-tighter">VisionSketch AI</span>
          </div>
          <p className="text-xs text-muted-foreground font-medium">
            © 2026 VisionSketch. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
