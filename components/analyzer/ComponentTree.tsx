import type { TreeNode } from "@/types/analysis";

const TAG_COLORS = {
  root: "text-purple-300 bg-purple-900/40 border-purple-800/50",
  component: "text-blue-300 bg-blue-900/40 border-blue-800/50",
  html: "text-gray-400 bg-gray-800/60 border-gray-700/50",
  fragment: "text-yellow-400/80 bg-yellow-900/20 border-yellow-800/30",
} as const;

function countCustomComponents(node: TreeNode): number {
  let count = 0;
  for (const child of node.children) {
    if (child.isComponent && child.tag !== "Fragment") count++;
    count += countCustomComponents(child);
  }
  return count;
}

interface NodeRowProps {
  node: TreeNode;
  isLast: boolean;
  parentPrefix: string;
}

function NodeRow({ node, isLast, parentPrefix }: NodeRowProps) {
  const linePrefix = parentPrefix + (isLast ? "└─ " : "├─ ");
  const childPrefix = parentPrefix + (isLast ? "   " : "│  ");

  const tagStyle =
    node.tag === "Fragment"
      ? TAG_COLORS.fragment
      : node.isComponent
      ? TAG_COLORS.component
      : TAG_COLORS.html;

  return (
    <div className="font-mono text-xs leading-relaxed">
      <div className="flex items-center gap-1.5 py-0.5">
        <span className="text-gray-600 select-none whitespace-pre">{linePrefix}</span>
        <span className={`px-1.5 py-0.5 rounded border font-medium ${tagStyle}`}>
          {node.tag === "Fragment" ? "<>" : `<${node.tag}>`}
        </span>
        {node.isComponent && node.tag !== "Fragment" && (
          <span className="text-gray-600 text-xs">컴포넌트</span>
        )}
      </div>
      {node.children.map((child, i) => (
        <NodeRow
          key={`${child.tag}-${i}`}
          node={child}
          isLast={i === node.children.length - 1}
          parentPrefix={childPrefix}
        />
      ))}
    </div>
  );
}

export function ComponentTree({ root }: { root: TreeNode }) {
  if (root.children.length === 0) return null;

  const componentCount = countCustomComponents(root);

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xl">🌳</span>
        <h3 className="font-bold text-gray-200">컴포넌트 트리</h3>
        {componentCount > 0 && (
          <span className="ml-auto text-xs text-blue-400 bg-blue-900/30 border border-blue-800/50 px-2 py-0.5 rounded-full">
            컴포넌트 {componentCount}개
          </span>
        )}
      </div>

      <div className="font-mono text-xs leading-relaxed">
        {/* Root */}
        <div className="flex items-center gap-1.5 py-0.5 mb-0.5">
          <span className={`px-2 py-1 rounded border font-semibold ${TAG_COLORS.root}`}>
            {root.tag}
          </span>
          <span className="text-gray-500 text-xs">← 현재 컴포넌트</span>
        </div>
        {root.children.map((child, i) => (
          <NodeRow
            key={`${child.tag}-${i}`}
            node={child}
            isLast={i === root.children.length - 1}
            parentPrefix=""
          />
        ))}
      </div>

      {/* 범례 */}
      <div className="flex items-center gap-3 mt-4 pt-3 border-t border-gray-800">
        <span className="text-gray-600 text-xs">범례:</span>
        <span className="text-xs text-purple-300 bg-purple-900/40 border border-purple-800/50 px-1.5 py-0.5 rounded">현재</span>
        <span className="text-xs text-blue-300 bg-blue-900/40 border border-blue-800/50 px-1.5 py-0.5 rounded">컴포넌트</span>
        <span className="text-xs text-gray-400 bg-gray-800/60 border border-gray-700/50 px-1.5 py-0.5 rounded">HTML</span>
      </div>
    </div>
  );
}
