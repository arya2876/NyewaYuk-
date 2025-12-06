/* eslint-disable */
// @ts-nocheck
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
	console.log('🌱 Seeding database with sample users...');

	const hashedPassword = await bcrypt.hash('test123', 12);

	const freeUser = await prisma.user.upsert({
		where: { email: 'user@free.com' },
		update: {},
		create: {
			email: 'user@free.com',
			name: 'Free User',
			hashedPassword,
			plan: 'FREE',
		},
	});

	console.log('✅ Created FREE user:', {
		id: freeUser.id,
		email: freeUser.email,
		plan: freeUser.plan,
	});

	const proUser = await prisma.user.upsert({
		where: { email: 'user@pro.com' },
		update: {},
		create: {
			email: 'user@pro.com',
			name: 'Pro User',
			hashedPassword,
			plan: 'PRO',
		},
	});

	console.log('✅ Created PRO user:', {
		id: proUser.id,
		email: proUser.email,
		plan: proUser.plan,
	});

	const sampleListing = await prisma.listing.upsert({
		where: {
			id: 'sample-listing-1',
		},
		update: {},
		create: {
			id: 'sample-listing-1',
			title: 'Modern Apartment in Jakarta',
			description: 'Beautiful modern apartment with city views',
			imageSrc: '/images/apartment.jpg',
			category: 'Apartment',
			roomCount: 2,
			bathroomCount: 1,
			guestCount: 4,
			locationValue: 'ID,Jakarta',
			price: 500000,
			userId: freeUser.id,
		},
	});

	console.log('✅ Created sample listing:', {
		id: sampleListing.id,
		title: sampleListing.title,
	});

	const sampleReservation = await prisma.reservation.create({
		data: {
			userId: proUser.id,
			listingId: sampleListing.id,
			startDate: new Date('2024-02-01'),
			endDate: new Date('2024-02-03'),
			totalPrice: 1000000,
		},
	});

	console.log('✅ Created sample reservation:', { id: sampleReservation.id });

	console.log('🎉 Seeding completed successfully!');
	console.log('\n📋 Test Credentials:');
	console.log('FREE User: user@free.com / test123');
	console.log('PRO User: user@pro.com / test123');
}

main()
	.catch(e => {
		console.error(e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});