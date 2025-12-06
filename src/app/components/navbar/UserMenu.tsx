'use client';

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
// Work around JSX type mismatch in some TS setups by aliasing AnimatePresence as any
const Presence: any = AnimatePresence;
import { AiOutlineMenu } from "react-icons/ai";
import { signOut } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";

import useLoginModal from "@/app/hooks/useLoginModal";
import useRegisterModal from "@/app/hooks/useRegisterModal";
import useRentModal from "@/app/hooks/useRentModal";
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
    const rentModal = useRentModal();

    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();

    // Track a single refresh per open session and baseline for scroll
    const didRefreshRef = useRef(false);
    const baselinePathRef = useRef<string | null>(null);
    const baselineScrollRef = useRef<number>(0);

    const toggleOpen = useCallback(() => {
        setIsOpen((value) => !value);
    }, []);

    const onPrimaryCta = useCallback(() => {
        if (!currentUser) {
            return loginModal.onOpen();
        }
        // Authenticated users: open rent modal (Sewakan Barang flow)
        rentModal.onOpen();
    }, [loginModal, rentModal, currentUser]);

    // When menu opens, capture baseline values and reset refresh guard
    useEffect(() => {
        if (isOpen) {
            didRefreshRef.current = false;
            baselinePathRef.current = pathname ?? null;
            baselineScrollRef.current = typeof window !== 'undefined' ? window.scrollY : 0;
        }
    }, [isOpen, pathname]);

    // Auto-refresh when route changes while menu is open
    useEffect(() => {
        if (!isOpen) return;
        const baseline = baselinePathRef.current;
        if (!didRefreshRef.current && baseline !== null && pathname !== baseline) {
            didRefreshRef.current = true;
            // Refresh data and close the menu for a clean UX
            router.refresh();
            setIsOpen(false);
        }
    }, [pathname, isOpen, router]);

    // Auto-refresh when user scrolls downward while menu is open
    useEffect(() => {
        if (!isOpen) return;
        const onScroll = () => {
            if (didRefreshRef.current) return;
            const baseline = baselineScrollRef.current || 0;
            const currentY = window.scrollY || 0;
            // Trigger only on downward scroll beyond a small threshold
            if (currentY > baseline + 12) {
                didRefreshRef.current = true;
                router.refresh();
                setIsOpen(false);
            }
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, [isOpen, router]);

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
            <Presence>
                {isOpen && (
                    <motion.div
                        role="menu"
                        initial={{ opacity: 0, y: 10, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 6, scale: 0.97 }}
                        transition={{ type: 'spring', stiffness: 520, damping: 34, mass: 0.55 }}
                        className="
                            absolute right-0 top-12
                            w-[40vw] md:w-3/4
                            rounded-xl shadow-md bg-white overflow-hidden text-sm
                            origin-top-right
                        "
                    >
                        <div className="flex flex-col cursor-pointer">
                            {currentUser ? (
                                <>
                                    <MenuItem
                                        label="SewaanKu"
                                        onClick={() => router.push('/properties')}
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
                    </motion.div>
                )}
            </Presence>
        </div>
    );
}

export default UserMenu;