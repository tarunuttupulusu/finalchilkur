const fs = require('fs');

const homePath = 'src/views/Home.tsx';
let content = fs.readFileSync(homePath, 'utf8');

const targetString = `  const specialOffers = SIGNATURE_DISHES.filter(dish => dish.category === 'Combo Family Pack').slice(0, 2).map((dish, idx) => ({
    id: dish.id,
    title: dish.name,
    description: dish.description,
    price: dish.price,
    image: dish.image,
    badge: idx === 0 ? 'Best Seller' : 'Value Platter',
    cta: 'Order Combo'
  }));`;

const replacementString = `  const specialOffers = [
    {
      id: 'online-booking-offer',
      title: '10% Off Online Bookings',
      description: 'Skip the wait and get 10% off your entire bill when you reserve a table online.',
      price: '-10%',
      badge: 'Limited Time',
      cta: 'Book Now',
      image: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?q=80&w=1000&auto=format&fit=crop',
      link: '/reserve'
    },
    {
      id: 'family-combo',
      title: 'Jumbo Family Pack',
      description: 'Perfect for 4-5 people. Includes Biryani, Curries, Rotis, and Desserts.',
      price: '₹1499',
      badge: 'Best Value',
      cta: 'Order Now',
      image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?q=80&w=1000&auto=format&fit=crop',
      link: '/menu?category=Combo+Family+Pack'
    }
  ];`;

if (content.includes(targetString)) {
  content = content.replace(targetString, replacementString);
  
  // Now replace the onClick handlers to use offer.link
  const onClickTarget = `navigate.push(\`/menu?category=\${encodeURIComponent('Combo Family Pack')}&dish=\${encodeURIComponent(offer.title)}\`)`;
  content = content.replaceAll(onClickTarget, "navigate.push(offer.link)");
  
  fs.writeFileSync(homePath, content, 'utf8');
  console.log('Successfully patched Home.tsx');
} else {
  console.error('Could not find target string in Home.tsx. Check spacing/newlines.');
}
