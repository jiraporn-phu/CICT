const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('--- Repairing initialQuantity for existing equipment ---');
  const equipment = await prisma.equipment.findMany({
    include: {
      borrows: {
        where: {
          transactionType: "REQUISITION",
          status: "requisitioned"
        }
      }
    }
  });
  
  let updateCount = 0;
  for (const item of equipment) {
    const requisitionedTotal = item.borrows.reduce((sum, b) => sum + b.borrowQuantity, 0);
    const correctInitialQty = item.quantity + requisitionedTotal;
    
    // Safety check: Don't let it be 0 if there were transactions or if it's new
    const finalInitialQty = Math.max(correctInitialQty, 1);
    
    if (item.initialQuantity !== finalInitialQty) {
      console.log(`Updating ${item.name}: CurrentStock=${item.quantity}, Requisitioned=${requisitionedTotal}, New Initial=${finalInitialQty}`);
      await prisma.equipment.update({
        where: { id: item.id },
        data: { initialQuantity: finalInitialQty }
      });
      updateCount++;
    }
  }
  
  console.log(`\nRepair completed. Updated ${updateCount} items.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
