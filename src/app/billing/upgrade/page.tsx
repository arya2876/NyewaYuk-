import Link from 'next/link';

export default function BillingUpgrade() {
	return (
		<div className="min-h-screen bg-gray-50 py-12">
			<div className="max-w-4xl mx-auto px-4">
				{/* Header */}
				<div className="text-center mb-12">
					<h1 className="text-4xl font-bold text-gray-900 mb-4">
						Upgrade to Pro
					</h1>
					<p className="text-xl text-gray-600">
						Unlock advanced analytics and grow your rental business
					</p>
				</div>

				{/* Pricing Cards */}
				<div className="grid md:grid-cols-2 gap-8 mb-12">
					{/* Basic Plan */}
					<div className="bg-white rounded-xl border p-8">
						<div className="text-center">
							<h3 className="text-2xl font-semibold mb-4">Basic</h3>
							<div className="text-4xl font-bold mb-2">Free</div>
							<p className="text-gray-600 mb-8">Perfect for getting started</p>
						</div>
						<ul className="space-y-3 mb-8">
							<li className="flex items-center gap-3">
								<span className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
									✓
								</span>
								Basic dashboard metrics
							</li>
							<li className="flex items-center gap-3">
								<span className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
									✓
								</span>
								Recent bookings (10 items)
							</li>
							<li className="flex items-center gap-3">
								<span className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
									✓
								</span>
								Popular items overview
							</li>
							<li className="flex items-center gap-3">
								<span className="w-5 h-5 bg-gray-200 rounded-full flex items-center justify-center">
									✗
								</span>
								<span className="text-gray-400">Advanced analytics</span>
							</li>
							<li className="flex items-center gap-3">
								<span className="w-5 h-5 bg-gray-200 rounded-full flex items-center justify-center">
									✗
								</span>
								<span className="text-gray-400">CSV exports</span>
							</li>
						</ul>
						<Link 
							href="/dashboard/basic"
							className="w-full block text-center py-3 px-6 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
						>
							Current Plan
						</Link>
					</div>

					{/* Pro Plan */}
					<div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border-2 border-blue-200 p-8 relative">
						<div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
							<span className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-medium">
								Recommended
							</span>
						</div>
						<div className="text-center">
							<h3 className="text-2xl font-semibold mb-4">Pro</h3>
							<div className="text-4xl font-bold mb-2">
								Rp 99,000
								<span className="text-lg font-normal text-gray-600">/month</span>
							</div>
							<p className="text-gray-600 mb-8">For serious rental businesses</p>
						</div>
						<ul className="space-y-3 mb-8">
							<li className="flex items-center gap-3">
								<span className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
									✓
								</span>
								Everything in Basic
							</li>
							<li className="flex items-center gap-3">
								<span className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
									✓
								</span>
								Advanced analytics & charts
							</li>
							<li className="flex items-center gap-3">
								<span className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
									✓
								</span>
								Unlimited CSV exports
							</li>
							<li className="flex items-center gap-3">
								<span className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
									✓
								</span>
								Activity logs & insights
							</li>
							<li className="flex items-center gap-3">
								<span className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
									✓
								</span>
								Custom date ranges
							</li>
							<li className="flex items-center gap-3">
								<span className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
									✓
								</span>
								Priority support
							</li>
						</ul>
						<button className="w-full py-3 px-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold">
							Upgrade to Pro
						</button>
					</div>
				</div>

				{/* Features Comparison */}
				<div className="bg-white rounded-xl border p-8">
					<h3 className="text-2xl font-semibold mb-6 text-center">Feature Comparison</h3>
					<div className="overflow-x-auto">
						<table className="w-full">
							<thead>
								<tr className="border-b">
									<th className="text-left py-3 px-4">Feature</th>
									<th className="text-center py-3 px-4">Basic</th>
									<th className="text-center py-3 px-4">Pro</th>
								</tr>
							</thead>
							<tbody>
								<tr className="border-b">
									<td className="py-3 px-4">Dashboard metrics</td>
									<td className="text-center py-3 px-4">✓</td>
									<td className="text-center py-3 px-4">✓</td>
								</tr>
								<tr className="border-b">
									<td className="py-3 px-4">Recent bookings</td>
									<td className="text-center py-3 px-4">10 items</td>
									<td className="text-center py-3 px-4">Unlimited</td>
								</tr>
								<tr className="border-b">
									<td className="py-3 px-4">Analytics charts</td>
									<td className="text-center py-3 px-4">✗</td>
									<td className="text-center py-3 px-4">✓</td>
								</tr>
								<tr className="border-b">
									<td className="py-3 px-4">Data export</td>
									<td className="text-center py-3 px-4">✗</td>
									<td className="text-center py-3 px-4">CSV/Excel</td>
								</tr>
								<tr className="border-b">
									<td className="py-3 px-4">Custom date filters</td>
									<td className="text-center py-3 px-4">✗</td>
									<td className="text-center py-3 px-4">✓</td>
								</tr>
								<tr className="border-b">
									<td className="py-3 px-4">Activity logs</td>
									<td className="text-center py-3 px-4">✗</td>
									<td className="text-center py-3 px-4">✓</td>
								</tr>
								<tr>
									<td className="py-3 px-4">Support</td>
									<td className="text-center py-3 px-4">Standard</td>
									<td className="text-center py-3 px-4">Priority</td>
								</tr>
							</tbody>
						</table>
					</div>
				</div>

				{/* CTA */}
				<div className="text-center">
					<p className="text-gray-600 mb-4">
						Questions about upgrading? <Link href="/contact" className="text-blue-600 hover:underline">Contact our team</Link>
					</p>
				</div>
			</div>
		</div>
	);
}