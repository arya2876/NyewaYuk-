"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

const Logo = () => {
    const router = useRouter();
    return (
        <div className="flex items-center cursor-pointer" onClick={() => router.push('/')}> 
            <Image
                className="hidden md:block"
                src="/images/Logo Ny.png"
                height="48"
                width="48"
                alt="Logo NyewaYuk"
                style={{ width: '48px', height: '48px' }}
            />
        </div>
    );
}

export default Logo;