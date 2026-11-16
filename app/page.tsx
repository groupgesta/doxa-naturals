import Image from "next/image";
import CartProvider from "./components/CartProvider";
import Header from "./components/Header";
import OrderCart from "./components/OrderCart";
import RevealObserver from "./components/RevealObserver";
import ProductGrid from "./components/ProductGrid";
import Year from "./components/Year";

export default function Home() {
  return (
    <CartProvider>
      <div className="top">Made in Mauritius · Collection by arrangement</div>
      <Header />
      <RevealObserver />

      <main>
        <section id="home" className="hero">
          <div className="hero-text">
            <div className="kicker">Natural-based textured haircare</div>
            <h1>
              Your hair was <em>never</em> the problem.
            </h1>
            <p>
              The products were. Thoughtful haircare for real curls, coils and
              textured hair, created in Mauritius with softness, definition and
              scalp comfort in mind.
            </p>
            <div className="actions">
              <a className="btn" href="#collection">
                Shop the collection ↗
              </a>
              <a className="btn secondary" href="#story">
                The story
              </a>
            </div>
          </div>
          <div className="visual" data-reveal="zoom" style={{ "--d": "100ms" } as React.CSSProperties}>
            <Image
              src="/images/butter.png"
              alt="Doxa Naturals Rosemary Sealing Butter jar"
              fill
              sizes="(max-width: 700px) 100vw, 50vw"
              preload
            />
          </div>
        </section>

        <div className="stripe" data-reveal>
          Softness <span>✦</span> Definition <span>✦</span> Scalp comfort{" "}
          <span>✦</span> Less breakage
        </div>

        <section id="collection" className="section wrap">
          <div className="heading" data-reveal>
            <div>
              <div className="kicker">The essentials</div>
              <h2>Meet the collection</h2>
            </div>
            <p>
              Simple, considered products to support your textured-hair routine,
              from wash day to everyday care.
            </p>
          </div>
          <ProductGrid />
          <p className="note" data-reveal>
            Photographs from the Doxa Naturals collection. All prices are in
            Mauritian rupees.
          </p>
        </section>

        <section className="story" id="story">
          <div className="story-visual" data-reveal="zoom">
            <Image
              src="/images/story.png"
              alt="Doxa Naturals products"
              fill
              sizes="(max-width: 700px) 100vw, 50vw"
            />
          </div>
          <div className="story-copy" data-reveal="right">
            <div className="kicker">The beginning</div>
            <h2>It started with my daughter.</h2>
            <p>
              I wanted a gentler way to care for her hair and make detangling
              easier. I began creating a rosemary-infused butter using shea,
              mango, olive and jojoba oils.
            </p>
            <p>
              Seeing how soft and manageable her hair felt inspired me to create
              Doxa Naturals. I want women and families to enjoy caring for their
              natural curls and coils with products that work with their hair.
            </p>
            <p>
              <em>
                Healthy haircare is a routine, not a promise of overnight
                growth.
              </em>
            </p>
          </div>
        </section>

        <section className="section ritual" id="ritual">
          <div className="wrap">
            <div className="kicker" data-reveal>A little care goes a long way</div>
            <h2 className="large" data-reveal style={{ "--d": "80ms" } as React.CSSProperties}>
              Make room for
              <br />
              your natural texture.
            </h2>
            <div className="steps">
              <div className="step" data-reveal style={{ "--d": "0ms" } as React.CSSProperties}>
                <div className="number">01</div>
                <h3>Detangle gently</h3>
                <p>
                  Work in sections. Use the flaxseed defining gel for slip and
                  curl definition, and detangle from the ends upwards.
                </p>
              </div>
              <div className="step" data-reveal style={{ "--d": "120ms" } as React.CSSProperties}>
                <div className="number">02</div>
                <h3>Care for your scalp</h3>
                <p>
                  Bring the rosemary scalp spray and scalp oil into a simple,
                  consistent scalp-care routine.
                </p>
              </div>
              <div className="step" data-reveal style={{ "--d": "240ms" } as React.CSSProperties}>
                <div className="number">03</div>
                <h3>Seal in moisture</h3>
                <p>
                  Apply the rosemary sealing butter after moisturising to help
                  soften the hair and reduce dryness and breakage.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="section wrap ordering" id="order">
          <div data-reveal>
            <div className="kicker">How to order</div>
            <h2>Your next haircare favourite is a message away.</h2>
            <p>
              Add products to your bag and send your order to me on WhatsApp.
              I&apos;ll confirm availability, payment and collection with you
              personally.
            </p>
            <div className="order-step" data-reveal>
              <b>01</b>
              <span>
                Choose your products or message me with a question.
              </span>
            </div>
            <div className="order-step" data-reveal>
              <b>02</b>
              <span>
                Once confirmed, pay in advance by MCB Juice or bank transfer.
              </span>
            </div>
            <div className="order-step" data-reveal>
              <b>03</b>
              <span>
                Collection by arrangement in Curepipe, Quatre Bornes or Port
                Louis. No delivery at present.
              </span>
            </div>
          </div>
          <OrderCart />
        </section>
      </main>

      <footer>
        <div className="wrap">
          <div className="foot">
            <div>
              <a className="brand" href="#home">
                <b>DOXA</b>
                <small>NATURALS</small>
              </a>
              <p>
                Haircare for real curls, coils and textured hair. Made with care
                in Mauritius.
              </p>
            </div>
            <div>
              <a href="#collection">Collection</a>
              <a href="#story">Our story</a>
              <a href="#order">Order / Contact</a>
              <a href="/admin/login">Admin</a>
            </div>
          </div>
          <div className="copy">
            © <Year /> Doxa Naturals. All rights reserved.
          </div>
        </div>
      </footer>
    </CartProvider>
  );
}
