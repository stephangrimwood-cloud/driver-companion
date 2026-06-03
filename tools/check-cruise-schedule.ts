import fs from "fs";
import { PDFParse } from "pdf-parse";

async function main() {
  const pdfBuffer = fs.readFileSync("./tools/pdfs/CruiseSchedule.pdf");

  const parser = new PDFParse({ data: pdfBuffer });
  const data = await parser.getText();

  const match = data.text.match(/Last updated:\s*(.+)/);

  if (!match) {
    console.log("Could not find Last updated text.");
    return;
  }

  console.log("Ports North schedule last updated:");
  console.log(match[1]);
}

main().catch(console.error);