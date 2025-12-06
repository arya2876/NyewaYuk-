import { PrismaClient } from '@prisma/client';

// Development fallback when database is not available
interface MockUser {
	id: string;
	name: string;
	email: string;
	plan: 'FREE' | 'PRO';
	image?: string;
	createdAt: string;
	updatedAt: string;
}

interface MockItem {
	id: string;
	userId: string;
	title: string;
	description: string;
	imageSrc: string;
	category: string;
	pricePerDay: number;
	createdAt: string;
	brand?: string;
	condition?: string;
	isNyewaGuardVerified: boolean;
	rating: number;
	rentCount: number;
	locationValue: string;
}

interface MockBooking {
	id: string;
	userId: string;
	itemId: string;
	startDate: string;
	endDate: string;
	totalPrice: number;
	status: string;
	createdAt: string;
}

// Mock data untuk development
const mockUsers: MockUser[] = [
	{
		id: 'user-free-1',
		name: 'Free User',
		email: 'user@free.com',
		plan: 'FREE',
		image: 'https://via.placeholder.com/40',
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
	},
	{
		id: 'user-pro-1',
		name: 'Pro User',
		email: 'user@pro.com',
		plan: 'PRO',
		image: 'https://via.placeholder.com/40',
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
	},
	{
		id: 'user-google-1',
		name: 'ARYA WINATA',
		email: 'aryawarrior98@gmail.com',
		plan: 'FREE',
		image: 'https://lh3.googleusercontent.com/a/ACg8ocK0X7gh-14gCBZyvTs8jevj6JrTFP0PoJWnabuucRxYMXeuwbE=s96-c',
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
	},
];

const mockItems: MockItem[] = [
	{
		id: 'item-1',
		userId: 'user-free-1',
		title: 'Canon EOS R5 Mirrorless Camera',
		description: 'Professional mirrorless camera dengan video 8K recording',
		imageSrc: '/images/canon-r5.jpg',
		category: 'Kamera',
		pricePerDay: 350000,
		brand: 'Canon',
		condition: 'Seperti Baru',
		isNyewaGuardVerified: true,
		rating: 4.8,
		rentCount: 25,
		locationValue: 'ID-SM',
		createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
	},
	{
		id: 'item-2',
		userId: 'user-pro-1',
		title: 'DJI Mavic Air 2 Drone',
		description: 'Drone profesional dengan kamera 4K dan stabilisasi gimbal 3-axis',
		imageSrc: '/images/dji-mavic.jpg',
		category: 'Drone',
		pricePerDay: 200000,
		brand: 'DJI',
		condition: 'Baik',
		isNyewaGuardVerified: true,
		rating: 4.9,
		rentCount: 45,
		locationValue: 'ID-JT',
		createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
	},
	{
		id: 'item-3',
		userId: 'user-google-1',
		title: 'Sony FX3 Cinema Camera',
		description: 'Kamera cinema profesional untuk produksi film dan video',
		imageSrc: '/images/sony-fx3.jpg',
		category: 'Kamera',
		pricePerDay: 450000,
		brand: 'Sony',
		condition: 'Baru',
		isNyewaGuardVerified: true,
		rating: 5.0,
		rentCount: 12,
		locationValue: 'ID-SM',
		createdAt: new Date(Date.now() - 86400000).toISOString(),
	},
];

const mockBookings: MockBooking[] = [
	{
		id: 'booking-1',
		userId: 'user-pro-1',
		itemId: 'item-1',
		startDate: new Date(Date.now() + 86400000).toISOString(),
		endDate: new Date(Date.now() + 86400000 * 3).toISOString(),
		totalPrice: 700000,
		status: 'confirmed',
		createdAt: new Date(Date.now() - 3600000).toISOString(),
	},
	{
		id: 'booking-2',
		userId: 'user-free-1',
		itemId: 'item-2',
		startDate: new Date(Date.now() - 86400000 * 2).toISOString(),
		endDate: new Date(Date.now() - 86400000).toISOString(),
		totalPrice: 400000,
		status: 'completed',
		createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
	},
];

class MockPrismaClient {
	user = {
		findUnique: async (params: any) => {
			console.log('[MockDB] Finding user:', params.where);
			const user = mockUsers.find(
				u => u.id === params.where?.id || u.email === params.where?.email,
			);
			return user || null;
		},

		create: async (params: any) => {
			console.log('[MockDB] Creating user:', params.data);
			const newUser: MockUser = {
				id: 'user-' + Date.now(),
				name: params.data.name || 'New User',
				email: params.data.email,
				plan: params.data.plan || 'FREE',
				image: params.data.image,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			};
			mockUsers.push(newUser);
			return newUser;
		},

		update: async (params: any) => {
			console.log('[MockDB] Updating user:', params.where, params.data);
			const userIndex = mockUsers.findIndex(u => u.id === params.where.id);
			if (userIndex >= 0) {
				mockUsers[userIndex] = { ...mockUsers[userIndex], ...params.data };
				return mockUsers[userIndex];
			}
			throw new Error('User not found');
		},

		upsert: async (params: any) => {
			const existing = mockUsers.find(u => u.email === params.where.email);
			if (existing) {
				const updated = { ...existing, ...params.update } as MockUser;
				const idx = mockUsers.findIndex(u => u.id === existing.id);
				if (idx >= 0) mockUsers[idx] = updated;
				return updated;
			} else {
				const newUser: MockUser = {
					id: 'user-' + Date.now(),
					name: params.create?.name || 'New User',
					email: params.create?.email,
					plan: params.create?.plan || 'FREE',
					image: params.create?.image,
					createdAt: new Date().toISOString(),
					updatedAt: new Date().toISOString(),
				};
				mockUsers.push(newUser);
				return newUser;
			}
		},
	};

	item = {
		findMany: async (params: any = {}) => {
			console.log('[MockDB] Finding items:', params.where);
			let items = [...mockItems];

			if (params.where?.userId) {
				items = items.filter(item => item.userId === params.where.userId);
			}
			if (params.where?.category) {
				items = items.filter(item => item.category === params.where.category);
			}

			if (params.orderBy?.createdAt === 'desc') {
				items.sort(
					(a, b) =>
						new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
				);
					if (process.env.NODE_ENV === 'production') {
						prismaInstance = new PrismaClient();
					} else {
						// Always use mock client in development to avoid DB connection errors
						if (!globalForPrisma.mockPrisma) {
							globalForPrisma.mockPrisma = new MockPrismaClient();
						}
						prismaInstance = globalForPrisma.mockPrisma;
					}
		},
	};

	booking = {
		findMany: async (params: any = {}) => {
			console.log('[MockDB] Finding bookings:', params.where);
			let bookings = [...mockBookings];

			if (params.where?.userId) {
				bookings = bookings.filter(
					booking => booking.userId === params.where.userId,
				);
			}
			if (params.where?.itemId) {
				bookings = bookings.filter(
					booking => booking.itemId === params.where.itemId,
				);
			}

			if (params.include?.item) {
				return bookings.map(booking => ({
					...booking,
					item: mockItems.find(item => item.id === booking.itemId) || null,
				}));
			}

			return bookings;
		},

		create: async (params: any) => {
			console.log('[MockDB] Creating booking:', params.data);
			const newBooking: MockBooking = {
				id: 'booking-' + Date.now(),
				...params.data,
				createdAt: new Date().toISOString(),
			};
			mockBookings.push(newBooking);
			return newBooking;
		},
	};

	account = {
		create: async (params: any) => {
			console.log('[MockDB] Creating account:', params.data);
			return { id: 'account-' + Date.now(), ...params.data };
		},

		delete: async (params: any) => {
			console.log('[MockDB] Deleting account:', params.where);
			return { id: params.where.id };
		},
	};

	session = {
		create: async (params: any) => {
			console.log('[MockDB] Creating session:', params.data);
			return { id: 'session-' + Date.now(), ...params.data };
		},

		update: async (params: any) => {
			console.log('[MockDB] Updating session:', params.where);
			return { sessionToken: params.where.sessionToken };
		},

		delete: async (params: any) => {
			console.log('[MockDB] Deleting session:', params.where);
			return { sessionToken: params.where.sessionToken };
		},

		findUnique: async (params: any) => {
			console.log('[MockDB] Finding session:', params.where);
			if (params.where?.sessionToken) {
				return {
					id: 'session-mock',
					sessionToken: params.where.sessionToken,
					userId: 'user-google-1',
					expires: new Date(Date.now() + 86400000 * 30),
				};
			}
			return null;
		},
	};

	verificationToken = {
		create: async (params: any) => {
			console.log('[MockDB] Creating verification token:', params.data);
			return { id: 'token-' + Date.now(), ...params.data };
		},

		delete: async (params: any) => {
			console.log('[MockDB] Deleting verification token:', params.where);
			return { token: params.where.token };
		},
	};

	$disconnect = async () => {
		console.log('[MockDB] Disconnected');
	};
}

const globalForPrisma = globalThis as unknown as {
	prisma: PrismaClient | undefined;
	mockPrisma: MockPrismaClient | undefined;
};

let prismaInstance: PrismaClient | MockPrismaClient;

if (process.env.NODE_ENV === 'production') {
	prismaInstance = new PrismaClient();
} else {
	if (!globalForPrisma.mockPrisma) {
		try {
			const realPrisma = new PrismaClient();
			globalForPrisma.prisma = realPrisma;
			prismaInstance = realPrisma;
			console.log('✅ Using real Prisma client');
			void realPrisma.$connect().catch(() => {
				console.log('⚠️  Database connect failed, switching to mock data');
				globalForPrisma.mockPrisma = new MockPrismaClient();
				prismaInstance = globalForPrisma.mockPrisma;
			});
		} catch (error) {
			console.log('⚠️  Database unavailable, using mock data for development');
			globalForPrisma.mockPrisma = new MockPrismaClient();
			prismaInstance = globalForPrisma.mockPrisma;
		}
	} else {
		prismaInstance = globalForPrisma.mockPrisma;
	}
}

if (process.env.NODE_ENV !== 'production')
	globalForPrisma.prisma = prismaInstance as PrismaClient;

export default prismaInstance as PrismaClient;