"use client";

import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Copy, Check, Play, Code as CodeIcon } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface CodePreviewProps {
  code: string | null;
  isLoading: boolean;
}

export function CodePreview({ code, isLoading }: CodePreviewProps) {
  const [copied, setCopied] = useState(false);
  const [view, setView] = useState<"code" | "preview">("code");

  const copyToClipboard = () => {
    if (code) {
      navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (isLoading) {
    return (
      <div className="h-full min-h-[400px] flex flex-col items-center justify-center glass rounded-2xl p-8 text-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
        <h3 className="text-xl font-semibold mb-2">Generating your code...</h3>
        <p className="text-muted-foreground max-w-sm">
          Neo Banana is analyzing your sketch and turning it into reality. This usually takes a few seconds.
        </p>
      </div>
    );
  }

  if (!code) {
    return (
      <div className="h-full min-h-[400px] flex flex-col items-center justify-center border-2 border-dashed border-border rounded-2xl p-8 text-center text-muted-foreground bg-secondary/20">
        <CodeIcon className="w-12 h-12 mb-4 opacity-20" />
        <p>Upload a sketch to generate code</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col glass rounded-2xl overflow-hidden border border-border/50">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 bg-secondary/30">
        <div className="flex bg-background/50 p-1 rounded-lg border border-border/50">
          <button
            onClick={() => setView("code")}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all",
              view === "code" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <CodeIcon className="w-3.5 h-3.5" /> Code
          </button>
          <button
            onClick={() => setView("preview")}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all",
              view === "preview" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Play className="w-3.5 h-3.5" /> Preview
          </button>
        </div>
        <button
          onClick={copyToClipboard}
          className="p-2 hover:bg-secondary rounded-lg transition-colors text-muted-foreground hover:text-foreground"
        >
          {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>

      <div className="flex-1 overflow-auto bg-[#1e1e1e]">
        <AnimatePresence mode="wait">
          {view === "code" ? (
            <motion.div
              key="code"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-4"
            >
              <SyntaxHighlighter
                language="tsx"
                style={atomDark}
                customStyle={{
                  background: "transparent",
                  padding: 0,
                  fontSize: "0.875rem",
                  lineHeight: "1.5",
                }}
              >
                {code}
              </SyntaxHighlighter>
            </motion.div>
          ) : (
            <motion.div
              key="preview"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full bg-white p-8 flex items-center justify-center"
            >
              <div className="text-slate-900 italic">
                Live preview is limited in this environment. Copy the code to your project to see it in action!
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
