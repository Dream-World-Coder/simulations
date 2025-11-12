import fs from "fs";
import path from "path";

import HomeLayout from ".";

export default function Home() {
  // subdirectories (non-nested)
  const rootDir = path.join(process.cwd(), "src/app");
  const dirs = fs
    .readdirSync(rootDir, { withFileTypes: true })
    .filter(
      (dirent) =>
        dirent.isDirectory() && dirent.name !== "api" && dirent.name[0] !== "_",
    )
    .map((dirent) => dirent.name);

  return <HomeLayout dirs={dirs} />;
}
