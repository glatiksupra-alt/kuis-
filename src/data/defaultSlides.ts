import { CarouselSlide, BannerSettings } from '../types';

export const DEFAULT_CAROUSEL_SLIDES: CarouselSlide[] = [
  {
    id: 'slide-1',
    title: 'Standar Planogram & Facing Out KAO',
    tag: 'SOP Gondola Utama',
    subtitle: 'Label produk (Attack, Biore, Laurier) wajib menghadap lurus ke depan di eye-level pelanggan tanpa celah kosong.',
    imageUrl: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?q=80&w=1000&auto=format&fit=crop',
    isActive: true,
  },
  {
    id: 'slide-2',
    title: 'Disiplin Rotasi Produk FIFO',
    tag: 'First In First Out',
    subtitle: 'Produk stok lama dengan expired date lebih dekat diletakkan di baris depan; stok baru mengisi baris belakang.',
    imageUrl: 'https://images.unsplash.com/photo-1583258292688-d0213dc5a3a8?q=80&w=1000&auto=format&fit=crop',
    isActive: true,
  },
  {
    id: 'slide-3',
    title: 'Pemasangan POSM, Wobbler & Price Tag',
    tag: 'Promosi Modern Market',
    subtitle: 'Wobbler, shelf talker, dan label harga promosi harus terpasang rapi, bersih, dan sesuai periode promo toko.',
    imageUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1000&auto=format&fit=crop',
    isActive: true,
  },
  {
    id: 'slide-4',
    title: 'End Cap Gondola & Floor Display',
    tag: 'Secondary Placement',
    subtitle: 'Penataan blok warna Men\'s Biore & Attack Sensor Matic di posisi strategis untuk memaksimalkan daya tarik pembeli.',
    imageUrl: 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?q=80&w=1000&auto=format&fit=crop',
    isActive: true,
  },
];

export const DEFAULT_BANNER_SETTINGS: BannerSettings = {
  autoSlideIntervalSeconds: 4,
  isAutoSlideEnabled: true,
  slides: DEFAULT_CAROUSEL_SLIDES,
};
