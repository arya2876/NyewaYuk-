'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { 
    Camera, 
    Drone, 
    Projector, 
    Radio, 
    Music,
    Speaker,
    PartyPopper,
    Bike, 
    Gamepad2, 
    MoreHorizontal 
} from 'lucide-react';

import CategoryBox from "../CategoryBox";
import Container from '../Container';


export const categories = [
    {
        label: 'Kamera',
        icon: Camera,
        description: 'Kamera DSLR, Mirrorless, Action Cam untuk foto & video',
    },
    {
        label: 'Drone',
        icon: Drone,
        description: 'Drone untuk aerial photography dan videography',
    },
    {
        label: 'Proyektor',
        icon: Projector,
        description: 'Proyektor untuk presentasi, nonton film, atau acara'
    },
    {
        label: 'HT',
        icon: Radio,
        description: 'Handy Talky untuk komunikasi jarak jauh'
    },
    {
        label: 'Alat Musik',
        icon: Music,
        description: 'Gitar, Keyboard, Drum, dan alat musik lainnya'
    },
    {
        label: 'Sound System',
        icon: Speaker,
        description: 'Speaker, Mic, Mixer untuk acara dan hiburan'
    },
    {
        label: 'Alat Pesta',
        icon: PartyPopper,
        description: 'Dekorasi, tenda, kursi untuk pesta dan acara'
    },
    {
        label: 'Hobi',
        icon: Bike,
        description: 'Sepeda, skateboard, dan peralatan hobi lainnya'
    },
    {
        label: 'Game',
        icon: Gamepad2,
        description: 'Console game, VR, dan peralatan gaming'
    },
    {
        label: 'Lainnya',
        icon: MoreHorizontal,
        description: 'Item sewa lainnya yang tidak termasuk kategori di atas'
    }
]

const Categories = () => {
    const params = useSearchParams();
    const category = params?.get('category');
    const pathname = usePathname();
    const isMainPage = pathname === '/';

    if (!isMainPage) {
        return null;
    }

    return (
        <Container className="py-10">
            <div
                className="
          flex flex-row items-center 
          gap-4 sm:gap-6 md:gap-8
          overflow-x-auto sm:overflow-visible
          justify-start sm:justify-center
          px-1
        "
                role="list"
            >
                {categories.map((item) => (
                    <div key={item.label} role="listitem">
                        <CategoryBox
                            label={item.label}
                            icon={item.icon}
                            selected={category === item.label}
                        />
                    </div>
                ))}
            </div>
        </Container>
    );
}

export default Categories;