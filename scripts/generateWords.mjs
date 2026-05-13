import XLSX from "xlsx";
import fs from "fs";
import path from "path";

// Your Excel file path
const inputPath = path.resolve("src/data/raw/word_final_ver.xlsx");

// The TypeScript file we want to generate
const outputPath = path.resolve("src/data/words.json");

// Read the Excel file
const workbook = XLSX.readFile(inputPath);

// Use the first sheet
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];

// Convert the sheet into rows.
// header: 1 means: treat each row as an array, not as an object with column names.
const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

function normalizeDifficulty(level) {
  const value = String(level || "").trim().toLowerCase();

  if (value === "lower beginner") return "lower_beginner";
  if (value === "upper beginner") return "upper_beginner";
  if (value === "intermediate") return "intermediate";

  throw new Error(`Unknown difficulty level: ${level}`);
}

function createWordId(index) {
  return `w${String(index + 1).padStart(4, "0")}`;
}

const words = rows
  .map((row, index) => {
    const korean = row[0];
    const english = row[1];
    const level = row[2];

    if (!korean || !english || !level) {
      return null;
    }

    return {
      id: createWordId(index),
      korean: String(korean).trim(),
      english: String(english).trim(),
      difficulty: normalizeDifficulty(level),
    };
  })
  .filter(Boolean);

  fs.writeFileSync(outputPath, JSON.stringify(words, null, 2), "utf8");

  console.log(`Generated ${words.length} words at ${outputPath}`);