import ClientOnly from '@/app/components/ClientOnly';
import DashboardClient from '../DashboardClient';
import getCurrentUser from '@/app/actions/getCurrentUser';
import getDashboardStats from '@/app/actions/getDashboardStats';
import UpgradeCta from './UpgradeCta';

export default async function DashboardBasic({ searchParams }: { searchParams?: { from?: string; to?: string; page?: string; pageSize?: string; denied?: string } }) {
	const currentUser = await getCurrentUser();
	let data: any = { summary: { totalRent: 0, completedRent: 0, totalRevenue: 0 }, weeklyRevenue: [], popular: [], recent: [] };
  
	if (currentUser?.id) {
		const page = searchParams?.page ? parseInt(searchParams.page, 10) : 1;
		const pageSize = searchParams?.pageSize ? parseInt(searchParams.pageSize, 10) : 8;
		data = await getDashboardStats({ userId: currentUser.id, fromDate: searchParams?.from, toDate: searchParams?.to, page, pageSize });
	}

	return (
		<div className="space-y-6">
			{/* Access denied message */}
			{searchParams?.denied === 'plan' && (
				<div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
					<div className="flex">
						<div className="ml-3">
							<h3 className="text-sm font-medium text-yellow-800">
								Upgrade Required
							</h3>
							<div className="mt-2 text-sm text-yellow-700">
								<p>You need a Pro plan to access advanced dashboard features. Upgrade now to unlock analytics, exports, and more!</p>
							</div>
						</div>
					</div>
				</div>
			)}

			{/* Upgrade CTA */}
			<UpgradeCta />
      
			{/* Dashboard Content - using existing DashboardClient */}
			<ClientOnly>
				<DashboardClient data={data} />
			</ClientOnly>
		</div>
	);
}