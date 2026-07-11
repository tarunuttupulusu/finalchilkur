import { PrismaClient } from '@prisma/client';
import { SIGNATURE_DISHES, GALLERY_PHOTOS, TESTIMONIALS } from '../src/utils/menuData';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting CMS database seeding...');

  // 1. Seed Branches if not exist
  console.log('Seeding branches...');
  const moinabadBranch = await prisma.branch.upsert({
    where: { id: '52ae6a0f-daee-40f5-aa0e-ac44e17d325e' },
    update: {
      name: 'Moinabad Branch',
      address: '4-15/2part, Aziz Nagar, Himayat Sagar Rd, Moinabad, Telangana 500075',
      phone: '098494 98681',
      totalTables: 25,
      openingTime: '11:00',
      closingTime: '23:00'
    },
    create: {
      id: '52ae6a0f-daee-40f5-aa0e-ac44e17d325e',
      name: 'Moinabad Branch',
      address: '4-15/2part, Aziz Nagar, Himayat Sagar Rd, Moinabad, Telangana 500075',
      phone: '098494 98681',
      totalTables: 25,
      openingTime: '11:00',
      closingTime: '23:00'
    }
  });

  const chinthalBranch = await prisma.branch.upsert({
    where: { id: 'a2ae6a0f-daee-40f5-aa0e-ac44e17d325f' },
    update: {
      name: 'Chinthal Branch',
      address: '1 2nd floor, HMT Rd, above The Kakatiya Co-operative Bank, Chinthal, Quthbullapur, Hyderabad, Telangana 500037',
      phone: '098494 98681',
      totalTables: 15,
      openingTime: '11:00',
      closingTime: '23:00'
    },
    create: {
      id: 'a2ae6a0f-daee-40f5-aa0e-ac44e17d325f',
      name: 'Chinthal Branch',
      address: '1 2nd floor, HMT Rd, above The Kakatiya Co-operative Bank, Chinthal, Quthbullapur, Hyderabad, Telangana 500037',
      phone: '098494 98681',
      totalTables: 15,
      openingTime: '11:00',
      closingTime: '23:00'
    }
  });

  console.log(`✅ Branches seeded: ${moinabadBranch.name}, ${chinthalBranch.name}`);

  // 2. Seed Categories & Dishes
  console.log('Seeding categories and dishes...');
  const uniqueCategories = Array.from(new Set(SIGNATURE_DISHES.map(d => d.category)));
  
  const categoryMap = new Map<string, string>();

  for (let i = 0; i < uniqueCategories.length; i++) {
    const catName = uniqueCategories[i];
    const category = await prisma.category.upsert({
      where: { name: catName },
      update: { order: i },
      create: {
        name: catName,
        description: `Delicious ${catName} items freshly prepared.`,
        order: i
      }
    });
    categoryMap.set(catName, category.id);
  }
  console.log(`✅ Seeded ${categoryMap.size} categories.`);

  let dishCount = 0;
  for (let i = 0; i < SIGNATURE_DISHES.length; i++) {
    const d = SIGNATURE_DISHES[i];
    const categoryId = categoryMap.get(d.category);
    if (!categoryId) continue;

    await prisma.dish.upsert({
      where: { name: d.name },
      update: {
        teluguName: d.teluguName || null,
        description: d.description || null,
        price: String(d.price),
        image: d.image,
        categoryId: categoryId,
        isVegetarian: d.isVegetarian ?? true,
        rating: d.rating ?? 4.5,
        order: i
      },
      create: {
        name: d.name,
        teluguName: d.teluguName || null,
        description: d.description || null,
        price: String(d.price),
        image: d.image,
        categoryId: categoryId,
        isVegetarian: d.isVegetarian ?? true,
        rating: d.rating ?? 4.5,
        order: i,
        isBestseller: d.category === 'Combo Family Pack',
        isChefSpecial: i % 15 === 0,
        isSeasonal: false,
        isOutOfStock: false,
        isHidden: false
      }
    });
    dishCount++;
  }
  console.log(`✅ Seeded ${dishCount} dishes.`);

  // 3. Seed Gallery Photos
  console.log('Seeding gallery photos...');
  let galleryCount = 0;
  for (let i = 0; i < GALLERY_PHOTOS.length; i++) {
    const photo = GALLERY_PHOTOS[i];
    await prisma.galleryPhoto.create({
      data: {
        src: photo.src,
        title: photo.title,
        menuCategory: photo.menuCategory || null,
        menuDishName: photo.menuDishName || null,
        order: i,
        altText: photo.title,
        isFeatured: i < 6,
        albumName: 'General'
      }
    });
    galleryCount++;
  }
  console.log(`✅ Seeded ${galleryCount} gallery photos.`);

  // 4. Seed Testimonials
  console.log('Seeding testimonials...');
  let testimonialCount = 0;
  for (let i = 0; i < TESTIMONIALS.length; i++) {
    const t = TESTIMONIALS[i];
    await prisma.testimonial.create({
      data: {
        name: t.name,
        role: t.role,
        content: t.content,
        rating: t.rating,
        source: t.source,
        avatar: t.avatar || null,
        date: t.date,
        isApproved: true,
        order: i
      }
    });
    testimonialCount++;
  }
  console.log(`✅ Seeded ${testimonialCount} testimonials.`);

  // 5. Seed Site Settings (Homepage sections & default configurations)
  console.log('Seeding site settings...');
  const defaultSettings = [
    {
      key: 'homepage_hero',
      value: JSON.stringify({
        title: 'Authentic Indian Cuisine',
        subtitle: 'Experience the rich flavors of traditional pure vegetarian recipes cooked with love and passion.',
        videoUrl: 'https://www.youtube-nocookie.com/embed/VRKIM1pytu8?autoplay=1&mute=1&loop=1&playlist=VRKIM1pytu8&playsinline=1&controls=0&showinfo=0&rel=0&modestbranding=1&iv_load_policy=3&disablekb=1&fs=0&vq=hd1080',
        ctaText: 'Reserve A Table',
        ctaLink: '/reserve',
        secondaryCtaText: 'Order Online',
        secondaryCtaLink: '/menu',
        draftTitle: 'Authentic Indian Cuisine',
        draftSubtitle: 'Experience the rich flavors of traditional pure vegetarian recipes cooked with love and passion.',
        isPublished: true
      })
    },
    {
      key: 'announcement_bar',
      value: JSON.stringify({
        text: '🎉 Special Offer: Flat 10% Off on Table Bookings Online! Show your QR code at the counter.',
        isActive: true,
        startDate: null,
        endDate: null
      })
    },
    {
      key: 'homepage_about',
      value: JSON.stringify({
        heading: 'Our Culinary Journey',
        subheading: 'A Legacy of Pure Vegetarian Excellence Since 1999',
        content: 'At Balaji Chilkur Family Dhaba, we bring you the finest flavors of North & South Indian cuisine. Our dishes are prepared by expert chefs using the freshest local produce and pure spices. Perfect for family dining, farm events, and travelers looking for a premium dining stop.',
        image: '/bsd-about.jpg',
        isActive: true
      })
    },
    {
      key: 'homepage_sections',
      value: JSON.stringify({
        hero: true,
        announcement: true,
        featuredDishes: true,
        offers: true,
        about: true,
        gallery: true,
        testimonials: true,
        contact: true
      })
    },
    {
      key: 'seo_settings',
      value: JSON.stringify({
        title: 'Balaji Chilkur Family Dhaba | Pure Vegetarian Indian Restaurant',
        description: 'Enjoy authentic pure vegetarian Indian food at Balaji Chilkur Family Dhaba near Moinabad & Chinthal. Serving delicious biryani, paneer, starters, and family combos.',
        keywords: 'vegetarian restaurant, pure veg dhaba, Moinabad veg food, Hyderabad dhaba, Paneer Butter Masala, Veg Biryani near me, Chilkur family restaurant'
      })
    },
    {
      key: 'admin_roles',
      value: JSON.stringify({
        'admin@restaurant.com': 'admin',
        'staff@restaurant.com': 'staff'
      })
    }
  ];

  for (const setting of defaultSettings) {
    await prisma.siteSettings.upsert({
      where: { key: setting.key },
      update: { value: setting.value },
      create: { key: setting.key, value: setting.value }
    });
  }
  console.log('✅ Site settings seeded successfully.');

  console.log('🎉 Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
