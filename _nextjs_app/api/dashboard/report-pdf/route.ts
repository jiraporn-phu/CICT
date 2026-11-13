import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import fs from "fs";
import path from "path";

export const dynamic = 'force-dynamic';

const getFontBase64 = (fontFileName: string) => {
  try {
    const cwd = process.cwd();
    const possiblePaths = [
      path.join(cwd, "public", "fonts", fontFileName),
      path.join("C:/Users/premm/Downloads/THSarabunNew", fontFileName),
      path.join("C:/Windows/Fonts", fontFileName),
    ];

    for (const fontPath of possiblePaths) {
      if (fs.existsSync(fontPath)) {
        console.log(`PDF Report API: Loading font from ${fontPath}`);
        return fs.readFileSync(fontPath).toString("base64");
      }
    }
    console.error(`PDF Report API: Font NOT FOUND: ${fontFileName}`);
  } catch (err) {
    console.error(`Font find error (${fontFileName}):`, err);
  }
  return null;
};

const formatThaiBE = (date: Date | null) => {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("th-TH-u-ca-buddhist", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
};

export async function GET(request: Request) {
  console.log("PDF Report API: Starting generation with TH Sarabun New...");
  const { searchParams } = new URL(request.url);
  const selectedDate = searchParams.get("date");
  const selectedMonth = searchParams.get("month");
  const selectedYear = searchParams.get("year");
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");
  const orientation = (searchParams.get("orientation") || "landscape") as "landscape" | "portrait";

  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {

    const [equipmentData, borrowsData, activeBorrows] = await Promise.all([
      prisma.equipment.findMany({ 
        include: { borrows: true },
        orderBy: { category: 'asc' }
      }),
      prisma.borrowTransaction.findMany({ 
        include: { equipment: true, borrower: true }, 
        orderBy: { createdAt: 'desc' } 
      }),
      prisma.borrowTransaction.findMany({
        where: { status: { in: ['borrowed', 'overdue'] } },
        include: { equipment: true, borrower: true },
        orderBy: { dueDate: 'asc' }
      })
    ]);

    let periodBorrows = borrowsData;
    let reportTitleSuffix = "ข้อมูลทั้งหมด";

    if (selectedDate) {
      periodBorrows = borrowsData.filter(b => b.createdAt.toLocaleDateString('en-CA', { timeZone: 'Asia/Bangkok' }) === selectedDate);
      reportTitleSuffix = `ประจำวันที่ ${new Date(selectedDate).toLocaleDateString('th-TH-u-ca-buddhist', { day: 'numeric', month: 'long', year: 'numeric' })}`;
    } else if (selectedMonth) {
      periodBorrows = borrowsData.filter(b => b.createdAt.toLocaleDateString('en-CA', { timeZone: 'Asia/Bangkok' }).startsWith(selectedMonth));
      reportTitleSuffix = `ประจำเดือน ${new Date(selectedMonth + '-02').toLocaleDateString('th-TH-u-ca-buddhist', { month: 'long', year: 'numeric' })}`;
    } else if (selectedYear) {
      periodBorrows = borrowsData.filter(b => b.createdAt.toLocaleDateString('en-CA', { timeZone: 'Asia/Bangkok' }).startsWith(selectedYear));
      reportTitleSuffix = `ประจำปี พ.ศ. ${parseInt(selectedYear) + 543}`;
    } else if (startDate && endDate) {
      periodBorrows = borrowsData.filter(b => {
        const cDate = b.createdAt.toLocaleDateString('en-CA', { timeZone: 'Asia/Bangkok' });
        return cDate >= startDate && cDate <= endDate;
      });
      reportTitleSuffix = `ช่วงวันที่ ${formatThaiBE(new Date(startDate))} ถึง ${formatThaiBE(new Date(endDate))}`;
    }

    const doc = new jsPDF({
      orientation: orientation,
      unit: 'mm',
      format: 'a4'
    });

    const fontName = "Sarabun";
    const normalFont = getFontBase64("THSarabunNew.ttf");
    const boldFont = getFontBase64("THSarabunNew Bold.ttf");

    if (normalFont) {
      doc.addFileToVFS("thsarabun.ttf", normalFont);
      doc.addFont("thsarabun.ttf", fontName, "normal");
      doc.setFont(fontName, "normal");
    }
    if (boldFont) {
      doc.addFileToVFS("thsarabun-bold.ttf", boldFont);
      doc.addFont("thsarabun-bold.ttf", fontName, "bold");
    }

    doc.setFont(fontName, "bold");
    doc.setFontSize(22);
    doc.setTextColor(30, 41, 59);
    doc.text("ICTC ASSET MANAGEMENT", 14, 20);
    
    doc.setFontSize(14);
    doc.setTextColor(100, 116, 139);
    doc.text("รายงานสรุปผลการจัดการทรัพย์สินและอุปกรณ์", 14, 28);
    
    doc.setFont(fontName, "normal");
    doc.setFontSize(10);
    doc.text(`ขอบเขตข้อมูล: ${reportTitleSuffix}`, 14, 38);
    doc.text(`ผู้ออกรายงาน: ${session.user?.name || "Admin"}`, 14, 43);
    doc.text(`วันที่จัดทำ: ${formatThaiBE(new Date())} ${new Date().toLocaleTimeString('th-TH-u-ca-buddhist')}`, 14, 48);

    const totalQty = equipmentData.reduce((s, i) => s + i.quantity, 0);
    const currentlyBorrowedQty = activeBorrows.filter(b => (b as any).transactionType === "BORROW").reduce((s, b) => s + b.borrowQuantity, 0);
    const pendingCount = periodBorrows.filter(b => b.status === 'pending').length;
    const overdueCount = activeBorrows.filter(b => b.status === 'overdue').length;
    const requisitionCount = periodBorrows.filter(b => (b as any).transactionType === "REQUISITION" && b.status === "requisitioned").length;

    autoTable(doc, {
      startY: 55,
      head: [['สรุปข้อมูลภาพรวม', 'จำนวน', 'หน่วย']],
      body: [
        ['อุปกรณ์ทั้งหมด (รายการ)', equipmentData.length, 'รายการ'],
        ['จำนวนชิ้นอุปกรณ์รวมทั้งหมด', totalQty, 'ชิ้น'],
        ['คำขอ ยืม-เบิก อุปกรณ์ ที่รออนุมัติ', pendingCount, 'รายการ'],
        ['จำนวนอุปกรณ์ที่กำลังถูกยืมอยู่', currentlyBorrowedQty, 'ชิ้น'],
        ['เกินกำหนดคืนอุปกรณ์', overdueCount, 'รายการ'],
        ['จำนวนอุปกรณ์ที่ถูกเบิกไปในช่วงนี้', requisitionCount, 'ชิ้น'],
        ['ความเคลื่อนไหวในช่วงเวลาที่เลือก', periodBorrows.length, 'ครั้ง'],
      ],
      theme: 'grid',
      headStyles: { 
        fillColor: [30, 41, 59], // Slate 800
        halign: 'center', 
        font: fontName, 
        fontStyle: 'bold',
        lineWidth: 0.1,
        lineColor: [0, 0, 0]
      },
      columnStyles: { 0: { halign: 'left' }, 1: { halign: 'center' }, 2: { halign: 'center' } },
      styles: { 
        fontSize: 11, 
        font: fontName, 
        cellPadding: 2,
        lineWidth: 0.1,
        lineColor: [0, 0, 0]
      }
    });

    // 1. Inventory Details
    doc.setFont(fontName, "bold");
    doc.setFontSize(14);
    doc.setTextColor(15, 23, 42);
    const currentY1 = (doc as any).lastAutoTable.finalY + 15;
    doc.text("1. รายละเอียดอุปกรณ์", 14, currentY1);
    
    const inventoryBody = equipmentData.length > 0 ? equipmentData.map(item => {
      const borrowed = item.borrows.filter(b => b.status === "borrowed" || b.status === "overdue").reduce((s, b) => s + b.borrowQuantity, 0);
      const available = item.quantity - borrowed;
      return [item.category, item.name, item.quantity, available, available > 0 ? "พร้อมให้ยืม" : "หมดสต็อก"];
    }) : [["-", "-", "-", "-", "-"]];

    autoTable(doc, {
      startY: currentY1 + 5,
      head: [['หมวดหมู่', 'รายการอุปกรณ์', 'จำนวนรวม', 'คงเหลือ', 'สถานะ']],
      body: inventoryBody,
      theme: 'grid',
      headStyles: { 
        fillColor: [3, 105, 161], 
        font: fontName, 
        fontStyle: 'bold',
        halign: 'center',
        lineWidth: 0.1,
        lineColor: [0, 0, 0]
      },
      columnStyles: { 0: { halign: 'left' }, 1: { halign: 'left' }, 2: { halign: 'center' }, 3: { halign: 'center' }, 4: { halign: 'left' } },
      styles: { 
        fontSize: 10, 
        font: fontName, 
        cellPadding: 2,
        lineWidth: 0.1,
        lineColor: [0, 0, 0]
      }
    });

    // 2. Active Borrows
    const periodActiveBorrows = activeBorrows.filter(b => {
      const bDate = b.borrowDate.toLocaleDateString('en-CA', { timeZone: 'Asia/Bangkok' });
      const matchesDate = selectedDate ? bDate === selectedDate :
                        selectedMonth ? bDate.startsWith(selectedMonth) :
                        selectedYear ? bDate.startsWith(selectedYear) :
                        (startDate && endDate) ? (bDate >= startDate && bDate <= endDate) : true;
      return matchesDate && (b as any).transactionType === "BORROW";
    });

    const currentY2 = (doc as any).lastAutoTable.finalY + 15;
    const shouldAddPage2 = currentY2 > 250;
    const finalStartY2 = shouldAddPage2 ? 20 : currentY2;
    if (shouldAddPage2) doc.addPage();

    doc.setFont(fontName, "bold");
    doc.setFontSize(14);
    doc.text("2. รายการอุปกรณ์ที่กำลังยืมอยู่", 14, finalStartY2);

    autoTable(doc, {
      startY: finalStartY2 + 5,
      head: [['ผู้ยืมอุปกรณ์', 'เบอร์โทรศัพท์', 'รายการอุปกรณ์', 'จำนวน', 'วันที่ยืม', 'กำหนดคืน', 'สถานะ']],
      body: periodActiveBorrows.length > 0 ? periodActiveBorrows.map(b => [
        b.borrower?.fullName || b.borrower?.username || "-",
        b.borrower?.phone || "-",
        b.equipment?.name || "-",
        b.borrowQuantity,
        formatThaiBE(b.borrowDate),
        formatThaiBE(b.dueDate),
        b.status === "overdue" ? "เกินกำหนด" : "รอคืนอุปกรณ์"
      ]) : [["-", "-", "-", "-", "-", "-", "-"]],
      theme: 'grid',
      headStyles: { 
        fillColor: [217, 119, 6], 
        font: fontName, 
        fontStyle: 'bold',
        halign: 'center',
        lineWidth: 0.1,
        lineColor: [0, 0, 0]
      },
      columnStyles: { 0: { halign: 'left' }, 1: { halign: 'left' }, 2: { halign: 'left' }, 3: { halign: 'center' }, 4: { halign: 'center' }, 5: { halign: 'center' }, 6: { halign: 'left' } },
      styles: { 
        fontSize: 9, 
        font: fontName, 
        cellPadding: 2,
        lineWidth: 0.1,
        lineColor: [0, 0, 0]
      },
      didParseCell: (data) => {
        if (data.section === 'body' && data.column.index === 6) {
          if (data.cell.text[0] === 'เกินกำหนด') {
            data.cell.styles.textColor = [220, 38, 38]; // Red-600
            data.cell.styles.fontStyle = 'bold';
          }
        }
      }
    });

    // 3. Requisitioned Items
    const periodRequisitions = periodBorrows.filter(b => 
      (b as any).transactionType === "REQUISITION" && b.status === "requisitioned"
    );

    const currentY3 = (doc as any).lastAutoTable.finalY + 15;
    const shouldAddPage3 = currentY3 > 250;
    const finalStartY3 = shouldAddPage3 ? 20 : currentY3;
    if (shouldAddPage3) doc.addPage();

    doc.setFont(fontName, "bold");
    doc.setFontSize(14);
    doc.text("3. รายการอุปกรณ์ที่ถูกเบิกไป", 14, finalStartY3);

    autoTable(doc, {
      startY: finalStartY3 + 5,
      head: [['ผู้เบิกอุปกรณ์', 'เบอร์โทรศัพท์', 'รายการอุปกรณ์', 'จำนวน', 'วันที่เบิก']],
      body: periodRequisitions.length > 0 ? periodRequisitions.map(b => [
        b.borrower?.fullName || b.borrower?.username || "-",
        b.borrower?.phone || "-",
        b.equipment?.name || "-",
        b.borrowQuantity,
        formatThaiBE(b.borrowDate)
      ]) : [["-", "-", "-", "-", "-"]],
      theme: 'grid',
      headStyles: { 
        fillColor: [13, 148, 136], 
        font: fontName, 
        fontStyle: 'bold',
        halign: 'center',
        lineWidth: 0.1,
        lineColor: [0, 0, 0]
      },
      columnStyles: { 0: { halign: 'left' }, 1: { halign: 'left' }, 2: { halign: 'left' }, 3: { halign: 'center' }, 4: { halign: 'center' } },
      styles: { 
        fontSize: 10, 
        font: fontName, 
        cellPadding: 2,
        lineWidth: 0.1,
        lineColor: [0, 0, 0]
      }
    });

    // 4. Activity Log
    const activityData = periodBorrows.slice(0, 50).map(b => [
      b.borrower?.fullName || b.borrower?.username || "-",
      b.borrower?.phone || "-",
      b.equipment?.name || "-",
      b.borrowQuantity,
      b.status === "borrowed" ? "อนุมัติแล้ว" : b.status === "returned" ? "คืนอุปกรณ์แล้ว" : b.status === "pending" ? "รออนุมัติ" : b.status === "rejected" ? "ไม่อนุมัติ" : b.status === "requisitioned" ? "อนุมัติการเบิกแล้ว" : b.status,
      formatThaiBE(b.createdAt)
    ]);

    const currentY4 = (doc as any).lastAutoTable.finalY + 15;
    const shouldAddPage4 = currentY4 > 250;
    const finalStartY4 = shouldAddPage4 ? 20 : currentY4;
    if (shouldAddPage4) doc.addPage();

    doc.setFont(fontName, "bold");
    doc.setFontSize(14);
    doc.text("4. ความเคลื่อนไหวล่าสุด", 14, finalStartY4);

    autoTable(doc, {
      startY: finalStartY4 + 5,
      head: [['ผู้ดำเนินการ', 'เบอร์โทรศัพท์', 'รายการอุปกรณ์', 'จำนวน', 'กิจกรรม', 'วันที่']],
      body: activityData.length > 0 ? activityData : [["-", "-", "-", "-", "-", "-"]],
      theme: 'grid',
      headStyles: { 
        fillColor: [30, 27, 75], 
        font: fontName, 
        fontStyle: 'bold',
        halign: 'center',
        lineWidth: 0.1,
        lineColor: [0, 0, 0]
      },
      columnStyles: { 0: { halign: 'left' }, 1: { halign: 'left' }, 2: { halign: 'left' }, 3: { halign: 'center' }, 4: { halign: 'left' }, 5: { halign: 'center' } },
      styles: { 
        fontSize: 9, 
        font: fontName, 
        cellPadding: 2,
        lineWidth: 0.1,
        lineColor: [0, 0, 0]
      }
    });

    const pdfBuffer = doc.output("arraybuffer");
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="ictc_inventory_report.pdf"`,
      },
    });

  } catch (error) {
    console.error("PDF API Error:", error);
    return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 });
  }
}
