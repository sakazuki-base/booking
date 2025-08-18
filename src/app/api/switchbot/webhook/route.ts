import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();

  console.log("SwitchBot Webhook 受信:", body);

  // 後でここにパスコード登録成功処理などを書く
  return NextResponse.json({ ok: true });
}
