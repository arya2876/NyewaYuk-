'use client';

import Link from 'next/link';
import { Crown, TrendingUp, Download, Activity } from 'lucide-react';

export default function UpgradeCta() {
	return (
		<div className="bg-gradient-to-r from-blue-50 via-white to-purple-50 rounded-xl border p-6 shadow-sm">
			<div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
				<div className="flex-1">
					<div className="flex items-center gap-2 mb-2">
						<Crown className="w-5 h-5 text-yellow-500" />
						<h3 className="text-lg font-semibold text-gray-900">Upgrade to Dashboard Pro</h3>
					</div>
					<p className="text-gray-600 mb-4">
						Unlock advanced analytics, unlimited exports, activity logs, and priority support to grow your rental business.
					</p>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
						<div className="flex items-center gap-2">
							<TrendingUp className="w-4 h-4 text-blue-600" />
							<span>Advanced Analytics & Charts</span>
						</div>
						<div className="flex items-center gap-2">
							<Download className="w-4 h-4 text-green-600" />
							<span>Unlimited CSV Exports</span>
						</div>
						<div className="flex items-center gap-2">
							<Activity className="w-4 h-4 text-purple-600" />
							<span>Activity Logs & Insights</span>
						</div>
					</div>
				</div>
				<div className="flex flex-col sm:flex-row gap-3">
					<Link 
						href="/billing/upgrade"
						className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors text-center"
					>
						Upgrade Now
					</Link>
					<Link 
						href="/pricing"
						className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors text-center"
					>
						View Plans
					</Link>
				</div>
			</div>
		</div>
	);
}