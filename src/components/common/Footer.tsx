import Link from "next/link";
import { memo, useMemo } from "react";

function Footer() {
  const thisYear: number = useMemo(() => {
    const data: Date = new Date();
    return data.getFullYear();
  }, []);

  return (
    <footer className="text-center">
      <p>
        <small suppressHydrationWarning={true}>
          &copy; {thisYear}{" "}
          <Link href={"https://sawano.dev"} target="_blank">
            sawano.dev
          </Link>
        </small>
      </p>
    </footer>
  );
}

export default memo(Footer);
