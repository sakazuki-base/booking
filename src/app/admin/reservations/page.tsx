import { prisma } from "@/lib/prisma";
import Link from "next/link";
import AdminReservationTable from "@/components/admin/AdminReservationTable";

export const dynamic = "force-dynamic"; // 最新を取りに行く

// URL クエリの型
type SearchParams = {
  page?: string;
  q?: string; // フリーテキスト（todoContent / person / rooms を対象）
  room?: string; // 完全一致
  person?: string; // 部分一致
  from?: string; // 作成日時（createdAt）開始 ISO (YYYY-MM-DD)
  to?: string; // 作成日時（createdAt）終了 ISO (YYYY-MM-DD)
};

const PAGE_SIZE = 20;

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams; // Next.js 15 準拠

  const page = Math.max(1, Number(sp.page ?? 1));
  const q = (sp.q ?? "").trim();
  const room = (sp.room ?? "").trim();
  const person = (sp.person ?? "").trim();
  const from = (sp.from ?? "").trim();
  const to = (sp.to ?? "").trim();

  // where 句を動的に構築
  const where: any = {};
  if (q) {
    where.OR = [
      { todoContent: { contains: q } },
      { person: { contains: q } },
      { rooms: { contains: q } },
    ];
  }
  if (room) {
    where.rooms = room; // 完全一致（必要なら contains に変更）
  }
  if (person) {
    where.person = { contains: person };
  }
  if (from || to) {
    where.createdAt = {};
    if (from) where.createdAt.gte = new Date(`${from}T00:00:00.000Z`);
    if (to) where.createdAt.lte = new Date(`${to}T23:59:59.999Z`);
  }

  const [total, reservations] = await Promise.all([
    prisma.reservation.count({ where }),
    prisma.reservation.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  // Link の href を文字列で組み立てる
  const baseQuery: Record<string, string> = {};
  if (q) baseQuery.q = q;
  if (room) baseQuery.room = room;
  if (person) baseQuery.person = person;
  if (from) baseQuery.from = from;
  if (to) baseQuery.to = to;
  const qs = (obj: Record<string, string>) => {
    const usp = new URLSearchParams(obj);
    const s = usp.toString();
    return s ? `?${s}` : "";
  };

  return (
    <main className="mx-auto max-w-screen-xl space-y-6 p-4">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">予約一覧（管理）</h1>
        <Link href="/" className="text-sm underline">
          サイトへ戻る
        </Link>
      </header>

      {/* フィルタフォーム（クエリストリング連動） */}
      <form className="grid gap-3 rounded-2xl bg-white p-4 shadow md:grid-cols-6">
        <input
          name="q"
          defaultValue={q}
          placeholder="フリーテキスト検索（内容/氏名/部屋）"
          className="rounded border px-3 py-2 md:col-span-3"
        />
        <input
          name="person"
          defaultValue={person}
          placeholder="氏名（部分一致）"
          className="rounded border px-3 py-2"
        />
        <input
          name="room"
          defaultValue={room}
          placeholder="部屋（完全一致）"
          className="rounded border px-3 py-2"
        />
        <div className="flex gap-2 md:col-span-2">
          <input
            type="date"
            name="from"
            defaultValue={from}
            className="w-full rounded border px-3 py-2"
          />
          <input
            type="date"
            name="to"
            defaultValue={to}
            className="w-full rounded border px-3 py-2"
          />
        </div>
        <div className="flex gap-2 md:col-span-6">
          <button className="rounded border px-4 py-2">検索</button>
          <Link href="/admin/reservations" className="rounded border px-4 py-2">
            クリア
          </Link>
        </div>
      </form>

      <AdminReservationTable
        data={reservations}
        page={page}
        pageSize={PAGE_SIZE}
        total={total}
      />

      {/* ページネーション（href は文字列固定） */}
      <nav className="flex justify-center gap-2">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
          <Link
            key={p}
            href={`/admin/reservations${qs({ ...baseQuery, page: String(p) })}`}
            className={`rounded border px-3 py-1 ${p === page ? "bg-gray-900 text-white" : "bg-white"}`}
          >
            {p}
          </Link>
        ))}
      </nav>
    </main>
  );
}
