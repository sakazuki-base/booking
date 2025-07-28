import { memo } from "react";
import Link from "next/link";

function NotFoundPage() {
  return (
    // <section className={baseStyle.notFoundPageSec}>
    //     <div className={baseStyle.contentWrapper}>
    <section>
      <div>
        <h2>here is 404</h2>
        <Link href={'/'}>go to TOP</Link>
      </div>
    </section>
  );
}

export default memo(NotFoundPage);