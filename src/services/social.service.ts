import { listings, sellers } from '@/mocks/data';
import type { MarketplaceReport, NotificationItem, Review } from '@/types';

const delay = (ms = 150) => new Promise((resolve) => setTimeout(resolve, ms));
const saved = new Set<string>();
const followed = new Set<string>();
let reviews: Review[] = [
  {
    id: 'rv1',
    sellerId: 'seller-1',
    reviewerName: 'Lucas Almeida',
    rating: 5,
    comment: 'Great communication and the car matched the listing.',
    date: '2026-08-10',
    sellerReply: 'Thanks, Lucas. Enjoy the car!',
  },
  {
    id: 'rv2',
    sellerId: 'seller-1',
    reviewerName: 'Camila Rocha',
    rating: 4,
    comment: 'Professional seller and quick responses.',
    date: '2026-07-29',
  },
  {
    id: 'rv3',
    sellerId: 'seller-2',
    reviewerName: 'Rafael Lima',
    rating: 5,
    comment: 'Very helpful and easy to deal with.',
    date: '2026-08-05',
  },
];
let notifications: NotificationItem[] = [
  {
    id: 'n1',
    type: 'message',
    title: 'New message from AutoPrime SP',
    body: 'Is 3pm good for you?',
    createdAt: '10 min ago',
    read: false,
    href: '/messages',
  },
  {
    id: 'n2',
    type: 'listing',
    title: 'Listing published',
    body: 'Your iPhone 15 Pro listing passed automated validation and is now live.',
    createdAt: '2 hours ago',
    read: false,
    href: '/selling/listings',
  },
  {
    id: 'n3',
    type: 'payment',
    title: 'Payment confirmed',
    body: 'Your Pro subscription payment was confirmed.',
    createdAt: 'Yesterday',
    read: true,
    href: '/selling/payments',
  },
  {
    id: 'n4',
    type: 'verification',
    title: 'Verification approved',
    body: 'Your seller profile is now verified.',
    createdAt: '2 days ago',
    read: true,
    href: '/selling/verification',
  },
];
const reports: MarketplaceReport[] = [];

export const socialService = {
  async getSaved() {
    await delay();
    return listings.filter((listing) => saved.has(listing.id));
  },

  async getSavedIds() {
    await delay(60);
    return Array.from(saved);
  },

  async toggleSaved(id: string) {
    await delay(80);
    if (saved.has(id)) saved.delete(id);
    else saved.add(id);
    return saved.has(id);
  },

  async toggleFollowSeller(id: string) {
    await delay(80);
    if (followed.has(id)) followed.delete(id);
    else followed.add(id);
    return followed.has(id);
  },

  async getSellerProfile(id: string) {
    await delay();
    const seller = sellers.find((item) => item.id === id);
    if (!seller) return null;
    return {
      seller,
      listings: listings.filter((listing) => listing.sellerId === id),
      reviews: reviews.filter((review) => review.sellerId === id),
    };
  },

  async getReviews(sellerId: string) {
    await delay();
    return reviews.filter((review) => review.sellerId === sellerId);
  },

  async addReview(input: Omit<Review, 'id' | 'date'>) {
    await delay();
    const review = {
      ...input,
      id: `rv-${Date.now()}`,
      date: new Date().toISOString().slice(0, 10),
    };
    reviews.unshift(review);
    return review;
  },

  async replyReview(id: string, reply: string) {
    await delay();
    reviews = reviews.map((review) =>
      review.id === id ? { ...review, sellerReply: reply } : review,
    );
    return reviews.find((review) => review.id === id)!;
  },

  async getNotifications() {
    await delay();
    return notifications;
  },

  async markRead(id: string) {
    await delay(50);
    notifications = notifications.map((notification) =>
      notification.id === id ? { ...notification, read: true } : notification,
    );
    return true;
  },

  async markAllRead() {
    await delay(100);
    notifications = notifications.map((notification) => ({
      ...notification,
      read: true,
    }));
    return true;
  },

  async report(
    input: Omit<MarketplaceReport, 'id' | 'createdAt' | 'status'>,
  ) {
    await delay();
    const report: MarketplaceReport = {
      ...input,
      id: `rep-${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: 'open',
    };
    reports.unshift(report);
    return report;
  },

  async getReports() {
    await delay();
    return [...reports];
  },
};
