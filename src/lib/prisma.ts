/* クライアントで prisma を通じてデータベースを操作・利用するための機能をインポート */
import { PrismaClient } from '@prisma/client';

/* グローバルスコープに PrismaClient のインスタンスを保持するための型定義 */
const globalForPrisma = global as unknown as { prisma: PrismaClient };

/* PrismaClient のインスタンスが存在しない場合は新規作成 */
export const prisma = globalForPrisma.prisma || new PrismaClient();

/**
 * 開発環境の場合のみ、グローバルオブジェクトに PrismaClient インスタンスを保持
 * これにより開発時のホットリロードで複数のインスタンスが作成されることを防ぐ
*/
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;