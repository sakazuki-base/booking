"use client";

import { useMemo, useState } from "react";
import type { Reservation } from "@prisma/client";

export default function AdminReservationTable({
  data,
  page,
  pageSize,
  total,
}: {
  data: Reservation[];
  page: number;
  pageSize: number;
  total: number;
}) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const toggle = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };
  const allChecked =
    selectedIds.length > 0 && selectedIds.length === data.length;
  const toggleAll = () => {
    setSelectedIds(allChecked ? [] : data.map((d) => d.id));
  };

  const csvText = useMemo(() => toCSV(data), [data]);

  const handleCopyCSV = async () => {
    await navigator.clipboard.writeText(csvText);
    alert("CSVをコピーしました");
  };

  const handleDelete = async () => {
    if (!selectedIds.length) return;
    if (!confirm(`${selectedIds.length}件を削除します。よろしいですか？`))
      return;
    const res = await fetch("/api/admin/reservations/bulk-delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: selectedIds }),
    });
    if (!res.ok) {
      const t = await res.text();
      alert(`削除に失敗しました: ${t}`);
      return;
    }
    location.reload();
  };

  const handleSendEmail = async (id: string, presetEmail?: string | null) => {
    let to = (presetEmail ?? "").trim();
    if (!to) {
      const input = prompt(
        "送信先メールアドレスを入力してください（例: user@example.com）",
      );
      if (!input) return;
      to = input.trim();
    }
    const ok = confirm(
      `${to} に鍵パスワードメールを送信します。よろしいですか？`,
    );
    if (!ok) return;
    const res = await fetch(`/api/admin/reservations/${id}/send-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to }),
    });
    if (!res.ok) {
      const t = await res.text();
      alert(`送信に失敗しました: ${t}`);
      return;
    }
    alert("送信しました");
  };

  return (
    <section className="overflow-x-auto rounded-2xl bg-white shadow">
      <div className="flex items-center justify-between gap-2 p-3">
        <p className="text-sm text-gray-600">
          全{total}件 / ページ {page}（{pageSize}件表示）
        </p>
        <div className="flex gap-2">
          <a
            href={`data:text/csv;charset=utf-8,${encodeURIComponent(csvText)}`}
            download={`reservations_page${page}.csv`}
            className="rounded border px-3 py-1"
          >
            CSVダウンロード
          </a>
          <button onClick={handleCopyCSV} className="rounded border px-3 py-1">
            CSVをコピー
          </button>
          <button
            onClick={handleDelete}
            className="rounded border px-3 py-1 text-red-600"
          >
            選択を削除
          </button>
        </div>
      </div>

      <table className="min-w-full text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="w-10 p-2 text-center">
              <input
                type="checkbox"
                checked={allChecked}
                onChange={toggleAll}
              />
            </th>
            <th className="p-2 whitespace-nowrap">作成日時</th>
            <th className="p-2 whitespace-nowrap">部屋</th>
            <th className="p-2 whitespace-nowrap">氏名</th>
            <th className="p-2 whitespace-nowrap">メール</th>
            <th className="p-2 whitespace-nowrap">開始</th>
            <th className="p-2 whitespace-nowrap">終了</th>
            <th className="p-2 whitespace-nowrap">解錠パス</th>
            <th className="p-2 whitespace-nowrap">操作</th>
          </tr>
        </thead>
        <tbody>
          {data.map((r) => (
            <tr key={r.id} className="border-t">
              <td className="p-2 text-center">
                <input
                  type="checkbox"
                  checked={selectedIds.includes(r.id)}
                  onChange={() => toggle(r.id)}
                />
              </td>
              <td className="p-2 text-center whitespace-nowrap">
                {formatDateTime(r.createdAt)}
              </td>
              <td className="p-2 text-center whitespace-nowrap">{r.rooms}</td>
              <td className="p-2 text-center whitespace-nowrap">{r.person}</td>
              <td className="p-2 text-center whitespace-nowrap">
                {r.email ?? ""}
              </td>
              <td className="p-2 text-center whitespace-nowrap">
                {r.startTime}
              </td>
              <td className="p-2 text-center whitespace-nowrap">
                {r.finishTime}
              </td>
              <td className="p-2 text-center whitespace-nowrap">
                {r.unlockCode ?? ""}
              </td>
              <td className="p-2 text-center whitespace-nowrap">
                <button
                  onClick={async () => {
                    if (!confirm("この予約を削除しますか？")) return;
                    const res = await fetch(`/api/admin/reservations/${r.id}`, {
                      method: "DELETE",
                    });
                    if (!res.ok) {
                      alert("削除に失敗しました");
                    } else {
                      location.reload();
                    }
                  }}
                  className="rounded border px-2 py-1 text-red-600"
                >
                  削除
                </button>
                <button
                  onClick={() => handleSendEmail(r.id, r.email)}
                  className="rounded border px-2 py-1 text-blue-600"
                >
                  メール
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

function toCSV(rows: any[]): string {
  const headers = [
    "id",
    "createdAt",
    "rooms",
    "person",
    "email",
    "startTime",
    "finishTime",
    "unlockCode",
    "todoContent",
  ];
  const esc = (v: any) => {
    if (v == null) return "";
    const s = String(v).replaceAll('"', '""');
    return /[",\n]/.test(s) ? `"${s}"` : s;
  };
  const head = headers.join(",");
  const body = rows
    .map((r) =>
      [
        r.id,
        r.createdAt?.toISOString?.() ?? r.createdAt,
        r.rooms,
        r.person,
        r.email ?? "",
        r.startTime,
        r.finishTime,
        r.unlockCode ?? "",
        r.todoContent,
      ]
        .map(esc)
        .join(","),
    )
    .join("\n");
  return [head, body].join("\n");
}

function formatDateTime(d: Date | string): string {
  const date = typeof d === "string" ? new Date(d) : d;
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const hh = String(date.getHours()).padStart(2, "0");
  const mi = String(date.getMinutes()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd} ${hh}:${mi}`;
}
