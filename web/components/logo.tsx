import Image from "next/image";
import Link from "next/link";

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-3">
      <Image src="/logo.svg" alt="AcogoFitness" width={40} height={40} priority />
      <span className="text-lg font-semibold tracking-wide text-brand-lime">
        AcogoFitness
      </span>
    </Link>
  );
}
