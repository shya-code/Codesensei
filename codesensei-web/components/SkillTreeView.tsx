"use client";
import { useEffect, useRef } from "react";
import * as d3 from "d3";
import { SKILL_TREE_EDGES, SKILL_ROOTS, getUnlockedConcepts } from "@/lib/skillTree";
import { TOPICS } from "@/lib/topics-data";

interface Props {
  completedConcepts: string[];
  onSelectConcept: (concept: string) => void;
}

interface NodeDatum extends d3.SimulationNodeDatum {
  id: string;
  label: string;
  emoji: string;
  status: "completed" | "unlocked" | "locked";
}

interface LinkDatum extends d3.SimulationLinkDatum<NodeDatum> {
  source: NodeDatum | string;
  target: NodeDatum | string;
}

export default function SkillTreeView({ completedConcepts, onSelectConcept }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const W = svgRef.current.clientWidth || 800;
    const H = svgRef.current.clientHeight || 500;

    const completedSet = new Set(completedConcepts);
    const unlockedSet = new Set(getUnlockedConcepts(completedConcepts));

    // Build nodes from all edge endpoints + roots
    const conceptIds = new Set<string>(SKILL_ROOTS);
    SKILL_TREE_EDGES.forEach((e) => { conceptIds.add(e.from); conceptIds.add(e.to); });

    const nodes: NodeDatum[] = Array.from(conceptIds).map((id) => {
      const topicDef = TOPICS.find((t) => t.concept === id);
      const status = completedSet.has(id) ? "completed" : unlockedSet.has(id) ? "unlocked" : "locked";
      return { id, label: topicDef?.name ?? id.replace(/_/g, " "), emoji: topicDef?.emoji ?? "🧩", status };
    });

    const nodeById = new Map(nodes.map((n) => [n.id, n]));
    const links: LinkDatum[] = SKILL_TREE_EDGES
      .filter((e) => nodeById.has(e.from) && nodeById.has(e.to))
      .map((e) => ({ source: e.from, target: e.to }));

    const sim = d3.forceSimulation<NodeDatum>(nodes)
      .force("link", d3.forceLink<NodeDatum, LinkDatum>(links).id((d) => d.id).distance(120))
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(W / 2, H / 2))
      .force("collision", d3.forceCollide(55));

    const g = svg.append("g");

    // Zoom
    svg.call(d3.zoom<SVGSVGElement, unknown>().on("zoom", (event) => {
      g.attr("transform", event.transform);
    }) as any);

    // Links
    const link = g.append("g").selectAll("line").data(links).join("line")
      .attr("stroke", "#ccc").attr("stroke-width", 1.5).attr("marker-end", "url(#arrow)");

    // Arrow marker
    svg.append("defs").append("marker")
      .attr("id", "arrow").attr("viewBox", "0 -5 10 10")
      .attr("refX", 22).attr("refY", 0)
      .attr("markerWidth", 6).attr("markerHeight", 6).attr("orient", "auto")
      .append("path").attr("d", "M0,-5L10,0L0,5").attr("fill", "#aaa");

    // Nodes
    const node = g.append("g").selectAll("g").data(nodes).join("g")
      .style("cursor", (d) => d.status === "locked" ? "default" : "pointer")
      .on("click", (_, d) => { if (d.status !== "locked") onSelectConcept(d.id); });

    node.append("circle").attr("r", 28)
      .attr("fill", (d) => d.status === "completed" ? "#4caf5022" : d.status === "unlocked" ? "var(--bg-warm)" : "var(--bg-ruled)")
      .attr("stroke", (d) => d.status === "completed" ? "#4caf50" : d.status === "unlocked" ? "var(--ink)" : "var(--ink-faint)")
      .attr("stroke-width", (d) => d.status === "locked" ? 1 : 2);

    node.append("text").attr("text-anchor", "middle").attr("dominant-baseline", "central")
      .attr("dy", "-5").style("font-size", "1.3rem")
      .attr("opacity", (d) => d.status === "locked" ? 0.3 : 1)
      .text((d) => d.emoji);

    node.append("text").attr("text-anchor", "middle").attr("dy", "22")
      .style("font-size", "0.6rem").style("font-family", "var(--font-head)")
      .attr("fill", (d) => d.status === "locked" ? "var(--ink-faint)" : "var(--ink)")
      .text((d) => d.label);

    sim.on("tick", () => {
      link
        .attr("x1", (d) => (d.source as NodeDatum).x!)
        .attr("y1", (d) => (d.source as NodeDatum).y!)
        .attr("x2", (d) => (d.target as NodeDatum).x!)
        .attr("y2", (d) => (d.target as NodeDatum).y!);
      node.attr("transform", (d) => `translate(${d.x},${d.y})`);
    });

    return () => { sim.stop(); };
  }, [completedConcepts, onSelectConcept]);

  return (
    <svg ref={svgRef} style={{ width: "100%", height: 500, display: "block", border: "var(--border)", borderRadius: 8, background: "var(--bg)" }} />
  );
}
