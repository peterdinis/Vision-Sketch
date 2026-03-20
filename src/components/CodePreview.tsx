"use client";

import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Copy, Check, Play, Code as CodeIcon, Loader2 } from "lucide-react";
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface CodePreviewProps {
  code: string | null;
  /** True while the server action is running (includes optimistic pending). */
  isLoading: boolean;
}

const IDENT_RE = /^[A-Za-z_$][\w$]*$/;

/** If the model double-wraps JSON, pull the inner `code` string. */
const unwrapCodePayload = (raw: string): string => {
  const t = raw.trim();
  if (t.startsWith("{") && t.includes('"code"')) {
    try {
      const parsed = JSON.parse(t) as { code?: string };
      if (typeof parsed.code === "string" && parsed.code.trim()) return parsed.code;
    } catch {
      /* keep raw */
    }
  }
  return raw;
};

const extractLucideNames = (source: string): string[] => {
  const names = new Set<string>();
  const re = /import\s*\{([^}]+)\}\s*from\s*["']lucide-react["']/g;
  for (const m of source.matchAll(re)) {
    const block = m[1] ?? "";
    for (const part of block.split(",")) {
      const p = part.trim();
      if (!p) continue;
      const alias = p.split(/\s+as\s+/);
      const id = (alias[1] ?? alias[0]).trim();
      if (IDENT_RE.test(id)) names.add(id);
    }
  }
  return [...names];
};

/** Guess the main component identifier so preview works when the name isn't App/Component. */
const inferMainComponentName = (source: string): string | null => {
  const m1 = source.match(/export\s+default\s+function\s+(\w+)\b/);
  if (m1?.[1] && IDENT_RE.test(m1[1])) return m1[1];
  const m2 = source.match(/export\s+default\s+const\s+(\w+)\s*=/);
  if (m2?.[1] && IDENT_RE.test(m2[1])) return m2[1];
  const m3 = source.match(/export\s+default\s+(\w+)\s*;/);
  if (m3?.[1] && IDENT_RE.test(m3[1])) return m3[1];

  const funcNames = [...source.matchAll(/\bfunction\s+(\w+)\s*\(/g)].map((x) => x[1]);
  const pascalFuncs = funcNames.filter((n) => /^[A-Z]/.test(n));
  if (pascalFuncs.length) return pascalFuncs[pascalFuncs.length - 1];

  const constNames = [...source.matchAll(/\bconst\s+(\w+)\s*=\s*(?:async\s*)?\(/g)].map((x) => x[1]);
  const pascalConsts = constNames.filter((n) => /^[A-Z]/.test(n));
  if (pascalConsts.length) return pascalConsts[pascalConsts.length - 1];

  return null;
};

const stripImportsAndExports = (source: string) => {
  let next = source.trim();
  // Markdown fences
  next = next.replace(/^```[a-zA-Z]*\n?/m, "").replace(/\n?```$/m, "");
  next = next.replace(/^"use client";?\s*/m, "");
  next = next.replace(/^'use client';?\s*/m, "");

  // Multiline imports (including `import type` and side-effect imports)
  next = next.replace(
    /^\s*import\s+(?:type\s+)?(?:[\w*{}\s,\n]+\s+from\s+)?["'][^"']+["']\s*;?/gm,
    ""
  );
  next = next.replace(/^\s*import\s+["'][^"']+["']\s*;?/gm, "");

  next = next.replace(/^\s*export\s+default\s+/gm, "");
  next = next.replace(/^\s*export\s+(?=async\s+function|function|const|class|let|var)\s*/gm, "");
  next = next.replace(/^\s*export\s*\{[\s\S]*?\}\s*;?/gm, "");

  return next.replace(/\n{3,}/g, "\n\n").trim();
};

const buildResolveReturn = (inferred: string | null) => {
  const chain = [...new Set([inferred, "Preview", "App", "Component"].filter((x): x is string => Boolean(x && IDENT_RE.test(x))))];
  return chain.map((n) => `typeof ${n} !== "undefined" ? ${n}`).join(" : ") + " : null";
};

const buildPreviewDoc = (sourceCode: string) => {
  const raw = unwrapCodePayload(sourceCode);
  const inferredName = inferMainComponentName(raw);
  const lucideNames = extractLucideNames(raw);
  const userBody = stripImportsAndExports(raw);
  const resolveReturn = buildResolveReturn(inferredName);

  const motionStub = `var motion = new Proxy({}, { get: function (_, tag) { var T = String(tag); return function (props) { return React.createElement(T, props, props && props.children); }; } });`;
  const cnStub = `function cn() { var a = Array.prototype.slice.call(arguments); return a.flat().filter(Boolean).join(" "); }`;
  const lucideStubs =
    lucideNames.length > 0
      ? lucideNames
          .map(
            (n) =>
              `var ${n} = function (props) { return React.createElement("span", Object.assign({ title: "${n}", style: { display: "inline-block", width: "1em", height: "1em", borderRadius: "2px", background: "currentColor", opacity: 0.35 } }, props)); };`
          )
          .join("\n")
      : "";

  const prelude = [motionStub, cnStub, lucideStubs].filter(Boolean).join("\n");
  const wrappedInner = prelude + "\n" + userBody + "\nreturn (" + resolveReturn + ");";

  const escapedWrapped = JSON.stringify(
    "function __getPreviewComponent() {\n" + wrappedInner + "\n}"
  );

  return `<!doctype html>
<html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <script src="https://cdn.tailwindcss.com"></script>
    <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
    <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
    <style>
      body { margin: 0; font-family: Inter, system-ui, -apple-system, sans-serif; background: #fff; color: #111827; }
      #root { min-height: 100vh; }
      .preview-error {
        margin: 12px;
        padding: 12px;
        border: 1px solid #fecaca;
        border-radius: 10px;
        background: #fef2f2;
        color: #991b1b;
        font-size: 13px;
        white-space: pre-wrap;
      }
    </style>
  </head>
  <body>
    <div id="root"></div>
    <script>
      (function () {
        const mount = document.getElementById("root");
        const wrapped = ${escapedWrapped};
        const { useState, useEffect, useMemo, useCallback, useRef } = React;

        try {
          const transformed = Babel.transform(wrapped, {
            filename: "GeneratedPreview.tsx",
            presets: [["react", { runtime: "classic" }], "typescript"],
          }).code;

          const fn = new Function(
            "React",
            "useState",
            "useEffect",
            "useMemo",
            "useCallback",
            "useRef",
            transformed + "\\nreturn __getPreviewComponent();"
          );
          const PreviewComponent = fn(React, useState, useEffect, useMemo, useCallback, useRef);

          if (!PreviewComponent) {
            throw new Error(
              "Could not resolve a component to render. Use a PascalCase name (e.g. export default function SketchCard) or name it Preview, App, or Component."
            );
          }

          ReactDOM.createRoot(mount).render(React.createElement(PreviewComponent));
        } catch (err) {
          const message = err && err.message ? err.message : String(err);
          mount.innerHTML = '<div class="preview-error">Live preview failed for this snippet.\\n\\n' + message + '</div>';
        }
      })();
    </script>
  </body>
</html>`;
};

export function CodePreview({ code, isLoading }: CodePreviewProps) {
  const [copied, setCopied] = useState(false);
  const [view, setView] = useState<"code" | "preview">("code");
  const previewDoc = useMemo(() => (code ? buildPreviewDoc(code) : ""), [code]);

  const copyToClipboard = () => {
    if (code) {
      navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!code && isLoading) {
    return (
      <div className="h-full min-h-[400px] flex flex-col items-center justify-center glass rounded-2xl p-8 text-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
        <h3 className="text-xl font-semibold mb-2">Generating your code...</h3>
        <p className="text-muted-foreground max-w-sm">
          Vision Sketch is analyzing your sketch and turning it into reality. This usually takes a few seconds.
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
    <div className="relative h-full flex flex-col glass rounded-2xl overflow-hidden border border-border/50">
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
          title="Copy generated code"
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
              className="h-full bg-white"
            >
              <iframe
                title="Generated code live preview"
                srcDoc={previewDoc}
                sandbox="allow-scripts"
                className="w-full h-full border-0"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {isLoading && (
        <div
          className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-background/70 backdrop-blur-sm text-center px-6"
          role="status"
          aria-live="polite"
          aria-label="Regenerating code"
        >
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
          <div>
            <p className="font-semibold text-foreground">Regenerating…</p>
            <p className="text-sm text-muted-foreground mt-1 max-w-xs">
              Previous code stays visible until the new result arrives (optimistic UI).
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default CodePreview;
