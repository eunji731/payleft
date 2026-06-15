import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const data = [
  { name: "08전기0128137559", payDate: "2025-08-31", currentInstallment: 10, totalInstallment: 12, amount: 8800 },
  { name: "08월8126KT통신요금", payDate: "2025-08-31", currentInstallment: 10, totalInstallment: 12, amount: 11000 },
  { name: "신세계프라퍼티 코엑스몰", payDate: "2025-08-31", currentInstallment: 10, totalInstallment: 12, amount: 9800 },
  { name: "주식회사 노라독", payDate: "2025-08-31", currentInstallment: 10, totalInstallment: 12, amount: 10200 },
  { name: "삼성화재해상보험(1)", payDate: "2025-08-31", currentInstallment: 10, totalInstallment: 12, amount: 9600 },
  { name: "서울교통공사(1)", payDate: "2025-08-31", currentInstallment: 10, totalInstallment: 12, amount: 9000 },
  { name: "로또대성축산", payDate: "2025-08-31", currentInstallment: 10, totalInstallment: 12, amount: 9200 },
  { name: "정선축산유통", payDate: "2025-08-31", currentInstallment: 10, totalInstallment: 12, amount: 11600 },
  { name: "이윤세동물병원(1)", payDate: "2025-08-31", currentInstallment: 10, totalInstallment: 12, amount: 26600 },
  { name: "쿠팡(1)", payDate: "2025-09-11", currentInstallment: 9, totalInstallment: 11, amount: 74200 },
  { name: "글렌(1)", payDate: "2025-09-16", currentInstallment: 9, totalInstallment: 12, amount: 12300 },
  { name: "글렌(2)", payDate: "2025-09-16", currentInstallment: 9, totalInstallment: 12, amount: 19500 },
  { name: "삼성화재해상보험(2)", payDate: "2025-09-16", currentInstallment: 9, totalInstallment: 12, amount: 14400 },
  { name: "슈슈멍(1)", payDate: "2025-09-16", currentInstallment: 9, totalInstallment: 12, amount: 17400 },
  { name: "서울교통공사(2)", payDate: "2025-09-16", currentInstallment: 9, totalInstallment: 12, amount: 13500 },
  { name: "데이원컴퍼니", payDate: "2025-10-26", currentInstallment: 8, totalInstallment: 12, amount: 106000 },
  { name: "소액합산16건(1)", payDate: "2026-01-12", currentInstallment: 5, totalInstallment: 6, amount: 48100 },
  { name: "소액합산18건(1)", payDate: "2026-01-12", currentInstallment: 5, totalInstallment: 6, amount: 37900 },
  { name: "쿠팡(2)", payDate: "2026-01-20", currentInstallment: 5, totalInstallment: 7, amount: 20200 },
  { name: "24시센트럴동물메디컬(1)", payDate: "2026-01-28", currentInstallment: 5, totalInstallment: 12, amount: 66500 },
  { name: "놀유니버스(1)", payDate: "2026-01-28", currentInstallment: 5, totalInstallment: 12, amount: 3500 },
  { name: "엘동물병원(1)", payDate: "2026-01-28", currentInstallment: 5, totalInstallment: 12, amount: 31500 },
  { name: "삼성화재해상보험(3)", payDate: "2026-01-28", currentInstallment: 5, totalInstallment: 12, amount: 33600 },
  { name: "소액합산16건(2)", payDate: "2026-01-28", currentInstallment: 5, totalInstallment: 6, amount: 77600 },
  { name: "24시센트럴동물메디컬(2)", payDate: "2026-02-03", currentInstallment: 5, totalInstallment: 12, amount: 74200 },
  { name: "놀유니버스(2)", payDate: "2026-02-03", currentInstallment: 5, totalInstallment: 12, amount: 52500 },
  { name: "소액합산18건(2)", payDate: "2026-02-03", currentInstallment: 5, totalInstallment: 6, amount: 76000 },
  { name: "쿠팡(3)", payDate: "2026-02-07", currentInstallment: 5, totalInstallment: 11, amount: 31800 },
  { name: "서울교통공사(3)", payDate: "2026-02-09", currentInstallment: 5, totalInstallment: 12, amount: 31500 },
  { name: "소액합산25건", payDate: "2026-02-09", currentInstallment: 5, totalInstallment: 6, amount: 63100 },
  { name: "감성공방(1)", payDate: "2026-02-11", currentInstallment: 5, totalInstallment: 12, amount: 65800 },
  { name: "감성공방(2)", payDate: "2026-02-12", currentInstallment: 4, totalInstallment: 12, amount: 65600 },
  { name: "네이버페이(1)", payDate: "2026-02-18", currentInstallment: 4, totalInstallment: 11, amount: 49000 },
  { name: "네이버페이(2)", payDate: "2026-02-18", currentInstallment: 4, totalInstallment: 11, amount: 46900 },
  { name: "네이버페이(3)", payDate: "2026-02-18", currentInstallment: 4, totalInstallment: 11, amount: 46200 },
  { name: "감성공방(3)", payDate: "2026-02-18", currentInstallment: 4, totalInstallment: 12, amount: 66400 },
  { name: "삼성화재해상보험(4)", payDate: "2026-02-20", currentInstallment: 4, totalInstallment: 12, amount: 38400 },
  { name: "쿠팡이츠(1)", payDate: "2026-02-20", currentInstallment: 4, totalInstallment: 12, amount: 36000 },
  { name: "소액합산21건", payDate: "2026-02-20", currentInstallment: 4, totalInstallment: 6, amount: 131800 },
  { name: "소액합산22건", payDate: "2026-02-20", currentInstallment: 4, totalInstallment: 6, amount: 62800 },
  { name: "소액합산30건(1)", payDate: "2026-02-20", currentInstallment: 4, totalInstallment: 6, amount: 30600 },
  { name: "네이버페이(4)", payDate: "2026-02-21", currentInstallment: 4, totalInstallment: 11, amount: 47600 },
  { name: "주식회사 예스코", payDate: "2026-02-28", currentInstallment: 4, totalInstallment: 12, amount: 40800 },
  { name: "소액합산27건", payDate: "2026-02-28", currentInstallment: 4, totalInstallment: 6, amount: 205800 },
  { name: "11번가-11pay", payDate: "2026-03-06", currentInstallment: 4, totalInstallment: 12, amount: 443200 },
  { name: "쿠팡(4)", payDate: "2026-03-06", currentInstallment: 4, totalInstallment: 11, amount: 375200 },
  { name: "삼성화재해상보험(5)", payDate: "2026-03-16", currentInstallment: 3, totalInstallment: 12, amount: 43200 },
  { name: "서울교통공사(4)", payDate: "2026-03-16", currentInstallment: 3, totalInstallment: 12, amount: 45900 },
  { name: "엘동물병원(2)", payDate: "2026-03-16", currentInstallment: 3, totalInstallment: 12, amount: 54900 },
  { name: "소액합산26건", payDate: "2026-03-16", currentInstallment: 3, totalInstallment: 6, amount: 240000 },
  { name: "지마켓", payDate: "2026-03-17", currentInstallment: 3, totalInstallment: 12, amount: 81000 },
  { name: "ALIEXPRESS", payDate: "2026-03-26", currentInstallment: 3, totalInstallment: 10, amount: 39900 },
  { name: "17정글", payDate: "2026-03-26", currentInstallment: 3, totalInstallment: 15, amount: 54000 },
  { name: "주식회사 분독", payDate: "2026-03-26", currentInstallment: 3, totalInstallment: 15, amount: 79200 },
  { name: "주식회사 굿굿스", payDate: "2026-03-26", currentInstallment: 3, totalInstallment: 15, amount: 96000 },
  { name: "소액합산30건(2)", payDate: "2026-03-26", currentInstallment: 3, totalInstallment: 6, amount: 281400 },
  { name: "소액합산28건", payDate: "2026-03-28", currentInstallment: 3, totalInstallment: 6, amount: 118500 },
  { name: "쿠팡(5)", payDate: "2026-04-16", currentInstallment: 2, totalInstallment: 11, amount: 48600 },
  { name: "슈슈멍(2)", payDate: "2026-04-21", currentInstallment: 2, totalInstallment: 12, amount: 50000 },
  { name: "이윤세동물병원(2)", payDate: "2026-04-21", currentInstallment: 2, totalInstallment: 12, amount: 91000 },
  { name: "삼성화재해상보험(6)", payDate: "2026-04-21", currentInstallment: 2, totalInstallment: 12, amount: 48000 },
  { name: "서울교통공사(5)", payDate: "2026-04-21", currentInstallment: 2, totalInstallment: 12, amount: 45000 },
  { name: "소액합산30건(3)", payDate: "2026-04-21", currentInstallment: 2, totalInstallment: 6, amount: 504000 },
  { name: "소액합산13건", payDate: "2026-04-21", currentInstallment: 2, totalInstallment: 6, amount: 108000 },
  { name: "소액합산30건(4)", payDate: "2026-04-23", currentInstallment: 2, totalInstallment: 6, amount: 88000 },
  { name: "소액합산10건(1)", payDate: "2026-04-23", currentInstallment: 2, totalInstallment: 6, amount: 39200 },
  { name: "CLAUDE.AI", payDate: "2026-04-28", currentInstallment: 2, totalInstallment: 12, amount: 276000 },
  { name: "소액합산18건(2)", payDate: "2026-04-28", currentInstallment: 2, totalInstallment: 6, amount: 222000 },
  { name: "삼성화재해상보험(7)", payDate: "2026-05-12", currentInstallment: 1, totalInstallment: 12, amount: 52800 },
  { name: "이마트 왕십리점", payDate: "2026-05-12", currentInstallment: 1, totalInstallment: 12, amount: 47300 },
  { name: "아웃백스테이크하우스 왕십리", payDate: "2026-05-12", currentInstallment: 1, totalInstallment: 12, amount: 66000 },
  { name: "엔터6에프인에프", payDate: "2026-05-12", currentInstallment: 1, totalInstallment: 12, amount: 181500 },
  { name: "서울교통공사(6)", payDate: "2026-05-12", currentInstallment: 1, totalInstallment: 12, amount: 49500 },
  { name: "돈구네 참숯구이", payDate: "2026-05-12", currentInstallment: 1, totalInstallment: 12, amount: 75900 },
  { name: "이윤세동물병원(3)", payDate: "2026-05-12", currentInstallment: 1, totalInstallment: 12, amount: 86900 },
  { name: "롯데백화점 이솝", payDate: "2026-05-13", currentInstallment: 1, totalInstallment: 12, amount: 53900 },
  { name: "롯데백화점 록시땅", payDate: "2026-05-13", currentInstallment: 1, totalInstallment: 12, amount: 60500 },
  { name: "소액합산16건(3)", payDate: "2026-05-13", currentInstallment: 1, totalInstallment: 6, amount: 356000 },
  { name: "네이버페이(5)", payDate: "2026-05-14", currentInstallment: 1, totalInstallment: 11, amount: 148000 },
  { name: "프로젝트감", payDate: "2026-05-17", currentInstallment: 1, totalInstallment: 12, amount: 204600 },
  { name: "네이버페이(6)", payDate: "2026-05-17", currentInstallment: 1, totalInstallment: 7, amount: 60000 },
  { name: "네이버페이(7)", payDate: "2026-05-20", currentInstallment: 1, totalInstallment: 11, amount: 62000 },
  { name: "쿠팡이츠(2)", payDate: "2026-05-21", currentInstallment: 1, totalInstallment: 12, amount: 55000 },
  { name: "소액합산30건(5)", payDate: "2026-05-21", currentInstallment: 1, totalInstallment: 6, amount: 465000 },
  { name: "큐어라이프", payDate: "2026-05-22", currentInstallment: 1, totalInstallment: 12, amount: 60500 },
  { name: "무인양품 아이파크몰점", payDate: "2026-05-25", currentInstallment: 1, totalInstallment: 12, amount: 46200 },
  { name: "소액합산10건(2)", payDate: "2026-05-25", currentInstallment: 1, totalInstallment: 6, amount: 160500 },
  { name: "인프랩", payDate: "2026-05-29", currentInstallment: 1, totalInstallment: 11, amount: 177000 },
  { name: "올리브영 구로지밸리몰점", payDate: "2026-06-05", currentInstallment: 1, totalInstallment: 12, amount: 83600 },
  { name: "롯데월드몰점", payDate: "2026-06-12", currentInstallment: 0, totalInstallment: 12, amount: 58600 },
  { name: "주식회사 와그", payDate: "2026-06-12", currentInstallment: 0, totalInstallment: 12, amount: 79380 },
  { name: "서울교통공사(7)", payDate: "2026-06-12", currentInstallment: 0, totalInstallment: 12, amount: 55000 },
  { name: "소액합산30건(6)", payDate: "2026-06-12", currentInstallment: 0, totalInstallment: 6, amount: 859878 },
  { name: "소액합산24건", payDate: "2026-06-13", currentInstallment: 0, totalInstallment: 6, amount: 275960 },
];

async function main() {
  await prisma.installment.deleteMany();

  for (const item of data) {
    await prisma.installment.create({ data: item });
  }

  console.log(`Seeded ${data.length} installment records.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
