import type {
  AiFrontendRanking,
  AiVendorIcon,
} from "@/lib/learning/resources-page-types";
import Image from "next/image";
import { cn } from "@/lib/utils";

type TechRankingTableProps = {
  rankings: AiFrontendRanking[];
};

const statusStyles: Record<string, string> = {
  闭源: "bg-neutral-100 text-neutral-600",
  开源: "bg-[#10B981]/10 text-[#10B981]",
};

const vendorIcons: Record<AiVendorIcon, { src: string; alt: string }> = {
  claude: { src: "/images/ai-vendors/claude.png", alt: "Claude" },
  qwen: { src: "/images/ai-vendors/qwen.png", alt: "Qwen" },
  glm: { src: "/images/ai-vendors/glm.png", alt: "GLM" },
};

function VendorIcon({ vendor }: { vendor: AiVendorIcon }) {
  const icon = vendorIcons[vendor];

  return (
    <span className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-[#E8E8E8] bg-neutral-50 p-1.5">
      <Image
        src={icon.src}
        alt={icon.alt}
        width={28}
        height={28}
        className="size-full object-contain"
      />
    </span>
  );
}

function ModelCell({ item }: { item: AiFrontendRanking }) {
  return (
    <div className="flex items-center gap-3">
      <VendorIcon vendor={item.vendor} />
      <div>
        <p className="font-semibold text-neutral-950">{item.name}</p>
        <p className="mt-0.5 text-xs text-neutral-500">{item.subtitle}</p>
      </div>
    </div>
  );
}

export function TechRankingTable({ rankings }: TechRankingTableProps) {
  return (
    <section className="mb-8">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-neutral-950">
          主流 AI 前端能力排名
        </h2>
        <p className="mt-1 text-sm text-neutral-500">
          基于多维度前端能力评测与典型输入输出成本的参考排行
        </p>
      </div>

      <div className="lingstack-card-v2 overflow-hidden">
        <div className="hidden overflow-x-auto sm:block">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-[#E8E8E8] bg-[#fafafa] text-xs font-semibold tracking-wide text-neutral-500 uppercase">
                <th className="px-5 py-3">排名</th>
                <th className="px-5 py-3">AI 模型 / 工具</th>
                <th className="px-5 py-3">Score</th>
                <th className="px-5 py-3">输入输出所花费美刀</th>
                <th className="px-5 py-3">状态</th>
              </tr>
            </thead>
            <tbody>
              {rankings.map((item) => (
                <tr
                  key={item.rank}
                  className="border-b border-[#E8E8E8] last:border-b-0"
                >
                  <td className="px-5 py-4 font-semibold text-neutral-950">
                    {String(item.rank).padStart(2, "0")}
                  </td>
                  <td className="px-5 py-4">
                    <ModelCell item={item} />
                  </td>
                  <td className="px-5 py-4 font-semibold text-[#10B981]">
                    {item.score}
                  </td>
                  <td className="px-5 py-4 font-semibold text-neutral-950">
                    {item.ioCostUsd}
                    {item.ioCostUsd !== "N/A" ? (
                      <span className="mt-0.5 block text-[11px] font-normal text-neutral-400">
                        每 1M tokens
                      </span>
                    ) : null}
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={cn(
                        "inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold",
                        statusStyles[item.status] ?? statusStyles["闭源"],
                      )}
                    >
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="divide-y divide-[#E8E8E8] sm:hidden">
          {rankings.map((item) => (
            <div key={item.rank} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <VendorIcon vendor={item.vendor} />
                  <div>
                    <p className="text-xs font-semibold text-neutral-400">
                      #{String(item.rank).padStart(2, "0")}
                    </p>
                    <p className="mt-1 font-semibold text-neutral-950">
                      {item.name}
                    </p>
                    <p className="text-xs text-neutral-500">{item.subtitle}</p>
                  </div>
                </div>
                <span
                  className={cn(
                    "shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold",
                    statusStyles[item.status] ?? statusStyles["闭源"],
                  )}
                >
                  {item.status}
                </span>
              </div>
              <div className="mt-3 space-y-1 text-xs font-medium">
                <p className="font-semibold text-[#10B981]">
                  Score: {item.score}
                </p>
                <p className="text-neutral-500">
                  {item.ioCostUsd}
                  {item.ioCostUsd !== "N/A" ? (
                    <span className="text-neutral-400"> / 每 1M tokens</span>
                  ) : null}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
