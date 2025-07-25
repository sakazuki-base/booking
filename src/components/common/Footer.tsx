import Link from "next/link";
import { memo, useMemo } from "react";
import baseStyle from "../../styles/page.module.css";

function Footer() {
    const thisYear: number = useMemo(() => {
        const data: Date = new Date();
        return data.getFullYear();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <footer className={baseStyle.theFooter}>
            {/* [Minified React error #418 対応](https://react.dev/reference/react-dom/client/hydrateRoot#suppressing-unavoidable-hydration-mismatch-errors) */}
            <p><small suppressHydrationWarning={true}>&copy; {thisYear} <Link href={'https://sawano.dev'} target="_blank">sawano.dev</Link></small></p>
        </footer>
    );
}

export default memo(Footer);