import Link from "next/link";
import { ArrowRight } from "lucide-react";

import type { ResourceDocument } from "@/lib/learning/resources-page-types";

import { ResourceDocumentCard } from "./resource-document-card";

type ResourceDocumentsSectionProps = {
  documents: ResourceDocument[];
};

export function ResourceDocumentsSection({
  documents,
}: ResourceDocumentsSectionProps) {
  return (
    <section id="documents" className="mb-12">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-neutral-950">学习文档</h2>
          <p className="mt-1 text-sm text-neutral-500">
            官方推荐与实战进阶指南
          </p>
        </div>
        <Link
          href="/home/resources/documents"
          className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-neutral-500 transition-colors hover:text-neutral-950"
        >
          查看全部
          <ArrowRight className="size-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {documents.map((document) => (
          <ResourceDocumentCard key={document.id} document={document} />
        ))}
      </div>
    </section>
  );
}
