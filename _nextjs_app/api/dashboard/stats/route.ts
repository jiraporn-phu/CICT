import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const selectedDate = searchParams.get("date");
  const selectedMonth = searchParams.get("month");
  const selectedYear = searchParams.get("year");
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");

  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const [equipment, users, borrows] = await Promise.all([
      prisma.equipment.findMany({ 
        include: { borrows: true } 
      }),
      prisma.user.findMany({
        select: { 
          id: true, 
          username: true, 
          fullName: true, 
          department: true,
          status: true 
        }
      }),
      prisma.borrowTransaction.findMany({ 
        include: { 
          equipment: {
            select: { id: true, name: true, category: true, department: true }
          }, 
          borrower: {
            select: { id: true, username: true, fullName: true, department: true }
          }
        }, 
        orderBy: { createdAt: 'desc' } 
      })
    ]);

    const thTodayStr = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Bangkok' });
    const currentMonthStr = thTodayStr.slice(0, 7);

    const totalEquipment = equipment.length;
    const totalPhysicalUnits = equipment.reduce((sum, item) => sum + item.quantity, 0);

    const borrowedCount = equipment.filter(item => {
        const itemBorrowed = item.borrows.filter(b => b.status === "borrowed").reduce((s, b) => s + b.borrowQuantity, 0);
        return itemBorrowed > 0;
    }).length;

    const available = equipment.filter(item => {
        const itemBorrowed = item.borrows.filter(b => b.status === "borrowed").reduce((s, b) => s + b.borrowQuantity, 0);
        return (item.quantity - itemBorrowed) > 0;
    }).length;

    const overdueReturns = borrows.filter(b => {
        if (b.status !== "borrowed" && b.status !== "overdue") return false;
        const bDueDateStr = b.dueDate.toLocaleDateString('en-CA', { timeZone: 'Asia/Bangkok' });
        return bDueDateStr < thTodayStr;
    }).length;
    
    const pendingRequests = borrows.filter(b => b.status === "pending").length;

    let activitiesSource = borrows;
    let equipmentSource = equipment;
    let filterTitle = "ทั้งหมด";

    if (selectedDate) {
        activitiesSource = borrows.filter(b => {
            const cDate = b.createdAt.toLocaleDateString('en-CA', { timeZone: 'Asia/Bangkok' });
            const rDate = b.returnDate?.toLocaleDateString('en-CA', { timeZone: 'Asia/Bangkok' });
            return cDate === selectedDate || rDate === selectedDate;
        });
        equipmentSource = equipment.filter(e => e.createdAt.toLocaleDateString('en-CA', { timeZone: 'Asia/Bangkok' }) === selectedDate);
        filterTitle = `วันที่ ${new Date(selectedDate).toLocaleDateString('th-TH-u-ca-buddhist', { day: 'numeric', month: 'long', year: 'numeric' })}`;
    } else if (selectedMonth) {
        activitiesSource = borrows.filter(b => {
            const cMonth = b.createdAt.toLocaleDateString('en-CA', { timeZone: 'Asia/Bangkok' }).slice(0, 7);
            const rMonth = b.returnDate?.toLocaleDateString('en-CA', { timeZone: 'Asia/Bangkok' }).slice(0, 7);
            return cMonth === selectedMonth || rMonth === selectedMonth;
        });
        equipmentSource = equipment.filter(e => e.createdAt.toLocaleDateString('en-CA', { timeZone: 'Asia/Bangkok' }).startsWith(selectedMonth));
        filterTitle = `เดือน ${new Date(selectedMonth + '-02').toLocaleDateString('th-TH-u-ca-buddhist', { month: 'long', year: 'numeric' })}`;
    } else if (selectedYear) {
        activitiesSource = borrows.filter(b => {
            const cYear = b.createdAt.toLocaleDateString('en-CA', { timeZone: 'Asia/Bangkok' }).slice(0, 4);
            const rYear = b.returnDate?.toLocaleDateString('en-CA', { timeZone: 'Asia/Bangkok' }).slice(0, 4);
            return cYear === selectedYear || rYear === selectedYear;
        });
        equipmentSource = equipment.filter(e => e.createdAt.toLocaleDateString('en-CA', { timeZone: 'Asia/Bangkok' }).startsWith(selectedYear));
        filterTitle = `ปี พ.ศ. ${parseInt(selectedYear) + 543}`;
    } else if (startDate && endDate) {
        activitiesSource = borrows.filter(b => {
            const cDate = b.createdAt.toLocaleDateString('en-CA', { timeZone: 'Asia/Bangkok' });
            const rDate = b.returnDate?.toLocaleDateString('en-CA', { timeZone: 'Asia/Bangkok' });
            return (cDate >= startDate && cDate <= endDate) || (rDate && rDate >= startDate && rDate <= endDate);
        });
        equipmentSource = equipment.filter(e => {
            const itemDate = e.createdAt.toLocaleDateString('en-CA', { timeZone: 'Asia/Bangkok' });
            return itemDate >= startDate && itemDate <= endDate;
        });
        const startThai = new Date(startDate).toLocaleDateString('th-TH-u-ca-buddhist', { day: 'numeric', month: 'short', year: 'numeric' });
        const endThai = new Date(endDate).toLocaleDateString('th-TH-u-ca-buddhist', { day: 'numeric', month: 'short', year: 'numeric' });
        filterTitle = `${startThai} - ${endThai}`;
    }

    const currentPeriodActivities = activitiesSource.length;
    const currentPeriodNewItems = equipmentSource.length;

    const catMap = new Map<string, number>();
    const itMap = new Map<string, number>();
    const prMap = new Map<string, number>();

    if (selectedDate || selectedMonth || selectedYear || (startDate && endDate)) {
        activitiesSource.forEach(b => {
            const cat = b.equipment?.category || "Unknown";
            catMap.set(cat, (catMap.get(cat) || 0) + b.borrowQuantity);
            
            const dept = b.equipment?.department;
            if (dept === "IT") itMap.set(cat, (itMap.get(cat) || 0) + b.borrowQuantity);
            if (dept === "PR") prMap.set(cat, (prMap.get(cat) || 0) + b.borrowQuantity);
        });
    } else {
        equipment.forEach(e => {
            catMap.set(e.category, (catMap.get(e.category) || 0) + e.quantity);
            
            if (e.department === "IT") itMap.set(e.category, (itMap.get(e.category) || 0) + e.quantity);
            if (e.department === "PR") prMap.set(e.category, (prMap.get(e.category) || 0) + e.quantity);
        });
    }

    const categoryDistribution = Array.from(catMap.entries()).map(([name, value], index) => ({
        name,
        value,
        color: ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"][index % 5] || "#cbd5e1"
    }));

    const itDistribution = Array.from(itMap.entries()).map(([name, value], index) => ({
        name,
        value,
        color: ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"][index % 5] || "#cbd5e1"
    }));

    const prDistribution = Array.from(prMap.entries()).map(([name, value], index) => ({
        name,
        value,
        color: ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"][index % 5] || "#cbd5e1"
    }));

    let chartData: { month: string; borrowed: number; returned: number; added: number }[] = [];

    if (selectedDate) {
        const hourMap = new Map<number, { borrowed: number, returned: number, added: number }>();
        for (let i = 0; i < 24; i++) hourMap.set(i, { borrowed: 0, returned: 0, added: 0 });

        activitiesSource.forEach(b => {
            if (b.status === "borrowed" || b.status === "pending" || b.status === "approved") {
                const hour = new Date(b.createdAt).getHours();
                hourMap.get(hour)!.borrowed += b.borrowQuantity;
            }
            if (b.returnDate) {
                const hour = new Date(b.returnDate).getHours();
                hourMap.get(hour)!.returned += b.borrowQuantity;
            }
        });
        equipmentSource.forEach(e => {
            const hour = new Date(e.createdAt).getHours();
            hourMap.get(hour)!.added++;
        });

        chartData = Array.from(hourMap.entries()).map(([hour, val]) => ({
            month: `${hour.toString().padStart(2, '0')}:00`,
            monthKey: `${selectedDate}-${hour.toString().padStart(2, '0')}`,
            ...val
        }));
    } else if (selectedMonth) {
        const daysInMonth = new Date(parseInt(selectedMonth.split('-')[0]), parseInt(selectedMonth.split('-')[1]), 0).getDate();
        const dayMap = new Map<number, { borrowed: number, returned: number, added: number }>();
        for (let i = 1; i <= daysInMonth; i++) dayMap.set(i, { borrowed: 0, returned: 0, added: 0 });

        activitiesSource.forEach(b => {
            const d = new Date(b.createdAt).getDate();
            const rd = b.returnDate ? new Date(b.returnDate).getDate() : null;
            
            const bMonth = b.createdAt.toLocaleDateString('en-CA', { timeZone: 'Asia/Bangkok' }).slice(0, 7);
            if (bMonth === selectedMonth) dayMap.get(d)!.borrowed += b.borrowQuantity;
            
            if (rd && b.returnDate?.toLocaleDateString('en-CA', { timeZone: 'Asia/Bangkok' }).slice(0, 7) === selectedMonth) {
                dayMap.get(rd)!.returned += b.borrowQuantity;
            }
        });
        equipmentSource.forEach(e => {
            const d = new Date(e.createdAt).getDate();
            dayMap.get(d)!.added++;
        });

        chartData = Array.from(dayMap.entries()).map(([day, val]) => ({
            month: day.toString(),
            monthKey: `${selectedMonth}-${day.toString().padStart(2, '0')}`,
            ...val
        }));
    } else if (selectedYear) {
        const months = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
        const yearMap = new Map<number, { borrowed: number, returned: number, added: number }>();
        for (let i = 0; i < 12; i++) yearMap.set(i, { borrowed: 0, returned: 0, added: 0 });

        activitiesSource.forEach(b => {
            const m = new Date(b.createdAt).getMonth();
            const rm = b.returnDate ? new Date(b.returnDate).getMonth() : null;

            if (b.createdAt.getFullYear().toString() === selectedYear) yearMap.get(m)!.borrowed += b.borrowQuantity;
            if (rm !== null && b.returnDate?.getFullYear().toString() === selectedYear) yearMap.get(rm)!.returned += b.borrowQuantity;
        });
        equipmentSource.forEach(e => {
            const m = new Date(e.createdAt).getMonth();
            yearMap.get(m)!.added++;
        });

        chartData = Array.from(yearMap.entries()).map(([mIdx, val]) => ({
            month: months[mIdx],
            monthKey: `${selectedYear}-${(mIdx + 1).toString().padStart(2, '0')}`,
            ...val
        }));
    } else if (startDate && endDate) {

        const start = new Date(startDate);
        const end = new Date(endDate);
        const dayMap = new Map<string, { borrowed: number, returned: number, added: number }>();
        
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            const key = d.toLocaleDateString('en-CA', { timeZone: 'Asia/Bangkok' });
            dayMap.set(key, { borrowed: 0, returned: 0, added: 0 });
        }

        activitiesSource.forEach(b => {
            const bDate = b.createdAt.toLocaleDateString('en-CA', { timeZone: 'Asia/Bangkok' });
            if (dayMap.has(bDate)) dayMap.get(bDate)!.borrowed += b.borrowQuantity;
            
            if (b.returnDate) {
                const rDate = b.returnDate.toLocaleDateString('en-CA', { timeZone: 'Asia/Bangkok' });
                if (dayMap.has(rDate)) dayMap.get(rDate)!.returned += b.borrowQuantity;
            }
        });
        equipmentSource.forEach(e => {
            const eDate = e.createdAt.toLocaleDateString('en-CA', { timeZone: 'Asia/Bangkok' });
            if (dayMap.has(eDate)) dayMap.get(eDate)!.added++;
        });

        chartData = Array.from(dayMap.entries()).map(([key, val]) => ({
            month: new Date(key).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' }),
            monthKey: key,
            ...val
        }));
    } else {
        const monthlyMap = new Map<string, { borrowed: number, returned: number, added: number }>();
        borrows.forEach(b => {
            const m = b.borrowDate.toLocaleDateString('en-CA', { timeZone: 'Asia/Bangkok' }).slice(0, 7);
            if (!monthlyMap.has(m)) monthlyMap.set(m, { borrowed: 0, returned: 0, added: 0 });
            monthlyMap.get(m)!.borrowed += b.borrowQuantity;
            if (b.returnDate) {
                const rm = b.returnDate.toLocaleDateString('en-CA', { timeZone: 'Asia/Bangkok' }).slice(0, 7);
                if (!monthlyMap.has(rm)) monthlyMap.set(rm, { borrowed: 0, returned: 0, added: 0 });
                monthlyMap.get(rm)!.returned += b.borrowQuantity;
            }
        });
        equipment.forEach(e => {
            const m = e.createdAt.toLocaleDateString('en-CA', { timeZone: 'Asia/Bangkok' }).slice(0, 7);
            if (!monthlyMap.has(m)) monthlyMap.set(m, { borrowed: 0, returned: 0, added: 0 });
            monthlyMap.get(m)!.added++;
        });

        chartData = Array.from(monthlyMap.entries())
            .sort((a, b) => a[0].localeCompare(b[0]))
            .slice(-12)
            .map(([key, val]) => ({
                month: new Date(key + '-02').toLocaleDateString('th-TH-u-ca-buddhist', { month: 'short' }),
                monthKey: key,
                ...val
            }));
    }

    const monthlyChartData = chartData;

    const recentActivities = activitiesSource.slice(0, 20).map(b => ({
        id: b.id,
        user: b.borrower?.fullName || b.borrower?.username || "Unknown",
        equipment: b.equipment?.name || "Unknown",
        type: b.status === "pending" ? "request" : b.status === "borrowed" ? "borrow" : b.status === "requisitioned" ? "requisition" : "return",
        timestamp: b.updatedAt.toLocaleString('th-TH-u-ca-buddhist', { 
            timeZone: 'Asia/Bangkok',
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).replace(/,/g, '')
    }));

    const recentEquipment = equipmentSource
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .slice(0, 20)
        .map(e => ({
            id: e.id,
            name: e.name,
            category: e.category,
            quantity: e.initialQuantity,
            date: e.createdAt.toLocaleDateString('th-TH-u-ca-buddhist', { timeZone: 'Asia/Bangkok', day: 'numeric', month: 'short', year: 'numeric' }),
            time: e.createdAt.toLocaleTimeString('th-TH-u-ca-buddhist', { timeZone: 'Asia/Bangkok', hour: '2-digit', minute: '2-digit' })
        }));

    const monthSet = new Set<string>();
    const yearSet = new Set<string>();
    borrows.forEach(b => {
        const m = b.borrowDate.toLocaleDateString('en-CA', { timeZone: 'Asia/Bangkok' }).slice(0, 7);
        monthSet.add(m);
        yearSet.add(m.slice(0, 4));
    });
    equipment.forEach(e => {
        const m = e.createdAt.toLocaleDateString('en-CA', { timeZone: 'Asia/Bangkok' }).slice(0, 7);
        monthSet.add(m);
        yearSet.add(m.slice(0, 4));
    });

    monthSet.add(thTodayStr.slice(0, 7));
    yearSet.add(thTodayStr.slice(0, 4));

    const availableMonths = Array.from(monthSet).sort().reverse().map(m => ({
        key: m,
        label: new Date(m + '-02').toLocaleDateString('th-TH-u-ca-buddhist', { month: 'long', year: 'numeric' })
    }));

    const availableYears = Array.from(yearSet).sort().reverse().map(y => ({
        key: y,
        label: `ปี พ.ศ. ${parseInt(y) + 543}`
    }));

    let comparisonLabel = "เทียบกับเดือนก่อน";
    if (selectedDate) comparisonLabel = "เทียบกับเมื่อวานนี้";
    else if (selectedMonth) comparisonLabel = "เทียบกับเดือนก่อน";
    else if (selectedYear) comparisonLabel = "เทียบกับปีก่อน";

    return NextResponse.json({
        stats: {
            totalEquipment,
            totalPhysicalUnits,
            currentlyBorrowed: borrowedCount,
            available,
            overdueReturns,
            totalUsers: users.length,
            pendingRequests,
            pendingUserApprovals: users.filter(u => u.status === "pending").length,
            todayActivities: currentPeriodActivities,
            newItemsThisMonth: currentPeriodNewItems,
            totalDepartments: new Set(users.map(u => u.department).filter(Boolean)).size,
            totalCategories: catMap.size,
            totalRequisitions: activitiesSource.filter(b => (b as any).transactionType === "REQUISITION" || b.status === "requisitioned").length,
            comparisonLabel
        },
        categoryDistribution,
        itDistribution,
        prDistribution,
        monthlyChartData,
        recentActivities,
        recentEquipment,
        availableMonths,
        availableYears,
        filterTitle
    });

  } catch (error) {
    console.error("Dashboard Stats API error:", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
