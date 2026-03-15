"use client";

import { useState } from "react";
import { FilePond, registerPlugin } from "react-filepond";
import FilePondPluginImagePreview from "filepond-plugin-image-preview";
import FilePondPluginImageCrop from "filepond-plugin-image-crop";
import FilePondPluginImageResize from "filepond-plugin-image-resize";
import FilePondPluginImageTransform from "filepond-plugin-image-transform";
import { cn } from "@/lib/utils";

// Register the plugins
registerPlugin(
  FilePondPluginImagePreview,
  FilePondPluginImageCrop,
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
      <FilePond
        files={files}
        onupdatefiles={setFiles}
        allowMultiple={false}
        maxFiles={1}
        name="files"
        labelIdle='Drag & Drop your sketch or <span class="filepond--label-action">Browse</span>'
        imagePreviewHeight={170}
        imageCropAspectRatio="1:1"
        imageResizeTargetWidth={200}
        imageResizeTargetHeight={200}
        stylePanelLayout="compact"
        styleLoadIndicatorPosition="center bottom"
        styleProgressIndicatorPosition="right bottom"
        styleButtonRemoveItemPosition="left bottom"
        styleButtonProcessItemPosition="right bottom"
        className={cn(
          "vision-sketch-pond",
          "dark:filepond--root"
        )}
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
