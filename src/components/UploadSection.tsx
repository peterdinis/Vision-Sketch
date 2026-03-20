"use client";

import { useState } from "react";
import { FilePond, registerPlugin } from "react-filepond";
import FilePondPluginImagePreview from "filepond-plugin-image-preview";
import FilePondPluginImageResize from "filepond-plugin-image-resize";
import FilePondPluginImageTransform from "filepond-plugin-image-transform";
import { cn } from "@/lib/utils";
import {
  ALLOWED_IMAGE_MIME,
  MAX_UPLOAD_IMAGE_BYTES,
  UPLOAD_MAX_DIMENSION,
} from "@/lib/upload-rules";

// Register the plugins
registerPlugin(
  FilePondPluginImagePreview,
  FilePondPluginImageResize,
  FilePondPluginImageTransform
);

interface UploadSectionProps {
  onUpload: (base64: string) => void;
}

export function UploadSection({ onUpload }: UploadSectionProps) {
  const [files, setFiles] = useState<any[]>([]);

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground leading-relaxed">
        Povolené: PNG, JPEG, WebP, GIF · max. {MAX_UPLOAD_IMAGE_BYTES / 1024 / 1024} MB · dlhšia strana sa pred odoslaním zmenší na max. {UPLOAD_MAX_DIMENSION} px (zachovaný pomer strán).
      </p>
      <FilePond
        files={files}
        onupdatefiles={setFiles}
        allowMultiple={false}
        maxFiles={1}
        maxFileSize={MAX_UPLOAD_IMAGE_BYTES}
        acceptedFileTypes={[...ALLOWED_IMAGE_MIME]}
        labelFileTypeNotAllowed="Nepovolený typ súboru (použi PNG, JPEG, WebP alebo GIF)."
        labelMaxFileSizeExceeded="Súbor je príliš veľký."
        name="files"
        labelIdle='Presuň sem skicu alebo <span class="filepond--label-action">vyber súbor</span>'
        imagePreviewHeight={170}
        imageResizeMode="contain"
        imageResizeTargetWidth={UPLOAD_MAX_DIMENSION}
        imageResizeTargetHeight={UPLOAD_MAX_DIMENSION}
        imageResizeUpscale={false}
        stylePanelLayout="compact"
        styleLoadIndicatorPosition="center bottom"
        styleProgressIndicatorPosition="right bottom"
        styleButtonRemoveItemPosition="left bottom"
        styleButtonProcessItemPosition="right bottom"
        className={cn(
          "vision-sketch-pond",
          "dark:filepond--root"
        )}
        beforeAddFile={(item) => {
          const t = item.file?.type ?? "";
          return (ALLOWED_IMAGE_MIME as readonly string[]).includes(t);
        }}
        onpreparefile={(file, output) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64 = reader.result as string;
            onUpload(base64);
          };
          reader.readAsDataURL(output);
        }}
      />
      
      <style jsx global>{`
        .filepond--root {
          margin-bottom: 0;
          font-family: inherit;
        }
        .filepond--panel-root {
          background-color: var(--secondary);
          border-radius: 1.5rem;
          border: 2px dashed var(--border);
        }
        .filepond--drop-label {
          color: var(--muted-foreground);
        }
        .filepond--label-action {
          text-decoration-color: var(--primary);
          color: var(--primary);
          font-weight: 600;
        }
        .dark .filepond--panel-root {
          background-color: rgba(255, 255, 255, 0.05);
        }
        .filepond--item-panel {
           background-color: var(--primary);
        }
      `}</style>
    </div>
  );
}
