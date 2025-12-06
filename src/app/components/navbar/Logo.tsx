"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

const Logo = () => {
    const router = useRouter();
    return (
                <div className="flex items-center cursor-pointer select-none" onClick={() => router.push('/')}> 
                                    <div className="relative h-10 w-10 mr-2">
                                        <Image
                                            src="/images/Logo Ny.png"
                                            alt="NyewaYuk Logo"
                                            fill
                                            priority
                                            sizes="40px"
                                            className="object-contain"
                                        />
                                    </div>
                        <span className="font-extrabold text-lg md:text-xl tracking-tight text-sky-700">NyewaYuk</span>
                </div>
    );
}

export default Logo;