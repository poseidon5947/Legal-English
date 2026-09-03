import { createHash } from "crypto";
import * as XLSX from "xlsx";
import { CATEGORIES, emptyTerm, isCanonicalCategory, type Quiz, type Term } from "./types";

type Row = Record<string, unknown>;
export type ImportIssue = {
  sheet: string;
  row: number;
  id?: string;
  field?: string;
  value?: string;
  message: string;
  severity: "blocking" | "warning";
};

const REQUIRED_SHEETS: Record<string, string[]> = {
  Terms: ["TermID", "Term", "Definition", "SpanishEquivalent", "CivilLawEquivalent", "SpanishSpeakerAlert", "Topic", "Status", "EditorialVersion", "LastReviewedAt", "JurisdictionUS", "JurisdictionUK", "AudioUS", "AudioUK"],
  Categories: ["CategoryID", "CategoryName"],
  Topics: ["TopicID", "CategoryID", "TopicName"],
  LearningCollections: ["LearningCollectionID", "CollectionName"],
  CollectionItems: ["CollectionItemID", "LearningCollectionID", "TermID", "Position", "Status"],
  UseItWithItems: ["UseItWithItemID", "TermID", "Expression", "DisplayOrder", "Status"],
  InContextItems: ["InContextItemID", "TermID", "ExampleText", "Jurisdiction", "DisplayOrder", "Status"],
  QuizItems: ["QuizItemID", "TermID", "Prompt", "OptionA", "OptionB", "OptionC", "OptionD", "CorrectOption", "Explanation", "DisplayOrder", "Status"],
  TermJurisdictionVariants: ["VariantID", "TermID", "Jurisdiction", "VariantTerm", "Definition", "DisplayOrder", "Status"],
  Sources: ["SourceID"],
  TermSources: ["TermSourceID", "TermID", "SourceID", "SourceRole"],
};

function text(value: unknown) {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value ?? "").trim();
}

function asBool(value: unknown) {
  if (typeof value === "boolean") return value;
  return ["true", "1", "yes", "x"].includes(text(value).toLowerCase());
}

function sheetRows(book: XLSX.WorkBook, name: string) {
  const sheet = book.Sheets[name];
  if (!sheet) return { headers: [] as string[], rows: [] as Row[] };
  const raw = XLSX.utils.sheet_to_json<Row>(sheet, { defval: "", raw: false });
  const headers = raw[0] ? Object.keys(raw[0]) : [];
  return { headers, rows: raw };
}

function documentControl(book: XLSX.WorkBook) {
  const sheet = book.Sheets["Document Control"];
  if (!sheet) return { version: "", status: "", workbook: "" };
  const rows = XLSX.utils.sheet_to_json<(string | number)[]>(sheet, { header: 1, defval: "" });
  const find = (label: string) => {
    const row = rows.find((item) => text(item[0]).toLowerCase() === label.toLowerCase());
    return row ? text(row[1]) : "";
  };
  // The Version cell carries a governance note after the number
  // ("v1.3.81 — working-version number alone does not prove authority");
  // only the version token is stored as source_workbook_version.
  const rawVersion = find("Version");
  const versionToken = /v?\d+\.\d+\.\d+/i.exec(rawVersion)?.[0] ?? rawVersion;
  return {
    version: versionToken ? (versionToken.startsWith("v") ? versionToken : `v${versionToken}`) : "",
    versionNote: rawVersion,
    status: find("Status"),
    workbook: find("Workbook identification"),
  };
}

// Key-order independent serialization: the same editorial content must hash
// the same whether it came from the importer, the seed file or the database.
function canonical(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    return `{${Object.keys(record)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${canonical(record[key])}`)
      .join(",")}}`;
  }
  return JSON.stringify(value ?? null);
}

export function hashTerm(term: Pick<Term, "id" | "term" | "definition" | "spanishEquivalent" | "civilLawEquivalent" | "spanishSpeakerAlert" | "category" | "useItWith" | "inContext" | "quiz" | "usVariant" | "ukVariant">) {
  return createHash("sha256")
    .update(
      canonical({
        id: term.id,
        term: term.term,
        definition: term.definition,
        spanishEquivalent: term.spanishEquivalent,
        civilLawEquivalent: term.civilLawEquivalent,
        spanishSpeakerAlert: term.spanishSpeakerAlert,
        category: term.category,
        useItWith: term.useItWith,
        inContext: term.inContext,
        quiz: term.quiz,
        usVariant: term.usVariant,
        ukVariant: term.ukVariant,
      })
    )
    .digest("hex");
}

function optionLetter(index: number) {
  return String.fromCharCode(65 + index);
}

function buildQuiz(row: Row): Quiz | null {
  if (!text(row.Prompt)) return null;
  const optionA = text(row.OptionA);
  const optionB = text(row.OptionB);
  const optionC = text(row.OptionC);
  const optionD = text(row.OptionD);
  const options = [optionA, optionB, optionC, optionD].filter(Boolean);
  return {
    id: text(row.QuizItemID),
    question: text(row.Prompt),
    options,
    optionA,
    optionB,
    optionC,
    optionD,
    correctOption: text(row.CorrectOption) || "A",
    explanation: text(row.Explanation),
    displayOrder: Number(row.DisplayOrder || 1),
    mcdStatus: text(row.Status) || "Approved",
  };
}

function populatedOption(quiz: Quiz, letter: string) {
  const map: Record<string, string> = { A: quiz.optionA, B: quiz.optionB, C: quiz.optionC, D: quiz.optionD };
  return Boolean(map[letter]);
}

export function previewWorkbook(buffer: Buffer, current: Term[]) {
  const book = XLSX.read(buffer, { type: "buffer" });
  const issues: ImportIssue[] = [];
  const warn = (issue: Omit<ImportIssue, "severity"> & { severity?: ImportIssue["severity"] }) => {
    issues.push({ severity: "blocking", ...issue });
  };

  const control = documentControl(book);
  if (!book.Sheets["Document Control"]) {
    warn({ sheet: "Document Control", row: 0, message: "Document Control sheet is required before accepting a workbook." });
  } else if (!/1\.3\.81/.test(control.version)) {
    issues.push({
      sheet: "Document Control",
      row: 0,
      field: "Version",
      value: control.version,
      message: `Workbook version is ${control.version || "unspecified"}. Initial load is specified as v1.3.81.`,
      severity: "warning",
    });
  }

  const sheets: Record<string, { headers: string[]; rows: Row[] }> = {};
  for (const [name, needed] of Object.entries(REQUIRED_SHEETS)) {
    const parsed = sheetRows(book, name);
    sheets[name] = parsed;
    if (!parsed.headers.length) {
      warn({ sheet: name, row: 0, message: `Missing sheet ${name}.` });
      continue;
    }
    const seen = new Set<string>();
    for (const header of parsed.headers) {
      if (seen.has(header)) warn({ sheet: name, row: 1, field: header, message: `Duplicate header ${header}.` });
      seen.add(header);
    }
    for (const header of needed) {
      if (!parsed.headers.includes(header)) warn({ sheet: name, row: 1, field: header, message: `Missing column ${header}.` });
    }
  }

  const collections = sheets.LearningCollections?.rows ?? [];
  if (!collections.some((row) => text(row.LearningCollectionID) === "LC-001")) {
    warn({ sheet: "LearningCollections", row: 0, id: "LC-001", message: "LC-001 is required as the launch selector." });
  }

  const selected = (sheets.CollectionItems?.rows ?? []).filter(
    (row) => text(row.LearningCollectionID) === "LC-001" && text(row.Status) === "Approved"
  );
  const selectedIds = selected.map((row) => text(row.TermID));
  const uniqueSelected = new Set(selectedIds);
  if (selected.length !== 30 || uniqueSelected.size !== 30) {
    warn({
      sheet: "CollectionItems",
      row: 0,
      id: "LC-001",
      message: `LC-001 must contain exactly 30 unique Approved TermIDs. Found ${selected.length} rows / ${uniqueSelected.size} unique.`,
    });
  }
  const positions = selected.map((row) => Number(row.Position)).sort((a, b) => a - b);
  if (positions.join(",") !== Array.from({ length: 30 }, (_, i) => i + 1).join(",")) {
    warn({ sheet: "CollectionItems", row: 0, field: "Position", message: "LC-001 Position values must be unique and contiguous 1–30." });
  }

  const termById = new Map((sheets.Terms?.rows ?? []).map((row, index) => [text(row.TermID), { row, index }]));
  const topicByName = new Map((sheets.Topics?.rows ?? []).map((row) => [text(row.TopicName), row]));
  const categoryById = new Map((sheets.Categories?.rows ?? []).map((row) => [text(row.CategoryID), row]));

  const useApproved = (sheets.UseItWithItems?.rows ?? []).filter((row) => text(row.Status) === "Approved");
  const contextApproved = (sheets.InContextItems?.rows ?? []).filter((row) => text(row.Status) === "Approved");
  const quizzes = (sheets.QuizItems?.rows ?? []).filter((row) => selectedIds.includes(text(row.TermID)));
  const variants = (sheets.TermJurisdictionVariants?.rows ?? []).filter((row) => text(row.Status) === "Approved");
  const termSources = sheets.TermSources?.rows ?? [];
  const sourceIds = new Set((sheets.Sources?.rows ?? []).map((row) => text(row.SourceID)).filter(Boolean));

  const useBy = new Map<string, Term["useItWith"]>();
  useApproved.forEach((row, index) => {
    const id = text(row.TermID);
    if (!id) return;
    if (!uniqueSelected.has(id) && !termById.has(id)) {
      warn({ sheet: "UseItWithItems", row: index + 2, id, field: "TermID", value: id, message: `Orphan UseItWith TermID ${id}.` });
    }
    const list = useBy.get(id) ?? [];
    list.push({ id: text(row.UseItWithItemID), expression: text(row.Expression), displayOrder: Number(row.DisplayOrder || 0) });
    list.sort((a, b) => a.displayOrder - b.displayOrder);
    useBy.set(id, list);
  });

  const contextBy = new Map<string, Term["inContext"]>();
  const contextGroups = new Map<string, Row[]>();
  contextApproved.forEach((row) => {
    const id = text(row.TermID);
    contextGroups.set(id, [...(contextGroups.get(id) ?? []), row]);
  });
  for (const [id, list] of contextGroups) {
    const chosen = [...list].sort((a, b) => Number(a.DisplayOrder || 0) - Number(b.DisplayOrder || 0))[0];
    contextBy.set(id, {
      id: text(chosen.InContextItemID),
      exampleText: text(chosen.ExampleText),
      jurisdiction: text(chosen.Jurisdiction),
      displayOrder: Number(chosen.DisplayOrder || 0),
    });
  }

  const quizBy = new Map<string, Quiz>();
  quizzes.forEach((row, index) => {
    const id = text(row.TermID);
    const quiz = buildQuiz(row);
    if (!quiz) return;
    if (quizBy.has(id)) {
      warn({ sheet: "QuizItems", row: index + 2, id, field: "TermID", message: `More than one quiz for ${id}. MVP allows one quiz per Term.` });
    }
    if (quiz.options.length < 3) {
      warn({ sheet: "QuizItems", row: index + 2, id: quiz.id, field: "OptionA-C", message: "Quiz must have at least three populated options." });
    }
    if (!["A", "B", "C", "D"].includes(quiz.correctOption) || !populatedOption(quiz, quiz.correctOption)) {
      warn({
        sheet: "QuizItems",
        row: index + 2,
        id: quiz.id,
        field: "CorrectOption",
        value: quiz.correctOption,
        message: "CorrectOption must point to a populated option (A–D; OptionD may be empty).",
      });
    }
    if (!quiz.explanation) {
      warn({ sheet: "QuizItems", row: index + 2, id: quiz.id, field: "Explanation", message: "Explanation is required." });
    }
    quizBy.set(id, quiz);
  });

  const variantBy = new Map<string, { US?: Term["usVariant"]; UK?: Term["ukVariant"] }>();
  const variantSeen = new Set<string>();
  variants.forEach((row, index) => {
    const id = text(row.TermID);
    const jurisdiction = text(row.Jurisdiction);
    const key = `${id}:${jurisdiction}`;
    if (variantSeen.has(key)) {
      warn({ sheet: "TermJurisdictionVariants", row: index + 2, id, field: "Jurisdiction", value: jurisdiction, message: `Duplicate variant for ${id} + ${jurisdiction}.` });
    }
    variantSeen.add(key);
    const payload = {
      id: text(row.VariantID),
      variantTerm: text(row.VariantTerm),
      definition: text(row.Definition),
      displayOrder: Number(row.DisplayOrder || 0),
    };
    const current = variantBy.get(id) ?? {};
    if (jurisdiction === "US") current.US = payload;
    if (jurisdiction === "UK") current.UK = payload;
    variantBy.set(id, current);
  });

  const categoryCounts: Record<string, number> = { "Corporate Law": 0, Contracts: 0, "Employment Law": 0 };
  const existing = new Map(current.map((term) => [term.id, term]));
  const creates: string[] = [];
  const updates: string[] = [];
  const unchanged: string[] = [];
  const terms: Term[] = [];

  selected.forEach((item, index) => {
    const id = text(item.TermID);
    const found = termById.get(id);
    const rowNumber = found ? found.index + 2 : 0;
    if (!found) {
      warn({ sheet: "CollectionItems", row: index + 2, id, message: `Selected TermID ${id} does not exist on Terms.` });
      return;
    }
    const row = found.row;
    const required = [
      ["TermID", id],
      ["Term", text(row.Term)],
      ["Definition", text(row.Definition)],
      ["SpanishEquivalent", text(row.SpanishEquivalent)],
      ["Topic", text(row.Topic)],
      ["Status", text(row.Status)],
      ["EditorialVersion", text(row.EditorialVersion)],
      ["LastReviewedAt", text(row.LastReviewedAt)],
    ];
    for (const [field, value] of required) {
      if (!value) warn({ sheet: "Terms", row: rowNumber, id, field, message: `${field} is required.` });
    }

    const topic = topicByName.get(text(row.Topic));
    const categoryName = topic ? text(categoryById.get(text(topic.CategoryID))?.CategoryName) : "";
    if (!isCanonicalCategory(categoryName)) {
      warn({
        sheet: "Terms",
        row: rowNumber,
        id,
        field: "Topic",
        value: `${text(row.Topic)} → ${categoryName || "unresolved"}`,
        message: `Category must resolve to ${CATEGORIES.join(", ")}.`,
      });
    } else {
      categoryCounts[categoryName] += 1;
    }

    const use = useBy.get(id) ?? [];
    const context = contextBy.get(id) ?? null;
    const quiz = quizBy.get(id) ?? null;
    if (!use.length) warn({ sheet: "UseItWithItems", row: 0, id, message: `${id} needs at least one Approved Use It With item.` });
    if (!context) warn({ sheet: "InContextItems", row: 0, id, message: `${id} needs at least one Approved In Context item.` });
    if (!quiz) warn({ sheet: "QuizItems", row: 0, id, message: `${id} needs exactly one quiz for the LC-001 baseline.` });

    const sourcesFor = termSources.filter((itemRow) => text(itemRow.TermID) === id);
    if (!sourcesFor.length) {
      warn({ sheet: "TermSources", row: 0, id, message: `${id} needs at least one TermSource.` });
    }
    for (const source of sourcesFor) {
      if (!sourceIds.has(text(source.SourceID))) {
        warn({ sheet: "TermSources", row: 0, id, field: "SourceID", value: text(source.SourceID), message: `Unknown SourceID ${text(source.SourceID)}.` });
      }
    }
    if (text(row.CivilLawEquivalent) && !sourcesFor.some((itemRow) => text(itemRow.SourceRole) === "CivilLawEquivalent")) {
      warn({
        sheet: "TermSources",
        row: 0,
        id,
        field: "CivilLawEquivalent",
        message: "CivilLawEquivalent is populated but no TermSource has SourceRole=CivilLawEquivalent.",
      });
    }

    const us = asBool(row.JurisdictionUS);
    const uk = asBool(row.JurisdictionUK);
    const variantsFor = variantBy.get(id) ?? {};
    const term: Term = {
      ...emptyTerm(),
      id,
      term: text(row.Term),
      definition: text(row.Definition),
      spanishEquivalent: text(row.SpanishEquivalent),
      civilLawEquivalent: text(row.CivilLawEquivalent),
      spanishSpeakerAlert: text(row.SpanishSpeakerAlert),
      category: isCanonicalCategory(categoryName) ? categoryName : text(row.Topic),
      topic: text(row.Topic),
      displayOrder: Number(item.Position || 0),
      jurisdictionUS: us,
      jurisdictionUK: uk,
      jurisdiction: us && uk ? "US/UK" : uk ? "UK" : "US",
      audioUsPath: text(row.AudioUS),
      audioUkPath: text(row.AudioUK),
      usVariant: variantsFor.US ?? null,
      ukVariant: variantsFor.UK ?? null,
      useItWith: use,
      inContext: context,
      quiz,
      mcdStatus: text(row.Status) || "Approved",
      published: false,
      archived: false,
      sourceEditorialVersion: text(row.EditorialVersion),
      sourceLastReviewedAt: text(row.LastReviewedAt),
      sourceWorkbookVersion: control.version || "v1.3.81",
      sourceContentHash: "",
      partOfSpeech: text(row.PartOfSpeech),
      comparativeLawNote: text(row.ComparativeLawNote),
      pronunciation: "",
    };
    term.sourceContentHash = hashTerm(term);

    const previous = existing.get(id);
    // Recompute the stored Term's hash with this same function instead of
    // trusting the persisted value, so a seed produced by another tool
    // (scripts/generate-mcd-seed.py) still reads as "no change" when the
    // editorial content is identical.
    if (!previous) creates.push(id);
    else if (previous.sourceContentHash === term.sourceContentHash || hashTerm(previous) === term.sourceContentHash) unchanged.push(id);
    else updates.push(id);
    terms.push(term);
  });

  if (categoryCounts["Corporate Law"] !== 10 || categoryCounts.Contracts !== 10 || categoryCounts["Employment Law"] !== 10) {
    warn({
      sheet: "Terms",
      row: 0,
      field: "category",
      value: JSON.stringify(categoryCounts),
      message: "LC-001 must resolve to 10 Corporate Law, 10 Contracts and 10 Employment Law.",
    });
  }

  const missing = current.filter((term) => !uniqueSelected.has(term.id)).map((term) => term.id);
  if (missing.length) {
    issues.push({
      sheet: "CollectionItems",
      row: 0,
      message: `${missing.length} existing TermID(s) are absent from this file and will be kept, not deleted: ${missing.slice(0, 8).join(", ")}${missing.length > 8 ? "…" : ""}`,
      severity: "warning",
    });
  }

  const blocking = issues.filter((issue) => issue.severity === "blocking");
  return {
    issues,
    creates,
    updates,
    unchanged,
    missing,
    terms,
    workbookVersion: control.version,
    workbookStatus: control.status,
    categoryCounts,
    counts: {
      terms: terms.length,
      useItWith: terms.reduce((sum, term) => sum + term.useItWith.length, 0),
      inContext: terms.filter((term) => term.inContext).length,
      quizzes: terms.filter((term) => term.quiz).length,
      quizzesThreeOptions: terms.filter((term) => term.quiz && term.quiz.options.length === 3).length,
      quizzesFourOptions: terms.filter((term) => term.quiz && term.quiz.options.length === 4).length,
      variants: terms.filter((term) => term.usVariant).length + terms.filter((term) => term.ukVariant).length,
      published: 0,
    },
    canCommit: blocking.length === 0,
  };
}

export function optionLabel(index: number) {
  return optionLetter(index);
}
