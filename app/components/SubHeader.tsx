import Image from "next/image";
import Link from "next/link";

export default function SubHeader() {
  return (
    <>
      <div className="top">Made in Mauritius · Collection by arrangement</div>
      <header className="nav">
        <Link className="brand" href="/" aria-label="Doxa Naturals, home">
          <Image
            src="/images/logo.png"
            alt="Doxa Naturals logo"
            width={1208}
            height={587}
            sizes="222px"
            loading="eager"
          />
        </Link>
        <nav className="links open-static" aria-label="Main">
          <Link href="/faq">FAQ</Link>
          <Link href="/contact">Contact</Link>
          <Link className="btn" href="/#collection">
            Shop the collection
          </Link>
        </nav>
      </header>
    </>
  );
}
