'use client';

import { useCallback, useState } from "react";
import { AiOutlineMenu } from "react-icons/ai";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

import useLoginModal from "@/app/hooks/useLoginModal";
import useRegisterModal from "@/app/hooks/useRegisterModal";
import { SafeUser } from "@/app/types";

import MenuItem from "./MenuItem";
import Avatar from "../Avatar";

interface UserMenuProps {
    currentUser?: SafeUser | null
}

const UserMenu: React.FC<UserMenuProps> = ({
    currentUser
}) => {
    const router = useRouter();

    const loginModal = useLoginModal();
    const registerModal = useRegisterModal();

    const [isOpen, setIsOpen] = useState(false);

    const toggleOpen = useCallback(() => {
        setIsOpen((value) => !value);
    }, []);

    const onPrimaryCta = useCallback(() => {
        if (!currentUser) {
            return loginModal.onOpen();
        }
        // Redirect authenticated users to add new item page (owner flow)
        router.push('/barang-saya/new');
    }, [loginModal, currentUser, router]);

    return (
        <div className="relative">
            <div className="flex flex-row items-center gap-3">
                <button
                    onClick={onPrimaryCta}
                    className="hidden md:inline-flex items-center text-sm font-semibold py-2.5 px-4 rounded-full bg-ny-primary text-white hover:opacity-95 transition"
                >
                    Sewakan Barang
                </button>
                <div
                    onClick={toggleOpen}
                    className="
          p-4
          md:py-1
          md:px-2
          border-[1px] 
          border-neutral-200 
          flex 
          flex-row 
          items-center 
          gap-3 
          rounded-full 
          cursor-pointer 
          hover:shadow-md 
          transition
          "
                >
                    <AiOutlineMenu />
                    <div className="hidden md:block">
                        <Avatar src={currentUser?.image} />
                    </div>
                </div>
            </div>
            {isOpen && (
                <div
                    className="
            absolute 
            rounded-xl 
            shadow-md
            w-[40vw]
            md:w-3/4 
            bg-white 
            overflow-hidden 
            right-0 
            top-12 
            text-sm
          "
                >
                    <div className="flex flex-col cursor-pointer">
                        {currentUser ? (
                            <>
                                <MenuItem
                                    label="Sewaanku"
                                    onClick={() => router.push('/sewaanku')}
                                />
                                <MenuItem
                                    label="Barang Saya"
                                    onClick={() => router.push('/barang-saya')}
                                />
                                <MenuItem
                                    label="Dasbor Mitra"
                                    onClick={() => router.push('/dashboard')}
                                />
                                <hr />
                                <MenuItem
                                    label="Logout"
                                    onClick={() => signOut()}
                                />
                            </>
                        ) : (
                            <>
                                <MenuItem
                                    label="Login"
                                    onClick={loginModal.onOpen}
                                />
                                <MenuItem
                                    label="Sign up"
                                    onClick={registerModal.onOpen}
                                />
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default UserMenu;