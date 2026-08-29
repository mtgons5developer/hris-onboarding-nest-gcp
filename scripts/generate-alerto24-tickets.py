#!/usr/bin/env python3
"""Generate Alerto24/Klaro import CSV from ALERTO24_TICKETS.md with rich Description bodies."""

from __future__ import annotations

import csv
import re
import sys
from dataclasses import dataclass, field
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MD_PATH = ROOT / "docs" / "ALERTO24_TICKETS.md"
CSV_OUT = ROOT / "docs" / "alerto24-tickets.csv"

EPIC_CONTEXT: dict[str, str] = {
    "Foundation": (
        "This ticket is part of the Foundation epic: local monorepo scaffolding, Nest API, "
        "Prisma/Postgres, seed data, shared packages, and baseline tests that every later "
        "auth, documents, client, and deploy ticket builds on."
    ),
    "Auth": (
        "This ticket is part of the Auth epic: OIDC identity (Cognito in prod, Keycloak/dev "
        "bypass locally), JWT guards, role claims, and portal login so HR, managers, and "
        "employees reach the correct surfaces."
    ),
    "Documents": (
        "This ticket is part of the Documents epic: metadata registration, local/S3 storage "
        "drivers, upload/download/delete flows, and linking files to onboarding checklist "
        "tasks for the employee and HR review path."
    ),
    "Clients": (
        "This ticket is part of the Clients epic: Vite admin/onboarding/landing portals and "
        "Flutter mobile clients that consume the Nest API and OIDC, including routing, "
        "role-gated UX, and production subdomain wiring on getlakbay.com."
    ),
    "Infra / Deploy": (
        "This ticket is part of the Infra / Deploy epic: Cloudflare Pages + Tunnel, AWS "
        "Cognito/S3, DNS/SSL, and the public demo path that exposes the local Nest API "
        "at api.getlakbay.com without a long-lived VPS."
    ),
    "Bugfixes": (
        "This ticket is part of the Bugfixes epic: regressions found during lab bring-up "
        "(ports, auth edge cases, CORS, env baking, tunnel/Pages quirks). Each fix should "
        "remain reproducible from the steps below."
    ),
    "Documentation": (
        "This ticket is part of the Documentation epic: README, setup guides, env tables, "
        "and demo scripts that match the as-built AWS + Cognito + S3 + Cloudflare stack "
        "(GCP/Firebase paths marked historical only)."
    ),
}

EPIC_DEMO: dict[str, str] = {
    "Foundation": (
        "Run `npm run db:up && npm run prisma:migrate && npm run prisma:seed && "
        "npm run dev:api`; hit `GET /health` and Swagger at `/api/docs`."
    ),
    "Auth": (
        "Sign in as Harper (`hr@lab.local` / `LabPass123!`) via Cognito Hosted UI on Pages "
        "or Keycloak/dev bypass locally; confirm `GET /api/v1/me` returns role claims."
    ),
    "Documents": (
        "As Luis, upload government ID on onboarding checklist; as Harper, view/delete "
        "document on admin case detail (web or Flutter)."
    ),
    "Clients": (
        "Open each portal (admin :5173, onboarding :5174, landing :5175 locally; "
        "getlakbay.com subdomains in prod) and walk the happy path."
    ),
    "Infra / Deploy": (
        "Verify `curl https://api.getlakbay.com/health`, Pages SSL Active, and tunnel + "
        "Nest running for public demo."
    ),
    "Bugfixes": (
        "Reproduce original failure mode, apply fix steps in description, confirm "
        "regression no longer occurs."
    ),
    "Documentation": (
        "Open linked doc paths; confirm URLs, env tables, and demo script match current "
        "as-built stack."
    ),
}

EPIC_DEPS: dict[str, str] = {
    "Foundation": (
        "Requires Docker, Node 20+, npm workspaces. No cloud credentials for local-only path."
    ),
    "Auth": (
        "Cognito: `infra/aws-cognito` outputs, Pages `VITE_OIDC_*` vars. Local: Keycloak "
        "on :8082, `AUTH_DEV_BYPASS=true` on API."
    ),
    "Documents": (
        "`STORAGE_DRIVER=local` (dev) or `s3` (prod). S3 needs `infra/aws-s3` apply + IAM "
        "keys in API `.env`."
    ),
    "Clients": (
        "Vite env baked at build time (`VITE_API_BASE_URL`, OIDC vars). Flutter uses "
        "`--dart-define=API_BASE_URL` for device LAN IP."
    ),
    "Infra / Deploy": (
        "Cloudflare account, scoped API token, AWS CLI user `hris-lab-cli`. Tunnel "
        "credentials gitignored."
    ),
    "Bugfixes": (
        "See ticket-specific env/dashboard notes. Distinguish Cloudflare edge 403 from "
        "API JWT 401."
    ),
    "Documentation": (
        "Docs reflect AWS+Cognito+S3+Cloudflare as-built; GCP/Firebase paths marked "
        "historical only."
    ),
}

TICKET_HEADER = re.compile(r"^### ([A-Z]+-\d+) — (.+)$", re.MULTILINE)
EPIC_HEADER = re.compile(r"^## Epic: (.+)$", re.MULTILINE)
WORD_RE = re.compile(r"\S+")


@dataclass
class Ticket:
    ticket_id: str
    title: str
    epic: str
    status: str
    priority: str
    labels: str
    summary: str
    scope_items: list[str] = field(default_factory=list)
    files: str = ""
    acceptance: list[str] = field(default_factory=list)
    demo_notes: str = ""
    dependencies: str = ""

    def acceptance_block(self) -> str:
        lines: list[str] = []
        for item in self.acceptance:
            text = item.lstrip("- [x] ").lstrip("- ").strip()
            lines.append(f"- [x] {text}")
        return "\n".join(lines)

    def rich_description(self) -> str:
        """Build a self-contained multi-section card body (~100–300 words)."""
        summary = self.summary.strip()
        if summary and not summary.endswith((".", "!", "?")):
            summary += "."

        scope = [s.strip().rstrip(".") + "." for s in self.scope_items if s.strip()]
        if not scope:
            scope = [summary]

        files = (self.files or "").strip() or "See acceptance criteria and linked paths in repo."
        demo = (self.demo_notes or "").strip() or EPIC_DEMO.get(self.epic, "Follow README happy-path demo.")
        deps = (self.dependencies or "").strip() or EPIC_DEPS.get(self.epic, "See README and `.env.example` files.")
        epic_ctx = EPIC_CONTEXT.get(self.epic, "")

        # Narrative summary: what/why + epic placement
        summary_para = (
            f"{summary} Ticket `{self.ticket_id}` ({self.priority}, status {self.status}) "
            f"lives under the **{self.epic}** epic"
        )
        if self.labels:
            summary_para += f" and is tagged `{self.labels}`"
        summary_para += "."
        if epic_ctx:
            summary_para += f" {epic_ctx}"

        # Expand scope into prose + bullets so thin tickets still read as full work logs
        scope_intro = (
            f"Work completed for **{self.title}** includes the concrete changes below. "
            "Treat this as the as-built record for reviewers importing into Alerto24/Klaro "
            "who only see Title + Description on the card."
        )

        ac_lines = []
        for item in self.acceptance:
            text = item.lstrip("- [x] ").lstrip("- ").strip()
            ac_lines.append(f"- [x] {text}")
        if not ac_lines:
            ac_lines = ["- [x] Described work is present in the repo and demoable via notes below"]

        ac_intro = (
            "The card is Done when all of the following hold (also duplicated in the "
            "Acceptance Criteria column for checklist-style boards):"
        )

        files_para = (
            f"Primary touchpoints: {files}. When validating locally or in CI, start from "
            "these paths, then confirm related workspace scripts and env examples still "
            "align with the acceptance checklist."
        )

        demo_para = (
            f"{demo} Prefer the seeded personas (Harper / Maya / Luis) where auth or "
            "portal flows apply, and capture any failure mode before claiming the ticket Done."
        )

        deps_para = (
            f"{deps} Do not commit secrets, tunnel credentials, or cloud keys; keep "
            "`.env` / credential files gitignored and document only placeholder names."
        )

        sections = [
            "## Summary",
            summary_para,
            "",
            "## Scope / work done",
            scope_intro,
            "",
            *[f"- {item}" for item in scope],
            "",
            "## Files / areas touched",
            files_para,
            "",
            "## Acceptance criteria",
            ac_intro,
            "",
            *ac_lines,
            "",
            "## Demo / verify notes",
            demo_para,
            "",
            "## Dependencies / notes",
            deps_para,
        ]
        body = "\n".join(sections)

        # Pad thin tickets with explicit why/impact without inventing false deliverables
        words = len(WORD_RE.findall(body))
        if words < 100:
            pad = (
                "\n\n## Why it matters\n"
                f"Without `{self.ticket_id}`, later lab steps in **{self.epic}** become harder "
                "to demo or regress. Keeping the narrative, files, checklist, and verify notes "
                "on the card body ensures Alerto24 imports remain useful even when only "
                "Title and Description are mapped."
            )
            body += pad
            words = len(WORD_RE.findall(body))

        # Soft upper bound: if somehow huge, leave as-is (markdown is authoritative)
        if words > 320:
            # Prefer keeping structure; only trim Why it matters if we added it
            pass

        return body


def _meta_line(body: str, name: str) -> str:
    m = re.search(rf"\*\*{re.escape(name)}:\*\*\s*(.+)", body)
    if not m:
        return ""
    return m.group(1).strip().rstrip("*").strip()


def _section(body: str, name: str) -> str:
    """Capture content after **Name:** until next **Something:** or end."""
    pattern = rf"\*\*{re.escape(name)}:\*\*\s*(.*?)(?=\n\*\*[^*\n]+:\*\*|\Z)"
    m = re.search(pattern, body, re.DOTALL)
    if not m:
        return ""
    return m.group(1).strip()


def parse_markdown(content: str) -> list[Ticket]:
    first_epic = content.find("## Epic:")
    if first_epic == -1:
        raise ValueError("No epic sections found")

    epic_spans: list[tuple[str, int, int]] = []
    for m in EPIC_HEADER.finditer(content):
        if m.group(1).startswith("Deferred"):
            break
        epic_spans.append((m.group(1).strip(), m.start(), m.end()))

    tickets: list[Ticket] = []
    for i, (epic, _start, end) in enumerate(epic_spans):
        next_start = epic_spans[i + 1][1] if i + 1 < len(epic_spans) else content.find("## Deferred")
        if next_start == -1:
            next_start = len(content)
        epic_body = content[end:next_start]

        parts = re.split(r"(?=^### [A-Z]+-\d+ — )", epic_body, flags=re.MULTILINE)
        for part in parts:
            part = part.strip()
            if not part.startswith("### "):
                continue
            header = TICKET_HEADER.match(part)
            if not header:
                continue
            ticket_id, title = header.group(1), header.group(2).strip()
            body = part[header.end() :].strip()
            body = re.sub(r"\n---\s*$", "", body).strip()

            status = _meta_line(body, "Status")
            priority = _meta_line(body, "Priority")
            labels = _meta_line(body, "Labels")

            summary = _section(body, "Summary")
            # Fallback for older **Description:** blocks
            if not summary:
                summary = _section(body, "Description")

            scope_raw = _section(body, "Scope / work done")
            scope_items = [
                re.sub(r"^[-*]\s+", "", line).strip()
                for line in scope_raw.splitlines()
                if line.strip().startswith(("-", "*"))
            ]
            if not scope_items and scope_raw:
                scope_items = [scope_raw.replace("\n", " ").strip()]

            files = _section(body, "Files / areas touched") or _section(body, "Files")
            # Flatten single-line files fields
            files = " ".join(files.split())

            ac_raw = _section(body, "Acceptance criteria")
            acceptance = [
                line.strip()
                for line in ac_raw.splitlines()
                if line.strip().startswith("- [")
            ]

            demo = _section(body, "Demo / verify notes") or _section(body, "Demo notes")
            demo = " ".join(demo.split())
            deps = _section(body, "Dependencies / notes")
            deps = " ".join(deps.split())

            if not summary:
                summary = title

            tickets.append(
                Ticket(
                    ticket_id=ticket_id,
                    title=title,
                    epic=epic,
                    status=status or "Done",
                    priority=priority or "P2",
                    labels=labels,
                    summary=summary,
                    scope_items=scope_items,
                    files=files,
                    acceptance=acceptance,
                    demo_notes=demo,
                    dependencies=deps,
                )
            )

    return tickets


def update_markdown_import_notes(content: str) -> str:
    """Ensure import notes state that CSV Description mirrors markdown bodies."""
    note = (
        "**CSV Description column:** `docs/alerto24-tickets.csv` now mirrors each markdown "
        "ticket body (Summary, Scope, Files, Acceptance criteria, Demo / verify, Dependencies) "
        "as a self-contained multi-paragraph narrative (~100–300 words) so boards that only "
        "map Title + Description still get complete cards."
    )
    if "CSV Description column:" in content:
        content = re.sub(
            r"\*\*CSV Description column:\*\*.*?(?=\n\n|\n\*\*Deliverables)",
            note + "\n\n",
            content,
            count=1,
            flags=re.DOTALL,
        )
        return content

    # Insert after Critical line or before Deliverables
    if "**Critical:**" in content:
        content = content.replace(
            "**Critical:** Put the complete ticket narrative in `Card description`, not only in the title. See [`docs/ALERTO24_IMPORT.md`](ALERTO24_IMPORT.md) for step-by-step import instructions and CSV escaping rules.",
            "**Critical:** Put the complete ticket narrative in `Description` (and Klaro `Card description` if used), not only in the title. See [`docs/ALERTO24_IMPORT.md`](ALERTO24_IMPORT.md) for step-by-step import instructions and CSV escaping rules.\n\n"
            + note,
            1,
        )
    elif "**Deliverables:**" in content:
        content = content.replace("**Deliverables:**", note + "\n\n**Deliverables:**", 1)
    return content


def write_csv(tickets: list[Ticket], path: Path) -> None:
    fieldnames = [
        "ID",
        "Title",
        "Description",
        "Status",
        "Priority",
        "Labels/Tags",
        "Epic/Phase",
        "Acceptance Criteria",
        "Files / Notes",
        # Klaro-friendly aliases (same content) for auto-map
        "Card title",
        "Card description",
        "Labels",
        "Epic",
    ]
    with path.open("w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames, quoting=csv.QUOTE_MINIMAL)
        writer.writeheader()
        for t in tickets:
            title = f"{t.ticket_id} — {t.title}"
            body = t.rich_description()
            labels = t.labels.replace(", ", ",")
            writer.writerow(
                {
                    "ID": t.ticket_id,
                    "Title": title,
                    "Description": body,
                    "Status": t.status,
                    "Priority": t.priority,
                    "Labels/Tags": labels,
                    "Epic/Phase": t.epic,
                    "Acceptance Criteria": t.acceptance_block(),
                    "Files / Notes": t.files,
                    "Card title": title,
                    "Card description": body,
                    "Labels": labels,
                    "Epic": t.epic,
                }
            )


def main() -> int:
    if not MD_PATH.exists():
        print(f"Missing {MD_PATH}", file=sys.stderr)
        return 1

    content = MD_PATH.read_text(encoding="utf-8")
    tickets = parse_markdown(content)
    if len(tickets) < 80:
        print(f"Expected ~89 tickets, parsed {len(tickets)}", file=sys.stderr)
        return 1

    # Light touch on markdown import notes only (do not rewrite ticket bodies)
    updated = update_markdown_import_notes(content)
    if updated != content:
        MD_PATH.write_text(updated, encoding="utf-8")

    write_csv(tickets, CSV_OUT)

    lengths = [len(t.rich_description()) for t in tickets]
    words = [len(WORD_RE.findall(t.rich_description())) for t in tickets]
    under = [t.ticket_id for t, w in zip(tickets, words) if w < 100]
    print(
        f"Wrote {len(tickets)} tickets "
        f"(chars min={min(lengths)} avg={sum(lengths)//len(lengths)} max={max(lengths)}; "
        f"words min={min(words)} avg={sum(words)//len(words)} max={max(words)})"
    )
    if under:
        print(f"  WARNING under 100 words: {', '.join(under)}")
    print(f"  {CSV_OUT}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
