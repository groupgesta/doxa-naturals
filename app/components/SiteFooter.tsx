import Link from "next/link";
import Year from "./Year";

export default function SiteFooter() {
  return (
    <footer>
      <div className="wrap">
        <div className="foot">
          <div>
            <Link className="brand" href="/">
              <b>DOXA</b>
              <small>NATURALS</small>
            </Link>
            <p>
              Haircare for real curls, coils and textured hair. Made with care
              in Mauritius.
            </p>
          </div>
          <nav className="foot-cols" aria-label="Footer">
            <div>
              <h4>Shop</h4>
              <Link href="/#collection">Collection</Link>
              <Link href="/#story">Our story</Link>
              <Link href="/#order">How to order</Link>
            </div>
            <div>
              <h4>Help</h4>
              <Link href="/faq">FAQ</Link>
              <Link href="/collection-and-payment">Collection and payment</Link>
              <Link href="/contact">Contact</Link>
            </div>
            <div>
              <h4>Legal</h4>
              <Link href="/privacy">Privacy policy</Link>
              <Link href="/terms">Terms of sale</Link>
            </div>
          </nav>
        </div>
        <div className="copy">
          © <Year /> Doxa Naturals. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
