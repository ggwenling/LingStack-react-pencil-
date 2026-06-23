import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import type { ResourceDocument } from "@/lib/learning/resources-page-types";

import { ResourceDocumentCard } from "./resource-document-card";

type ResourceDocumentsAllSectionProps = {
  title: string;
  description: string;
  documents: ResourceDocument[];
};

export function ResourceDocumentsAllSection({
  title,
  description,
  documents,
}: ResourceDocumentsAllSectionProps) {
  return (
    <section>
      <div className="mb-8">
        <Link
          href="/home/resources"
          className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-neutral-500 transition-colors hover:text-neutral-950"
        >
          <ArrowLeft className="size-3.5" />
          返回资源库
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-950">
          {title}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-500">
          {description}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {documents.map((document) => (
          <ResourceDocumentCard key={document.id} document={document} />
        ))}
      </div>
    </section>
  );
}
