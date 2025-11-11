import { SafeUser } from "@/app/types";
import Container from "../Container";
import Logo from "./Logo";
import Search from "./Search";
import UserMenu from "./UserMenu";
import Link from 'next/link';

interface NavBarProps {
    currentUser?: SafeUser | null;
}

const NavBar: React.FC<NavBarProps> = ({
    currentUser,
}) => {
    return (
        <header className="sticky top-0 w-full z-30 bg-white shadow-md">
            <div className="border-b border-neutral-200/70 bg-white">
                <Container>
                    <div className="flex flex-row items-center justify-between gap-4 py-4">
                        <div className="flex items-center gap-3">
                            <Logo />
                            <Link href="/" className="text-lg font-bold tracking-wide text-ny-primary hidden sm:inline-block">
                                NyewaYuk
                            </Link>
                        </div>
                        <div className="flex-1 max-w-xl hidden md:block">
                            <Search />
                        </div>
                        <div className="flex items-center gap-4">
                            <UserMenu currentUser={currentUser} />
                        </div>
                    </div>
                </Container>
            </div>
            {/* Mobile Search (below nav) */}
            <div className="md:hidden px-4 pb-3 bg-white">
                <Search />
            </div>
        </header>
    );
}


export default NavBar;