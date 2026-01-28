import PageContainer from "@/components/PageContainer";

export default function AboutPage() {
  return (
    <PageContainer>
      <div className="pb-5">
        <h1 className="mt-6 font-bold text-pova-heading">About Us</h1>
        <h2 className="text-xl font-bold mt-5" id="who-is-pova">
          Who is Pova?
        </h2>
        <p className="mt-4 text-sm font-light">
          Welcome to <span className="font-medium">Pova</span> where the world
          of metal supply meets digital precision. We&apos;ve transformed the
          way you access metals for your projects, offering a seamless online
          experience tailored to your needs. Our platform redefines convenience,
          providing a comprehensive range of high-quality metals at your
          fingertips.
        </p>
        <h2 className="text-xl font-bold mt-5" id="products-and-services">
          Products & Services
        </h2>
        <p className="mt-4 text-sm font-light">
          From <span className="font-medium">Roofing</span> to{" "}
          <span className="font-medium">
            Fencing & Screening, Skylights, Insulation
          </span>{" "}
          and <span className="font-medium">Metal Accessories</span> explore our
          virtual warehouse stocked with over 10,000+ vast array of materials to
          fuel your creativity. With user-friendly navigation, real-time
          inventory updates, and a secure checkout process,{" "}
          <span className="font-medium">Pova</span> is designed to make your
          metal sourcing journey effortless. <br />
          <br />
          Whether you prefer the ease of doorstep delivery or the flexibility of
          picking up your order, we&apos;ve got you covered. Say goodbye to
          traditional hassles and embrace a new era of metal procurement.
        </p>
        <h2 className="text-xl font-bold mt-5" id="ordering-process">
          Ordering Process
        </h2>
        <p className="mt-4 text-sm font-light">
          The process is designed to be uers friendly and straightforward.
          Customers are guided through a step-by-step ordering system, where
          they can easily browse our vast inventory, select the materials they
          need, and specify quantities.{" "}
          <span className="font-medium">Pova</span> has fully customizable
          features, allowing customers to tailor their orders to their exact
          specifications. Our intuitive interface ensures that even those new to
          online ordering can navigate with ease. Once the order is placed,
          customers receive real-time updates on the status of their order,
          including tracking information for delivery or pick-up.
        </p>
        <h2 className="text-xl font-bold mt-5" id="why-pova">
          Why Pova?
        </h2>
        <p className="mt-4 text-sm font-light">
          Pova operates seamlessly to provide customers with the best metal
          supply experience. Partnering with the best manufacturers in the
          industry ensures that we offer the highest quality materials at the
          best prices in the industry. Ordering is made incredibly convenient,
          as customers can access our platform anytime, anywhere, using their
          smartphone or laptop. Pova streamlines metal procurement, freeing
          customers to focus solely on their projects. Your projects deserve the
          best, and we&apos;re here to deliver it digitally. Welcome to the
          future of metal supply.{" "}
          <span className="font-normal"> Welcome to Pova</span>.
        </p>
      </div>
    </PageContainer>
  );
}
