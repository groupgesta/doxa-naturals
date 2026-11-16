export type Product = {
  id: string;
  name: string;
  size: string;
  price: number;
  description: string;
  image: string;
};

export const WHATSAPP_NUMBER = "23054766618";

export const products: Product[] = [
  {
    id: "butter",
    name: "Rosemary Sealing Butter",
    size: "7 oz",
    price: 700,
    description:
      "Rich butter to help seal in moisture and keep hair feeling soft.",
    image: "/images/butter.png",
  },
  {
    id: "gel",
    name: "Flaxseed Defining Curl Gel",
    size: "300 ml",
    price: 400,
    description: "For curl definition, slip and gentle detangling.",
    image: "/images/gel.png",
  },
  {
    id: "oil",
    name: "Rosemary & Peppermint Scalp Oil",
    size: "100 ml",
    price: 600,
    description: "An oil for scalp care and sealing in moisture.",
    image: "/images/oil.png",
  },
  {
    id: "spray",
    name: "Rosemary Scalp Spray",
    size: "100 ml",
    price: 400,
    description: "A refreshing addition to your scalp-care routine.",
    image: "/images/spray.png",
  },
  {
    id: "shea",
    name: "Unrefined Shea Butter",
    size: "250 ml",
    price: 1600,
    description:
      "250 ml · 100% unrefined shea butter to help soften dry skin and seal moisture into hair.",
    image: "/images/shea.png",
  },
];

export const money = (n: number) => "Rs " + n.toLocaleString("en-MU");
