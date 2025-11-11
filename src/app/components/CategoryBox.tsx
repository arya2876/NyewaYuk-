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
            className={`group flex flex-col items-center justify-start gap-2 min-w-[88px] px-2 py-3 focus:outline-none border-b-2 ${selected ? 'border-ny-primary' : 'border-transparent hover:border-ny-primary'}`}
        >
            <div className={`rounded-full w-12 h-12 md:w-14 md:h-14 flex items-center justify-center transition-all duration-200 border ${selected ? 'bg-neutral-100 border-neutral-300 text-ny-primary shadow-sm' : 'bg-neutral-50 border-neutral-200 text-gray-500 group-hover:text-gray-900'}`}>
                <Icon size={28} className="md:w-7 md:h-7" />
            </div>
            <span className={`text-xs font-medium text-center ${selected ? 'text-ny-primary' : 'text-gray-500 group-hover:text-gray-900'}`}>{label}</span>
        </button>
    );
}

export default CategoryBox;