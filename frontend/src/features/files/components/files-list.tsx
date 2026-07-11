"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileCard } from "./file-card";
import { FileUpload } from "./file-upload";
import type { AssignmentFile } from "../types";

const MOCK_FILES: AssignmentFile[] = [
  {
    id: "f1",
    name: "Assignment_Brief_A101.pdf",
    size: 245760,
    type: "pdf",
    uploadedBy: "client",
    uploaderName: "John Client",
    assignmentId: "A-101",
    assignmentTitle: "Assignment #A-101",
    uploadedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    url: "#",
  },
  {
    id: "f2",
    name: "Draft_Essay_v1.docx",
    size: 512000,
    type: "docx",
    uploadedBy: "writer",
    uploaderName: "Sara Writer",
    assignmentId: "A-101",
    assignmentTitle: "Assignment #A-101",
    uploadedAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    url: "#",
  },
  {
    id: "f3",
    name: "Research_Requirements.pdf",
    size: 180000,
    type: "pdf",
    uploadedBy: "client",
    uploaderName: "Mike Client",
    assignmentId: "A-102",
    assignmentTitle: "Assignment #A-102",
    uploadedAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    url: "#",
  },
  {
    id: "f4",
    name: "Research_Outline.docx",
    size: 98304,
    type: "docx",
    uploadedBy: "writer",
    uploaderName: "Sara Writer",
    assignmentId: "A-102",
    assignmentTitle: "Assignment #A-102",
    uploadedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    url: "#",
  },
  {
    id: "f5",
    name: "Case_Study_Brief.pdf",
    size: 320000,
    type: "pdf",
    uploadedBy: "client",
    uploaderName: "Mike Client",
    assignmentId: "A-103",
    assignmentTitle: "Assignment #A-103",
    uploadedAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    url: "#",
  },
  {
    id: "f6",
    name: "Revision_Notes.docx",
    size: 65536,
    type: "docx",
    uploadedBy: "pm",
    uploaderName: "Project Manager",
    assignmentId: "A-101",
    assignmentTitle: "Assignment #A-101",
    uploadedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    url: "#",
  },
];

export function FilesList() {
  const [files, setFiles] = useState<AssignmentFile[]>(MOCK_FILES);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  function handleDelete(id: string) {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  }

  function handleUpload(file: File) {
    const ext = file.name.split(".").pop()?.toLowerCase();
    const type =
      ext === "pdf"
        ? "pdf"
        : ext === "docx"
          ? "docx"
          : ext === "xlsx"
            ? "xlsx"
            : ext === "jpg" || ext === "png"
              ? "image"
              : "other";
    const newFile: AssignmentFile = {
      id: Date.now().toString(),
      name: file.name,
      size: file.size,
      type,
      uploadedBy: "pm",
      uploaderName: "Project Manager",
      assignmentId: "A-101",
      assignmentTitle: "Assignment #A-101",
      uploadedAt: new Date().toISOString(),
      url: "#",
    };
    setFiles((prev) => [newFile, ...prev]);
  }

  const filtered = files.filter((f) => {
    const matchSearch =
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      f.assignmentTitle.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || f.uploadedBy === filter;
    return matchSearch && matchFilter;
  });

  return (
    <div className="space-y-6">
      <FileUpload onUpload={handleUpload} />

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            placeholder="Search files..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All files</SelectItem>
            <SelectItem value="client">Client</SelectItem>
            <SelectItem value="writer">Writer</SelectItem>
            <SelectItem value="pm">My uploads</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="text-muted-foreground py-12 text-center text-sm">
            No files found.
          </div>
        ) : (
          filtered.map((file) => (
            <FileCard key={file.id} file={file} onDelete={handleDelete} />
          ))
        )}
      </div>

      <p className="text-muted-foreground text-xs">{filtered.length} files</p>
    </div>
  );
}
