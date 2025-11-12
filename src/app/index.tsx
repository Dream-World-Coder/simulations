"use client";

import Link from "next/link";
import { useTheme } from "@/contexts/theme-context";
import { Moon, Sun } from "lucide-react";

export default function HomeLayout({ dirs }: { dirs: string[] }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-white dark:bg-[#171717]">
      <header className="fixed top-0 right-0 px-6 sm:px-8 py-2 flex items-center border-b border-neutral-300 dark:border-neutral-700 h-fit w-full">
        <div className="logo flex-1 uppercase text-sm">
          <span className="serif text-lg font-bold">S</span>
          imulations
        </div>

        {/* nav */}
        {/*<nav>
          <ul>
            <li></li>
          </ul>
        </nav>*/}

        {/* btns */}
        <ul>
          <li>
            <button
              aria-label="dark mode button"
              onClick={toggleTheme}
              className="cursor-pointer"
            >
              {theme == "light" ? <Moon size={20} /> : <Sun size={20} />}
            </button>
          </li>
        </ul>
      </header>

      <main className="flex flex-col p-6 md:p-8 w-full max-w-3xl mx-auto min-h-[95vh]">
        <h1 className="mt-16 mb-0 text-4xl font-bold font-serif">
          Simulations
        </h1>

        <nav className="">
          <ul className="pl-8 md:pl-12 py-2">
            {dirs.map((dir) => (
              <li key={dir} className="py-2 list-disc">
                <Link
                  href={`/${dir}`}
                  className="capitalize text-lg hover:border hover:border-lime-400 dark:hover:border-lime-700"
                >
                  {dir.replace(/[_-]/g, " ")}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </main>

      <footer className="text-center text-sm border-t border-neutral-100 dark:border-neutral-800 py-2 px-6 sm:px-8">
        Repository:{" "}
        <a
          className="underline"
          href="https://github.com/Dream-World-Coder/simulations"
        >
          https://github.com/Dream-World-Coder/simulations
        </a>
      </footer>
    </div>
  );
}
