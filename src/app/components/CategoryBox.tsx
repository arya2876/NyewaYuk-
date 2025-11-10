'use client';

import qs from 'query-string';
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { ComponentType } from "react";

interface CategoryBoxProps {
    icon: ComponentType<any> | any;
    label: string;
    selected?: boolean;
}

const CategoryBox: React.FC<CategoryBoxProps> = ({
    icon: Icon,
    label,
    selected,
}) => {
    const router = useRouter();
    const params = useSearchParams();

    const handleClick = useCallback(() => {
        let currentQuery = {};

        if (params) {
            currentQuery = qs.parse(params.toString())
        }

        const updatedQuery: any = {
            ...currentQuery,
            category: label
        }

        if (params?.get('category') === label) {
            delete updatedQuery.category;
        }

        const url = qs.stringifyUrl({
            url: '/',
            query: updatedQuery
        }, { skipNull: true });

        router.push(url);
    }, [label, router, params]);

    return (
        <button
            onClick={handleClick}
            className={`group flex flex-col items-center justify-start gap-2 min-w-[80px] px-2 py-3 focus:outline-none`}
        >
            <div className={`rounded-full w-16 h-16 flex items-center justify-center transition-colors shadow-sm border ${selected ? 'bg-yellow-400 border-yellow-500 text-neutral-900' : 'bg-neutral-100 border-neutral-200 text-neutral-600 group-hover:bg-neutral-200'}`}>
                <Icon size={30} />
            </div>
            <span className={`text-xs font-medium text-center ${selected ? 'text-neutral-800' : 'text-neutral-500 group-hover:text-neutral-700'}`}>{label}</span>
        </button>
    );
}

export default CategoryBox;