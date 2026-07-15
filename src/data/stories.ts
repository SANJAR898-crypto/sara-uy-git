export interface StorySlide {
  id: string;
  title: string;
  price?: string;
  imageUrl: string;
  desc?: string;
  listingId?: string;
  ownerPhone?: string;
}

export const DEFAULT_STORIES: Record<string, StorySlide[]> = {
  villas: [
    {
      id: 'sv-1',
      title: "Ko'kaldosh sohilidagi dabdabali shinam villa",
      price: "$450,000",
      imageUrl: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80",
      desc: "8 xona, 12 sotix, qishki va yozgi basseyn, sauna, lof uslubidagi ta'mir. Juda nufuzli hududda joyhazlangan.",
      ownerPhone: "+998 90 999 11 22"
    },
    {
      id: 'sv-2',
      title: "Qibrayda 8 sotixli yevro-villa yangi uy",
      price: "$280,000",
      imageUrl: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
      desc: "Yevropacha dizayn, eng sifatli qurilish materiallari, mebellar va texnikalar to'liq jihozlangan.",
      ownerPhone: "+998 91 777 88 99"
    },
    {
      id: 'sv-3',
      title: "Toshkent dengizi bo'yidagi premium dacha",
      price: "$190,000",
      imageUrl: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80",
      desc: "Tog' va suv manzarasi ostida dam olish uchun ideal joy. Yozgi ayvon, barbekyu hududi, landshaft dizayn.",
      ownerPhone: "+998 94 333 44 55"
    },
    {
      id: 'sv-4',
      title: "Chimyon tog' bag'ridagi luxury chalet dacha",
      price: "$350,000",
      imageUrl: "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
      desc: "Qishki va yozgi mavsum uchun mo'ljallangan dabdabali tog' uyi. Shaxsiy qor chang'i yo'lakchasi yonida.",
      ownerPhone: "+998 93 111 22 33"
    }
  ],
  apartments: [
    {
      id: 'sa-1',
      title: "Tashkent City - Gardens Residence penthouse",
      price: "$185,000",
      imageUrl: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80",
      desc: "Tashkent City qoq markazida, 4 xonali premium xonadon. Panoramic manzara, shaxsiy terassa, yuqori xavfsizlik.",
      ownerPhone: "+998 90 321 00 99"
    },
    {
      id: 'sa-2',
      title: "Mirobod tumani premium 3-xonali shinam xonadon",
      price: "$125,000",
      imageUrl: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80",
      desc: "Oybek metro yaqinida joylashgan. Butunlay yevro-remont qilingan, italyan mebellari o'rnatilgan.",
      ownerPhone: "+998 95 444 55 66"
    },
    {
      id: 'sa-3',
      title: "Novostroyka - Chilonzor metrosi yonida",
      price: "$75,000",
      imageUrl: "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=800&q=80",
      desc: "9-qavat, 2 xona, 65 m². Yangi g'ishtli uyda shinam uy. Hamma texnikalar qoladi.",
      ownerPhone: "+998 97 555 66 77"
    },
    {
      id: 'sa-4',
      title: "Yunusobod tumanida 2 xonali arzon kvartira",
      price: "$55,000",
      imageUrl: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80",
      desc: "Yunusobod 4-kvartal, 2 xonali o'rta ta'mirdagi xonadon. Bozorgacha 5 minutlik yo'l.",
      ownerPhone: "+998 99 888 77 66"
    }
  ],
  cheap: [],
  tips: [
    {
      id: 'st-1',
      title: "Ko'chmas mulk sotib olishda 5 ta oltin qoida",
      imageUrl: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80",
      desc: "1. Hujjatlarni yurist orqali tekshiring. 2. Hududni yaxshilab o'rganing. 3. Qo'shnilardan so'rang. 4. Kommunikatsiyalarni tekshiring. 5. Bozordagi o'rtacha narxni solishtiring."
    },
    {
      id: 'st-2',
      title: "Qanday qilib uy narxini to'g'ri baholash lozim?",
      imageUrl: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=80",
      desc: "Uyingiz narxini qo'shni uylar narxlari, bino holati, qavatlilik va remont darajasiga qarab belgilang. SARA AI sizga narxni baholashda bepul yordam beradi."
    },
    {
      id: 'st-3',
      title: "Toshkentda 2026-yilda uy narxlari qanday bo'ladi?",
      imageUrl: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=800&q=80",
      desc: "Ekspertlar tahliliga ko'ra, metro yaqinidagi va Tashkent City kabi markazlardagi premium uylar narxi yana 8-12% gacha ko'tarilishi prognoz qilinmoqda."
    },
    {
      id: 'st-4',
      title: "Kredit va Ipoteka olish sirlari va qonun-qoidalari",
      imageUrl: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80",
      desc: "Banklar ipoteka berishdan oldin rasmiy ish haqi va kredit tarixini qat'iy tekshiradi. Birinchi to'lov kamida 15-25% bo'lishi lozim."
    },
    {
      id: 'st-5',
      title: "Ijara shartnomasi tuzganda nimalarga qarash kerak?",
      imageUrl: "https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=800&q=80",
      desc: "Ijara shartnomasini albatta davlat soliq idorasida ro'yxatdan o'tkazing. Bu har ikki tomonning qonuniy huquqlarini to'liq himoya qiladi."
    }
  ]
};
