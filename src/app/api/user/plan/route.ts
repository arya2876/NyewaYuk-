import { NextResponse } from 'next/server';
import getCurrentUser from '@/app/actions/getCurrentUser';

export async function GET() {
	try {
		const currentUser = await getCurrentUser();
    
		if (!currentUser) {
			return NextResponse.json({ plan: 'FREE' }, { status: 200 });
		}

		return NextResponse.json({ 
			plan: currentUser.plan || 'FREE' 
		}, { status: 200 });
	} catch (error) {
		console.error('Error fetching user plan:', error);
		return NextResponse.json({ 
			plan: 'FREE' 
		}, { status: 200 });
	}
}