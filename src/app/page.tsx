import fs from "fs";
import Link from "next/link";
import path from "path";

export default function Home() {
  // subdirectories (non-nested)
  const rootDir = path.join(process.cwd(), "src/app");
  const dirs = fs
    .readdirSync(rootDir, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory() && dirent.name !== "api")
    .map((dirent) => dirent.name);

  return (
    <div className="min-h-screen bg-white dark:bg-[#171717]">
      <main className="flex flex-col p-6 md:p-8 w-full max-w-3xl mx-auto">
        <h1 className="mt-16 mb-0 text-4xl font-bold font-serif">
          Simulations
        </h1>

        <nav className="">
          <ul className="pl-8 md:pl-12 py-2">
            {dirs.map((dir) => (
              <li key={dir} className="py-2 list-disc">
                <Link
                  href={`/${dir}`}
                  className="capitalize text-lg hover:border hover:border-lime-300 dark:hover:border-lime-700"
                >
                  {dir.replace(/[_-]/g, " ")}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </main>
    </div>
  );
}
