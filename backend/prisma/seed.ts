import "dotenv/config";
import bcrypt from "bcrypt";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, Role, TransactionType } from "../generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  // 1. Clear old data (children first, parents last)
  await prisma.alert.deleteMany();
  await prisma.stockTransaction.deleteMany();
  await prisma.stock.deleteMany();
  await prisma.user.deleteMany();
  await prisma.medicine.deleteMany();
  await prisma.facility.deleteMany();

  // 2. Facilities
  const kenyatta = await prisma.facility.create({
    data: { name: "Kenyatta Pharmacy", county: "Nairobi", address: "Moi Avenue", phone: "0700000001" },
  });
  const machakos = await prisma.facility.create({
    data: { name: "Machakos Level 5 Clinic", county: "Machakos", address: "Mwatu Wa Ngoma Rd", phone: "0700000002" },
  });
  const matuu = await prisma.facility.create({
    data: { name: "Matuu Health Centre", county: "Machakos", address: "Matuu Town", phone: "0700000003" },
  });

  // 3. Users (passwords are hashed, never stored as plain text)
  const passwordHash = await bcrypt.hash("Password123!", 10);

  await prisma.user.create({
    data: { name: "Grace Admin", email: "admin@stockbridge.test", passwordHash, role: Role.ADMIN, facilityId: kenyatta.id },
  });
  const pharmKenyatta = await prisma.user.create({
    data: { name: "John Mwangi", email: "john@stockbridge.test", passwordHash, role: Role.PHARMACIST, facilityId: kenyatta.id },
  });
  const pharmMachakos = await prisma.user.create({
    data: { name: "Mary Kamau", email: "mary@stockbridge.test", passwordHash, role: Role.PHARMACIST, facilityId: machakos.id },
  });
  const pharmMatuu = await prisma.user.create({
    data: { name: "Peter Mutua", email: "peter@stockbridge.test", passwordHash, role: Role.PHARMACIST, facilityId: matuu.id },
  });

  // 4. Medicines
  const amoxicillin = await prisma.medicine.create({ data: { name: "Amoxicillin", strength: "500mg", unit: "capsule" } });
  const paracetamol = await prisma.medicine.create({ data: { name: "Paracetamol", strength: "500mg", unit: "tablet" } });
  const ors = await prisma.medicine.create({ data: { name: "ORS", strength: "20.5g", unit: "sachet" } });
  const coartem = await prisma.medicine.create({ data: { name: "Artemether-Lumefantrine", strength: "20/120mg", unit: "tablet" } });
  const metformin = await prisma.medicine.create({ data: { name: "Metformin", strength: "500mg", unit: "tablet" } });

  // 5. Stock rows: who has what, and how much
  const stockPlan = [
    { facility: kenyatta, pharmacist: pharmKenyatta, medicine: amoxicillin, quantity: 200, threshold: 50 },
    { facility: kenyatta, pharmacist: pharmKenyatta, medicine: paracetamol, quantity: 500, threshold: 100 },
    { facility: kenyatta, pharmacist: pharmKenyatta, medicine: ors, quantity: 30, threshold: 40 }, // LOW
    { facility: machakos, pharmacist: pharmMachakos, medicine: paracetamol, quantity: 150, threshold: 100 },
    { facility: machakos, pharmacist: pharmMachakos, medicine: coartem, quantity: 12, threshold: 30 }, // LOW
    { facility: machakos, pharmacist: pharmMachakos, medicine: metformin, quantity: 300, threshold: 60 },
    { facility: matuu, pharmacist: pharmMatuu, medicine: amoxicillin, quantity: 0, threshold: 20 }, // OUT
    { facility: matuu, pharmacist: pharmMatuu, medicine: ors, quantity: 80, threshold: 40 },
  ];

  for (const item of stockPlan) {
    const stock = await prisma.stock.create({
      data: {
        facilityId: item.facility.id,
        medicineId: item.medicine.id,
        quantity: item.quantity,
        lowStockThreshold: item.threshold,
      },
    });

    // History: one delivery that explains the balance
    if (item.quantity > 0) {
      await prisma.stockTransaction.create({
        data: {
          type: TransactionType.STOCK_IN,
          quantity: item.quantity,
          note: "Initial seed delivery",
          stockId: stock.id,
          userId: item.pharmacist.id,
        },
      });
    }

    // Alert if stock is at or below its threshold
    if (item.quantity <= item.threshold) {
      await prisma.alert.create({
        data: { stockId: stock.id, quantityAtAlert: item.quantity },
      });
    }
  }

  console.log("Seed complete");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });