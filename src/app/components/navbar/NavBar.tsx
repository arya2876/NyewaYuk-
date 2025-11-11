import { SafeUser } from "@/app/types";
import Container from "../Container";
import Logo from "./Logo";
import Search from "./Search";
import UserMenu from "./UserMenu";

interface NavBarProps {
    currentUser?: SafeUser | null;
}

const NavBar: React.FC<NavBarProps> = ({
    currentUser,
}) => {
    return (
        <div className="sticky top-0 w-full z-20 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/80 shadow-sm">
            <div
                className="
          py-4 
          border-b-[1px]
        "
            >
                <Container>
                    <div
                        className="
            flex 
            flex-row 
            items-center 
            justify-between
            gap-3
            md:gap-0
          "
                    >
                        <Logo />
                        <Search />
                        <UserMenu currentUser={currentUser} />
                    </div>
                </Container>
            </div>
        </div>
    );
}


export default NavBar;