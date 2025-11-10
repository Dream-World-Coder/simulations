import fs from "fs";
import path from "path";
import Simulation from ".";
import { Metadata } from "next";

const filePath = path.join(process.cwd(), "src/app/lover-hater/desc.md");
const markdown = fs.readFileSync(filePath, "utf-8");
const match1 = markdown.match(/```txt\s*([\s\S]*?)```/);
const question = match1 ? match1[1].trim() : "// No C code found";

const match2 = markdown.match(/```c\s*([\s\S]*?)```/);
const code = match2 ? match2[1].trim() : "// No C code found";

export const metadata: Metadata = {
  title: "Lover Hater Problem Simulation",
  description: question,
};

export default async function Home() {
  return <Simulation question={question} code={code} />;
}
