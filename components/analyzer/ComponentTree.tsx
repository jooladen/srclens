"use client";

import { useState } from "react";
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

function countAllNodes(node: TreeNode): number {
  return node.children.reduce((acc, child) => acc + 1 + countAllNodes(child), 0);
}

function calcMaxDepth(node: TreeNode, depth = 0): number {
  if (node.children.length === 0) return depth;
  return Math.max(...node.children.map((c) => calcMaxDepth(c, depth + 1)));
}

interface NodeRowProps {
  node: TreeNode;
  isLast: boolean;
  parentPrefix: string;
  depth: number;
  siblingIndex: number;
}

function NodeRow({ node, isLast, parentPrefix, depth, siblingIndex }: NodeRowProps) {
  const [isOpen, setIsOpen] = useState(depth < 2);
  const hasChildren = node.children.length > 0;

  const linePrefix = parentPrefix + (isLast ? "└─ " : "├─ ");
  const childPrefix = parentPrefix + (isLast ? "   " : "│  ");

  const tagStyle =
    node.tag === "Fragment"
      ? TAG_COLORS.fragment
      : node.isComponent
      ? TAG_COLORS.component
      : TAG_COLORS.html;

  const animDelay = (depth * 2 + siblingIndex) * 35 + 40;

  return (
    <div className="tree-node-animate" style={{ animationDelay: `${animDelay}ms` }}>
      <div
        className={`flex items-center gap-1 py-0.5 px-1 -mx-1 rounded-md transition-colors group ${
          hasChildren
            ? "cursor-pointer hover:bg-gray-800/50"
            : "hover:bg-gray-800/30"
        }`}
        onClick={() => hasChildren && setIsOpen(!isOpen)}
      >
        <span className="text-gray-600 select-none whitespace-pre font-mono text-xs">
          {linePrefix}
        </span>
        <span className="w-3 text-xs text-gray-500 select-none flex-shrink-0 text-center">
          {hasChildren ? (isOpen ? "▼" : "▶") : ""}
        </span>
        <span
          className={`px-1.5 py-0.5 rounded border font-medium text-xs font-mono transition-all ${tagStyle} ${
            node.isComponent && node.tag !== "Fragment"
              ? "group-hover:ring-1 group-hover:ring-blue-500/40"
              : ""
          }`}
        >
          {node.tag === "Fragment" ? "<>" : `<${node.tag}>`}
        </span>
        {node.isComponent && node.tag !== "Fragment" && (
          <span className="text-gray-600 text-xs">컴포넌트</span>
        )}
        {hasChildren && !isOpen && (
          <span className="text-gray-700 text-xs ml-0.5">+{node.children.length}</span>
        )}
      </div>

      {isOpen &&
        node.children.map((child, i) => (
          <NodeRow
            key={`${child.tag}-${i}`}
            node={child}
            isLast={i === node.children.length - 1}
            parentPrefix={childPrefix}
            depth={depth + 1}
            siblingIndex={i}
          />
        ))}
    </div>
  );
}

export function ComponentTree({ root }: { root: TreeNode }) {
  const componentCount = countCustomComponents(root);
  const totalNodes = countAllNodes(root);
  const maxDepth = calcMaxDepth(root);

  if (root.children.length === 0) {
    return (
      <div className="bg-gray-900 border border-gray-700 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xl">🌳</span>
          <h3 className="font-bold text-gray-200">컴포넌트 트리</h3>
        </div>
        <div className="text-center py-4">
          <div className="text-2xl mb-2">🔍</div>
          <p className="text-sm text-gray-500">JSX를 찾지 못했어요.</p>
          <p className="text-xs mt-1 text-gray-700">
            <code className="text-gray-500">return ( )</code> 안에 태그가 있는지 확인해보세요.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xl">🌳</span>
        <h3 className="font-bold text-gray-200">컴포넌트 트리</h3>
        <span className="ml-auto text-xs text-gray-600">클릭으로 접기/펼치기</span>
      </div>

      <div className="leading-relaxed">
        {/* Root node */}
        <div
          className="tree-node-animate flex items-center gap-1.5 py-0.5 mb-0.5"
          style={{ animationDelay: "0ms" }}
        >
          <span
            className={`px-2 py-1 rounded border font-semibold text-xs font-mono ${TAG_COLORS.root}`}
          >
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
            depth={0}
            siblingIndex={i}
          />
        ))}
      </div>

      {/* 통계 + 범례 Footer */}
      <div className="flex items-center flex-wrap gap-x-3 gap-y-2 mt-4 pt-3 border-t border-gray-800 text-xs text-gray-500">
        <span>
          총 <span className="text-gray-300 font-medium">{totalNodes}</span>개 노드
        </span>
        <span className="text-gray-700">·</span>
        <span>
          컴포넌트 <span className="text-blue-400 font-medium">{componentCount}</span>개
        </span>
        <span className="text-gray-700">·</span>
        <span>
          최대 <span className="text-gray-300 font-medium">{maxDepth}</span>단계
        </span>
        <span className="ml-auto flex items-center gap-1.5">
          <span className="text-purple-300 bg-purple-900/40 border border-purple-800/50 px-1.5 py-0.5 rounded">
            현재
          </span>
          <span className="text-blue-300 bg-blue-900/40 border border-blue-800/50 px-1.5 py-0.5 rounded">
            컴포넌트
          </span>
          <span className="text-gray-400 bg-gray-800/60 border border-gray-700/50 px-1.5 py-0.5 rounded">
            HTML
          </span>
        </span>
      </div>
    </div>
  );
}
