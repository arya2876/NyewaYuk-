'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type Plan = 'FREE' | 'PRO';

interface RequirePlanProps {
	children: React.ReactNode;
	required: Plan;
	fallback?: React.ReactNode;
	redirectTo?: string;
}

export default function RequirePlan({ 
	children, 
	required, 
	fallback = null, 
	redirectTo 
}: RequirePlanProps) {
	const [userPlan, setUserPlan] = useState<Plan | null>(null);
	const router = useRouter();

	useEffect(() => {
		// In a real app, this would fetch from your auth context or API
		// For now, we'll assume FREE by default
		// You can integrate this with your NextAuth session
		const checkUserPlan = async () => {
			try {
				const response = await fetch('/api/user/plan');
				if (response.ok) {
					const data = await response.json();
					setUserPlan(data.plan || 'FREE');
				} else {
					setUserPlan('FREE');
				}
			} catch (error) {
				console.warn('Could not fetch user plan, defaulting to FREE');
				setUserPlan('FREE');
			}
		};

		checkUserPlan();
	}, []);

	useEffect(() => {
		if (userPlan && userPlan !== required && redirectTo) {
			router.push(redirectTo);
		}
	}, [userPlan, required, redirectTo, router]);

	if (userPlan === null) {
		return <div className="flex items-center justify-center p-4">Loading...</div>;
	}

	if (userPlan !== required) {
		if (fallback) {
			return <>{fallback}</>;
		}
    
		return (
			<div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
				<h3 className="text-lg font-semibold text-yellow-800 mb-2">
					{required === 'PRO' ? 'Pro Plan Required' : 'Access Restricted'}
				</h3>
				<p className="text-yellow-700 mb-4">
					{required === 'PRO' 
						? 'This feature requires a Pro subscription. Upgrade now to access advanced analytics and tools.'
						: 'You do not have access to this feature.'}
				</p>
				{required === 'PRO' && (
					<a 
						href="/billing/upgrade" 
						className="inline-block px-6 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
					>
						Upgrade to Pro
					</a>
				)}
			</div>
		);
	}

	return <>{children}</>;
}

// HOC version for class components or advanced usage
export function withPlan<P extends object>(
	Component: React.ComponentType<P>,
	required: Plan,
	fallback?: React.ReactNode
) {
	return function WithPlanComponent(props: P) {
		return (
			<RequirePlan required={required} fallback={fallback}>
				<Component {...props} />
			</RequirePlan>
		);
	};
}