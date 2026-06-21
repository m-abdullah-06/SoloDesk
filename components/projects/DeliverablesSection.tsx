"use client";
import { useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { Deliverable } from "@/types";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input, Textarea } from "@/components/ui/Input";
import { formatDate } from "@/lib/utils";
import {
  Upload, Link2, Package, FileText, Image, Archive, Trash2, Plus,
  Download, ExternalLink, FileVideo, File, Loader2
} from "lucide-react";

function fileIcon(fileType: string | null, isExternal: boolean) {
  if (isExternal) return <Link2 size={20} className="text-indigo-400" />;
  if (!fileType) return <File size={20} className="text-muted-foreground" />;
  if (fileType.includes("image")) return <Image size={20} className="text-purple-400" />;
  if (fileType.includes("pdf")) return <FileText size={20} className="text-red-400" />;
  if (fileType.includes("video")) return <FileVideo size={20} className="text-blue-400" />;
  if (fileType.includes("zip") || fileType.includes("rar") || fileType.includes("7z"))
    return <Archive size={20} className="text-amber-400" />;
  return <File size={20} className="text-muted-foreground" />;
}

function formatBytes(bytes: number | null) {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

interface Props {
  projectId: string;
  userId: string;
  deliverables: Deliverable[];
  onRefresh: () => void;
}

export function DeliverablesSection({ projectId, userId, deliverables, onRefresh }: Props) {
  const supabase = createClient();
  const fileRef = useRef<HTMLInputElement>(null);

  const [showModal, setShowModal] = useState(false);
  const [mode, setMode] = useState<"upload" | "link">("upload");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [externalUrl, setExternalUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  function reset() {
    setTitle(""); setDescription(""); setExternalUrl(""); setFile(null);
    setMode("upload"); setShowModal(false); setUploading(false);
  }

  async function handleSubmit() {
    if (!title.trim()) return;
    setUploading(true);

    try {
      if (mode === "link") {
        if (!externalUrl.trim()) return;
        await supabase.from("project_deliverables").insert({
          project_id: projectId, user_id: userId,
          title, description: description || null,
          file_url: externalUrl, file_name: null,
          file_size: null, file_type: "link", is_external: true,
        });
      } else {
        if (!file) return;
        const ext = file.name.split(".").pop();
        const path = `${userId}/${projectId}/${Date.now()}.${ext}`;
        const { data: uploaded, error } = await supabase.storage
          .from("deliverables")
          .upload(path, file, { upsert: false });
        if (error) throw error;
        const { data: { publicUrl } } = supabase.storage.from("deliverables").getPublicUrl(path);
        await supabase.from("project_deliverables").insert({
          project_id: projectId, user_id: userId,
          title, description: description || null,
          file_url: publicUrl, file_name: file.name,
          file_size: file.size, file_type: file.type, is_external: false,
        });
      }
      reset();
      onRefresh();
    } catch (e) {
      console.error(e);
      setUploading(false);
    }
  }

  async function handleDelete(d: Deliverable) {
    setDeletingId(d.id);
    // Remove from storage if it's an uploaded file
    if (!d.is_external && d.file_url) {
      const path = d.file_url.split("/deliverables/")[1];
      if (path) await supabase.storage.from("deliverables").remove([path]);
    }
    await supabase.from("project_deliverables").delete().eq("id", d.id);
    setDeletingId(null);
    onRefresh();
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault(); setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) { setFile(f); if (!title) setTitle(f.name.replace(/\.[^/.]+$/, "")); }
  }

  return (
    <>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Button size="sm" onClick={() => setShowModal(true)}>
            <Plus size={14} /> Add Deliverable
          </Button>
        </div>

        {deliverables.length === 0 ? (
          <Card className="text-center py-10">
            <Package size={32} className="text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm font-semibold text-foreground mb-1">No deliverables yet</p>
            <p className="text-xs text-muted-foreground">
              Upload files or paste links to share your work with the client.
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-orange-500 hover:text-orange-600 transition-colors"
            >
              <Plus size={13} /> Add first deliverable
            </button>
          </Card>
        ) : (
          <div className="space-y-2.5">
            {deliverables.map((d) => (
              <Card key={d.id} className="flex items-center gap-4 !p-4">
                {/* Icon */}
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: "var(--muted)", border: "1px solid var(--border)" }}
                >
                  {fileIcon(d.file_type, d.is_external)}
                </div>
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{d.title}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {d.file_name && <span>{d.file_name} · </span>}
                    {d.file_size && <span>{formatBytes(d.file_size)} · </span>}
                    {formatDate(d.created_at)}
                  </p>
                  {d.description && (
                    <p className="text-[11px] text-muted-foreground mt-0.5 truncate">{d.description}</p>
                  )}
                </div>
                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {d.file_url && (
                    <a href={d.file_url} target="_blank" rel="noreferrer" download={!d.is_external && d.file_name ? d.file_name : undefined}>
                      <Button size="sm" variant="outline">
                        {d.is_external ? <ExternalLink size={13} /> : <Download size={13} />}
                      </Button>
                    </a>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(d)}
                    className="text-red-400 hover:text-red-500"
                  >
                    {deletingId === d.id ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Add Deliverable Modal */}
      <Modal open={showModal} onClose={reset} title="Add Deliverable">
        <div className="space-y-4">
          {/* Mode toggle */}
          <div className="flex gap-1 p-1 rounded-xl bg-muted">
            {(["upload", "link"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold transition-all"
                style={
                  mode === m
                    ? { background: "var(--card)", color: "#F5790A", border: "1px solid rgba(245,121,10,0.2)", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }
                    : { color: "var(--muted-foreground)", border: "1px solid transparent" }
                }
              >
                {m === "upload" ? <Upload size={14} /> : <Link2 size={14} />}
                {m === "upload" ? "Upload File" : "Paste Link"}
              </button>
            ))}
          </div>

          <Input
            label="Title"
            placeholder="e.g. Final Logo Package"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <Textarea
            label="Description (optional)"
            placeholder="e.g. All formats: SVG, PNG, PDF"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
          />

          {mode === "link" ? (
            <Input
              label="URL"
              placeholder="https://drive.google.com/..."
              value={externalUrl}
              onChange={(e) => setExternalUrl(e.target.value)}
            />
          ) : (
            <>
              <input
                ref={fileRef}
                type="file"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) { setFile(f); if (!title) setTitle(f.name.replace(/\.[^/.]+$/, "")); }
                }}
              />
              <div
                onClick={() => fileRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                className="rounded-xl border-2 border-dashed p-6 text-center cursor-pointer transition-all"
                style={{
                  borderColor: dragOver ? "rgba(245,121,10,0.5)" : "var(--border)",
                  background: dragOver ? "rgba(245,121,10,0.04)" : "var(--muted)",
                }}
              >
                {file ? (
                  <div>
                    <Archive size={24} className="text-orange-500 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-foreground">{file.name}</p>
                    <p className="text-xs text-muted-foreground">{formatBytes(file.size)}</p>
                  </div>
                ) : (
                  <div>
                    <Upload size={24} className="text-muted-foreground/40 mx-auto mb-2" />
                    <p className="text-sm text-foreground font-medium">Drop a file or click to browse</p>
                    <p className="text-xs text-muted-foreground mt-1">Any file type — max 50 MB</p>
                  </div>
                )}
              </div>
            </>
          )}

          <div className="flex gap-3">
            <Button variant="outline" onClick={reset} className="flex-1">Cancel</Button>
            <Button
              onClick={handleSubmit}
              loading={uploading}
              className="flex-1"
              disabled={!title.trim() || (mode === "upload" && !file) || (mode === "link" && !externalUrl.trim())}
            >
              {uploading ? "Uploading…" : "Add Deliverable"}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
