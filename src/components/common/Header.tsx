import Link from "next/link";
import { memo } from "react";

function Header() {
    return (
        // <header className={baseStyle.theHeader}>
        <header>
            <nav>
                <ul>
                    <li><Link href={'/'}>TOP</Link></li>
                    <li><Link href={'/about'}>使い方について</Link></li>
                </ul>
            </nav>
        </header>
    );
}

export default memo(Header);