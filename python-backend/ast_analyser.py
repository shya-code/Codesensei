# python-backend/ast_analyser.py
# CodeSensei — Static Code Analysis using Python's built-in ast module ONLY.
# No subprocess, no exec, no eval, no code execution of any kind.
# Imports: ast, typing (both stdlib only).

import ast
from typing import Tuple


def analyse_code(code: str) -> Tuple[dict, list]:
    """
    Parses Python code using the ast module and returns:
      (ast_data_dict, issues_list)

    ast_data_dict = { "nodes": [...], "edges": [...] }
    issues_list   = list of strings describing detected patterns
    """

    nodes: list = []
    edges: list = []
    issues: list = []
    node_id_counter = [0]

    # ─── Step 1: Parse ────────────────────────────────────────────────────────
    try:
        tree = ast.parse(code)
    except SyntaxError as e:
        return (
            {"nodes": [], "edges": []},
            [f"SyntaxError at line {e.lineno}, offset {e.offset}: {e.msg}"],
        )

    # ─── Step 2 & 3: Walk tree, build visualisation data, detect patterns ────

    def _get_id() -> str:
        nid = f"n{node_id_counter[0]}"
        node_id_counter[0] += 1
        return nid

    def _check_range_len(node: ast.AST) -> bool:
        """Pattern A helper: detect range(len(...)) in a loop body sub-tree."""
        for sub in ast.walk(node):
            if isinstance(sub, ast.Call):
                func = sub.func
                if isinstance(func, ast.Name) and func.id == "range":
                    for arg in sub.args:
                        if (
                            isinstance(arg, ast.Call)
                            and isinstance(arg.func, ast.Name)
                            and arg.func.id == "len"
                        ):
                            return True
        return False

    def _check_recursive_no_base(func_node: ast.FunctionDef) -> bool:
        """
        Pattern B helper: returns True if the function has a recursive call
        but NO if-statement anywhere in its body.
        """
        func_name = func_node.name
        has_recursive_call = False
        has_if = False

        for sub in ast.walk(func_node):
            # Skip the FunctionDef node itself when looking for nested ifs
            if sub is func_node:
                continue
            if isinstance(sub, ast.If):
                has_if = True
            if isinstance(sub, ast.Call):
                cf = sub.func
                if isinstance(cf, ast.Name) and cf.id == func_name:
                    has_recursive_call = True
                elif isinstance(cf, ast.Attribute) and cf.attr == func_name:
                    has_recursive_call = True

        return has_recursive_call and not has_if

    def visit(node: ast.AST, parent_id: str | None) -> None:
        current_id = _get_id()
        node_type = type(node).__name__
        line: int | None = getattr(node, "lineno", None)
        has_issue = False
        issue_type: str | None = None

        # ── Pattern A — range(len(...)) in For/While ──────────────────────────
        if isinstance(node, (ast.For, ast.While)):
            if _check_range_len(node):
                has_issue = True
                issue_type = "boundary"
                loop_line = getattr(node, "lineno", "?")
                issues.append(
                    f"Line {loop_line}: range(len(...)) used directly — possible "
                    f"off-by-one error. Consider range(len(arr)-1) or enumerate(arr)"
                )

        # ── Pattern B — Recursive function with no base case ─────────────────
        if isinstance(node, ast.FunctionDef):
            if _check_recursive_no_base(node):
                has_issue = True
                issue_type = "missing_base_case"
                func_line = getattr(node, "lineno", "?")
                issues.append(
                    f"Line {func_line}: '{node.name}' appears recursive but has "
                    f"no if-statement — base case may be missing"
                )

            # ── Pattern D — Mutable default argument ──────────────────────────
            for default in node.args.defaults:
                if isinstance(default, (ast.List, ast.Dict, ast.Set)):
                    has_issue = True
                    issue_type = "mutable_default"
                    func_line = getattr(node, "lineno", "?")
                    issues.append(
                        f"Line {func_line}: mutable default argument detected in "
                        f"'{node.name}' — this is shared across all function calls"
                    )
                    break  # one report per function is enough

        # ── Pattern C — Bare except ───────────────────────────────────────────
        if isinstance(node, ast.ExceptHandler):
            if node.type is None:
                has_issue = True
                issue_type = "bare_except"
                exc_line = getattr(node, "lineno", "?")
                issues.append(
                    f"Line {exc_line}: bare except: clause catches ALL exceptions "
                    f"including KeyboardInterrupt — specify the exception type"
                )

        # ── Build node label ──────────────────────────────────────────────────
        label = f"{node_type} (L{line})" if line is not None else node_type

        nodes.append(
            {
                "id": current_id,
                "type": node_type,
                "line": line,
                "hasIssue": has_issue,
                "issueType": issue_type,
                "label": label,
            }
        )

        if parent_id is not None:
            edges.append({"source": parent_id, "target": current_id})

        # ── Recurse into children ─────────────────────────────────────────────
        for child in ast.iter_child_nodes(node):
            visit(child, current_id)

    visit(tree, None)

    # ─── Step 4: Cap and return ───────────────────────────────────────────────
    capped_nodes = nodes[:60]
    capped_edges = edges[:80]

    return {"nodes": capped_nodes, "edges": capped_edges}, issues
